// api/sanmar-search.js
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

    // Use indexOf for all parsing — regex fails on 600KB XML
    const getFirst = (tag) => {
      for (const t of [tag, `ns2:${tag}`]) {
        const open = `<${t}>`;
        const i = xml.indexOf(open);
        if (i === -1) continue;
        const start = i + open.length;
        const end = xml.indexOf(`</${t}>`, start);
        if (end === -1) continue;
        return xml.substring(start, end).trim();
      }
      return '';
    };

    const productId   = getFirst('productId') || style.toUpperCase();
    const productName = getFirst('productName') || style.toUpperCase();
    const brand       = getFirst('productBrand') || 'SanMar';
    const category    = getFirst('category') || '';

    // Parse all descriptions
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

    const product = {
      styleID:      productId,
      styleName:    productId,
      title:        productName,
      brandName:    brand,
      baseCategory: category,
      description:  descriptions.join(' | '),
      styleImage:   '',
      _source:      'sanmar',
    };

    return res.status(200).json([product]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}
