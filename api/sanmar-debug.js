// api/sanmar-debug.js — temporary debug endpoint, remove after fixing
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { style } = req.query;
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:web="http://webservice.integration.sanmar.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <web:getProductInfoByStyle>
      <arg0>
        <sanmarUsername>${user}</sanmarUsername>
        <sanmarPassword>${pass}</sanmarPassword>
        <sanmarUserRegistrationNumber></sanmarUserRegistrationNumber>
      </arg0>
      <arg1>${style || 'PC61'}</arg1>
    </web:getProductInfoByStyle>
  </soapenv:Body>
</soapenv:Envelope>`;

  const response = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort', {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
    body: soap,
  });

  const xml = await response.text();
  // Return first 3000 chars of XML so we can see the structure
  res.status(200).json({ preview: xml.substring(0, 3000) });
}
