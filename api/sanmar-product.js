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
        if (cached && cached.skus && cached.product) {
          if (mode === 'skus') return res.status(200).json(cached.skus);
          return res.status(200).json([cached.product]);
        }
      }
    } catch(e) {}
  }

  // Fetch image map from Redis
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

  // ── IMPROVED FUZZY MATCHER ──
  const lookupFuzzy = (colorName, map) => {
    if (!colorName || !map) return null;

    const normalize = (str) => str.toLowerCase()
      .replace(/&amp;/gi, 'and')
      .replace(/&/g, 'and')
      .replace(/\./g, '')           // Ath. → Ath
      .replace(/safety/gi, 's')
      .replace(/dark heather/gi, 'd heather')
      .replace(/athletic/gi, 'ath')
      .replace(/heather grey/gi, 'heather gray')
      .trim();

    const queryNorm = normalize(colorName);
    const queryWords = queryNorm.split(/\s+/).filter(Boolean);

    for (const [key, imgs] of Object.entries(map)) {
      const keyNorm = normalize(key);
      const keyWords = keyNorm.split(/\s+/).filter(Boolean);

      // Exact match
      if (keyNorm === queryNorm) return imgs;

      // Strong partial match
      if (queryWords.every(qw => 
        keyWords.some(kw => kw.includes(qw) || qw.includes(kw))
      )) {
        return imgs;
      }

      // Common abbreviation handling
      if ((queryNorm.includes('ath') && keyNorm.includes('athletic')) ||
          (queryNorm.includes('s ') && keyNorm.includes('safety')) ||
          (queryNorm.includes('d heather') && keyNorm.includes('dark heather'))) {
        return imgs;
      }
    }
    return null;
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

      // Improved slug
      const colorSlug = colorName
        .replace(/&amp;/gi, 'and')
        .replace(/&/g, 'and')
        .replace(/\./g, '')
        .replace(/\s+/g, '_')
        .replace(/\//g, '_')
        .trim();

      // Try exact slug → exact name → fuzzy lookup
      const imgs = imageMap[colorSlug] || imageMap[colorName] || lookupFuzzy(colorName, imageMap) || {};

      const proxy = (u) => {
        if (!u) return '';
        if (!u.startsWith('http')) u = `https://cdnm.sanmar.com/imglib/swatches/${u}`;
        return `/api/sanmar-image?url=${encodeURIComponent(u)}`;
      };

      if (!skuMap[colorName]) {
        skuMap[colorName] = {
          colorName,
          inventoryColorName: imgs.colorName || colorName,
          color1: '#888888',
          colorFrontImage: proxy(imgs.side || imgs.front),
          colorBackImage: proxy(imgs.back),
          colorSideImage: proxy(imgs.front),
          colorSwatchImage: proxy(imgs.swatch),
          colorOnModelFrontImage: '',
          colorOnModelSideImage: '',
          colorOnModelBackImage: '',
          sizes: [],
        };
      }
      skuMap[colorName].sizes.push({ partId, size });
    }

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

    // ── Better Image Fallback ──
    let styleImage = '';
    const firstWithImg = Object.values(skuMap).find(c => c.colorFrontImage);
    if (firstWithImg && firstWithImg.colorFrontImage) {
      styleImage = firstWithImg.colorFrontImage;
    } else {
      // Fallback to S&S default image (very reliable for common styles like PC61)
      styleImage = `https://images.ssactivewear.com/im/1-0-0/500/${styleUpper}_FRONT.jpg`;
    }

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
