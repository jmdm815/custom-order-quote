export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const acct = process.env.SANMAR_ACCOUNT;
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  const results = {};

  // Test 1: sanmarCustomerNumber, username, password order
  const soap1 = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:web="http://impl.webservice.integration.sanmar.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <web:getProductInfoByStyleColorSize>
      <arg0>
        <sanmarCustomerNumber>${acct}</sanmarCustomerNumber>
        <username>${user}</username>
        <password>${pass}</password>
        <sanmarUserRegistrationNumber></sanmarUserRegistrationNumber>
      </arg0>
      <arg1>
        <style>PC61</style>
        <color></color>
        <size></size>
      </arg1>
    </web:getProductInfoByStyleColorSize>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const r = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarProductInfoServicePort', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap1,
    });
    const xml = await r.text();
    results.test1_structured = xml.substring(0, 3000);
  } catch(e) { results.test1_error = e.message; }

  // Test 2: flat args — acct, user, pass, style, color, size, regnum
  const soap2 = `<?xml version="1.0" encoding="UTF-8"?>
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
      body: soap2,
    });
    const xml2 = await r2.text();
    results.test2_flat = xml2.substring(0, 3000);
  } catch(e) { results.test2_error = e.message; }

  res.status(200).json(results);
}
