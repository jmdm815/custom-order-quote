// api/sanmar-debug.js — temporary, remove after fixing
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { style } = req.query;
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  // Try the correct method: getProductInfoByStyleColorSize
  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:web="http://webservice.integration.sanmar.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <web:getProductInfoByStyleColorSize>
      <arg0>
        <sanmarCustomerNumber></sanmarCustomerNumber>
        <username>${user}</username>
        <password>${pass}</password>
        <sanmarUserRegistrationNumber></sanmarUserRegistrationNumber>
      </arg0>
      <arg1>
        <style>${style || 'PC61'}</style>
        <color></color>
        <size></size>
      </arg1>
    </web:getProductInfoByStyleColorSize>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap,
    });
    const xml = await response.text();
    res.status(200).json({ status: response.status, preview: xml.substring(0, 4000) });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
