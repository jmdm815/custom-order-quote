// api/sanmar-debug.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Just fetch the WSDL to see what methods are available
    const response = await fetch(
      'https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort?wsdl',
      { headers: { 'Accept': 'text/xml' } }
    );
    const xml = await response.text();
    // Return first 5000 chars to see operations
    res.status(200).json({ status: response.status, wsdl: xml.substring(0, 5000) });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}
