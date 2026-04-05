export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Test many different URL patterns until we find one that returns image/jpeg
  const patterns = [
    'https://cdnm.sanmar.com/medias/mcs/PC61_Aquatic_Blue_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Black_FM.jpg',
    'https://cdnm.sanmar.com/imglib/mresjpg/2021/m10/PC61_C7528_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/imglib/mresjpg/PC61_C7528_FM.jpg',
    'https://cdnm.sanmar.com/medias/PC61-AQUATIC-BLUE-282x282.jpg',
    'https://cdnm.sanmar.com/medias/PC61-BLACK-282x282.jpg',
    'https://cdnm.sanmar.com/medias/sys_master/images/hfc/h7d/PC61_Black.jpg',
    'https://www.sanmar.com/medias/mcs/PC61_Black_FM.jpg',
  ];

  const results = {};
  for (const url of patterns) {
    try {
      const r = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
      const ct = r.headers.get('content-type') || '';
      const buf = await r.arrayBuffer();
      results[url] = { status: r.status, contentType: ct, bytes: buf.byteLength, isImage: ct.includes('image') };
    } catch(e) {
      results[url] = { error: e.message };
    }
  }

  res.status(200).json(results);
}
