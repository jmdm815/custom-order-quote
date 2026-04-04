export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  const results = {};

  // Try PromoStandards Media Content Service
  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/MediaService/1.0.0/"
                  xmlns:shared="http://www.promostandards.org/WSDL/MediaService/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetMediaContentRequest>
      <shared:wsVersion>1.0.0</shared:wsVersion>
      <shared:id>${user}</shared:id>
      <shared:password>${pass}</shared:password>
      <shared:mediaType>Image</shared:mediaType>
      <shared:productId>PC61</shared:productId>
    </ns:GetMediaContentRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const r = await fetch('https://ws.sanmar.com:8080/promostandards/MediaServiceBinding', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: soap,
    });
    const xml = await r.text();
    const urls = [...xml.matchAll(/https?:\/\/[^\s<>"]+/gi)].map(m => m[0]);
    results.mediaService = { status: r.status, urls: urls.slice(0, 20), preview: xml.substring(0, 3000) };
  } catch(e) { results.mediaServiceError = e.message; }

  // Also try checking what SanMar CDN patterns actually work for PC61
  const testUrls = [
    'https://www.sanmar.com/medias/mcs/PC61_Black_FM.jpg',
    'https://www.sanmar.com/medias/mcs/PC61_Black_FM.jpg',
    'https://cdn.sanmar.com/catalog/images/imglib/mresjpg/2021/m10/PC61_C7528_FM.jpg',
    'https://www.sanmar.com/catalog/images/imglib/mresjpg/2021/m10/PC61_C7528_FM.jpg',
  ];

  const cdnChecks = {};
  for (const url of testUrls) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      cdnChecks[url] = r.status;
    } catch(e) { cdnChecks[url] = 'error'; }
  }
  results.cdnChecks = cdnChecks;

  res.status(200).json(results);
}
