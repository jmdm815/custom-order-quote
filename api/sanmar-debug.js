export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

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
      <shared:productId>PC61</shared:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const r = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
    body: soap,
  });
  const xml = await r.text();

  // Show the ProductPartArray section to see exact tag names
  const partStart = xml.indexOf('<ProductPartArray>');
  const partEnd = xml.indexOf('</ProductPartArray>') + '</ProductPartArray>'.length;
  const partSection = partStart > -1 ? xml.substring(partStart, Math.min(partStart + 2000, partEnd)) : 'NOT FOUND';

  res.status(200).json({ partSection, xmlLength: xml.length });
}
