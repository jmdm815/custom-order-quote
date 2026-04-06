export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { style, color } = req.query;
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  const acct = process.env.SANMAR_ACCOUNT;

  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:web="http://webservice.integration.sanmar.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <web:getInventoryQtyForStyleColorSize>
      <arg0>${acct}</arg0>
      <arg1>${user}</arg1>
      <arg2>${pass}</arg2>
      <arg3>${style||'PC61'}</arg3>
      <arg4>${color||'Aquatic Blue'}</arg4>
      <arg5></arg5>
      <arg6></arg6>
    </web:getInventoryQtyForStyleColorSize>
  </soapenv:Body>
</soapenv:Envelope>`;

  const r = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort', {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
    body: soap,
  });
  const xml = await r.text();

  let total = 0;
  let pos = 0;
  while (true) {
    const start = xml.indexOf('<listResponse', pos);
    if (start === -1) break;
    const valStart = xml.indexOf('>', start) + 1;
    const valEnd = xml.indexOf('</listResponse>', valStart);
    if (valEnd === -1) break;
    const val = parseInt(xml.substring(valStart, valEnd));
    if (!isNaN(val)) total += val;
    pos = valEnd + 1;
  }

  res.status(200).json({ style: style||'PC61', color: color||'Aquatic Blue', total, xmlPreview: xml.substring(0, 500) });
}
