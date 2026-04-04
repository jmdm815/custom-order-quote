export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const acct = process.env.SANMAR_ACCOUNT;
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  const results = {};

  // Get full product info WSDL to see method names
  try {
    const r = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarProductInfoServicePort?wsdl');
    const txt = await r.text();
    // Extract operation names
    const ops = [...txt.matchAll(/operation name="([^"]+)"/g)].map(m => m[1]);
    results.operations = ops;
    results.wsdlPreview = txt.substring(0, 3000);
  } catch(e) {
    results.error = e.message;
  }

  // Also test a call with the product info endpoint using namespace from WSDL
  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:web="http://impl.webservice.integration.sanmar.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <web:getProductInfoByStyleColorSize>
      <arg0>${acct}</arg0>
      <arg1>${user}</arg1>
      <arg2>${pass}</arg2>
      <arg3>PC61</arg3>
      <arg4></arg4>
      <arg5></arg5>
      <arg6></arg6>
    </web:getProductInfoByStyleColorSize>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const r2 = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarProductInfoServicePort', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap,
    });
    const xml = await r2.text();
    results.productCallStatus = r2.status;
    results.productCallPreview = xml.substring(0, 4000);
  } catch(e) {
    results.productCallError = e.message;
  }

  res.status(200).json(results);
}
