export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  // Try PromoStandards Product Data Service v1
  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <ns:wsVersion>1.0.0</ns:wsVersion>
      <ns:id>${user}</ns:id>
      <ns:password>${pass}</ns:password>
      <ns:localizationCountry>US</ns:localizationCountry>
      <ns:localizationLanguage>en</ns:localizationLanguage>
      <ns:productId>PC61</ns:productId>
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
    res.status(200).json({ status: r.status, preview: xml.substring(0, 5000) });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
