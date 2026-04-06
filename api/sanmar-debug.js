export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Get PC61 images from Redis and test first URL
  const redisRes = await fetch(`${REDIS_URL}/get/${encodeURIComponent('sanmar:images:PC61')}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const redisData = await redisRes.json();
  const imageMap = typeof redisData.result === 'string' ? JSON.parse(redisData.result) : redisData.result;
  const firstEntry = Object.entries(imageMap)[0];
  const colorSlug = firstEntry[0];
  const imgs = firstEntry[1];

  // Test if the front image URL actually returns an image
  const testUrl = imgs.front;
  let imgTest = {};
  try {
    const r = await fetch(testUrl, { headers: { 'Referer': 'https://www.sanmar.com/', 'User-Agent': 'Mozilla/5.0' } });
    const buf = await r.arrayBuffer();
    imgTest = { status: r.status, contentType: r.headers.get('content-type'), bytes: buf.byteLength };
  } catch(e) { imgTest = { error: e.message }; }

  res.status(200).json({ colorSlug, imgs, imgTest });
}
