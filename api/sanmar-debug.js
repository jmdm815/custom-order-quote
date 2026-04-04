export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Test image URLs for multi-word color names
  const testUrls = [
    'https://cdnm.sanmar.com/medias/mcs/PC61_Aquatic_Blue_FM.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_AquaticBlue_FM.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_Aquatic%20Blue_FM.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_Black_FM.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_Navy_FM.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_Athletic_Heather_FM.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_Black_SS.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_Navy_SS.jpg',
    'https://cdnm.sanmar.com/medias/mcs/PC61_Black_BM.jpg',
  ];

  const results = {};
  for (const url of testUrls) {
    try {
      const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
      results[url] = r.status;
    } catch(e) { results[url] = 'error'; }
  }
  res.status(200).json(results);
}
