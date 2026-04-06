export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const testUrl = 'https://cdnm.sanmar.com/imglib/mresjpg/2020/f14/PC61_white_flat_front.jpg';
  const r = await fetch(testUrl, { headers: { 'Referer': 'https://www.sanmar.com/', 'User-Agent': 'Mozilla/5.0' } });
  const buf = await r.arrayBuffer();
  const ct = r.headers.get('content-type');
  res.status(200).json({ status: r.status, contentType: ct, bytes: buf.byteLength, isRealImage: ct?.includes('image') && buf.byteLength > 20000 });
}
