// api/description.js
// Fetches the description for a single style and returns cleaned bullet points
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { styleID } = req.query;
  if (!styleID) return res.status(400).json({ error: 'Missing styleID' });

  const username = process.env.SS_USERNAME;
  const apiKey   = process.env.SS_API_KEY;
  if (!username || !apiKey) return res.status(500).json({ error: 'Credentials not configured.' });

  try {
    const response = await fetch(
      `https://api.ssactivewear.com/v2/styles/${encodeURIComponent(styleID)}?mediatype=json`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${username}:${apiKey}`).toString('base64'),
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) return res.status(response.status).json({ error: 'S&S API error' });

    const data = await response.json();
    const style = Array.isArray(data) ? data[0] : data;
    const html = style?.description || '';

    // Parse bullet points from the HTML description
    // S&S descriptions have newline-separated lines; some use <li>, some use plain text
    let bullets = [];

    if (html.includes('<li')) {
      // Strip HTML tags but extract <li> content
      bullets = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);
    } else {
      // Plain text with newlines — split and filter short/empty lines
      bullets = html
        .replace(/<[^>]+>/g, '\n')
        .split(/\n+/)
        .map(l => l.trim())
        .filter(l => l.length > 8); // skip very short fragments
    }

    return res.status(200).json({ bullets });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
