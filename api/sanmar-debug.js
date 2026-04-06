export default async function handler(req, res) {
  const { clear } = req.query;
  if (clear) {
    const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
    const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
    await fetch(`${REDIS_URL}/del/${encodeURIComponent('sanmar:product:' + clear.toUpperCase())}`, {
      method: 'POST', headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    return res.status(200).json({ cleared: 'sanmar:product:' + clear.toUpperCase() });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  const r = await fetch(`${REDIS_URL}/get/${encodeURIComponent('sanmar:images:PC61')}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const data = await r.json();
  let val = data.result;
  while (typeof val === 'string') { try { val = JSON.parse(val); } catch(e) { break; } }
  
  // Show color slugs and their colorName field
  const colorInfo = Object.entries(val).slice(0, 20).map(([slug, imgs]) => ({
    slug, colorName: imgs.colorName, hasImage: !!imgs.front
  }));
  
  res.status(200).json({ totalColors: Object.keys(val).length, colorInfo });
}
// To clear PC61 cache, hit: /api/sanmar-debug?clear=PC61
