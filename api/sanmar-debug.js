export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  const acct = process.env.SANMAR_ACCOUNT;
  const custNum = process.env.SANMAR_CUSTOMER_NUMBER;

  const results = { creds: { user: user?.substring(0,4)+'***', acct: acct?.substring(0,3)+'***', custNum: custNum?.substring(0,3)+'***' } };

  // Test 1: username + password only (PromoStandards style)
  const makeProductSoap = (id, pw) => `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/"
                  xmlns:shared="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <shared:wsVersion>1.0.0</shared:wsVersion>
      <shared:id>${id}</shared:id>
      <shared:password>${pw}</shared:password>
      <shared:localizationCountry>US</shared:localizationCountry>
      <shared:localizationLanguage>en</shared:localizationLanguage>
      <shared:productId>PC61</shared:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  // Try with customer number as id
  for (const [label, id] of [['username', user], ['account', acct], ['custNum', custNum]]) {
    try {
      const r = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
        body: makeProductSoap(id, pass),
      });
      const xml = await r.text();
      const hasProduct = xml.includes('<productName>');
      const hasError = xml.includes('faultstring') || xml.includes('errorCode');
      results[`test_${label}`] = { success: hasProduct, error: hasError, preview: xml.substring(0, 200) };
    } catch(e) { results[`test_${label}`] = { error: e.message }; }
  }

  res.status(200).json(results);
}
