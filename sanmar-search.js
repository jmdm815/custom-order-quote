// api/sanmar-search.js
// Search SanMar products by style number using their SOAP API
// SanMar's API doesn't support keyword search — customers must enter a style number

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { style } = req.query;
  if (!style) return res.status(400).json({ error: 'Missing style param' });

  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;
  if (!user || !pass) return res.status(500).json({ error: 'SanMar credentials not configured.' });

  // SanMar SOAP — getProductInfoByStyle returns all colors/sizes for a style
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
      <arg1>${style.trim().toUpperCase()}</arg1>
    </web:getProductInfoByStyle>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const response = await fetch(
      'https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '""',
        },
        body: soap,
      }
    );

    const xml = await response.text();

    // Check for auth error
    if (xml.includes('errorOccurred>true') || xml.includes('authenticating failed')) {
      return res.status(401).json({ error: 'SanMar authentication failed. Check credentials.' });
    }

    // Parse the XML response into a usable product object
    const product = parseSanMarProductXML(xml, style);
    if (!product) return res.status(404).json({ error: `Style ${style} not found in SanMar catalog.` });

    return res.status(200).json([product]); // return as array to match S&S format
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}

function getXmlValue(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}

function getAllXmlValues(xml, tag) {
  const results = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1].trim());
  return results;
}

function parseSanMarProductXML(xml, styleNum) {
  // Extract first product entry to get style-level info
  const title       = getXmlValue(xml, 'productTitle') || getXmlValue(xml, 'title') || styleNum;
  const brand       = getXmlValue(xml, 'brandName') || 'SanMar';
  const description = getXmlValue(xml, 'description') || '';
  const styleImage  = getXmlValue(xml, 'styleImage') || getXmlValue(xml, 'frontImage') || '';

  const imgUrl = styleImage
    ? (styleImage.startsWith('http') ? styleImage : 'https://www.sanmar.com/' + styleImage)
    : '';

  return {
    styleID:     styleNum.toUpperCase(),
    styleName:   styleNum.toUpperCase(),
    title,
    brandName:   brand,
    description,
    styleImage:  imgUrl,
    baseCategory: getXmlValue(xml, 'baseCategory') || getXmlValue(xml, 'categoryName') || '',
    _source:     'sanmar',
    _rawXml:     xml, // keep for SKU parsing
  };
}
