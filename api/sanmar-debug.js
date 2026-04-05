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

  const colorNames = [...new Set([...xml.matchAll(/<colorName>([^<]+)<\/colorName>/gi)].map(m => m[1].trim()))];

  // Test first 8 colors
  const urlTests = {};
  for (const colorName of colorNames.slice(0, 8)) {
    const colorSlug = colorName.replace(/\s+/g,'_').replace(/\//g,'_').replace(/&amp;/gi,'and').replace(/&/g,'and');
    const url = `https://cdnm.sanmar.com/medias/mcs/PC61_${colorSlug}_FM.jpg`;
    try {
      const tr = await fetch(url, { method: 'HEAD' });
      urlTests[colorName] = { slug: colorSlug, url, status: tr.status };
    } catch(e) {
      urlTests[colorName] = { slug: colorSlug, url, status: 'error' };
    }
  }

  res.status(200).json({ colorNames, urlTests });
}
