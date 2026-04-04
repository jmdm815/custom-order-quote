export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  // The SanMarWebServicePort only has inventory methods.
  // Product info uses a different endpoint. Let's try it:
  // Method: getInventoryQtyForStyleColorSize
  // args: username, password, style, color, size, sanmarUserRegNum
  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:web="http://webservice.integration.sanmar.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <web:getInventoryQtyForStyleColorSize>
      <arg0>${user}</arg0>
      <arg1>${pass}</arg1>
      <arg2>PC61</arg2>
      <arg3>Black</arg3>
      <arg4>M</arg4>
      <arg5></arg5>
    </web:getInventoryQtyForStyleColorSize>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const r = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap,
    });
    const xml = await r.text();
    res.status(200).json({ status: r.status, preview: xml.substring(0, 4000) });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
