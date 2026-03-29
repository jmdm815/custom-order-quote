// api/skus.js
// Fetches products (SKUs with color, size, image data) for a given styleID
// The /v2/products endpoint returns quantityAvailable directly — no separate inventory call needed

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { styleID } = req.query;
  if (!styleID) return res.status(400).json({ error: 'Missing query param: styleID' });

  const username = process.env.SS_USERNAME;
  const apiKey   = process.env.SS_API_KEY;
  if (!username || !apiKey) return res.status(500).json({ error: 'S&S credentials not configured.' });

  const auth = {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${username}:${apiKey}`).toString('base64'),
      'Accept': 'application/json',
    }
  };

  try {
    // /v2/products returns one row per SKU with colorName, sizeName, quantityAvailable, images, etc.
    const response = await fetch(
      `https://api.ssactivewear.com/v2/products/${encodeURIComponent(styleID)}`,
      auth
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `S&S API error: ${response.status}`, detail: text });
    }

    const skus = await response.json();

    // Prepend base URL to all image fields
    const base = 'https://www.ssactivewear.com/';
    const merged = (Array.isArray(skus) ? skus : []).map(s => ({
      ...s,
      colorFrontImage:  s.colorFrontImage  ? base + s.colorFrontImage  : '',
      colorSideImage:   s.colorSideImage   ? base + s.colorSideImage   : '',
      colorBackImage:   s.colorBackImage   ? base + s.colorBackImage   : '',
      colorSwatchImage: s.colorSwatchImage ? base + s.colorSwatchImage : '',
    }));

    return res.status(200).json(merged);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach S&S API', detail: err.message });
  }
}
