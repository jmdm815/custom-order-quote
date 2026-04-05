export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Fetch the actual SanMar product page and extract real image URLs
  try {
    const r = await fetch('https://www.sanmar.com/pc61-port-company-essential-tee', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    const html = await r.text();

    // Extract all image URLs
    const imgUrls = [...new Set([
      ...[...html.matchAll(/https?:\/\/[^\s"']+\.jpg[^\s"']*/gi)].map(m => m[0]),
      ...[...html.matchAll(/https?:\/\/[^\s"']+\.png[^\s"']*/gi)].map(m => m[0]),
      ...[...html.matchAll(/https?:\/\/[^\s"']+\.webp[^\s"']*/gi)].map(m => m[0]),
    ])].filter(u => u.includes('sanmar') || u.includes('cdn')).slice(0, 30);

    // Also check JSON-LD or data attributes for image data
    const jsonMatches = [...html.matchAll(/"image":\s*"([^"]+)"/gi)].map(m => m[1]).slice(0, 10);
    const srcsetMatches = [...html.matchAll(/srcset="([^"]+)"/gi)].map(m => m[1]).slice(0, 5);

    res.status(200).json({
      status: r.status,
      imgUrls,
      jsonImages: jsonMatches,
      srcsets: srcsetMatches,
      htmlSnippet: html.substring(0, 1000),
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
