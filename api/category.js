// api/category.js
// Returns styles filtered by baseCategory name
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing query param: name' });

  const username = process.env.SS_USERNAME;
  const apiKey   = process.env.SS_API_KEY;
  if (!username || !apiKey) return res.status(500).json({ error: 'S&S credentials not configured.' });

  try {
    // S&S styles endpoint supports filtering by baseCategory via search
    const response = await fetch(
      `https://api.ssactivewear.com/v2/styles?search=${encodeURIComponent(name)}&mediatype=json`,
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
    const base = 'https://www.ssactivewear.com/';

    // Filter to only styles whose baseCategory matches (search can be broad)
    const filtered = (Array.isArray(data) ? data : [])
      .filter(s => s.baseCategory && s.baseCategory.toLowerCase().includes(name.toLowerCase()))
      .map(s => ({
        ...s,
        styleImage: s.styleImage ? base + s.styleImage : '',
        brandImage: s.brandImage ? base + s.brandImage : '',
      }));

    return res.status(200).json(filtered);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach S&S API', detail: err.message });
  }
}
