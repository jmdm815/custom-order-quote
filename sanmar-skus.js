// api/sanmar-skus.js
// Returns colors, sizes, images and inventory for a SanMar style

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { styleID } = req.query;
  if (!styleID) return res.status(400).json({ error: 'Missing styleID' });

  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  if (!user || !pass) return res.status(500).json({ error: 'SanMar credentials not configured.' });

  // Fetch product info (colors, sizes, images)
  const productSoap = `<?xml version="1.0" encoding="UTF-8"?>
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
      <arg1>${styleID.trim().toUpperCase()}</arg1>
    </web:getProductInfoByStyle>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await fetch(
      'https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort',
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
        body: productSoap,
      }
    );

    const xml = await response.text();

    if (xml.includes('errorOccurred>true') || xml.includes('authenticating failed')) {
      return res.status(401).json({ error: 'SanMar authentication failed.' });
    }

    const skus = parseSanMarSkus(xml, styleID);
    return res.status(200).json(skus);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}

function getXmlValue(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}

function getAllBlocks(xml, tag) {
  const blocks = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  let m;
  while ((m = re.exec(xml)) !== null) blocks.push(m[1]);
  return blocks;
}

function parseSanMarSkus(xml, styleID) {
  const base = 'https://www.sanmar.com/';
  const skus = [];

  // SanMar response has listResponse entries, each containing a productBasicInfo block
  const entries = getAllBlocks(xml, 'listResponse');

  entries.forEach(entry => {
    const colorName  = getXmlValue(entry, 'colorName')  || getXmlValue(entry, 'color') || 'Default';
    const colorHex   = getXmlValue(entry, 'color1')     || '#cccccc';
    const sizeName   = getXmlValue(entry, 'sizeName')   || getXmlValue(entry, 'size') || '?';
    const sku        = getXmlValue(entry, 'uniqueKey')  || getXmlValue(entry, 'gtin') || `${styleID}-${colorName}-${sizeName}`;
    const invRaw     = getXmlValue(entry, 'inventoryKey') || '0';
    const qty        = parseInt(getXmlValue(entry, 'qty') || '0') || 0;

    // Images — SanMar uses frontImage, backImage, sideImage
    const frontImg = getXmlValue(entry, 'frontImage') || getXmlValue(entry, 'colorFrontImage') || '';
    const backImg  = getXmlValue(entry, 'backImage')  || getXmlValue(entry, 'colorBackImage')  || '';
    const sideImg  = getXmlValue(entry, 'sideImage')  || getXmlValue(entry, 'colorSideImage')  || '';
    const swatchImg= getXmlValue(entry, 'colorSwatchImage') || '';

    skus.push({
      sku,
      styleID,
      colorName,
      color1: colorHex,
      sizeName,
      quantityAvailable: qty,
      colorFrontImage:  frontImg  ? (frontImg.startsWith('http')  ? frontImg  : base + frontImg)  : '',
      colorBackImage:   backImg   ? (backImg.startsWith('http')   ? backImg   : base + backImg)   : '',
      colorSideImage:   sideImg   ? (sideImg.startsWith('http')   ? sideImg   : base + sideImg)   : '',
      colorSwatchImage: swatchImg ? (swatchImg.startsWith('http') ? swatchImg : base + swatchImg) : '',
      colorOnModelFrontImage: '',
      colorOnModelSideImage:  '',
      colorOnModelBackImage:  '',
      _source: 'sanmar',
    });
  });

  return skus;
}
