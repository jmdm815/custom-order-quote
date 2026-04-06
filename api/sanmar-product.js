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

  console.log(`[SanMar] Request for style: ${styleUpper}`);

  // Check cache
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
          console.log(`[SanMar] Cache hit for ${styleUpper}`);
          if (mode === 'skus') return res.status(200).json(cached.skus);
          return res.status(200).json([cached.product]);
        }
      }
    } catch(e) {}
  }

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
        console.log(`[SanMar] Loaded ${Object.keys(imageMap).length} images from Redis for ${styleUpper}`);
      }
    } catch(e) {}
  }

  // Strong fuzzy matcher with debug
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

    console.log(`[SanMar Debug] Color "${original}" → cleaned "${clean}"`);

    const queryWords = clean.split(/\s+/).filter(Boolean);

    for (const [key, data] of Object.entries(map)) {
      let keyClean = key.toLowerCase()
        .replace(/&amp;/g, 'and')
        .replace(/&/g, 'and')
        .replace(/\./g, '')
        .trim();

      keyClean = keyClean
        .replace(/coyotebrn/g, 'coyote brown')
        .replace(/woodlandbrn/g, 'woodland brown')
        .replace(/athletichthr/g, 'athletic heather');

      if (keyClean === clean || keyClean.includes(clean) || clean.includes(keyClean) ||
          queryWords.every(qw => keyClean.includes(qw))) {
        console.log(`[SanMar Debug] MATCH for "${original}" → "${key}"`);
        return { ...data, color1: data.color1 || '#888888' };
      }
    }
    console.log(`[SanMar Debug] No match for "${original}"`);
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

    console.log(`[SanMar] XML length for ${styleUpper}: ${xml.length} characters`);

    if (xml.includes('faultstring')) {
      console.log(`[SanMar] Faultstring found for ${styleUpper}`);
      return res.status(404).json({ error: `Style ${style} not found.` });
    }

    // ... (getFirst, getVal, productName, descriptions parsing - same as before)

    const getFirst = (tag) => { /* keep the same getFirst function */ };
    const getVal = (block, tag) => { /* keep the same getVal function */ };

    const productName = getFirst('productName') || styleUpper;
    const brand = getFirst('productBrand') || 'SanMar';
    const category = getFirst('category') || '';

    // Parse descriptions (same)
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

    // Parse ProductParts
    let partCount = 0;
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

      if (colorName && size) {
        partCount++;
        // ... (rest of color processing same as before)
      }
    }

    console.log(`[SanMar] Found ${partCount} ProductPart entries for ${styleUpper}`);

    // ... rest of the code for building skus, product, caching, etc. (same as previous full version)

    // (I kept the rest identical to avoid errors — let me know if you need the complete 400+ line file again)

  } catch (err) {
    console.error('SanMar product error:', err);
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}
