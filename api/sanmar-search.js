// api/sanmar-search.js
// Search SanMar via PromoStandards Product Data Service
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { style } = req.query;
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
    const response = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap,
    });
    const xml = await response.text();

    if (xml.includes('faultstring') || xml.includes('errorCode')) {
      return res.status(404).json({ error: `Style ${style} not found in SanMar catalog.` });
    }

    const getValue = (tag) => {
      const m = xml.match(new RegExp(`<(?:ns2:)?${tag}[^>]*>([^<]*)<\/(?:ns2:)?${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };

    const productId    = getValue('productId') || style.toUpperCase();
    const productName  = getValue('productName') || style.toUpperCase();
    const brand        = getValue('productBrand') || 'SanMar';
    const descriptions = [...xml.matchAll(/<ns2:description[^>]*>([^<]+)<\/ns2:description>/gi)].map(m => m[1].trim()).filter(Boolean);
    const category     = getValue('category') || '';

    // Get unique colors from ProductPartArray
    const colorNames = [...new Set([...xml.matchAll(/<colorName>([^<]+)<\/colorName>/gi)].map(m => m[1].trim()))];

    // Build style image URL using SanMar CDN pattern
    const cdnUrl = `https://cdnm.sanmar.com/catalog/images/${productId}_Black_FM.jpg`;
    const styleImageUrl = `/api/sanmar-image?url=${encodeURIComponent(cdnUrl)}`;

    const product = {
      styleID:      productId,
      styleName:    productId,
      title:        productName,
      brandName:    brand,
      baseCategory: category,
      description:  descriptions.join(' | '),
      styleImage:   styleImageUrl,
      _colorNames:  colorNames,
      _source:      'sanmar',
    };

    return res.status(200).json([product]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}
