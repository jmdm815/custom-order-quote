// api/sanmar-inventory.js
// Returns inventory qty per size for a style+color
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { style, color, size } = req.query;
  if (!style || !color || !size) return res.status(400).json({ error: 'Missing style, color, or size' });

  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  const acct = process.env.SANMAR_ACCOUNT;

  const soap = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://webservice.integration.sanmar.com/"><soapenv:Header/><soapenv:Body><web:getInventoryQtyForStyleColorSize><arg0>${acct}</arg0><arg1>${user}</arg1><arg2>${pass}</arg2><arg3>${style.trim().toUpperCase()}</arg3><arg4>${color.trim()}</arg4><arg5>${size.trim()}</arg5><arg6></arg6></web:getInventoryQtyForStyleColorSize></soapenv:Body></soapenv:Envelope>`;

  try {
    const r = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap,
    });
    const xml = await r.text();

    if (!xml.includes('errorOccurred>false')) {
      return res.status(200).json({ qty: null });
    }

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

    return res.status(200).json({ qty: total });
  } catch(err) {
    return res.status(200).json({ qty: null });
  }
}
