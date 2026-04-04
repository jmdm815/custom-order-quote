export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const acct = process.env.SANMAR_ACCOUNT;
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:web="http://webservice.integration.sanmar.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <web:getInventoryQtyForStyleColorSize>
      <arg0>${acct}</arg0>
      <arg1>${user}</arg1>
      <arg2>${pass}</arg2>
      <arg3>PC61</arg3>
      <arg4>Black</arg4>
      <arg5>M</arg5>
      <arg6></arg6>
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
    res.status(200).json({
      creds: { acct: acct ? acct.substring(0,3)+'***' : 'MISSING', user: user ? user.substring(0,3)+'***' : 'MISSING', pass: pass ? 'SET' : 'MISSING' },
      status: r.status,
      preview: xml.substring(0, 3000)
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
