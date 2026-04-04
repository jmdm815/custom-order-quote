// api/search.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query param: q' });

  const username = process.env.SS_USERNAME;
  const apiKey   = process.env.SS_API_KEY;
  if (!username || !apiKey) return res.status(500).json({ error: 'S&S credentials not configured.' });

  const auth = {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${username}:${apiKey}`).toString('base64'),
      'Accept': 'application/json',
    }
  };

  const base = 'https://www.ssactivewear.com/';

  const normalize = (data) =>
    (Array.isArray(data) ? data : []).map(s => ({
      ...s,
      styleImage: s.styleImage ? base + s.styleImage : '',
      brandImage: s.brandImage ? base + s.brandImage : '',
    }));

  try {
    // Try 3 strategies and merge unique results

    // 1. Direct style lookup by name/number (e.g. "PC61")
    const directRes = await fetch(
      `https://api.ssactivewear.com/v2/styles/${encodeURIComponent(q)}?mediatype=json`,
      auth
    );
    const directData = directRes.ok ? await directRes.json() : [];
    const direct = normalize(directData);

    // 2. Keyword search
    const searchRes = await fetch(
      `https://api.ssactivewear.com/v2/styles?search=${encodeURIComponent(q)}&mediatype=json`,
      auth
    );
    const searchData = searchRes.ok ? await searchRes.json() : [];
    const search = normalize(searchData);

    // 3. Contains search as fallback
    const containsRes = await fetch(
      `https://api.ssactivewear.com/v2/styles?contains=${encodeURIComponent(q)}&mediatype=json`,
      auth
    );
    const containsData = containsRes.ok ? await containsRes.json() : [];
    const contains = normalize(containsData);

    // Merge, deduplicate by styleID
    const seen = new Set();
    const all = [];
    for (const s of [...direct, ...search, ...contains]) {
      const key = s.styleID || s.styleName;
      if (key && !seen.has(key)) { seen.add(key); all.push(s); }
    }

    return res.status(200).json(all.slice(0, 48));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach S&S API', detail: err.message });
  }
}
