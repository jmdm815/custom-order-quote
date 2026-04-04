export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Fetch a real SanMar product page and extract image URLs
  try {
    const r = await fetch('https://www.sanmar.com/port-company-essential-tee-PC61', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await r.text();
    
    // Find all image URLs
    const imgUrls = [...html.matchAll(/https?:\/\/[^\s"']+\.jpg[^\s"']*/gi)].map(m => m[0]).filter(u => u.includes('PC61')).slice(0, 20);
    const allSanmarImgs = [...html.matchAll(/https?:\/\/[^\s"']*sanmar[^\s"']*\.jpg[^\s"']*/gi)].map(m => m[0]).slice(0, 10);
    
    res.status(200).json({ status: r.status, pc61Images: imgUrls, sanmarImages: allSanmarImgs, htmlSnippet: html.substring(0, 500) });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
