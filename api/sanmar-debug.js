export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Test catalog/images pattern with various colors
  const tests = [
    'https://cdnm.sanmar.com/catalog/images/PC61_Black_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Aquatic_Blue_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Navy_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Black_BM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Black_SM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Black_SS.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Athletic_Heather_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Ath._Maroon_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Ath__Maroon_FM.jpg',
  ];

  const results = {};
  for (const url of tests) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      results[url] = { status: r.status, contentType: r.headers.get('content-type') };
    } catch(e) { results[url] = { error: e.message }; }
  }
  res.status(200).json(results);
}
