export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Test known working SanMar image URL patterns
  const testUrls = [
    'https://www.sanmar.com/medias/PC61-BLACK-FRONT-282x282.jpg',
    'https://www.sanmar.com/medias/PC61-BLACK-282x282.jpg',
    'https://www.sanmar.com/medias/sys_master/images/PC61_Black_Front.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_Black_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/PC61_Black_FM.jpg',
    'https://www.sanmar.com/catalog/images/PC61_Black_FM.jpg',
    'https://cdnm.sanmar.com/imglib/mresjpg/2021/m10/PC61_C7528_FM.jpg',
    'https://www.sanmar.com/imglib/mresjpg/2021/m10/PC61_C7528_FM.jpg',
    'https://cdnm.sanmar.com/catalog/images/imglib/mresjpg/PC61_C7528_FM.jpg',
  ];

  const results = {};
  for (const url of testUrls) {
    try {
      const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
      results[url] = r.status;
    } catch(e) { results[url] = 'error: ' + e.message; }
  }

  // Also try fetching the actual sanmar product page with style number
  try {
    const r2 = await fetch('https://www.sanmar.com/PC61', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await r2.text();
    const imgs = [...html.matchAll(/https?:\/\/[^\s"']+(?:PC61|pc61)[^\s"']*/gi)].map(m=>m[0]).slice(0,10);
    results.pageImages = imgs;
    results.pageStatus = r2.status;
  } catch(e) { results.pageError = e.message; }

  res.status(200).json(results);
}
