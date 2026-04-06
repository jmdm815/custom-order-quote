// api/sanmar-product.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { style, mode } = req.query;
  if (!style) return res.status(400).json({ error: 'Missing style param' });

  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!user || !pass) return res.status(500).json({ error: 'SanMar credentials not configured.' });

  const styleUpper = style.trim().toUpperCase();
  const cacheKey = `sanmar:product:${styleUpper}`;

  // Check Redis cache first
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const cacheRes = await fetch(`${REDIS_URL}/get/${encodeURIComponent(cacheKey)}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      });
      const cacheData = await cacheRes.json();
      if (cacheData.result) {
        let cached = cacheData.result;
        while (typeof cached === 'string') { try { cached = JSON.parse(cached); } catch(e) { break; } }
        if (cached?.skus && cached?.product) {
          if (mode === 'skus') return res.status(200).json(cached.skus);
          return res.status(200).json([cached.product]);
        }
      }
    } catch(e) {}
  }

  // Load image map from Redis
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

  // ── DEBUG ENABLED FUZZY MATCHER ──
  const lookupFuzzy = (colorName, map) => {
    if (!colorName || !map) return { color1: '#888888' };

    const original = colorName;
    let clean = colorName.toLowerCase()
      .replace(/&amp;/g, 'and')
      .replace(/&/g, 'and')
      .replace(/\./g, '')
      .replace(/true /g, '')
      .replace(/brn/g, 'brown')
      .replace(/hthr/g, 'heather')
      .trim();

    console.log(`[SanMar Debug] Color: "${original}" → cleaned: "${clean}"`);

    const queryWords = clean.split(/\s+/).filter(Boolean);

    for (const [key, data] of Object.entries(map)) {
      let keyClean = key.toLowerCase()
        .replace(/&amp;/g, 'and')
        .replace(/&/g, 'and')
        .replace(/\./g, '')
        .trim();

      // Specific abbreviation fixes
      keyClean = keyClean
        .replace(/coyotebrn/g, 'coyote brown')
        .replace(/woodlandbrn/g, 'woodland brown')
        .replace(/athletichthr/g, 'athletic heather')
        .replace(/ath hthr/g, 'athletic heather');

      if (keyClean === clean || 
          keyClean.includes(clean) || 
          clean.includes(keyClean) ||
          (queryWords.length > 0 && queryWords.every(qw => keyClean.includes(qw)))) {
        
        console.log(`[SanMar Debug] MATCH FOUND for "${original}" → Redis key: "${key}"`);
        return { ...data, color1: data.color1 || '#888888' };
      }
    }

    console.log(`[SanMar Debug] No match found for "${original}"`);
    return { color1: '#888888' };
  };

  // SOAP Request
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
      return res.status(404).json({ error: `Style ${style} not found.` });
    }

    const getFirst = (tag) => {
      for (const t of [tag, `ns2:${tag}`]) {
        const i = xml.indexOf(`<${t}>`);
        if (i === -1) continue;
        const start = i + t.length + 2;
        const end = xml.indexOf(`</${t}>`, start);
        if (end === -1) continue;
        return xml.substring(start, end).trim();
      }
      return '';
    };

    const getVal = (block, tag) => {
      for (const t of [tag, `ns2:${tag}`]) {
        const i = block.indexOf(`<${t}>`);
        if (i === -1) continue;
        const start = i + t.length + 2;
        const end = block.indexOf(`</${t}>`, start);
        if (end === -1) continue;
        return block.substring(start, end).trim();
      }
      return '';
    };

    const productName = getFirst('productName') || styleUpper;
    const brand = getFirst('productBrand') || 'SanMar';
    const category = getFirst('category') || '';

    const descriptions = [];
    let dpos = 0;
    while (true) {
      const dtag = xml.indexOf('<ns2:description>', dpos);
      if (dtag === -1) break;
      const dstart = dtag + '<ns2:description>'.length;
      const dend = xml.indexOf('</ns2:description>', dstart);
      if (dend === -1) break;
      const txt = xml.substring(dstart, dend).trim();
      if (txt.length > 4) descriptions.push(txt);
      dpos = dend + 1;
    }

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
        .replace(/&amp;/gi,'and').replace(/&/g,'and')
        .replace(/\./g,'').replace(/\s+/g,'_').replace(/\//g,'_').trim();

      const imgData = imageMap[colorSlug] || imageMap[colorName] || lookupFuzzy(colorName, imageMap);

      const proxy = (u) => u 
        ? `/api/sanmar-image?url=${encodeURIComponent(u.startsWith('http') ? u : `https://cdnm.sanmar.com/imglib/swatches/${u}`)}` 
        : '';

      if (!skuMap[colorName]) {
        skuMap[colorName] = {
          colorName,
          inventoryColorName: imgData.inventoryColorName || colorName,
          color1: imgData.color1 || '#888888',
          colorFrontImage: proxy(imgData.side || imgData.front),
          colorBackImage: proxy(imgData.back),
          colorSideImage: proxy(imgData.front),
          colorSwatchImage: proxy(imgData.swatch),
          sizes: [],
        };
      }
      skuMap[colorName].sizes.push({ partId, size });
    }

    const skus = Object.values(skuMap).flatMap(color => 
      color.sizes.map(s => ({
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
        _source: 'sanmar',
      }))
    );

    const firstWithImg = Object.values(skuMap).find(c => c.colorFrontImage);
    const styleImage = firstWithImg?.colorFrontImage || 
                      `https://images.ssactivewear.com/im/1-0-0/500/${styleUpper}_FRONT.jpg`;

    const product = {
      styleID: styleUpper,
      styleName: styleUpper,
      title: productName,
      brandName: brand,
      baseCategory: category,
      description: descriptions.join(' | '),
      styleImage,
      _source: 'sanmar',
    };

    // Cache for 24h
    if (REDIS_URL && REDIS_TOKEN) {
      try {
        await fetch(`${REDIS_URL}/setex/${encodeURIComponent(cacheKey)}/86400`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(JSON.stringify({ product, skus })),
        });
      } catch(e) {}
    }

    if (mode === 'skus') return res.status(200).json(skus);
    return res.status(200).json([product]);

  } catch (err) {
    console.error('SanMar product error:', err);
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}
