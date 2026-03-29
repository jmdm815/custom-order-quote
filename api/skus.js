// api/skus.js
// Vercel serverless function — proxies S&S SKU + inventory lookup to avoid CORS

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { styleID } = req.query;
  if (!styleID) return res.status(400).json({ error: 'Missing query param: styleID' });

  const username = process.env.SS_USERNAME;
  const apiKey   = process.env.SS_API_KEY;

  if (!username || !apiKey) {
    return res.status(500).json({ error: 'S&S credentials not configured in Vercel environment variables.' });
  }

  try {
    const response = await fetch(
      `https://api.ssactivewear.com/v2/skus?styleID=${encodeURIComponent(styleID)}`,
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
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach S&S API', detail: err.message });
  }
}
