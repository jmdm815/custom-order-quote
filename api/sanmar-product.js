// api/sanmar-product.js
// Single endpoint — returns both product info AND skus in one call
// Replaces sanmar-search.js + sanmar-skus.js to avoid double 600KB XML fetches

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { style, mode } = req.query;
  // mode=search → return product card array
  // mode=skus   → return skus array
  if (!style) return res.status(400).json({ error: 'Missing style param' });

  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  if (!user || !pass) return res.status(500).json({ error: 'SanMar credentials not configured.' });

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
      <shared:productId>${style.trim().toUpperCase()}</shared:productId>
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

    // indexOf-based parser — reliable on 600KB XML
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

    // Parse product-level info
    const productId   = getFirst('productId') || style.toUpperCase();
    const productName = getFirst('productName') || style.toUpperCase();
    const brand       = getFirst('productBrand') || 'SanMar';
    const category    = getFirst('category') || '';

    // Parse descriptions
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

    // Parse all ProductPart blocks for SKUs
    const skuMap = {};
    const styleUpper = style.trim().toUpperCase();
    let searchFrom = 0;
    while (true) {
      const start = xml.indexOf('<ProductPart>', searchFrom);
      if (start === -1) break;
      const end = xml.indexOf('</ProductPart>', start);
      if (end === -1) break;
      const part = xml.substring(start + '<ProductPart>'.length, end);
      searchFrom = end + '</ProductPart>'.length;

      const partId    = getVal(part, 'partId');
      const colorName = getVal(part, 'colorName');
      const size      = getVal(part, 'labelSize');
      if (!colorName || !size) continue;

      const colorSlug = colorName
        .replace(/&amp;/gi, 'and').replace(/&/g, 'and')
        .replace(/\s+/g, '_').replace(/\//g, '_');

      if (!skuMap[colorName]) {
        skuMap[colorName] = {
          colorName,
          color1: '#888888',
          colorFrontImage: '',
          colorBackImage: '',
          colorSideImage: '',
          colorSwatchImage: '',
          colorOnModelFrontImage: '',
          colorOnModelSideImage: '',
          colorOnModelBackImage: '',
          sizes: [],
        };
      }
      skuMap[colorName].sizes.push({ partId, size });
    }

    // Build SKUs array
    const skus = [];
    Object.values(skuMap).forEach(color => {
      color.sizes.forEach(s => {
        skus.push({
          sku: s.partId,
          styleID: styleUpper,
          colorName: color.colorName,
          color1: color.color1,
          sizeName: s.size,
          quantityAvailable: 999,
          colorFrontImage: '',
          colorBackImage: '',
          colorSideImage: '',
          colorSwatchImage: '',
          colorOnModelFrontImage: '',
          colorOnModelSideImage: '',
          colorOnModelBackImage: '',
          _source: 'sanmar',
        });
      });
    });

    const product = {
      styleID:      styleUpper,
      styleName:    styleUpper,
      title:        productName,
      brandName:    brand,
      baseCategory: category,
      description:  descriptions.join(' | '),
      styleImage:   '',
      _source:      'sanmar',
      _skus:        skus, // embed skus in product so frontend can use them directly
    };

    if (mode === 'skus') return res.status(200).json(skus);
    return res.status(200).json([product]);

  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}
