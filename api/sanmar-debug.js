export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const acct = process.env.SANMAR_ACCOUNT;
  const user = process.env.SANMAR_USERNAME;
  const pass = process.env.SANMAR_PASSWORD;

  const results = {};

  // Try the PromoStandards product info endpoint
  const psProductSoap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <ns:wsVersion>2.0.0</ns:wsVersion>
      <ns:id>${user}</ns:id>
      <ns:password>${pass}</ns:password>
      <ns:localizationCountry>US</ns:localizationCountry>
      <ns:localizationLanguage>en</ns:localizationLanguage>
      <ns:productId>PC61</ns:productId>
      <ns:partId></ns:partId>
      <ns:colorName></ns:colorName>
      <ns:ApparelSizeArray></ns:ApparelSizeArray>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const r = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding?wsdl', {
      method: 'GET',
    });
    results.productDataWsdlStatus = r.status;
    const txt = await r.text();
    results.productDataWsdlPreview = txt.substring(0, 500);
  } catch(e) {
    results.productDataWsdlError = e.message;
  }

  // Also try fetching the product info service WSDL
  try {
    const r2 = await fetch('https://ws.sanmar.com:8080/SanMarWebService/SanMarProductInfoServicePort?wsdl');
    results.productInfoWsdlStatus = r2.status;
    const txt2 = await r2.text();
    results.productInfoWsdlPreview = txt2.substring(0, 500);
  } catch(e) {
    results.productInfoWsdlError = e.message;
  }

  res.status(200).json(results);
}
