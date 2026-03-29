// api/skus.js
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
    // Use ?styleID= query param (not path param) to get ALL skus for a style
    const response = await fetch(
      `https://api.ssactivewear.com/v2/products?styleID=${encodeURIComponent(styleID)}`,
      auth
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `S&S API error: ${response.status}`, detail: text });
    }

    const skus = await response.json();
    const base = 'https://www.ssactivewear.com/';

    const merged = (Array.isArray(skus) ? skus : []).map(s => {
      // Inventory is nested in warehouses array — sum all warehouse qty values
      const warehouseQty = Array.isArray(s.warehouses)
        ? s.warehouses.reduce((sum, w) => sum + (w.qty || 0), 0)
        : 0;

      return {
        ...s,
        quantityAvailable: warehouseQty,
        colorFrontImage:        s.colorFrontImage        ? base + s.colorFrontImage        : '',
        colorSideImage:         s.colorSideImage         ? base + s.colorSideImage         : '',
        colorBackImage:         s.colorBackImage         ? base + s.colorBackImage         : '',
        colorSwatchImage:       s.colorSwatchImage       ? base + s.colorSwatchImage       : '',
        colorOnModelFrontImage: s.colorOnModelFrontImage ? base + s.colorOnModelFrontImage : '',
        colorOnModelSideImage:  s.colorOnModelSideImage  ? base + s.colorOnModelSideImage  : '',
        colorOnModelBackImage:  s.colorOnModelBackImage  ? base + s.colorOnModelBackImage  : '',
        colorDirectSideImage:   s.colorDirectSideImage   ? base + s.colorDirectSideImage   : '',
      };
    });

    return res.status(200).json(merged);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach S&S API', detail: err.message });
  }
}
