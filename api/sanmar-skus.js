// api/sanmar-skus.js
// Returns colors, sizes and inventory for a SanMar style via PromoStandards

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { styleID } = req.query;
  if (!styleID) return res.status(400).json({ error: 'Missing styleID' });

  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!user || !pass) return res.status(500).json({ error: 'SanMar credentials not configured.' });

  const styleUpper = styleID.trim().toUpperCase();

  // Load image + color map from Redis
  let imageMap = {};
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const imgRes = await fetch(`${REDIS_URL}/get/${encodeURIComponent(`sanmar:images:${styleUpper}`)}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
      const imgData = await imgRes.json();
      if (imgData.result) {
        let val = imgData.result;
        while (typeof val === 'string') { try { val = JSON.parse(val); } catch(e) { break; } }
        imageMap = val || {};
      }
    } catch(e) {}
  }

  // ── IMPROVED FUZZY MATCHER WITH COLOR SUPPORT ──
  const lookupFuzzy = (colorName, map) => {
    if (!colorName || !map) return { color1: '#888888' };

    const normalize = (str) => str.toLowerCase()
      .replace(/&amp;/gi, 'and')
      .replace(/&/g, 'and')
      .replace(/\./g, '')
      .replace(/safety/gi, 's')
      .replace(/dark heather/gi, 'd heather')
      .replace(/athletic/gi, 'ath')
      .replace(/true /gi, '')
      .replace(/celadon/gi, 'celadon')
      .trim();

    const queryNorm = normalize(colorName);
    const queryWords = queryNorm.split(/\s+/).filter(Boolean);

    for (const [key, data] of Object.entries(map)) {
      const keyNorm = normalize(key);

      if (keyNorm === queryNorm || 
          queryWords.every(qw => keyNorm.includes(qw)) ||
          keyNorm.includes(queryNorm)) {
        return {
          ...data,
          color1: data.color1 || '#888888'
        };
      }
    }
    return { color1: '#888888' };
  };

  // ── FETCH FROM SANMAR ──
  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/"
                  xmlns:shared="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <shared:wsVersion>1.0.0</shared:wsVersion>
      <shared:id>${user}</shared:id>
      <shared:password>${pass}</shared:password>
      <shared:localizationCountry>US</shared:localizationCountry>
      <shared:localizationLanguage>en</shared:localizationLanguage>
      <shared:productId>${styleUpper}</shared:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const r = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap,
    });
    const xml = await r.text();

    if (xml.includes('faultstring')) {
      return res.status(404).json({ error: `Style ${styleID} not found.` });
    }

    const getVal = (block, tag) => {
      for (const t of [tag, `ns2:${tag}`]) {
        const open = `<${t}>`;
        const i = block.indexOf(open);
        if (i === -1) continue;
        const start = i + open.length;
        const end = block.indexOf(`</${t}>`, start);
        if (end === -1) continue;
        return block.substring(start, end).trim();
      }
      return '';
    };

    // Parse ProductPart blocks
    const skuMap = {};
    let searchFrom = 0;
    while (true) {
      const start = xml.indexOf('<ProductPart>', searchFrom);
      if (start === -1) break;
      const end = xml.indexOf('</ProductPart>', start);
      if (end === -1) break;
      const part = xml.substring(start + '<ProductPart>'.length, end);
      searchFrom = end + '</ProductPart>'.length;

      const partId = getVal(part, 'partId');
      const colorName = getVal(part, 'colorName');
      const size = getVal(part, 'labelSize');
      if (!colorName || !size) continue;

      const colorSlug = colorName
        .replace(/&amp;/gi, 'and')
        .replace(/&/g, 'and')
        .replace(/\./g, '')
        .replace(/\s+/g, '_')
        .replace(/\//g, '_')
        .trim();

      const imgData = imageMap[colorSlug] || imageMap[colorName] || lookupFuzzy(colorName, imageMap);

      const proxy = (u) => u 
        ? `/api/sanmar-image?url=${encodeURIComponent(u.startsWith('http') ? u : `https://cdnm.sanmar.com/imglib/swatches/${u}`)}` 
        : '';

      if (!skuMap[colorName]) {
        skuMap[colorName] = {
          colorName,
          inventoryColorName: imgData.inventoryColorName || colorName,
          color1: imgData.color1 || '#888888',           // ← Critical fix for grey swatches
          colorFrontImage: proxy(imgData.side || imgData.front),
          colorBackImage: proxy(imgData.back),
          colorSideImage: proxy(imgData.front),
          colorSwatchImage: proxy(imgData.swatch),
          sizes: [],
        };
      }
      skuMap[colorName].sizes.push({ partId, size });
    }

    // Build SKUs
    const skus = [];
    Object.values(skuMap).forEach(color => {
      color.sizes.forEach(s => {
        skus.push({
          sku: s.partId,
          styleID: styleUpper,
          colorName: color.colorName,
          inventoryColorName: color.inventoryColorName,
          color1: color.color1,
          sizeName: s.size,
          quantityAvailable: 999,
          colorFrontImage: color.colorFrontImage,
          colorBackImage: color.colorBackImage,
          colorSideImage: color.colorSideImage,
          colorSwatchImage: color.colorSwatchImage,
          colorOnModelFrontImage: '',
          colorOnModelSideImage: '',
          colorOnModelBackImage: '',
          _source: 'sanmar',
        });
      });
    });

    return res.status(200).json(skus);

  } catch (err) {
    console.error('SanMar skus error:', err);
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}
