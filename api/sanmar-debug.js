export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Test which colors have real images vs placeholder
  const colors = ['White', 'Black', 'Navy', 'Red', 'Royal', 'Athletic_Heather', 'Aquatic_Blue'];
  const results = {};

  for (const color of colors) {
    const url = `https://cdnm.sanmar.com/catalog/images/PC61_${color}_FM.jpg`;
    try {
      const r = await fetch(url);
      const buf = await r.arrayBuffer();
      // SanMar placeholder is ~12KB, real images are larger
      results[color] = { bytes: buf.byteLength, url };
    } catch(e) { results[color] = { error: e.message }; }
  }

  res.status(200).json(results);
}
