// api/sanmar-skus.js
// Returns colors, sizes and inventory for a SanMar style via PromoStandards
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

  const productSoap = `<?xml version="1.0" encoding="UTF-8"?>
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
      <shared:productId>${styleID.trim().toUpperCase()}</shared:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const r = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      body: productSoap,
    });
    const xml = await r.text();

    // Use indexOf instead of regex — more reliable on large XML (600KB+)
    const getVal = (block, tag) => {
      // Try without namespace first, then with ns2:
      for (const t of [tag, `ns2:${tag}`]) {
        const open = `<${t}>`;
        const close = `</${t}>`;
        const i = block.indexOf(open);
        if (i === -1) continue;
        const start = i + open.length;
        const end = block.indexOf(close, start);
        if (end === -1) continue;
        return block.substring(start, end).trim();
      }
      return '';
    };

    // Extract all ProductPart blocks
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

    // Group by color
    const skuMap = {};
    const style = styleID.trim().toUpperCase();

    partBlocks.forEach(part => {
      const partId    = getVal(part, 'partId');
      const colorName = getVal(part, 'colorName');
      const size      = getVal(part, 'labelSize');
      if (!colorName || !size) return;

      const colorSlug = colorName
        .replace(/&amp;/gi, 'and')
        .replace(/&/g, 'and')
        .replace(/\s+/g, '_')
        .replace(/\//g, '_');

      const cdnBase = 'https://cdnm.sanmar.com/medias/mcs';
      const proxy = (url) => `/api/sanmar-image?url=${encodeURIComponent(url)}`;
      const frontImg  = proxy(`${cdnBase}/${style}_${colorSlug}_FM.jpg`);
      const backImg   = proxy(`${cdnBase}/${style}_${colorSlug}_BM.jpg`);
      const sideImg   = proxy(`${cdnBase}/${style}_${colorSlug}_SM.jpg`);
      const swatchImg = proxy(`${cdnBase}/${style}_${colorSlug}_SS.jpg`);

      if (!skuMap[colorName]) {
        skuMap[colorName] = {
          colorName,
          color1: '#888888',
          colorFrontImage:  frontImg,
          colorBackImage:   backImg,
          colorSideImage:   sideImg,
          colorSwatchImage: swatchImg,
          colorOnModelFrontImage: '',
          colorOnModelSideImage:  '',
          colorOnModelBackImage:  '',
          sizes: [],
        };
      }
      skuMap[colorName].sizes.push({ partId, size });
    });

    // Fetch inventory via PromoStandards Inventory Service
    let invMap = {};
    try {
      const invSoap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/1.0.0/"
                  xmlns:shared="http://www.promostandards.org/WSDL/InventoryService/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetInventoryLevelsRequest>
      <shared:wsVersion>1.0.0</shared:wsVersion>
      <shared:id>${user}</shared:id>
      <shared:password>${pass}</shared:password>
      <shared:productId>${style}</shared:productId>
    </ns:GetInventoryLevelsRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

      const invR = await fetch('https://ws.sanmar.com:8080/promostandards/InventoryServiceBinding', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
        body: invSoap,
      });
      const invXml = await invR.text();

      // Parse inventory using indexOf
      let invSearch = 0;
      while (true) {
        const start = invXml.indexOf('<PartInventory>', invSearch);
        if (start === -1) break;
        const end = invXml.indexOf('</PartInventory>', start);
        if (end === -1) break;
        const block = invXml.substring(start, end);
        const pid = getVal(block, 'partId');
        const qty = parseInt(getVal(block, 'value') || '0') || 0;
        if (pid) invMap[pid] = (invMap[pid] || 0) + qty;
        invSearch = end + '</PartInventory>'.length;
      }
    } catch(e) {
      // Inventory unavailable — default to in stock
    }

    // Build final SKU array
    const skus = [];
    Object.values(skuMap).forEach(color => {
      color.sizes.forEach(s => {
        skus.push({
          sku:              s.partId,
          styleID:          style,
          colorName:        color.colorName,
          color1:           color.color1,
          sizeName:         s.size,
          quantityAvailable: invMap[s.partId] !== undefined ? invMap[s.partId] : 999,
          colorFrontImage:  color.colorFrontImage,
          colorBackImage:   color.colorBackImage,
          colorSideImage:   color.colorSideImage,
          colorSwatchImage: color.colorSwatchImage,
          colorOnModelFrontImage: '',
          colorOnModelSideImage:  '',
          colorOnModelBackImage:  '',
          _source: 'sanmar',
        });
      });
    });

    return res.status(200).json(skus);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach SanMar API', detail: err.message });
  }
}
