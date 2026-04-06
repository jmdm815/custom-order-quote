export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  const redisRes = await fetch(`${REDIS_URL}/get/${encodeURIComponent('sanmar:images:PC61')}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const redisData = await redisRes.json();
  
  // Show raw result to understand structure
  const raw = redisData.result;
  let parsed1, parsed2;
  try { parsed1 = JSON.parse(raw); } catch(e) { parsed1 = 'parse1 failed: ' + e.message; }
  try { parsed2 = typeof parsed1 === 'string' ? JSON.parse(parsed1) : parsed1; } catch(e) { parsed2 = 'parse2 failed: ' + e.message; }

  const firstEntry = typeof parsed2 === 'object' ? Object.entries(parsed2)[0] : null;

  res.status(200).json({
    rawType: typeof raw,
    rawPreview: String(raw).substring(0, 100),
    parsed1Type: typeof parsed1,
    parsed1Preview: typeof parsed1 === 'string' ? parsed1.substring(0, 100) : JSON.stringify(parsed1).substring(0, 100),
    parsed2Type: typeof parsed2,
    firstEntry,
  });
}
