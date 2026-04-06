// api/sanmar-image.js
// Proxies SanMar CDN images to bypass hotlink protection
export default async function handler(req, res) {
  let { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  // Handle swatch filenames — convert to full URL
  if (!url.startsWith('http')) {
    url = `https://cdnm.sanmar.com/imglib/swatches/${url}`;
  }

  // Only allow sanmar CDN domains
  if (!url.includes('sanmar.com')) {
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

    const contentType = r.headers.get('content-type') || 'image/jpeg';
    
    // If it returns HTML, it's a placeholder — return 404
    if (contentType.includes('text/html')) {
      return res.status(404).send('Not an image');
    }

    const buffer = await r.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch(err) {
    res.status(500).send('Proxy error');
  }
}
