export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/"
                  xmlns:shared="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <shared:wsVersion>1.0.0</shared:wsVersion>
      <shared:id>${user}</shared:id>
      <shared:password>${pass}</shared:password>
      <shared:localizationCountry>US</shared:localizationCountry>
      <shared:localizationLanguage>en</shared:localizationLanguage>
      <shared:productId>PC61</shared:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const r = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
    body: soap,
  });
  const xml = await r.text();

  // The XML is 600KB — use indexOf instead of regex for reliability
  const partBlocks = [];
  let searchFrom = 0;
  while (true) {
    const start = xml.indexOf('<ProductPart>', searchFrom);
    if (start === -1) break;
    const end = xml.indexOf('</ProductPart>', start);
    if (end === -1) break;
    partBlocks.push(xml.substring(start + '<ProductPart>'.length, end));
    searchFrom = end + '</ProductPart>'.length;
  }

  // Parse first part
  const firstPart = partBlocks[0] || '';
  const getVal = (block, tag) => {
    const i = block.indexOf(`<${tag}>`);
    const i2 = block.indexOf(`<ns2:${tag}>`);
    const actualTag = i > -1 ? tag : (i2 > -1 ? `ns2:${tag}` : null);
    if (!actualTag) return '';
    const start = block.indexOf(`<${actualTag}>`) + `<${actualTag}>`.length;
    const end = block.indexOf(`</${actualTag}>`);
    return start > 0 && end > start ? block.substring(start, end).trim() : '';
  };

  const colorNames = [...new Set(partBlocks.map(p => getVal(p, 'colorName')).filter(Boolean))];
  const firstColor = colorNames[0] || '';
  const colorSlug = firstColor.replace(/\s+/g,'_').replace(/\//g,'_').replace(/&amp;/gi,'and').replace(/&/g,'and');
  const testUrl = `https://cdnm.sanmar.com/medias/mcs/PC61_${colorSlug}_FM.jpg`;

  let imgStatus = 0;
  try {
    const ir = await fetch(testUrl, { method: 'HEAD' });
    imgStatus = ir.status;
  } catch(e) {}

  res.status(200).json({
    xmlLength: xml.length,
    partBlockCount: partBlocks.length,
    colorNames: colorNames.slice(0, 5),
    firstColor,
    colorSlug,
    testUrl,
    imgStatus,
    firstPartPreview: firstPart.substring(0, 400),
  });
}
