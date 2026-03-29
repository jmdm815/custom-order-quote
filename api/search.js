// api/search.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query param: q' });

  const username = process.env.SS_USERNAME;
  const apiKey   = process.env.SS_API_KEY;
  if (!username || !apiKey) return res.status(500).json({ error: 'S&S credentials not configured.' });

  try {
    // Use ?search= (not ?contains=) — searches brand name + style name accurately
    const response = await fetch(
      `https://api.ssactivewear.com/v2/styles?search=${encodeURIComponent(q)}&mediatype=json`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${username}:${apiKey}`).toString('base64'),
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `S&S API error: ${response.status}`, detail: text });
    }

    const data = await response.json();
    // Prepend base URL to styleImage field
    const base = 'https://www.ssactivewear.com/';
    const styles = (Array.isArray(data) ? data : []).map(s => ({
      ...s,
      styleImage: s.styleImage ? base + s.styleImage : '',
      brandImage: s.brandImage ? base + s.brandImage : '',
    }));

    return res.status(200).json(styles);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach S&S API', detail: err.message });
  }
}
