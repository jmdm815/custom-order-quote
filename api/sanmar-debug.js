export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Try cdnp.sanmar.com and other patterns
  const tests = [
    'https://cdnp.sanmar.com/medias/mcs/PC61_Black_FM.jpg',
    'https://cdnp.sanmar.com/catalog/images/PC61_Black_FM.jpg',
    'https://cdnp.sanmar.com/imglib/mresjpg/2021/m10/PC61_C7528_FM.jpg',
    // Try the SFTP image path patterns from their FTP guide
    'https://cdnm.sanmar.com/imglib/mresjpg/2021/m9/PC61_C7528_FM.jpg',
    'https://cdnm.sanmar.com/imglib/mresjpg/2022/m1/PC61_C7528_FM.jpg',
    'https://cdnm.sanmar.com/imglib/mresjpg/2020/m1/PC61_C7528_FM.jpg',
    // Try without year path
    'https://cdnm.sanmar.com/imglib/mresjpg/PC61_Black_FM.jpg',
    'https://cdnm.sanmar.com/imglib/imglib/mresjpg/PC61_Black_FM.jpg',
  ];

  const results = {};
  for (const url of tests) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const buf = await r.arrayBuffer();
      const ct = r.headers.get('content-type') || '';
      results[url] = { status: r.status, bytes: buf.byteLength, isRealImage: ct.includes('image') && buf.byteLength > 20000 };
    } catch(e) { results[url] = { error: e.message }; }
  }

  res.status(200).json(results);
}
