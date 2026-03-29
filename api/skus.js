// api/skus.js
// Fetches SKUs + inventory for a given styleID from S&S API

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

  const auth = { headers: {
    'Authorization': 'Basic ' + Buffer.from(`${username}:${apiKey}`).toString('base64'),
    'Accept': 'application/json',
  }};

  try {
    // Fetch SKUs and inventory in parallel
    const [skuRes, invRes] = await Promise.all([
      fetch(`https://api.ssactivewear.com/v2/products?styleID=${encodeURIComponent(styleID)}`, auth),
      fetch(`https://api.ssactivewear.com/v2/inventory?styleID=${encodeURIComponent(styleID)}`, auth),
    ]);

    const skus = skuRes.ok ? await skuRes.json() : [];
    const inv  = invRes.ok ? await invRes.json() : [];

    // Build inventory lookup: sku -> qty
    const invMap = {};
    (Array.isArray(inv) ? inv : []).forEach(i => {
      invMap[i.sku] = (invMap[i.sku] || 0) + (i.qty || i.quantity || 0);
    });

    // Merge inventory into skus and normalize image URLs
    const base = 'https://images.ssactivewear.com/';
    const merged = (Array.isArray(skus) ? skus : []).map(s => ({
      ...s,
      quantityAvailable: invMap[s.sku] || 0,
      colorFrontImage:   s.colorFrontImage   ? base + s.colorFrontImage   : '',
      colorSwatchImage:  s.colorSwatchImage  ? base + s.colorSwatchImage  : '',
      colorBackImage:    s.colorBackImage    ? base + s.colorBackImage    : '',
    }));

    return res.status(200).json(merged);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach S&S API', detail: err.message });
  }
}
