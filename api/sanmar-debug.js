export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  const { style } = req.query;

  // Get product parts (colors/sizes) - separate call
  const soapParts = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/"
                  xmlns:shared="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductDateModifiedRequest>
      <shared:wsVersion>1.0.0</shared:wsVersion>
      <shared:id>${user}</shared:id>
      <shared:password>${pass}</shared:password>
      <shared:productId>${style || 'PC61'}</shared:productId>
    </ns:GetProductDateModifiedRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  // Also get the sellable parts to understand color/size structure
  const soapSellable = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/"
                  xmlns:shared="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductCloseOutRequest>
      <shared:wsVersion>1.0.0</shared:wsVersion>
      <shared:id>${user}</shared:id>
      <shared:password>${pass}</shared:password>
    </ns:GetProductCloseOutRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  // Get full product with parts
  const soapFull = `<?xml version="1.0" encoding="UTF-8"?>
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
      <shared:productId>${style || 'PC61'}</shared:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const r = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soapFull,
    });
    const xml = await r.text();
    // Get the ProductPartArray section specifically
    const partMatch = xml.match(/<ProductPartArray>([\s\S]*?)<\/ProductPartArray>/);
    const colorMatch = xml.match(/<ColorArray>([\s\S]*?)<\/ColorArray>/);
    res.status(200).json({
      status: r.status,
      hasProductPartArray: !!partMatch,
      hasColorArray: !!colorMatch,
      productPartPreview: partMatch ? partMatch[0].substring(0, 3000) : 'not found',
      colorPreview: colorMatch ? colorMatch[0].substring(0, 2000) : 'not found',
      fullPreview: xml.substring(4000, 8000) // middle section
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
