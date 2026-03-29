// api/quote.js
// Receives quote form data and sends a formatted email via Resend

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL       = process.env.QUOTE_TO_EMAIL;
  const FROM_EMAIL     = process.env.QUOTE_FROM_EMAIL;

  if (!RESEND_API_KEY || !TO_EMAIL || !FROM_EMAIL) {
    return res.status(500).json({ error: 'Email not configured. Check Vercel environment variables.' });
  }

  const { first, last, email, phone, notes, cart, artworkFiles } = req.body;

  if (!first || !last || !email) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Build order lines HTML grouped by style
  const byStyle = {};
  (cart || []).forEach(item => {
    const key = item.product.styleName || String(item.product.styleID) || 'Unknown';
    if (!byStyle[key]) byStyle[key] = { name: item.product.title || item.product.styleName, brand: item.product.brandName || '', items: [] };
    byStyle[key].items.push(item);
  });

  let orderHtml = '';
  let grandTotal = 0;

  Object.entries(byStyle).forEach(([styleNum, group]) => {
    orderHtml += `
      <tr><td colspan="2" style="padding:12px 0 4px;border-top:2px solid #e0dcd4;font-weight:600;font-size:13px;color:#1a1a1a">
        Style ${styleNum} — ${group.name} <span style="font-weight:400;color:#888">(${group.brand})</span>
      </td></tr>`;
    group.items.forEach(item => {
      const total = item.sizes.reduce((a, s) => a + (parseInt(s.qty) || 0), 0);
      grandTotal += total;
      const sizeList = item.sizes.map(s => `${s.size}: ${parseInt(s.qty) || 0}`).join(', ');
      const placements = (item.placements || []).map(p => p === 'Custom' && item.customPlacement ? `Custom: ${item.customPlacement}` : p).join(', ') || '—';
      orderHtml += `
        <tr><td style="padding:3px 0;color:#555;font-size:13px;width:130px">Color</td><td style="padding:3px 0;font-size:13px">${item.color.name}</td></tr>
        <tr><td style="padding:3px 0;color:#555;font-size:13px">Sizes & qty</td><td style="padding:3px 0;font-size:13px">${sizeList}</td></tr>
        <tr><td style="padding:3px 0;color:#555;font-size:13px">Service</td><td style="padding:3px 0;font-size:13px">${item.service || '—'}</td></tr>
        <tr><td style="padding:3px 0;color:#555;font-size:13px">Placement</td><td style="padding:3px 0;font-size:13px">${placements}</td></tr>
        <tr><td style="padding:3px 0 8px;color:#555;font-size:13px">Pieces</td><td style="padding:3px 0 8px;font-size:13px;font-weight:600">${total}</td></tr>`;
    });
  });

  // Artwork files list
  const artworkHtml = artworkFiles && artworkFiles.length
    ? artworkFiles.map(f => `<li style="font-size:13px;color:#444">${f.name} <span style="color:#888">(${(f.size/1024).toFixed(0)}KB)</span></li>`).join('')
    : '<li style="font-size:13px;color:#888">None uploaded</li>';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f4ef;margin:0;padding:32px 16px">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

    <div style="background:#1a1a1a;padding:24px 32px;text-align:center">
      <p style="color:#fff;font-size:18px;font-weight:600;margin:0;letter-spacing:0.02em">New Quote Request</p>
      <p style="color:#888;font-size:13px;margin:4px 0 0">buyjmmedia.com custom order configurator</p>
    </div>

    <div style="padding:32px">

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 12px">Customer</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
        <tr><td style="padding:3px 0;color:#555;font-size:13px;width:130px">Name</td><td style="padding:3px 0;font-size:13px;font-weight:600">${first} ${last}</td></tr>
        <tr><td style="padding:3px 0;color:#555;font-size:13px">Email</td><td style="padding:3px 0;font-size:13px"><a href="mailto:${email}" style="color:#c8392b">${email}</a></td></tr>
        <tr><td style="padding:3px 0;color:#555;font-size:13px">Phone</td><td style="padding:3px 0;font-size:13px">${phone || 'Not provided'}</td></tr>
      </table>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 12px">Order Details</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
        ${orderHtml}
        <tr style="border-top:2px solid #1a1a1a">
          <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#1a1a1a">Total pieces</td>
          <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#1a1a1a">${grandTotal}</td>
        </tr>
      </table>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 12px">Additional Notes</h2>
      <p style="font-size:13px;color:#444;background:#f7f4ef;border-radius:8px;padding:14px;margin:0 0 28px;line-height:1.6">${notes || 'None provided'}</p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 12px">Artwork Files</h2>
      <ul style="margin:0 0 0 16px;padding:0">${artworkHtml}</ul>

    </div>

    <div style="background:#f7f4ef;padding:16px 32px;text-align:center">
      <p style="font-size:12px;color:#aaa;margin:0">Sent from your custom order configurator at custom-order-quote.vercel.app</p>
    </div>

  </div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `JM Media Custom Orders <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `New Quote Request — ${first} ${last} — ${grandTotal} pieces`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email', detail: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
