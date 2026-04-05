// api/sanmar-image.js
// Proxies SanMar CDN images to bypass hotlink protection
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  // Only allow cdnm.sanmar.com URLs for security
  if (!url.startsWith('https://cdnm.sanmar.com/')) {
    return res.status(403).send('Forbidden');
  }

  try {
    const r = await fetch(url, {
      headers: {
        'Referer': 'https://www.sanmar.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!r.ok) return res.status(r.status).send('Image not found');

    const buffer = await r.arrayBuffer();
    const contentType = r.headers.get('content-type') || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch(err) {
    res.status(500).send('Proxy error');
  }
}
