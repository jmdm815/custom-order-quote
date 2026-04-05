export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const testUrl = 'https://cdnm.sanmar.com/medias/mcs/PC61_Aquatic_Blue_FM.jpg';

  // Test with various referer headers
  const tests = {};

  for (const [label, headers] of [
    ['no_headers', {}],
    ['with_referer', { 'Referer': 'https://www.sanmar.com/' }],
    ['with_useragent', { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120' }],
    ['both', { 'Referer': 'https://www.sanmar.com/', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120' }],
  ]) {
    try {
      const r = await fetch(testUrl, { method: 'HEAD', headers });
      tests[label] = { status: r.status, contentType: r.headers.get('content-type') };
    } catch(e) {
      tests[label] = { error: e.message };
    }
  }

  // Also try GET to see if it actually returns image bytes
  try {
    const r = await fetch(testUrl, {
      headers: { 'Referer': 'https://www.sanmar.com/', 'User-Agent': 'Mozilla/5.0' }
    });
    const buf = await r.arrayBuffer();
    tests['get_size'] = { status: r.status, bytes: buf.byteLength, contentType: r.headers.get('content-type') };
  } catch(e) {
    tests['get_error'] = e.message;
  }

  res.status(200).json(tests);
}
