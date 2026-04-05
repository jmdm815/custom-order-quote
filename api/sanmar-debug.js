export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  // Time the SKU fetch to see if it's timing out
  const start = Date.now();

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

  try {
    const r = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap,
    });
    const xml = await r.text();
    const elapsed = Date.now() - start;

    // Count parts using indexOf
    let count = 0;
    let pos = 0;
    while ((pos = xml.indexOf('<ProductPart>', pos)) !== -1) { count++; pos++; }

    // Get first 5 colors
    const colors = [];
    let searchFrom = 0;
    while (colors.length < 5) {
      const s = xml.indexOf('<ProductPart>', searchFrom);
      if (s === -1) break;
      const e = xml.indexOf('</ProductPart>', s);
      const block = xml.substring(s, e);
      const ci = block.indexOf('<colorName>');
      const ce = block.indexOf('</colorName>');
      if (ci > -1) colors.push(block.substring(ci + '<colorName>'.length, ce));
      searchFrom = e + 1;
    }

    res.status(200).json({ elapsed, xmlLength: xml.length, partCount: count, sampleColors: colors });
  } catch(e) {
    res.status(500).json({ error: e.message, elapsed: Date.now() - start });
  }
}
