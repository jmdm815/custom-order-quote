<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Custom Apparel Configurator</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<style>
  /* ── CONFIG ── Replace with your real values before going live */
  :root {
    --ss-api-key: "YOUR_SS_API_KEY_HERE";
    --your-email: "YOUR_EMAIL@YOURDOMAIN.COM";
    --emailjs-service: "YOUR_EMAILJS_SERVICE_ID";
    --emailjs-template: "YOUR_EMAILJS_TEMPLATE_ID";
    --emailjs-public: "YOUR_EMAILJS_PUBLIC_KEY";
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1a1a1a;
    --ink2: #4a4a4a;
    --ink3: #8a8a8a;
    --paper: #f7f4ef;
    --paper2: #edeae3;
    --paper3: #e0dcd4;
    --accent: #c8392b;
    --accent2: #e8551e;
    --white: #ffffff;
    --radius: 12px;
    --radius-sm: 6px;
    --shadow: 0 2px 12px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
    --font-display: 'DM Serif Display', Georgia, serif;
    --font-body: 'DM Sans', sans-serif;
  }

  body {
    font-family: var(--font-body);
    background: var(--paper);
    color: var(--ink);
    min-height: 100vh;
    line-height: 1.6;
  }

  /* ── HEADER ── */
  .site-header {
    background: var(--ink);
    color: var(--white);
    padding: 24px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .site-header h1 {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 0.01em;
  }
  .site-header .badge {
    background: var(--accent);
    color: #fff;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 20px;
  }

  /* ── LAYOUT ── */
  .app {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  .steps-bar {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 40px;
    background: var(--white);
    border-radius: var(--radius);
    padding: 6px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  .step-btn {
    flex: 1;
    padding: 10px 8px;
    background: none;
    border: none;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 400;
    color: var(--ink3);
    cursor: pointer;
    border-radius: 8px;
    transition: all .2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }
  .step-btn .num {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--paper2);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 500;
    flex-shrink: 0;
    transition: all .2s;
  }
  .step-btn.active {
    background: var(--ink);
    color: var(--white);
    font-weight: 500;
  }
  .step-btn.active .num { background: var(--accent); color: #fff; }
  .step-btn.done { color: var(--ink2); }
  .step-btn.done .num { background: #d4edda; color: #1a6a2e; }

  /* ── PANELS ── */
  .panel { display: none; }
  .panel.active { display: block; animation: fadeUp .3s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

  .panel-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 400;
    margin-bottom: 6px;
  }
  .panel-sub {
    color: var(--ink3);
    font-size: 14px;
    margin-bottom: 28px;
  }

  /* ── CATEGORIES ── */
  .cat-bar {
    display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;
  }
  .cat-btn {
    padding: 8px 16px;
    border-radius: 20px;
    border: 1.5px solid var(--paper3);
    background: var(--white);
    font-family: var(--font-body);
    font-size: 13px; font-weight: 400;
    color: var(--ink2);
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
  }
  .cat-btn:hover { border-color: var(--ink2); color: var(--ink); }
  .cat-btn.active { background: var(--ink); color: var(--white); border-color: var(--ink); font-weight: 500; }
  .subcat-bar {
    display: none; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;
    padding: 12px 14px;
    background: var(--paper2);
    border-radius: var(--radius);
  }
  .subcat-bar.visible { display: flex; }
  .subcat-btn {
    padding: 5px 12px;
    border-radius: 20px;
    border: 1.5px solid var(--paper3);
    background: var(--white);
    font-family: var(--font-body);
    font-size: 12px; font-weight: 400;
    color: var(--ink2);
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
  }
  .subcat-btn:hover { border-color: var(--ink2); color: var(--ink); }
  .subcat-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); font-weight: 500; }

  /* ── SEARCH ── */
  .search-wrap {
    position: relative;
    margin-bottom: 28px;
  }
  .search-wrap input {
    width: 100%;
    padding: 14px 20px 14px 48px;
    border: 1.5px solid var(--paper3);
    border-radius: var(--radius);
    font-family: var(--font-body);
    font-size: 15px;
    background: var(--white);
    color: var(--ink);
    outline: none;
    transition: border-color .2s;
  }
  .search-wrap input:focus { border-color: var(--ink); }
  .search-wrap input::placeholder { color: var(--ink3); }
  .search-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: var(--ink3); pointer-events: none;
  }
  .search-btn {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    background: var(--ink);
    color: #fff;
    border: none;
    padding: 8px 18px;
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background .2s;
  }
  .search-btn:hover { background: var(--accent); }

  /* ── SORT BAR ── */
  .sort-bar {
    display: none;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--ink3);
  }
  .sort-bar.visible { display: flex; }
  .sort-select {
    padding: 6px 12px;
    border: 1.5px solid var(--paper3);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--ink);
    background: var(--white);
    outline: none;
    cursor: pointer;
    transition: border-color .15s;
  }
  .sort-select:focus { border-color: var(--ink); }
  .result-count { margin-left: auto; color: var(--ink3); font-size: 12px; }

  /* ── PRODUCT GRID ── */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  .product-card {
    background: var(--white);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all .2s;
    box-shadow: var(--shadow);
  }
  .product-card:hover { border-color: var(--ink); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .product-card.selected { border-color: var(--accent); }
  .product-card img {
    width: 100%; height: 180px; object-fit: cover;
    background: var(--paper2);
    display: block;
  }
  .product-card .img-placeholder {
    width: 100%; height: 180px;
    background: var(--paper2);
    display: flex; align-items: center; justify-content: center;
    color: var(--ink3); font-size: 13px;
  }
  .product-card .card-body { padding: 14px; }
  .product-card .card-style { font-size: 11px; color: var(--ink3); text-transform: uppercase; letter-spacing: 0.06em; }
  .product-card .card-name { font-size: 14px; font-weight: 500; margin: 4px 0 6px; line-height: 1.3; }
  .product-card .card-brand { font-size: 12px; color: var(--ink3); }

  /* ── COLOR PICKER ── */
  .color-grid {
    display: flex; flex-wrap: wrap; gap: 10px 10px;
    row-gap: 24px;
    margin-bottom: 28px;
  }
  .color-swatch {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    position: relative;
    transition: all .15s;
    outline: 2px solid var(--paper3);
  }
  .color-swatch:hover { transform: scale(1.12); }
  .color-swatch.selected { border-color: var(--ink); outline-color: var(--ink); }
  .color-swatch .swatch-name {
    display: none;
    position: absolute; bottom: calc(100% + 7px); left: 50%; transform: translateX(-50%);
    white-space: nowrap; font-size: 10px; color: var(--ink2); background: var(--white);
    padding: 3px 8px; border-radius: 4px; box-shadow: var(--shadow);
    pointer-events: none; z-index: 10;
    border: 1px solid var(--paper3);
  }
  .color-swatch:hover .swatch-name { display: block; }
  .color-label { font-size: 14px; color: var(--ink2); margin-bottom: 10px; font-weight: 500; }

  /* ── PRODUCT DETAIL ── */
  .detail-layout {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 32px;
    align-items: start;
  }
  @media (max-width: 680px) { .detail-layout { grid-template-columns: 1fr; } }
  .detail-img {
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--paper2);
    aspect-ratio: 1;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .detail-img img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .detail-img .no-img { color: var(--ink3); font-size: 14px; }
  .thumb-strip {
    display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;
  }
  .thumb {
    width: 64px; height: 64px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    background: var(--paper2);
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .thumb img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .thumb.active { border-color: var(--ink); }
  .thumb:hover { border-color: var(--ink2); }
  .thumb-label {
    font-size: 10px; text-align: center; color: var(--ink3);
    margin-top: 3px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .detail-info .brand { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink3); margin-bottom: 4px; }
  .detail-info h2 { font-family: var(--font-display); font-size: 24px; font-weight: 400; margin-bottom: 4px; }
  .detail-info .style-num { font-size: 13px; color: var(--ink3); margin-bottom: 20px; }

  /* ── PRODUCT DESCRIPTION ── */
  .product-desc {
    margin-top: 16px;
  }
  .product-desc-label {
    font-size: 11px; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.07em; color: var(--ink3); margin-bottom: 8px;
  }
  .product-desc ul {
    list-style: none; padding: 0; margin: 0;
  }
  .product-desc ul li {
    font-size: 13px; color: var(--ink2); padding: 3px 0 3px 16px;
    position: relative; line-height: 1.5;
  }
  .product-desc ul li::before {
    content: '·'; position: absolute; left: 4px; color: var(--ink3); font-weight: 700;
  }
  .product-desc .desc-loading { font-size: 13px; color: var(--ink3); }

  /* ── SIZE QTY TABLE ── */
  .size-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .size-table th {
    text-align: center; padding: 8px 6px;
    font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--ink3); border-bottom: 1.5px solid var(--paper3);
  }
  .size-table td { padding: 8px 6px; text-align: center; vertical-align: middle; }
  .size-table .size-name { font-size: 13px; font-weight: 500; }
  .size-table .stock-badge {
    font-size: 11px; padding: 2px 8px; border-radius: 20px;
  }
  .stock-badge.in { background: #d4edda; color: #1a6a2e; }
  .stock-badge.low { background: #fff3cd; color: #856404; }
  .stock-badge.out { background: #f8d7da; color: #842029; }
  .size-table .qty-input {
    width: 64px; padding: 6px 8px;
    border: 1.5px solid var(--paper3); border-radius: var(--radius-sm);
    font-family: var(--font-body); font-size: 14px; text-align: center;
    outline: none; transition: border-color .15s;
  }
  .size-table .qty-input:focus { border-color: var(--ink); }
  .size-table .qty-input:disabled { background: var(--paper2); color: var(--ink3); }

  /* ── SERVICE SELECTOR ── */
  .service-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
    margin-bottom: 28px;
  }
  @media (max-width: 520px) { .service-grid { grid-template-columns: 1fr; } }
  .service-card {
    border: 2px solid var(--paper3);
    border-radius: var(--radius);
    padding: 20px 16px;
    cursor: pointer;
    transition: all .2s;
    text-align: center;
    background: var(--white);
  }
  .service-card:hover { border-color: var(--ink2); }
  .service-card.selected { border-color: var(--accent); background: #fff5f4; }
  .service-card .svc-icon { font-size: 28px; margin-bottom: 10px; }
  .service-card .svc-name { font-weight: 500; font-size: 15px; margin-bottom: 4px; }
  .service-card .svc-desc { font-size: 12px; color: var(--ink3); line-height: 1.4; }

  /* ── FORM ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 520px) { .form-grid { grid-template-columns: 1fr; } }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field.full { grid-column: 1 / -1; }
  .field label { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink2); }
  .field input, .field textarea, .field select {
    padding: 11px 14px;
    border: 1.5px solid var(--paper3);
    border-radius: var(--radius-sm);
    font-family: var(--font-body); font-size: 14px;
    background: var(--white); color: var(--ink);
    outline: none; transition: border-color .2s;
    resize: vertical;
  }
  .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--ink); }

  /* ── ARTWORK UPLOAD ── */
  .artwork-section { margin-top: 20px; }
  .artwork-label {
    font-size: 12px; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--ink2); display: block; margin-bottom: 8px;
  }
  .artwork-drop {
    border: 2px dashed var(--paper3);
    border-radius: var(--radius);
    padding: 28px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color .2s, background .2s;
    background: var(--white);
    position: relative;
  }
  .artwork-drop:hover, .artwork-drop.dragover {
    border-color: var(--ink2);
    background: var(--paper2);
  }
  .artwork-drop input[type=file] {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .artwork-drop-icon { font-size: 28px; margin-bottom: 8px; }
  .artwork-drop-text { font-size: 13px; color: var(--ink2); margin-bottom: 4px; }
  .artwork-drop-sub { font-size: 11px; color: var(--ink3); }
  .artwork-files { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .artwork-file {
    display: flex; align-items: center; gap: 10px;
    background: var(--paper2); border-radius: var(--radius-sm);
    padding: 8px 12px; font-size: 13px;
  }
  .artwork-file-icon { font-size: 18px; flex-shrink: 0; }
  .artwork-file-name { flex: 1; color: var(--ink2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .artwork-file-size { font-size: 11px; color: var(--ink3); flex-shrink: 0; }
  .artwork-file-remove {
    background: none; border: none; color: var(--ink3); cursor: pointer;
    font-size: 16px; padding: 0 2px; flex-shrink: 0; line-height: 1;
    transition: color .15s;
  }
  .artwork-file-remove:hover { color: var(--accent); }
  .artwork-limit { font-size: 11px; color: var(--ink3); margin-top: 6px; }

  /* ── ORDER SUMMARY ── */
  .summary-box {
    background: var(--white);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: var(--shadow);
  }
  .summary-box h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ink3); margin-bottom: 14px; }
  .summary-row { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; border-bottom: 1px solid var(--paper2); font-size: 14px; }
  .summary-row:last-child { border-bottom: none; }
  .summary-row .label { color: var(--ink2); }
  .summary-row .val { font-weight: 500; }

  /* ── BUTTONS ── */
  .btn-row { display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px; }
  .btn {
    padding: 13px 28px;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 14px; font-weight: 500;
    border: none; cursor: pointer;
    transition: all .2s;
  }
  .btn-primary { background: var(--ink); color: #fff; }
  .btn-primary:hover { background: var(--accent); }
  .btn-primary:disabled { background: var(--ink3); cursor: not-allowed; }
  .btn-secondary { background: var(--paper2); color: var(--ink); }
  .btn-secondary:hover { background: var(--paper3); }
  .btn-outline { background: none; border: 1.5px solid var(--paper3); color: var(--ink2); }
  .btn-outline:hover { border-color: var(--ink); color: var(--ink); }

  /* ── LOADING / EMPTY ── */
  .loading { text-align: center; padding: 60px 20px; color: var(--ink3); }
  .spinner {
    width: 32px; height: 32px; border: 3px solid var(--paper3);
    border-top-color: var(--ink); border-radius: 50%;
    animation: spin .7s linear infinite; margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty { text-align: center; padding: 60px 20px; color: var(--ink3); font-size: 15px; }

  /* ── SUCCESS ── */
  .success-screen {
    text-align: center; padding: 60px 20px;
  }
  .success-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: #d4edda; color: #1a6a2e;
    font-size: 28px; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 24px;
  }
  .success-screen h2 { font-family: var(--font-display); font-size: 30px; margin-bottom: 10px; }
  .success-screen p { color: var(--ink2); max-width: 420px; margin: 0 auto 28px; }

  /* ── NOTICE ── */
  .notice {
    background: #fff3cd; border: 1px solid #ffc107; border-radius: var(--radius-sm);
    padding: 12px 16px; font-size: 13px; color: #664d03; margin-bottom: 20px;
  }
  .notice a { color: var(--accent); }

  .tag {
    display: inline-block;
    background: var(--paper2); color: var(--ink2);
    font-size: 11px; padding: 3px 8px; border-radius: 20px;
    margin: 2px;
  }

  /* ── CART ── */
  .cart-fab {
    position: fixed; bottom: 28px; right: 28px;
    background: var(--ink); color: #fff;
    border: none; border-radius: 50px;
    padding: 14px 22px;
    font-family: var(--font-body); font-size: 14px; font-weight: 500;
    cursor: pointer; box-shadow: var(--shadow-lg);
    display: flex; align-items: center; gap: 10px;
    transition: background .2s, transform .15s;
    z-index: 999;
  }
  .cart-fab:hover { background: var(--accent); transform: translateY(-2px); }
  .cart-fab .cart-count {
    background: var(--accent); color: #fff;
    border-radius: 50%; width: 22px; height: 22px;
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .cart-fab.hidden { display: none; }

  /* Cart drawer */
  .cart-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.4); z-index: 1000;
  }
  .cart-overlay.open { display: block; }
  .cart-drawer {
    position: fixed; top: 0; right: -480px; width: 480px; max-width: 100vw;
    height: 100vh; background: var(--white);
    box-shadow: -4px 0 32px rgba(0,0,0,0.15);
    display: flex; flex-direction: column;
    transition: right .3s cubic-bezier(.4,0,.2,1);
    z-index: 1001;
  }
  .cart-drawer.open { right: 0; }
  .cart-header {
    padding: 20px 24px; border-bottom: 1px solid var(--paper3);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .cart-header h2 { font-family: var(--font-display); font-size: 20px; font-weight: 400; }
  .cart-close {
    background: none; border: none; cursor: pointer;
    color: var(--ink2); font-size: 22px; line-height: 1;
    padding: 4px 8px; border-radius: 4px;
    transition: color .15s;
  }
  .cart-close:hover { color: var(--accent); }
  .cart-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
  .cart-empty { text-align: center; padding: 60px 20px; color: var(--ink3); font-size: 14px; }
  .cart-footer { padding: 16px 24px; border-top: 1px solid var(--paper3); flex-shrink: 0; }

  /* Cart item card */
  .cart-item {
    background: var(--paper);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
    position: relative;
  }
  .cart-item-header {
    display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;
  }
  .cart-item-img {
    width: 56px; height: 56px; border-radius: 8px;
    object-fit: contain; background: var(--paper2); flex-shrink: 0;
  }
  .cart-item-img-placeholder {
    width: 56px; height: 56px; border-radius: 8px;
    background: var(--paper2); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: var(--ink3);
  }
  .cart-item-info { flex: 1; }
  .cart-item-style { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ink3); }
  .cart-item-name { font-size: 14px; font-weight: 500; line-height: 1.3; margin: 2px 0 3px; }
  .cart-item-color { font-size: 12px; color: var(--ink3); }
  .cart-item-remove {
    background: none; border: none; cursor: pointer;
    color: var(--ink3); font-size: 16px; padding: 2px 4px;
    border-radius: 4px; transition: color .15s; flex-shrink: 0;
  }
  .cart-item-remove:hover { color: var(--accent); }
  .cart-item-sizes {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;
  }
  .cart-size-tag {
    background: var(--white); border: 1px solid var(--paper3);
    border-radius: 4px; padding: 3px 8px;
    font-size: 12px; color: var(--ink2);
  }
  .cart-item-service { margin-top: 4px; }
  .cart-item-service label {
    font-size: 11px; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--ink3); display: block; margin-bottom: 6px;
  }
  .svc-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .svc-pill {
    padding: 5px 12px; border-radius: 20px;
    border: 1.5px solid var(--paper3); background: var(--white);
    font-family: var(--font-body); font-size: 12px; color: var(--ink2);
    cursor: pointer; transition: all .15s;
  }
  .svc-pill:hover { border-color: var(--ink2); color: var(--ink); }
  .svc-pill.active { background: var(--ink); color: #fff; border-color: var(--ink); }

  /* Add to cart button on step 2 */
  .add-to-cart-btn {
    background: var(--accent); color: #fff;
    border: none; border-radius: var(--radius-sm);
    padding: 13px 28px; font-family: var(--font-body);
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: background .2s;
  }
  .add-to-cart-btn:hover { background: #a82e22; }
  .add-to-cart-btn:disabled { background: var(--ink3); cursor: not-allowed; }
</style>
<header class="site-header">
<a onclick="goStep(1)" style="cursor:pointer;display:inline-block;line-height:0" title="Back to catalog">
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 48 49.1" style="height:84px;width:auto;display:block;">
  <defs>
    <style>
      .st0 { fill: none; }
      .st1 { fill: #ed1c24; }
      .st2 { fill: #222a44; }
      .st3 { fill: #fff; }
      .st4 { fill: #fdfefe; }
      .st5 { clip-path: url(#clippath); }
    </style>
    <clipPath id="clippath">
      <rect class="st0" width="48" height="49.1"/>
    </clipPath>
  </defs>
  <g class="st5">
    <path class="st2" d="M46.7,21.6c-.3-.3-.6-.6-.9-.9.1-.3.2-.5.2-.8s0-.7,0-1c0-.9,0-1.8,0-2.7,0-.6-.2-1.2-.6-1.8-.8-1.3-2.1-2-3.8-2-1.6,0-3.2,0-4.8,0,0-.3-.3-.5-.5-.7l-.2-.2c-.1-.1-.3-.2-.4-.4L27.1,2.6h0c-.2-.2-.4-.5-.8-.7-1.7-1-3.8-.8-5.3.6-2.8,2.7-5.7,5.6-9.1,8.8-.4.3-.5.6-.7.9-1.6,0-3.3,0-4.9,0-2.5,0-4.3,1.7-4.3,4.2,0,1.1,0,2.1,0,3.1,0,.4,0,.8.2,1.1-.3.3-.6.6-1,.9C.5,22.4,0,23.5,0,24.5c0,1.1.4,2.1,1.3,2.9.3.3.6.6,1,.9,0,0,0,0,0,0,0,.1-.2.4-.2.9,0,.3,0,.5,0,.8h0c0,1,0,1.9,0,2.8,0,.7.2,1.3.6,1.9.8,1.3,2.1,2,3.7,2,1.6,0,3.2,0,4.8,0,.1.3.3.7.7,1,3.1,3,6.1,5.9,9.1,8.8.7.7,1.6,1.1,2.5,1.2.2,0,.3,0,.5,0,1.1,0,2.2-.4,3-1.3,1.8-1.8,3.6-3.5,5.4-5.3l.2-.2c1.2-1.1,2.3-2.3,3.5-3.4.3-.3.5-.6.6-.9.4,0,.8,0,1.2,0h0c1.3,0,2.6,0,3.9,0,2,0,3.7-1.4,4-3.3,0-.5,0-.9,0-1.2,0-.1,0-.2,0-.3,0-.6,0-1.2,0-1.9,0-.3,0-.5,0-.8s0-.6-.2-.8c.3-.3.6-.6.9-.8,1.7-1.7,1.8-4.2,0-5.9"/>
    <path class="st4" d="M3.4,19.7c0,0,0-.2,0-.2,0-1.1,0-2.1,0-3.2,0-1.4,1-2.3,2.4-2.3,3.7,0,7.4,0,11.1,0,8.4,0,16.8,0,25.2,0,.9,0,1.6.3,2.1,1.1.2.3.3.6.3.9,0,1.2,0,2.5,0,3.8-.3-.3-.5-.5-.7-.7-.2-.2-.2-.3-.2-.6,0-.7,0-1.5,0-2.2,0-.9-.5-1.4-1.4-1.4-5.5,0-11.1,0-16.6,0-6.5,0-13,0-19.5,0-.4,0-.8,0-1.1.2-.3.2-.5.6-.5,1,0,.8,0,1.6,0,2.4,0,.2,0,.3-.2.4-.3.2-.5.5-.8.8"/>
    <path class="st4" d="M44.5,29.4c0,.9,0,1.8,0,2.7,0,.4,0,.8,0,1.2-.2,1-1,1.8-2.1,1.8-1.8,0-3.6,0-5.5,0-10.4,0-20.7,0-31.1,0-.9,0-1.6-.3-2.1-1.1-.2-.3-.3-.6-.3-.9,0-1.2,0-2.5,0-3.7,0,0,0,0,0,0,.3.3.6.6.9.9,0,0,0,.2,0,.2,0,.8,0,1.6,0,2.3,0,.9.7,1.4,1.4,1.4,10.4,0,20.7,0,31.1,0s3.5,0,5.3,0c.9,0,1.4-.5,1.4-1.4,0-.8,0-1.6,0-2.3,0-.1,0-.2.1-.3.3-.3.5-.5.9-.8"/>
    <path class="st1" d="M12.7,12.7c0-.1,0-.2.2-.2,3.1-3,6.3-6.1,9.4-9.1.8-.8,2-1,2.9-.4.2.1.3.3.5.4,3,2.9,6,5.8,8.9,8.7.2.2.4.4.7.6-.3,0-.5,0-.8,0-.5,0-.8-.1-1.2-.5-2.8-2.7-5.6-5.4-8.4-8.2-.4-.4-.8-.6-1.4-.4-.2,0-.4.2-.6.3-1.5,1.5-3.1,3-4.6,4.5-1.4,1.4-2.8,2.7-4.2,4.1,0,0,0,.1-.2.1-.4,0-.8,0-1.3,0"/>
    <path class="st1" d="M35.2,36.4c0,.1-.1.2-.2.2-3.1,3-6.3,6.1-9.4,9.1-.5.5-1.2.8-2,.7-.6,0-1-.3-1.4-.7-3.1-3-6.3-6.1-9.4-9.1,0,0-.1,0-.1-.2,0,0,.1,0,.2,0,.3,0,.6,0,.9,0,.1,0,.2,0,.3.1,2.9,2.8,5.8,5.7,8.7,8.5.6.6,1.4.6,2,0,2.9-2.8,5.8-5.6,8.7-8.4.1-.1.3-.2.5-.2.3,0,.7,0,1,0"/>
    <path class="st1" d="M10.4,32.9c-.5,0-.9,0-1.3,0,0,0-.1,0-.2-.1-2.3-2.2-4.5-4.4-6.8-6.6-.9-.9-.9-2.3,0-3.2,2.3-2.2,4.5-4.4,6.8-6.6,0,0,.1-.1.2-.1.4,0,.8,0,1.3,0,0,.1-.1.2-.2.2-2.4,2.4-4.9,4.7-7.3,7.1-.3.3-.5.7-.4,1.2,0,.3.2.5.4.7.9.9,1.8,1.7,2.6,2.6,1.6,1.5,3.2,3.1,4.8,4.6,0,0,0,0,.2.2"/>
    <path class="st1" d="M37.5,16.2c.5,0,.9,0,1.3,0,0,0,.1,0,.2.1,2.3,2.2,4.5,4.4,6.8,6.6,1,1,1,2.3,0,3.3-2.2,2.2-4.5,4.3-6.7,6.5-.1.1-.2.2-.4.2-.3,0-.6,0-.9,0,0,0-.1,0-.1,0,0,0,0,0,0-.1,0,0,0,0,0,0,1.5-1.4,2.9-2.8,4.4-4.2,1-.9,1.9-1.9,2.9-2.8.4-.4.6-.7.5-1.3,0-.3-.2-.6-.5-.8-.9-.9-1.8-1.7-2.7-2.6-1.6-1.5-3.2-3.1-4.8-4.6,0,0,0,0,0-.1"/>
    <path class="st3" d="M37,26.3c-.6-.6-1.7-.5-2.1.3-.1.2-.2.4-.3.7-.3.6-.6,1.2-1,1.7-.4.4-.8.9-1.5.9-.5,0-.8-.2-.8-.7,0-.2,0-.4.1-.5.5-1.4,1-2.7,1.5-4.1.5-1.3.9-2.6,1.4-3.8.2-.5.3-1,.3-1.3,0-1.6-.9-2.8-2.3-3.2-1.5-.4-2.9,0-4.2.9-.3.3-.3.3-.6,0-.3-.4-.7-.7-1.2-.9-1-.3-2-.2-2.8.4,0-.3-.1-.5-.5-.5,0,0,0,0-.1,0-.2,0-.4,0-.6,0-.4,0-.8,0-1.2,0h0c-.2,0-.5,0-.7,0-1,0-1.9,0-2.7,0-.6,0-1,.2-1.3.7-.3.5-.3.9,0,1.3.2.4.6.5,1,.5.6,0,1.3,0,1.9,0s.3,0,.3,0c0,0,0,.1,0,.3-.9,2.6-1.8,5.2-2.7,7.8-.3.7-.5,1.5-.8,2.2,0,.1-.1.2-.2.3,0,0,0,0,0,0-.3.5-.8.7-1.4.8-.5,0-.9-.2-.8-.7,0-.2,0-.4,0-.5-.3-.5-.9-.8-1.5-.7-.6,0-1.1.5-1.2,1.1-.1.8.1,1.5.6,2.2,1.1,1.3,2.9,1.6,4.4,1.1.3,0,.5-.2.8-.3,1-.5,1.8-1.3,2.4-2.4,0,0,0,0,0-.1.4-.8.7-1.7,1-2.6.7-2,1.4-4,2.1-6t0,0c.1-.3.3-.6.5-.8.4-.5.8-.8,1.4-1,.6-.2,1,0,1.1.7,0,.3,0,.6-.1.9-.5,1.4-1,2.9-1.5,4.3-.6,1.8-1.3,3.5-1.9,5.2-.2.5-.2,1,.2,1.4.5.4,1,.5,1.6.3.6-.2,1-.7,1.2-1.3,1.1-3.1,2.2-6.2,3.4-9.4.2-.5.4-.9.7-1.3.4-.5.9-.9,1.6-1,.6,0,1,.3,1,.8,0,.3,0,.5-.2.8-.7,2-1.4,4-2.2,6-.2.6-.5,1.2-.6,1.9-.2,1.2.3,2.5,1.3,3,1.4.7,2.8.7,4.2,0,1.9-1,2.7-2.8,3.3-4.7,0-.3,0-.5-.2-.8"/>
    <path class="st3" d="M17,36.9c0,0,0,0,.1,0h0c0,0,0,0,0,0h0c0,0,0-.1,0-.1h0s0,0,0,0c0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0,0,0,0-.1,0-.2s0-.1,0-.2,0-.1.1-.2c0,0,.1,0,.2,0,0,0,.1,0,.2,0,0,0,.1,0,.2,0,0,0,0,0,.1,0,0,0,.1,0,.2,0,0,0,0,0,.1.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1,0,.2,0,0,0,.1,0,.2s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,.2,0,0,0,.1-.1.2,0,0,0,0-.1.1,0,0,0,0,0,0h0s0,0,0,0h0s0,0,0,0c-.1,0-.3.1-.4.1s-.2,0-.3,0c-.1,0-.2,0-.3-.1,0,0-.1,0-.1-.1,0,0,0,0,0,0,0,0,0,0,0-.1s0,0,0,0c0,0,0,0,.2,0M17.4,37.2s0,0,0,0c0,0,0,0,0,0,.1,0,.2,0,.3-.1,0,0,.1-.1.2-.2,0,0,0-.1,0-.1,0,0,0,0,0,0,0-.2,0-.3-.2-.3,0,0-.2,0-.3,0s0,0,0,0c0,0,0,0-.1,0,0,0,0,0,0,0,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0h0c0,0,0,0,.1-.1,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0s0,0,0,0c0,0,0,0-.1,0,0,0,0,0,0,0h0c0,0,0,0,0,0h0c0,.1,0,.2,0,.2h0c0,.1,0,.1,0,.1h0Z"/>
    <path class="st3" d="M18.9,37.1h0c0,0,0,.1,0,.1,0,0,0,0,.1,0,0,0,0,0,0,.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0h-.1c-.2,0-.2,0-.2-.2,0,0,0,0,0,0h0c0-.1,0-.3,0-.3h0c0-.1,0-.3,0-.3h0c0-.1,0-.1,0-.1,0,0,0-.1.1-.1s0,0,0,0c0,0,0,0,0,.1s0,.1,0,.2h0c0,.1,0,.3,0,.3h0ZM19.1,36.4s0,0,0,0,0,0-.1,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0,0,0,0,.1,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1h0Z"/>
    <path class="st3" d="M19.8,37.6s0,0,0,0c0,0,0,0-.1,0,0,0-.1,0-.2,0,0,0,0,0,0,0,0,0,0,0-.1,0,0,0-.1-.2-.1-.3s0-.2,0-.3c0-.1.1-.2.2-.2,0,0,.2,0,.2,0,0,0,0,0,.1,0s.1,0,.2,0c0,0,.1,0,.1.1s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0h0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0,0,0,0,.1,0,.2,0,0,.1,0,.1,0s0,0,.1,0c0,0,0,0,.1-.1h0c0,0,0,0,0,0h0c0,0,0,0,0,0h0c0-.1,0-.2,0-.2,0-.1.1-.2.2-.2s0,0,.1,0c0,0,0,0,0,.1s0,0,0,.2h0s0,.1,0,.1h0c0,0,0,.3,0,.3h0c0,0,0,.3,0,.3h0c0,.3,0,.3-.2.4,0,0-.1,0-.2.1,0,0-.1,0-.2,0s-.2,0-.2,0c0,0-.1,0-.2-.1,0,0,0-.1,0-.1,0,0,0,0,0-.1h0s0,0,0,0c0,0,0,0,.1,0s0,0,0,0c0,0,0,0,0,.1h0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1,0,.2-.1"/>
    <path class="st3" d="M20.9,37.1h0c0,0,0,.1,0,.1,0,0,0,0,.1,0,0,0,0,0,0,.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0h-.1c-.2,0-.2,0-.2-.2,0,0,0,0,0,0h0c0-.1,0-.3,0-.3h0c0-.1,0-.3,0-.3h0c0-.1,0-.1,0-.1,0,0,0-.1.1-.1s0,0,0,0c0,0,0,0,0,.1s0,.1,0,.2h0c0,.1,0,.3,0,.3h0ZM21.1,36.4s0,0,0,0,0,0-.1,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0,0,0,0,.1,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1h0Z"/>
    <path class="st3" d="M21.4,36.5h.2c0,0,0,0,0,0h0c0,0,0,0,0,0h0c0,0,0-.2,0-.2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0h0c0,0,0,0,0,0,.2,0,.2,0,.2.1s0,0,0,0c0,0,0,0-.2,0h-.2s0,0,0,0h0c0,0,0,.2,0,.2h0c0,0,0,0,0,0h0s0,0,0,0h0c0,0,0,0,0,0,0,0,0,0,.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,0,0,0h-.4s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0-.2h0s0-.1,0-.1h0c0-.1,0-.2,0-.2h0c0-.1,0-.1,0-.1,0,0,0,0,0,0-.1,0-.2,0-.2-.2s0,0,0-.1c0,0,0,0,.2,0"/>
    <path class="st3" d="M22.9,37.4h0c0,0-.2,0-.2,0,0,0-.1,0-.1,0-.1,0-.2,0-.3-.1-.1,0-.2-.2-.2-.4s0,0,0,0c0,0,0,0,0-.2,0-.1,0-.2.2-.2.1,0,.2,0,.2-.1s.1,0,.2,0,.1,0,.2,0c0,0,0,0,0,.1s0,0,0,0c0,0,0,0-.1,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,.1,0,.2,0,0,0,0,.2,0h0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.2h0c0-.1,0-.2,0-.2h0c0,0,0-.2,0-.2h0c0,0,0-.1,0-.1,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,0,0,0,.1s0,0,0,0h0c0,0,0,.2,0,.2h0c0,.1,0,.2,0,.2,0,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0"/>
    <path class="st3" d="M23.8,37v.2s0,0,0,0c0,0,0,0,0,.1s0,0,0,0c0,0,0,0,0,0,0,0,0,0-.2,0h-.1c-.1,0-.2,0-.2-.1s0,0,0-.1v-.2c0,0,.1,0,.1,0v-.2c0,0,0,0,0,0v-.2c0,0,.1-.2.1-.2v-.2c0,0,.1,0,.1,0h0s0,0,0,0c0,0,0,0,.1,0s0,0,0,0c0,0,0,0,0,0s0,.2,0,.3h0s0,.2,0,.2h0s0,.1,0,.1h0s0,.2,0,.2h0c0,0,0,.1,0,.1Z"/>
    <path class="st3" d="M25,36c0,0,.1,0,.2,0,0,0,0,0,.1,0,0,0,.1,0,.2,0s0,0,0,0c0,0,0,0,.1,0,0,0,0,0,.1,0h0c0,0,.1,0,.2,0,0,0,.1,0,.2,0,0,0,.2,0,.3,0,0,0,.1.1.1.2,0,0,0,.1,0,.1,0,0,0,0,0,0h0c0,0,0,0,0,.1h0c0,.1,0,.3,0,.3h0c0,.1,0,.2,0,.2v.2c0,0-.1.2-.1.2,0,0,0,0,0,.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0-.1v-.2c0,0,0,0,0,0h0c0,0,0-.2,0-.2h0c0,0,0-.2,0-.2v-.2c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0h0c0,0,0,.1,0,.1v.2c0,0-.2.3-.2.3h0c0,0,0,.3,0,.3h0c0,.1,0,.2,0,.2h0c0,.1,0,.1,0,.2,0,0,0,0,0,0,0,0-.1,0-.1,0,0,0,0,0,0,0,0,0,0,0,0-.2v-.2c0,0,.1-.1.1-.1h0c0,0,0-.2,0-.2h0s0-.2,0-.2h0s0,0,0,0c0,0,0,0,0-.1,0,0,0,0-.1,0,0,0-.1,0-.1.1v.2c0,0,0,0,0,0h0s0,.3,0,.3v.2c0,0-.1.1-.1.1h0s0,.2,0,.2c0,.1,0,.2-.2.2s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0-.1s0,0,0,0h0s0-.2,0-.2v-.2c0,0,0,0,0,0v-.3c.1,0,.1-.1.2-.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0,0,0-.1,0-.1-.2s0,0,0-.1c0,0,0,0,.1,0s0,0,.1,0"/>
    <path class="st3" d="M26.7,37.1s0,0,0,0h0c0-.1,0-.2,0-.2,0,0,0-.1.1-.2,0,0,.1-.1.2-.1,0,0,.1,0,.1,0,0,0,0,0,.1,0h0s0,0,0,0c0,0,0,0,.1,0,0,0,0,0,.1.1,0,0,0,.1,0,.2s0,0,0,.2c0,0,0,.1-.1.1,0,0-.1,0-.2,0s-.1,0-.2,0c0,0-.1,0-.1-.1s0,0,0,0c0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0h0s0,0,0,0c0,0,0,0,0,0s0,0,0,0,0,0-.1,0,0,0,0,0c0,0,0,0,0,0,0,0,0,0-.1,0,0,0,0,0,0,.1s0,0,0,0c0,0,0,0,0,0,0,0,.1,0,.2,0h.3s0,0,0,0,0,0,0,0,0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.2,0h-.1c-.2,0-.3,0-.4-.1s-.2-.2-.2-.3"/>
    <path class="st3" d="M28.8,37.5s0,0,0,0h0s-.1,0-.1,0h0s0,0-.1,0c0,0-.1,0-.2,0,0,0,0,0-.1,0,0,0,0,0-.1-.1,0,0,0,0,0-.2,0,0,0-.1,0-.2s0,0,0-.2c0,0,0-.1,0-.2,0,0,0-.1.2-.2,0,0,.2,0,.3,0s.2,0,.2,0c0,0,0,0,0,.1s0,0,0,0c0,0,0,0-.1,0h-.1s0,0,0,0c0,0,0,0-.1,0s-.1,0-.1.1c0,0,0,0,0,.1,0,0,0,.2,0,.2,0,0,.1,0,.1,0,0,0,.1,0,.2,0,0,0,0,0,0-.1,0,0,0,0,0-.2h0s0-.2,0-.2h0c0-.1,0-.2,0-.2v-.2c.1,0,.1-.1.1-.1,0,0,0,0,0,0,0,0,0,0,0,0s0,0,0,0,0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,.1h0c0,.1,0,.2,0,.2h0s0,.2,0,.2h0c0,.1,0,.2,0,.2h0c0,0,0,.1,0,.1h0c0,0,0,.1,0,.1h0c0,.2,0,.2,0,.2s0,0,0,.1,0,0,0,.1c0,0,0,0,0,0,0,0,0,0-.1,0s0,0-.1,0"/>
    <path class="st3" d="M29.6,37.1h0c0,0,0,.1,0,.1,0,0,0,0,.1,0,0,0,0,0,0,.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0h-.1c-.2,0-.2,0-.2-.2,0,0,0,0,0,0h0c0-.1,0-.3,0-.3h0c0-.1,0-.3,0-.3h0c0-.1,0-.1,0-.1,0,0,0-.1.1-.1s0,0,0,0c0,0,0,0,0,.1s0,.1,0,.2h0c0,.1,0,.3,0,.3h0ZM29.8,36.4s0,0,0,0,0,0-.1,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.1,0,0,0,0,.1,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1h0Z"/>
    <path class="st3" d="M30.8,37.4h0c0,0-.2,0-.2,0,0,0-.1,0-.1,0-.1,0-.2,0-.3-.1-.1,0-.2-.2-.2-.4s0,0,0,0c0,0,0,0,0-.2,0-.1,0-.2.2-.2.1,0,.2,0,.2-.1s.1,0,.2,0,.1,0,.2,0c0,0,0,0,0,.1s0,0,0,0c0,0,0,0-.1,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,.1,0,.2,0,0,0,0,.2,0h0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.2h0c0-.1,0-.2,0-.2h0c0,0,0-.2,0-.2h0c0,0,0-.1,0-.1,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,0,0,0,.1s0,0,0,0h0c0,0,0,.2,0,.2h0c0,.1,0,.2,0,.2,0,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0s0,0,0,0c0,0,0,0,0,0"/>
  </g>
</svg>
</a>
</header>

<div class="app">

  <!-- Steps bar -->
  <div class="steps-bar">
    <button class="step-btn active" id="step-btn-1" onclick="goStep(1)">
      <span class="num">1</span> Product
    </button>
    <button class="step-btn" id="step-btn-2" onclick="goStep(2)">
      <span class="num">2</span> Color &amp; Qty
    </button>
    <button class="step-btn" id="step-btn-4" onclick="goStep(4)">
      <span class="num">3</span> Quote
    </button>
  </div>

  <!-- ══ STEP 1: Search & Select Product ══ -->
  <div class="panel active" id="panel-1">
    <p class="panel-title">Find your product</p>
    <p class="panel-sub">Search our catalog by style number, brand, or keyword.</p>
<div class="cat-bar" id="cat-bar">
      <button class="cat-btn active" onclick="selectMainCat('', this)">All</button>
      <button class="cat-btn" onclick="selectMainCat('T-Shirts', this)">T-Shirts</button>
      <button class="cat-btn" onclick="selectMainCat('Polos', this)">Polos</button>
      <button class="cat-btn" onclick="selectMainCat('Sweatshirts', this)">Sweatshirts</button>
      <button class="cat-btn" onclick="selectMainCat('Jackets', this)">Jackets</button>
      <button class="cat-btn" onclick="selectMainCat('Hats', this)">Hats</button>
      <button class="cat-btn" onclick="selectMainCat('Shorts', this)">Shorts</button>
      <button class="cat-btn" onclick="selectMainCat('Bags', this)">Bags</button>
    </div>
    <div class="subcat-bar" id="subcat-bar"></div>

    <div class="search-wrap">
      <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input type="text" id="search-input" placeholder="e.g. PC61, Gildan, performance polo…" onkeydown="if(event.key==='Enter') searchProducts()">
      <button class="search-btn" onclick="searchProducts()">Search</button>
    </div>


    <div class="sort-bar" id="sort-bar">
      <span>Sort by</span>
      <select class="sort-select" id="sort-select" onchange="applySortAndRender()">
        <option value="relevance">Relevance</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
      </select>
      <span class="result-count" id="result-count"></span>
    </div>

    <div id="product-results">
      <p class="empty">Search for a product to get started.</p>
    </div>
  </div>

  <!-- ══ STEP 2: Color & Quantity ══ -->
  <div class="panel" id="panel-2">
    <p class="panel-title">Choose color &amp; quantities</p>
    <p class="panel-sub">Select a color, then enter your desired quantity for each size.</p>

    <div class="detail-layout">
      <div>
        <div class="detail-img" id="detail-img-wrap">
          <span class="no-img">No image</span>
        </div>
        <div class="thumb-strip" id="thumb-strip"></div>
        <div class="product-desc" id="product-desc" style="display:none">
          <div class="product-desc-label">Product details</div>
          <ul id="product-desc-list"></ul>
        </div>
      </div>
      <div class="detail-info">
        <div class="brand" id="d-brand"></div>
        <h2 id="d-name"></h2>
        <div class="style-num" id="d-style"></div>

        <div class="color-label" id="color-label-text">Select a color:</div>
        <div class="color-grid" id="color-grid"></div>

        <table class="size-table" id="size-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Stock</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody id="size-tbody"></tbody>
        </table>

        <div class="btn-row">
          <button class="btn btn-secondary" onclick="goStep(1)">← Back</button>
          <button class="add-to-cart-btn" id="step2-add" onclick="addToCart()" disabled>+ Add to bag</button>
        </div>
      </div>
    </div>
  </div>



  <!-- ══ STEP 4: Quote Request ══ -->
  <div class="panel" id="panel-4">
    <p class="panel-title">Bag Summary</p>
    <p class="panel-sub">Review your bag below, then fill in your details and we'll send a custom quote as soon as possible.</p>

    <div class="summary-box" id="order-summary"></div>

    <div class="form-grid">
      <div class="field">
        <label>First name</label>
        <input type="text" id="f-first" placeholder="Jane" required>
      </div>
      <div class="field">
        <label>Last name</label>
        <input type="text" id="f-last" placeholder="Smith" required>
      </div>
      <div class="field">
        <label>Email</label>
        <input type="email" id="f-email" placeholder="jane@company.com" required>
      </div>
      <div class="field">
        <label>Phone</label>
        <input type="tel" id="f-phone" placeholder="(555) 000-0000">
      </div>
      <div class="field full">
        <label>Additional Notes</label>
        <textarea id="f-notes" rows="4" placeholder="Add any additional information you would like us to know about your order."></textarea>
      </div>
    </div>

    <div class="artwork-section">
      <label class="artwork-label">Artwork files <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--ink3)">(Up to 4 Files)</span></label>
      <div class="artwork-drop" id="artwork-drop" onclick="document.getElementById('artwork-input').click()" ondragover="artworkDragOver(event)" ondragleave="artworkDragLeave(event)" ondrop="artworkDrop(event)">
        <input type="file" id="artwork-input" multiple accept=".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg,.gif,.tif,.tiff,.webp,.dst,.emb" style="display:none" onchange="artworkFilesAdded(this.files)">
        <div class="artwork-drop-icon">📎</div>
        <div class="artwork-drop-text">Click to browse or drag & drop files here</div>
        <div class="artwork-drop-sub">PDF, AI, EPS, SVG, PNG, JPG, TIF, DST, EMB — max 4 files</div>
      </div>
      <div class="artwork-files" id="artwork-files"></div>
      <div class="artwork-limit" id="artwork-limit"></div>
    </div>

    <div class="btn-row">
      <button onclick="clearBag()" style="padding:13px 20px;border-radius:6px;background:none;border:1.5px solid #c8392b;color:#c8392b;font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s" onmouseover="this.style.background='#c8392b';this.style.color='#fff'" onmouseout="this.style.background='none';this.style.color='#c8392b'">Clear bag</button>
      <button class="btn btn-primary" id="submit-btn" onclick="submitQuote()">Send Quote Request</button>
    </div>
  </div>

  <!-- ══ SUCCESS ══ -->
  <div class="panel" id="panel-success">
    <div class="success-screen">
      <div class="success-icon">✓</div>
      <h2>Quote request sent!</h2>
      <p>We've received your request and will send a detailed quote to your email as soon as possible. We'll reach out if we have any questions about your artwork.</p>
      <button class="btn btn-primary" onclick="resetApp()">Start another quote request</button>
    </div>
  </div>

</div>

<!-- ══ CART FAB ══ -->
<button class="cart-fab hidden" id="cart-fab" onclick="openCart()">
  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
  Bag
  <span class="cart-count" id="cart-count">0</span>
</button>

<!-- ══ CART OVERLAY ══ -->
<div class="cart-overlay" id="cart-overlay" onclick="closeCart()"></div>

<!-- ══ CART DRAWER ══ -->
<div class="cart-drawer" id="cart-drawer">
  <div class="cart-header">
    <h2>Your bag</h2>
    <button class="cart-close" onclick="closeCart()">✕</button>
  </div>
  <div class="cart-body" id="cart-body">
    <div class="cart-empty">Your bag is empty. Add items from the catalog.</div>
  </div>
  <div class="cart-footer">
    <button class="btn btn-primary" style="width:100%;margin-bottom:10px" onclick="closeCart(); goStep(4); buildSummary();" id="cart-checkout-btn" disabled>Request quote →</button>
    <button onclick="clearBag()" style="width:100%;padding:9px;background:none;border:1.5px solid #ddd;border-radius:6px;font-family:inherit;font-size:13px;color:#999;cursor:pointer;transition:all .15s" onmouseover="this.style.borderColor='#c8392b';this.style.color='#c8392b'" onmouseout="this.style.borderColor='#ddd';this.style.color='#999'">Clear bag</button>
  </div>
</div>

<script>
// ─────────────────────────────────────────────
//  CONFIGURATION — update these before launch
// ─────────────────────────────────────────────
// S&S credentials are now stored securely in Vercel environment variables.
// Do NOT put your API key or username here — the /api/ proxy handles auth server-side.
const YOUR_EMAIL  = "YOUR_EMAIL@YOURDOMAIN.COM"; // Where quote emails go

// EmailJS (free tier handles ~200 emails/month — sign up at emailjs.com)
// Alternatively swap submitQuote() to call your own backend endpoint
const EMAILJS_SERVICE  = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE = "YOUR_EMAILJS_TEMPLATE_ID";
const EMAILJS_PUBLIC   = "YOUR_EMAILJS_PUBLIC_KEY";

const SS_BASE = "https://api.ssactivewear.com/v2";

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let state = {
  currentStep: 1,
  product: null,
  color: null,
  sizes: [],
  service: null,
};
// Cart: array of { id, product, color, sizes, service, placements, customPlacement, image }
let cart = [];
let _lastProducts = []; // sort state — declared here so it's always available

function saveCart() {
  try { localStorage.setItem('jm_bag', JSON.stringify(cart)); } catch(e) {}
}

function loadCart() {
  try {
    const saved = localStorage.getItem('jm_bag');
    if (saved) cart = JSON.parse(saved);
  } catch(e) { cart = []; }
}

// Initialization runs at bottom of script after all functions are defined

// ─────────────────────────────────────────────
//  STEP NAV
// ─────────────────────────────────────────────
function goStep(n) {
  if (n > state.currentStep) return;
  _setStep(n);
}
function _setStep(n) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  // Map visual step numbers: 1=Product, 2=Color&Qty, 3=Quote(panel-4)
  const btnMap = { 1: 'step-btn-1', 2: 'step-btn-2', 4: 'step-btn-4' };
  Object.entries(btnMap).forEach(([step, id]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.remove('active','done');
    if (parseInt(step) < n) btn.classList.add('done');
    if (parseInt(step) === n) btn.classList.add('active');
  });
  const target = n <= 4 ? document.getElementById('panel-'+n) : document.getElementById('panel-success');
  if (target) target.classList.add('active');
  state.currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── CART FUNCTIONS ──
async function reloadProductFromCart(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  closeCart();

  // Restore product state
  state.product = item.product;

  // Go to step 2 and load product detail
  _setStep(2);

  // Populate product info
  document.getElementById('d-brand').textContent = item.product.brandName || item.product.BrandName || '';
  document.getElementById('d-name').textContent  = item.product.title || item.product.styleName || 'Product';
  document.getElementById('d-style').textContent = `Style# ${item.product.styleName || item.product.styleID}`;

  // Load description
  loadDescription(item.product.styleID || item.product.styleName);

  // Fetch SKUs fresh from API
  const styleId = item.product.styleID || item.product.StyleID || '';
  try {
    const res = await fetch(`/api/skus?styleID=${encodeURIComponent(styleId)}`);
    const skus = await res.json();
    buildColorGrid(Array.isArray(skus) ? skus : (skus.Skus || skus.skus || []));
  } catch(e) {
    buildColorGrid([]);
  }
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
}
function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
}

function addToCart() {
  const ordered = state.sizes.filter(s => s.qty > 0);
  if (!ordered.length || !state.color) return;

  const item = {
    id: Date.now(),
    product: JSON.parse(JSON.stringify(state.product)),
    color: { name: state.color.name, hex: state.color.hex, swatch: state.color.swatch },
    sizes: ordered.map(s => ({ size: s.size, sku: s.sku, qty: s.qty })), // deep copy
    service: null,
    placements: [],
    customPlacement: '',
    image: state.color.skus[0]?.colorFrontImage || '',
  };
  cart.push(item);
  saveCart();
  updateCartUI();
  openCart();

  // Reset for next item — stay on step 1
  state.sizes.forEach(s => s.qty = 0);
  document.querySelectorAll('.qty-input').forEach(i => i.value = 0);
  document.getElementById('step2-add').disabled = true;
  _setStep(1);
}

function removeFromCart(id) {
  const item = cart.find(i => i.id === id);
  const name = item ? (item.product.title || item.product.styleName || 'this item') : 'this item';
  if (!confirm(`Remove "${name}" from your bag?`)) return;
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
  buildSummary();
}

function clearBag() {
  if (!cart.length) return;
  if (!confirm('Remove all items from your bag?')) return;
  cart = [];
  saveCart();
  updateCartUI();
  buildSummary();
}

function setCartService(id, svc, pillEl) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.service = svc;
  item.placements = []; // reset placements when service changes
  item.customPlacement = '';
  saveCart();
  pillEl.closest('.svc-pills').querySelectorAll('.svc-pill').forEach(p => p.classList.remove('active'));
  pillEl.classList.add('active');
  // Re-render placement section
  const wrap = document.getElementById('placement-' + id);
  if (wrap) wrap.innerHTML = buildPlacementHTML(item);
  updateCartCheckoutBtn();
}

function isHat(item) {
  const cat = (item.product.baseCategory || '').toLowerCase();
  const title = (item.product.title || item.product.styleName || '').toLowerCase();
  return cat.includes('hat') || cat.includes('cap') || cat.includes('head') ||
         title.includes('hat') || title.includes('cap') || title.includes('beanie') ||
         title.includes('bucket') || title.includes('visor');
}

const PLACEMENTS = {
  'Embroidery':       ['Front left chest', 'Front right chest'],
  'Embroidery_Hat':   ['Front', 'Back', 'Left (wearing)', 'Right (wearing)'],
  'Print':            ['Front', 'Back', 'Left sleeve', 'Right sleeve'],
  'Print_Hat':        ['Front'],
  'UV Patch':         ['Front', 'Back', 'Left side (wearing)', 'Right side (wearing)'],
};

function getPlacementKey(item) {
  if (item.service === 'Embroidery' && isHat(item)) return 'Embroidery_Hat';
  if (item.service === 'Print' && isHat(item)) return 'Print_Hat';
  return item.service;
}

const PILL_OFF = "padding:7px 16px;border-radius:999px;border:2px solid #cccccc;background:#ffffff;font-size:12px;font-weight:400;color:#999999;cursor:pointer;font-family:inherit;margin:0;";
const PILL_ON  = "padding:7px 16px;border-radius:999px;border:2px solid #555555;background:#555555;font-size:12px;font-weight:700;color:#ffffff;cursor:pointer;font-family:inherit;margin:0;";

function buildPlacementHTML(item) {
  if (!item.service) return '';
  const opts = PLACEMENTS[getPlacementKey(item)] || [];
  const selected = item.placements || [];
  const isEmb = item.service === 'Embroidery';

  let pills = opts.map(opt => {
    const on = selected.includes(opt);
    return `<button style="${on ? PILL_ON : PILL_OFF}" onclick="togglePlacement(${item.id},'${opt.replace(/'/g,"\'")}',this)">${opt}</button>`;
  }).join('');

  if (isEmb) {
    const customVal = item.customPlacement || '';
    const on = selected.includes('Custom');
    const inputVisible = on ? ' visible' : '';
    pills += `<button style="${on ? PILL_ON : PILL_OFF}" onclick="togglePlacement(${item.id},'Custom',this)">Custom (describe)</button>`;
    const inputStyle = on ? 'display:block;width:100%;padding:7px 10px;margin-top:8px;border:1.5px solid #ccc;border-radius:6px;font-family:inherit;font-size:13px;color:#1a1a1a;background:#fff;outline:none;box-sizing:border-box;' : 'display:none;';
    pills += `<input style="${inputStyle}" id="custom-input-${item.id}" type="text" placeholder="Describe placement…" value="${customVal}" oninput="setCustomPlacement(${item.id},this.value)">`;
  }

  return `<label style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;color:#8a8a8a;display:block;margin-bottom:8px">Placement <span style="font-weight:400;text-transform:none;letter-spacing:0">(can select multiple)</span></label>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">${pills}</div>`;
}

function togglePlacement(id, opt, pillEl) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  if (!item.placements) item.placements = [];
  if (item.placements.includes(opt)) {
    item.placements = item.placements.filter(p => p !== opt);
    pillEl.setAttribute('style', PILL_OFF);
  } else {
    item.placements.push(opt);
    pillEl.setAttribute('style', PILL_ON);
  }
  saveCart();
  if (opt === 'Custom') {
    const input = document.getElementById('custom-input-' + id);
    if (input) input.style.display = item.placements.includes('Custom') ? 'block' : 'none';
    const sinput = document.getElementById('summary-custom-' + id);
    if (sinput) sinput.style.display = item.placements.includes('Custom') ? 'block' : 'none';
  }
  buildSummary();
  updateCartCheckoutBtn();
}

function setCustomPlacement(id, val) {
  const item = cart.find(i => i.id === id);
  if (item) { item.customPlacement = val; saveCart(); }
}

function updateCartUI() {
  const count = cart.reduce((a, item) => a + item.sizes.reduce((b, s) => b + s.qty, 0), 0);
  const fab = document.getElementById('cart-fab');
  const countEl = document.getElementById('cart-count');
  countEl.textContent = cart.length;
  fab.classList.toggle('hidden', cart.length === 0);

  const body = document.getElementById('cart-body');
  if (!cart.length) {
    body.innerHTML = '<div class="cart-empty">Your bag is empty. Add items from the catalog.</div>';
    updateCartCheckoutBtn();
    return;
  }

  // Group by style number
  const byStyle = {};
  cart.forEach(item => {
    const key = item.product.styleName || item.product.styleID || 'Unknown';
    if (!byStyle[key]) byStyle[key] = { name: item.product.title || item.product.styleName, items: [] };
    byStyle[key].items.push(item);
  });

  let html = '';
  Object.entries(byStyle).forEach(([styleNum, group]) => {
    html += `<div style="margin-bottom:20px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:var(--ink3);margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--paper3)">Style ${styleNum} — ${group.name}</div>`;
    group.items.forEach(item => {
      const sizeList = item.sizes.map(s => `<span class="cart-size-tag">${s.size} × ${s.qty}</span>`).join('');
      const total = item.sizes.reduce((a,s) => a+s.qty, 0);
      const imgHtml = item.image
        ? `<img class="cart-item-img" src="${item.image}" alt="${item.color.name}">`
        : `<div class="cart-item-img-placeholder">No img</div>`;

      html += `<div class="cart-item" id="cart-item-${item.id}">
        <div class="cart-item-header">
          ${imgHtml}
          <div class="cart-item-info" onclick="reloadProductFromCart(${item.id})" style="cursor:pointer;flex:1" title="Click to add more">
            <div class="cart-item-style">${styleNum} · ${item.color.name}</div>
            <div class="cart-item-name" style="text-decoration:underline;text-decoration-color:#ccc;text-underline-offset:2px">${item.product.title || item.product.styleName}</div>
            <div class="cart-item-color">${total} piece${total !== 1 ? 's' : ''} · <span style="color:var(--accent);font-size:11px">+ Add more</span></div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">✕</button>
        </div>
        <div class="cart-item-sizes">${sizeList}</div>
        <div class="cart-item-service">
          <label>Decoration service</label>
          <div class="svc-pills">
            <button class="svc-pill${item.service==='Embroidery'?' active':''}" onclick="setCartService(${item.id},'Embroidery',this)">🧵 Embroidery</button>
            <button class="svc-pill${item.service==='Print'?' active':''}" onclick="setCartService(${item.id},'Print',this)">🖨️ Print</button>
            ${isHat(item) ? `<button class="svc-pill${item.service==='UV Patch'?' active':''}" onclick="setCartService(${item.id},'UV Patch',this)">✨ UV Patch</button>` : ''}
          </div>
        </div>
        <div class="placement-wrap" id="placement-${item.id}">${buildPlacementHTML(item)}</div>
      </div>`;
    });
    html += '</div>';
  });

  body.innerHTML = html;
  updateCartCheckoutBtn();
}

function updateCartCheckoutBtn() {
  const btn = document.getElementById('cart-checkout-btn');
  const allHaveService = cart.length > 0 && cart.every(item => item.service);
  btn.disabled = !allHaveService;
  btn.title = allHaveService ? '' : 'Please select a service for each item';
}

// ─────────────────────────────────────────────
//  STEP 1 — SEARCH
// ─────────────────────────────────────────────
// Subcategory definitions — search terms that match S&S catalog
const SUBCATEGORIES = {
  'T-Shirts': [
    { label: 'All T-Shirts',         search: 'T-Shirts' },
    { label: '100% Cotton',          search: 'Cotton T-Shirt' },
    { label: 'Cotton/Poly Blend',    search: 'Cotton Poly T-Shirt' },
    { label: 'Performance',          search: 'Performance T-Shirt' },
    { label: 'Tri-Blend',            search: 'Triblend T-Shirt' },
    { label: 'Long Sleeve',          search: 'Long Sleeve T-Shirt' },
    { label: 'Youth',                search: 'Youth T-Shirt' },
    { label: 'Ladies',               search: 'Ladies T-Shirt' },
  ],
  'Polos': [
    { label: 'All Polos',            search: 'Polos' },
    { label: 'Performance',          search: 'Performance Polo' },
    { label: 'Cotton',               search: 'Cotton Polo' },
    { label: 'Pique',                search: 'Pique Polo' },
    { label: 'Ladies',               search: 'Ladies Polo' },
    { label: 'Youth',                search: 'Youth Polo' },
  ],
  'Sweatshirts': [
    { label: 'All Fleece',           search: 'Sweatshirts' },
    { label: 'Crewneck',             search: 'Crewneck Sweatshirt' },
    { label: 'Hoodies',              search: 'Hooded Sweatshirt' },
    { label: 'Zip-Up Hoodies',       search: 'Full Zip Hoodie' },
    { label: '1/4 Zip',              search: 'Quarter Zip' },
    { label: 'Youth',                search: 'Youth Hoodie' },
    { label: 'Ladies',               search: 'Ladies Hoodie' },
  ],
  'Jackets': [
    { label: 'All Jackets',          search: 'Jackets' },
    { label: 'Soft Shell',           search: 'Soft Shell Jacket' },
    { label: 'Puffer / Quilted',     search: 'Puffer Jacket' },
    { label: 'Windbreaker',          search: 'Wind Jacket' },
    { label: 'Rain / All-Weather',   search: 'Rain Jacket' },
    { label: 'Fleece Jacket',        search: 'Fleece Jacket' },
    { label: 'Ladies',               search: 'Ladies Jacket' },
  ],
  'Hats': [
    { label: 'All Headwear',         search: 'Hats' },
    { label: 'Structured',           search: 'Structured Cap' },
    { label: 'Unstructured',         search: 'Unstructured Cap' },
    { label: 'Snapback',             search: 'Snapback' },
    { label: 'Flexfit',              search: 'Flexfit' },
    { label: 'Trucker',              search: 'Trucker Cap' },
    { label: 'Beanies',              search: 'Beanie' },
    { label: 'Bucket Hats',          search: 'Bucket Hat' },
  ],
  'Shorts': [
    { label: 'All Shorts',           search: 'Shorts' },
    { label: 'Athletic',             search: 'Athletic Shorts' },
    { label: 'Mesh',                 search: 'Mesh Shorts' },
    { label: 'Cotton',               search: 'Cotton Shorts' },
    { label: 'Ladies',               search: 'Ladies Shorts' },
    { label: 'Youth',                search: 'Youth Shorts' },
  ],
  'Bags': [
    { label: 'All Bags',             search: 'Bags' },
    { label: 'Backpacks',            search: 'Backpack' },
    { label: 'Tote Bags',            search: 'Tote Bag' },
    { label: 'Cinch / Drawstring',   search: 'Cinch Bag' },
    { label: 'Duffel Bags',          search: 'Duffel Bag' },
    { label: 'Cooler Bags',          search: 'Cooler Bag' },
  ],
};

function selectMainCat(name, btnEl) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');

  const subBar = document.getElementById('subcat-bar');

  if (!name) {
    subBar.innerHTML = '';
    subBar.classList.remove('visible');
    document.getElementById('product-results').innerHTML = '<p class="empty">Search for a product or pick a category above.</p>';
    return;
  }

  // Build subcategory pills
  const subs = SUBCATEGORIES[name] || [];
  if (subs.length) {
    subBar.innerHTML = subs.map((s, i) =>
      `<button class="subcat-btn${i === 0 ? ' active' : ''}" onclick="browseSubCat('${s.search}', this)">${s.label}</button>`
    ).join('');
    subBar.classList.add('visible');
    browseSubCat(subs[0].search, subBar.querySelector('.subcat-btn'));
  } else {
    subBar.innerHTML = '';
    subBar.classList.remove('visible');
    browseSubCat(name, null);
  }
}

async function browseSubCat(searchTerm, btnEl) {
  if (btnEl) {
    document.querySelectorAll('.subcat-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }
  const el = document.getElementById('product-results');
  el.innerHTML = `<div class="loading"><div class="spinner"></div>Loading ${searchTerm}…</div>`;
  try {
    const res = await fetch(`/api/category?name=${encodeURIComponent(searchTerm)}`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    renderProductGrid(Array.isArray(data) ? data : []);
  } catch(e) {
    el.innerHTML = `<div class="empty">Could not load category. <small style="color:#aaa">${e.message}</small></div>`;
  }
}

// Keep old name for compatibility
async function browseCategory(name, btnEl) {
  browseSubCat(name, btnEl);
}

async function searchProducts() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;

  // Clear active category when doing a text search
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('subcat-bar').classList.remove('visible');
  document.getElementById('subcat-bar').innerHTML = '';
  const el = document.getElementById('product-results');
  el.innerHTML = '<div class="loading"><div class="spinner"></div>Searching catalog…</div>';

  try {
    // Search S&S and SanMar simultaneously
    const [ssResult, sanmarResult] = await Promise.allSettled([
      fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/sanmar-product?style=${encodeURIComponent(q)}`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]);

    const ssProducts     = ssResult.status     === 'fulfilled' ? (Array.isArray(ssResult.value)     ? ssResult.value     : []) : [];
    const sanmarProducts = sanmarResult.status  === 'fulfilled' ? (Array.isArray(sanmarResult.value) ? sanmarResult.value : []) : [];

    ssProducts.forEach(p => p._source = 'ss');
    sanmarProducts.forEach(p => p._source = 'sanmar');

    const combined = [...ssProducts, ...sanmarProducts];
    renderProductGrid(combined);
  } catch(e) {
    el.innerHTML = `<div class="empty">Could not reach catalog. <small style="color:#aaa">${e.message}</small></div>`;
  }
}

// Sort state
// (_lastProducts declared at top)

function applySortAndRender() {
  const sort = document.getElementById('sort-select').value;
  let sorted = [..._lastProducts];
  if (sort === 'az') {
    sorted.sort((a, b) => (a.title || a.styleName || '').localeCompare(b.title || b.styleName || ''));
  } else if (sort === 'za') {
    sorted.sort((a, b) => (b.title || b.styleName || '').localeCompare(a.title || a.styleName || ''));
  }
  // relevance = original API order
  renderProductGridRaw(sorted);
}

function renderProductGrid(products) {
  _lastProducts = products;
  // Reset sort to relevance whenever new results load
  const sel = document.getElementById('sort-select');
  if (sel) sel.value = 'relevance';

  const sortBar = document.getElementById('sort-bar');
  const countEl = document.getElementById('result-count');
  if (products.length > 0) {
    sortBar.classList.add('visible');
    if (countEl) countEl.textContent = `${products.length} item${products.length !== 1 ? 's' : ''}`;
  } else {
    sortBar.classList.remove('visible');
  }
  renderProductGridRaw(products);
}

function renderProductGridRaw(products) {
  const el = document.getElementById('product-results');
  if (!products.length) {
    el.innerHTML = '<div class="empty">No products found. Try a different search.</div>';
    document.getElementById('sort-bar').classList.remove('visible');
    return;
  }

  el.innerHTML = '<div class="product-grid" id="pg"></div>';
  const grid = document.getElementById('pg');
  products.forEach(p => {
    // S&S styles endpoint field names: styleID, title, brandName, styleName, styleImage
    const styleId = p.styleID || p.StyleID || '';
    const name  = p.title || p.Title || p.styleName || 'Product';
    const brand = p.brandName || p.BrandName || '';
    const style = p.styleName || styleId || '';
    // styleImage is available from the styles endpoint
    const img = p.styleImage || '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = img
      ? `<img src="${img}" alt="${name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const sourceBadge = p._source === 'sanmar'
      ? '<span style="font-size:10px;background:#e8f4fd;color:#1a6a9a;padding:2px 6px;border-radius:10px;margin-left:4px;font-weight:500">SanMar</span>'
      : '<span style="font-size:10px;background:#f0fdf4;color:#166534;padding:2px 6px;border-radius:10px;margin-left:4px;font-weight:500">S&S</span>';
    card.innerHTML += `<div class="img-placeholder" ${img ? 'style="display:none"' : ''}>No image</div>
      <div class="card-body">
        <div class="card-style">${style}${sourceBadge}</div>
        <div class="card-name">${name}</div>
        <div class="card-brand">${brand}</div>
      </div>`;
    card.onclick = () => selectProduct(p, card);
    grid.appendChild(card);
  });
}

async function selectProduct(p, cardEl) {
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  state.product = p;
  await loadProductDetail(p);
  _setStep(2);
}

// ─────────────────────────────────────────────
//  STEP 2 — COLOR & QTY
// ─────────────────────────────────────────────
async function loadDescription(styleId) {
  const wrap = document.getElementById('product-desc');
  const list = document.getElementById('product-desc-list');
  if (!wrap || !list) return;
  wrap.style.display = 'block';
  list.innerHTML = '<li class="desc-loading">Loading details…</li>';

  try {
    const res = await fetch(`/api/description?styleID=${encodeURIComponent(styleId)}`);
    if (!res.ok) throw new Error();
    const { bullets } = await res.json();
    if (!bullets || !bullets.length) {
      wrap.style.display = 'none';
      return;
    }
    list.innerHTML = bullets.map(b => `<li>${b}</li>`).join('');
  } catch(e) {
    wrap.style.display = 'none';
  }
}

async function loadProductDetail(p) {
  // Use numeric styleID for SKU/inventory lookup (p.styleID is the integer, p.styleName is e.g. "2000")
  const styleId = p.styleID || p.StyleID || '';
  console.log('Loading SKUs for styleID:', styleId, 'styleName:', p.styleName);

  // Populate basic info
  const _decodeHtml = s => (s||'').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'");
  document.getElementById('d-brand').textContent = _decodeHtml(p.brandName || p.BrandName || '');
  document.getElementById('d-name').textContent  = _decodeHtml(p.title || p.Title || p.styleName || 'Product');
  document.getElementById('d-style').textContent = `Style# ${p.styleName || styleId}`;

  // Load product description
  if (!p._source || p._source === 'ss') loadDescription(styleId);
  else {
    // For SanMar, show description from the product object if available
    const wrap = document.getElementById('product-desc');
    const list  = document.getElementById('product-desc-list');
    if (wrap && list && p.description) {
      wrap.style.display = 'block';
      const bullets = p.description
      .split('|')
      .map(l => l.replace(/<[^>]+>/g, '').trim())
      .filter(l => l.length > 4);
      list.innerHTML = bullets.map(b => `<li>${b}</li>`).join('');
    } else if (wrap) { wrap.style.display = 'none'; }
  }

  // Fetch SKUs — route to correct supplier based on product source
  try {
    const isSanmar = p._source === 'sanmar';
    const endpoint = isSanmar ? `/api/sanmar-product?style=${encodeURIComponent(styleId)}&mode=skus` : `/api/skus?styleID=${encodeURIComponent(styleId)}`;
    const res = await fetch(endpoint);
    const skus = await res.json();
    buildColorGrid(Array.isArray(skus) ? skus : (skus.Skus || skus.skus || []));
  } catch(e) {
    buildColorGrid(demoSkus(styleId));
  }
}

async function fetchSanmarInventory(styleID, colorName, skus) {
  try {
    const res = await fetch(`/api/sanmar-inventory?style=${encodeURIComponent(styleID)}&color=${encodeURIComponent(colorName)}`);
    if (!res.ok) return;
    const data = await res.json();
    const totalQty = data.qty || 999;
    // Update all size rows with the inventory qty
    skus.forEach(s => {
      const row = document.querySelector(`tr[data-sku="${s.sku}"]`);
      if (!row) return;
      const stockCell = row.querySelector('.stock-badge');
      if (!stockCell) return;
      if (totalQty === 0) {
        stockCell.textContent = 'Out of stock';
        stockCell.className = 'stock-badge out';
      } else if (totalQty < 12) {
        stockCell.textContent = `Low (${totalQty})`;
        stockCell.className = 'stock-badge low';
      } else {
        stockCell.textContent = `In stock (${totalQty.toLocaleString()})`;
        stockCell.className = 'stock-badge in';
      }
    });
  } catch(e) { /* inventory unavailable */ }
}

function colorNameToHex(name) {
  if (!name) return '#888';
  const n = name.toLowerCase();
  if (n.includes('black')) return '#1a1a1a';
  if (n.includes('white')) return '#f5f5f5';
  if (n.includes('navy')) return '#1e3a5f';
  if (n.includes('royal')) return '#2563eb';
  if (n.includes('red') || n.includes('cardinal')) return '#c0392b';
  if (n.includes('maroon') || n.includes('burgundy')) return '#7b1c2e';
  if (n.includes('forest') || n.includes('dark green')) return '#166534';
  if (n.includes('green')) return '#16a34a';
  if (n.includes('gold') || n.includes('yellow')) return '#d97706';
  if (n.includes('orange')) return '#ea580c';
  if (n.includes('purple') || n.includes('grape')) return '#7e22ce';
  if (n.includes('pink') || n.includes('azalea')) return '#ec4899';
  if (n.includes('heather') || n.includes('hthr')) return '#9ca3af';
  if (n.includes('grey') || n.includes('gray')) return '#6b7280';
  if (n.includes('ash')) return '#d1d5db';
  if (n.includes('brown') || n.includes('chocolate')) return '#78350f';
  if (n.includes('tan') || n.includes('khaki') || n.includes('sand')) return '#d4a96a';
  if (n.includes('blue') || n.includes('aquatic') || n.includes('carolina')) return '#3b82f6';
  if (n.includes('kelly')) return '#22c55e';
  if (n.includes('natural') || n.includes('cream')) return '#fef3c7';
  if (n.includes('coral') || n.includes('salmon')) return '#f97316';
  return '#888';
}

function buildColorGrid(skus) {
  // Group by color
  const byColor = {};
  skus.forEach(s => {
    const cname = s.colorName || s.ColorName || 'Default';
    const chex  = s.color1 || s.colorCode || '#cccccc';
    const swatch = s.colorSwatchImage || '';
    if (!byColor[cname]) byColor[cname] = { name: cname, hex: chex, swatch, skus: [] };
    byColor[cname].skus.push(s);
  });

  const grid = document.getElementById('color-grid');
  grid.innerHTML = '';
  Object.values(byColor).forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch';
    // For SanMar products, swatch images are placeholders — use color-name-based color
    const isSanmarSku = c.skus && c.skus[0] && c.skus[0]._source === 'sanmar';
    if (c.swatch && !isSanmarSku) {
      sw.style.backgroundImage = `url(${c.swatch})`;
      sw.style.backgroundSize = 'cover';
    } else {
      sw.style.background = c.hex && c.hex !== '#888888' ? c.hex : colorNameToHex(c.name);
    }
    sw.innerHTML = `<span class="swatch-name">${c.name}</span>`;
    sw.onclick = () => {
      document.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected'));
      sw.classList.add('selected');
      state.color = c;
      document.getElementById('color-label-text').textContent = `Color: ${c.name}`;
      buildSizeTable(c.skus);
      updateProductImage(c);
      // Fetch real inventory for SanMar products
      if (c.skus && c.skus[0] && c.skus[0]._source === 'sanmar') {
        fetchSanmarInventory(state.product.styleID, c.name, c.skus);
      }
    };
    grid.appendChild(sw);
  });

  // Auto-select first color
  if (grid.firstChild) grid.firstChild.click();
}

function updateProductImage(color) {
  const wrap  = document.getElementById('detail-img-wrap');
  const strip = document.getElementById('thumb-strip');
  const sku   = color.skus[0];
  if (!sku) { wrap.innerHTML = '<span class="no-img">No image</span>'; strip.innerHTML = ''; return; }

  // Build list of available images with labels
  const views = [
    { url: sku.colorFrontImage,        label: 'Front' },
    { url: sku.colorBackImage,         label: 'Back' },
    { url: sku.colorSideImage,         label: 'Side' },
    { url: sku.colorOnModelFrontImage, label: 'On model' },
    { url: sku.colorOnModelSideImage,  label: 'Side view' },
    { url: sku.colorOnModelBackImage,  label: 'Back view' },
  ].filter(v => v.url);

  if (!views.length) {
    const isSM = state.product && state.product._source === 'sanmar';
    wrap.innerHTML = isSM
      ? '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;color:#aaa"><svg width=48 height=48 fill=none stroke=currentColor stroke-width=1.5 viewBox="0 0 24 24"><rect x=3 y=3 width=18 height=18 rx=2/><path d="m3 9 4-4 4 4 4-5 4 5"/><circle cx=8.5 cy=13.5 r=1.5/></svg><span style="font-size:13px">Image not available</span></div>'
      : '<span class="no-img">No image available</span>';
    strip.innerHTML = '';
    return;
  }

  // Show first image as main
  function setMain(url, thumbEl) {
    wrap.innerHTML = `<img src="${url}" alt="${color.name}" onerror="this.parentElement.innerHTML='<span class=\'no-img\'>No image available</span>'" onload="if(this.naturalWidth<100||this.naturalHeight<100)this.parentElement.innerHTML='<span class=\'no-img\'>No image available</span>'">`;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  }

  setMain(views[0].url, null);

  // Build thumbnail strip — only show if more than 1 image
  strip.innerHTML = '';
  if (views.length > 1) {
    views.forEach((v, i) => {
      const wrap2 = document.createElement('div');
      const thumb = document.createElement('div');
      thumb.className = 'thumb' + (i === 0 ? ' active' : '');
      thumb.innerHTML = `<img src="${v.url}" alt="${v.label}" onerror="this.style.display='none'" onload="if(this.naturalWidth<100)this.style.display='none'">`;
      thumb.onclick = () => setMain(v.url, thumb);
      wrap2.appendChild(thumb);
      strip.appendChild(wrap2);
    });
  }
}

function buildSizeTable(skus) {
  const tbody = document.getElementById('size-tbody');
  tbody.innerHTML = '';
  state.sizes = [];

  skus.forEach(s => {
    const size  = s.sizeName || s.SizeName || '?';
    const qty   = parseInt(s.quantityAvailable || s.QuantityAvailable || 0);
    const sku   = s.sku || s.SKU || '';

    const stockClass = qty === 0 ? 'out' : qty < 12 ? 'low' : 'in';
    const stockLabel = qty === 0 ? 'Out of stock' : qty < 12 ? `Low (${qty})` : qty >= 999 ? 'In stock' : `In stock (${qty})`;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="size-name">${size}</td>
      <td><span class="stock-badge ${stockClass}">${stockLabel}</span></td>
      <td><input class="qty-input" type="number" min="0" max="${qty}" value="0"
           ${qty === 0 ? 'disabled' : ''}
           data-sku="${sku}" data-size="${size}"
           oninput="updateSizeState(this)"></td>`;
    tbody.appendChild(row);
    state.sizes.push({ size, sku, stock: qty, qty: 0 });
  });

  checkStep2Valid();
}

function updateSizeState(input) {
  const sku = input.dataset.sku;
  const sz  = state.sizes.find(s => s.sku === sku || s.size === input.dataset.size);
  if (sz) sz.qty = parseInt(input.value) || 0;
  checkStep2Valid();
}

function checkStep2Valid() {
  const total = state.sizes.reduce((a,s) => a + s.qty, 0);
  document.getElementById('step2-add').disabled = (total === 0 || !state.color);
}

// ─────────────────────────────────────────────
//  STEP 3 — SERVICE
// ─────────────────────────────────────────────
function selectService(name, el) {
  state.service = name;
}

// ─────────────────────────────────────────────
//  STEP 4 — QUOTE SUMMARY
// ─────────────────────────────────────────────
function goStep(n) {
  if (n === 4) buildSummary();
  _setStep(n);
}

function buildSummaryServicePills(item) {
  const services = ['Embroidery', 'Print'];
  if (isHat(item)) services.push('UV Patch');
  return services.map(svc => {
    const on = item.service === svc;
    const icons = { 'Embroidery': '🧵', 'Print': '🖨️', 'UV Patch': '✨' };
    return `<button style="${on ? SVC_ON : SVC_OFF}" onclick="setSummaryService(${item.id},'${svc}',this)">${icons[svc]} ${svc}</button>`;
  }).join('');
}

const SVC_OFF = "padding:7px 16px;border-radius:999px;border:2px solid #cccccc;background:#ffffff;font-size:12px;font-weight:400;color:#999999;cursor:pointer;font-family:inherit;margin:0;";
const SVC_ON  = "padding:7px 16px;border-radius:999px;border:2px solid #555555;background:#555555;font-size:12px;font-weight:700;color:#ffffff;cursor:pointer;font-family:inherit;margin:0;";

function setSummaryService(id, svc, pillEl) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.service = svc;
  item.placements = [];
  item.customPlacement = '';
  saveCart();
  // Re-render the whole summary so service + placement both update
  buildSummary();
  // Also sync bag drawer
  const svcPills = document.querySelector('#cart-item-' + id + ' .svc-pills');
  if (svcPills) {
    svcPills.querySelectorAll('.svc-pill').forEach(p => p.classList.remove('active'));
    svcPills.querySelectorAll('.svc-pill').forEach(p => { if (p.textContent.includes(svc)) p.classList.add('active'); });
  }
  const bagPlacement = document.getElementById('placement-' + id);
  if (bagPlacement) bagPlacement.innerHTML = buildPlacementHTML(item);
  updateCartCheckoutBtn();
}

function buildSummaryPlacementPills(item) {
  if (!item.service) return '<span style="color:#999;font-size:12px">Select a service first</span>';
  const opts = PLACEMENTS[getPlacementKey(item)] || [];
  const selected = item.placements || [];
  const isEmb = item.service === 'Embroidery';

  let pills = opts.map(opt => {
    const on = selected.includes(opt);
    return `<button style="${on ? PILL_ON : PILL_OFF}" onclick="toggleSummaryPlacement(${item.id},'${opt.replace(/'/g,"\'")}',this)">${opt}</button>`;
  }).join('');

  if (isEmb) {
    const on = selected.includes('Custom');
    pills += `<button style="${on ? PILL_ON : PILL_OFF}" onclick="toggleSummaryPlacement(${item.id},'Custom',this)">Custom (describe)</button>`;
  }
  return pills;
}

function toggleSummaryPlacement(id, opt, pillEl) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  if (!item.placements) item.placements = [];
  if (item.placements.includes(opt)) {
    item.placements = item.placements.filter(p => p !== opt);
    pillEl.setAttribute('style', PILL_OFF);
  } else {
    item.placements.push(opt);
    pillEl.setAttribute('style', PILL_ON);
  }
  saveCart();
  if (opt === 'Custom') {
    const input = document.getElementById('summary-custom-' + id);
    if (input) input.style.display = item.placements.includes('Custom') ? 'block' : 'none';
    const binput = document.getElementById('custom-input-' + id);
    if (binput) binput.style.display = item.placements.includes('Custom') ? 'block' : 'none';
  }
  const bagWrap = document.getElementById('placement-' + id);
  if (bagWrap) bagWrap.innerHTML = buildPlacementHTML(item);
}

function removeSummaryItem(id) {
  const item = cart.find(i => i.id === id);
  const name = item ? (item.product.title || item.product.styleName || 'this item') : 'this item';
  if (!confirm(`Remove "${name}" (${item?.color?.name || ''}) from your bag?`)) return;
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
  buildSummary();
}

function placementDisplay(item) {
  if (!item.placements || !item.placements.length) return '—';
  const parts = item.placements.map(p => {
    if (p === 'Custom' && item.customPlacement) return `Custom: ${item.customPlacement}`;
    if (p === 'Custom') return 'Custom';
    return p;
  });
  return parts.join(', ');
}

function buildSummary() {
  if (!cart.length) {
    document.getElementById('order-summary').innerHTML = '<div style="color:var(--ink3);font-size:14px;padding:12px 0">Your bag is empty.</div>';
    return;
  }

  const byStyle = {};
  cart.forEach(item => {
    const key = item.product.styleName || String(item.product.styleID) || 'Unknown';
    if (!byStyle[key]) byStyle[key] = { name: item.product.title || item.product.styleName || 'Item', brand: item.product.brandName || '', items: [] };
    byStyle[key].items.push(item);
  });

  let html = '';
  let grandTotal = 0;

  Object.entries(byStyle).forEach(([styleNum, group]) => {
    html += `<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:var(--ink3);margin:14px 0 8px;padding-top:12px;border-top:1.5px solid var(--paper3);display:flex;align-items:center;justify-content:space-between">
      <button onclick="reloadProductFromCart(${group.items[0].id})" style="font-size:11px;color:var(--ink2);background:none;border:none;cursor:pointer;font-family:inherit;padding:0;text-decoration:underline;text-underline-offset:2px;text-transform:uppercase;letter-spacing:0.07em;font-weight:400"><strong style="color:var(--ink2)">${styleNum}</strong> — ${group.name}</button>
      <button onclick="reloadProductFromCart(${group.items[0].id})" style="font-size:11px;color:var(--accent);background:none;border:none;cursor:pointer;font-family:inherit;padding:0;text-decoration:underline;text-underline-offset:2px">+ Add more</button>
    </div>`;
    group.items.forEach(item => {
      const total = item.sizes.reduce((a,s) => a + (parseInt(s.qty)||0), 0);
      grandTotal += total;
      const sizeList = item.sizes.map(s => `${s.size}: ${parseInt(s.qty)||0}`).join(' · ');
      html += `
        <div class="summary-row"><span class="label">Color</span><span class="val">${item.color.name}</span></div>
        <div class="summary-row"><span class="label">Sizes &amp; qty</span><span class="val" style="text-align:right;max-width:58%;font-size:13px;line-height:1.5">${sizeList}</span></div>
        <div class="summary-row" style="flex-direction:column;align-items:flex-start;gap:6px">
          <span class="label" style="color:var(--ink2)">Service</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${buildSummaryServicePills(item)}</div>
        </div>
        <div class="summary-row" style="flex-direction:column;align-items:flex-start;gap:6px">
          <span class="label" style="color:var(--ink2)">Placement <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--ink3);font-size:11px">(can select multiple)</span></span>
          <div class="placement-pills" style="margin:0">${buildSummaryPlacementPills(item)}</div>
          ${item.placements && item.placements.includes('Custom') ? `<input id="summary-custom-${item.id}" type="text" placeholder="Describe placement…" value="${item.customPlacement||''}" oninput="setCustomPlacement(${item.id},this.value)" style="display:block;width:100%;padding:7px 10px;margin-top:8px;border:1.5px solid #ccc;border-radius:6px;font-family:inherit;font-size:13px;color:#1a1a1a;background:#fff;outline:none;box-sizing:border-box;">` : ''}
        </div>
        <div class="summary-row" style="margin-bottom:4px"><span class="label">Pieces</span><span class="val">${total}</span></div>
        <div style="text-align:right;margin-bottom:10px">
          <button onclick="removeSummaryItem(${item.id})" style="font-size:12px;color:#c8392b;background:none;border:none;cursor:pointer;font-family:inherit;padding:0;text-decoration:underline;text-underline-offset:2px">Remove item</button>
        </div>`;
    });
  });

  html += `<div class="summary-row" style="font-weight:500;border-top:2px solid var(--paper3);margin-top:10px;padding-top:12px;font-size:15px">
    <span class="label">Total pieces</span><span class="val">${grandTotal}</span>
  </div>`;

  document.getElementById('order-summary').innerHTML = html;
}

// ─────────────────────────────────────────────
//  SUBMIT QUOTE
// ─────────────────────────────────────────────
async function submitQuote() {
  const first = document.getElementById('f-first').value.trim();
  const last  = document.getElementById('f-last').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const notes = document.getElementById('f-notes').value.trim();

  if (!first || !last || !email) {
    const missing = [];
    if (!first) missing.push('First name');
    if (!last)  missing.push('Last name');
    if (!email) missing.push('Email');
    alert('Please fill in the following required fields: ' + missing.join(', ') + '.');
    return;
  }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  // Build cart summary for email
  const byStyle = {};
  cart.forEach(item => {
    const key = item.product.styleName || item.product.styleID || 'Unknown';
    if (!byStyle[key]) byStyle[key] = { name: item.product.title || item.product.styleName, brand: item.product.brandName || '', items: [] };
    byStyle[key].items.push(item);
  });

  let orderLines = '';
  let grandTotal = 0;
  Object.entries(byStyle).forEach(([styleNum, group]) => {
    orderLines += `\nStyle ${styleNum} — ${group.name} (${group.brand})\n`;
    group.items.forEach(item => {
      const total = item.sizes.reduce((a,s)=>a+s.qty,0);
      grandTotal += total;
      orderLines += `  Color: ${item.color.name}\n`;
      orderLines += `  Sizes: ${item.sizes.map(s=>`${s.size}×${s.qty}`).join(', ')}\n`;
      orderLines += `  Service: ${item.service}\n`;
      orderLines += `  Placement: ${placementDisplay(item)}\n`;
      orderLines += `  Subtotal: ${total} pcs\n`;
    });
  });

  const body = `
NEW CUSTOM APPAREL QUOTE REQUEST
=================================

CUSTOMER
Name:   ${first} ${last}
Email:  ${email}
Phone:  ${phone || 'Not provided'}

ORDER DETAILS
${orderLines}
TOTAL PIECES: ${grandTotal}

ARTWORK / LOGO NOTES
${notes || 'None provided'}
  `.trim();

  // ── Send via Resend (api/quote.js)
  try {
    const r = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first, last, email, phone, notes,
        cart,
        artworkFiles: artworkFiles.map(f => ({ name: f.name, size: f.size })),
      })
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || 'Server error');
    }
    showSuccess();
  } catch(e) {
    btn.disabled = false;
    btn.textContent = 'Send Quote Request';
    alert('Could not send your request. Please try again.\n\nError: ' + e.message);
    console.error(e);
  }
}

function showSuccess() {
  // Clear bag and artwork after successful submission
  cart = [];
  saveCart();
  artworkFiles = [];
  renderArtworkFiles();
  updateCartUI();
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.step-btn').forEach(b => { b.classList.remove('active'); b.classList.add('done'); });
  document.getElementById('panel-success').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetApp() {
  state = { currentStep: 1, product: null, color: null, sizes: [], service: null };
  cart = [];
  saveCart();
  document.getElementById('search-input').value = '';
  document.getElementById('product-results').innerHTML = '<p class="empty">Search for a product or pick a category above.</p>';
  document.getElementById('cart-fab').classList.add('hidden');
  updateCartUI();
  _setStep(1);
}

// ─────────────────────────────────────────────
//  DEMO DATA (used when API key not yet set)
// ─────────────────────────────────────────────
function loadDemoProducts() {
  
  const demos = [
    { StyleID:'PC61', Title:'Essential Tee', BrandName:'Port & Company', Image:'https://images.ssactivewear.com/im/1-0-0/500/PC61_FRONT.jpg' },
    { StyleID:'G500', Title:'Heavy Cotton Tee', BrandName:'Gildan', Image:'https://images.ssactivewear.com/im/1-0-0/500/G500_FRONT.jpg' },
    { StyleID:'TW500', Title:'Moisture Wicking Polo', BrandName:'Team 365', Image:'https://images.ssactivewear.com/im/1-0-0/500/TW500_FRONT.jpg' },
    { StyleID:'K500', Title:'Silk Touch Polo', BrandName:"Port Authority", Image:'https://images.ssactivewear.com/im/1-0-0/500/K500_FRONT.jpg' },
    { StyleID:'J317', Title:'All-Weather 3-in-1 Jacket', BrandName:'Port Authority', Image:'https://images.ssactivewear.com/im/1-0-0/500/J317_FRONT.jpg' },
    { StyleID:'NE400', Title:'Performance Longsleeve', BrandName:'New Era', Image:'https://images.ssactivewear.com/im/1-0-0/500/NE400_FRONT.jpg' },
  ];
  renderProductGrid(demos);
}

function demoSkus(styleId) {
  const colors = [
    { ColorName:'Black', ColorCode:'#1a1a1a' },
    { ColorName:'Navy', ColorCode:'#1e3a5f' },
    { ColorName:'White', ColorCode:'#f5f5f5' },
    { ColorName:'Red', ColorCode:'#c8392b' },
    { ColorName:'Royal Blue', ColorCode:'#2563eb' },
    { ColorName:'Forest Green', ColorCode:'#166534' },
  ];
  const sizes = ['XS','S','M','L','XL','2XL','3XL'];
  const skus = [];
  colors.forEach(c => {
    sizes.forEach(sz => {
      skus.push({
        SKU: `${styleId}-${c.ColorName.replace(/\s/g,'')}-${sz}`,
        ColorName: c.ColorName, ColorCode: c.ColorCode,
        SizeName: sz,
        QuantityAvailable: Math.random() < 0.1 ? 0 : Math.floor(Math.random() * 200) + 5,
        Image: `https://images.ssactivewear.com/im/1-0-0/500/${styleId}_FRONT.jpg`
      });
    });
  });
  return skus;
}

// ─────────────────────────────────────────────
//  ARTWORK UPLOAD
// ─────────────────────────────────────────────
let artworkFiles = []; // [{ name, size, type, dataUrl }]

function artworkDragOver(e) {
  e.preventDefault();
  document.getElementById('artwork-drop').classList.add('dragover');
}
function artworkDragLeave(e) {
  document.getElementById('artwork-drop').classList.remove('dragover');
}
function artworkDrop(e) {
  e.preventDefault();
  document.getElementById('artwork-drop').classList.remove('dragover');
  artworkFilesAdded(e.dataTransfer.files);
}

function artworkFilesAdded(fileList) {
  const allowed = ['.pdf','.ai','.eps','.svg','.png','.jpg','.jpeg','.gif','.tif','.tiff','.webp','.dst','.emb'];
  const remaining = 4 - artworkFiles.length;
  if (remaining <= 0) return;

  let added = 0;
  Array.from(fileList).slice(0, remaining).forEach(file => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) return;
    if (artworkFiles.find(f => f.name === file.name)) return; // no dupes

    const reader = new FileReader();
    reader.onload = e => {
      artworkFiles.push({ name: file.name, size: file.size, type: file.type, dataUrl: e.target.result });
      renderArtworkFiles();
    };
    reader.readAsDataURL(file);
    added++;
  });
}

function removeArtworkFile(name) {
  artworkFiles = artworkFiles.filter(f => f.name !== name);
  renderArtworkFiles();
}

function renderArtworkFiles() {
  const container = document.getElementById('artwork-files');
  const limitEl   = document.getElementById('artwork-limit');
  if (!container) return;

  const iconFor = name => {
    const ext = name.split('.').pop().toLowerCase();
    if (['ai','eps'].includes(ext)) return '🎨';
    if (ext === 'svg') return '✏️';
    if (ext === 'pdf') return '📄';
    return '🖼️';
  };
  const fmtSize = b => b > 1048576 ? (b/1048576).toFixed(1)+'MB' : (b/1024).toFixed(0)+'KB';

  container.innerHTML = artworkFiles.map(f => `
    <div class="artwork-file">
      <span class="artwork-file-icon">${iconFor(f.name)}</span>
      <span class="artwork-file-name">${f.name}</span>
      <span class="artwork-file-size">${fmtSize(f.size)}</span>
      <button class="artwork-file-remove" onclick="removeArtworkFile('${f.name.replace(/'/g,"\'")}')">✕</button>
    </div>`).join('');

  const count = artworkFiles.length;
  limitEl.textContent = count >= 4 ? 'Maximum of 4 files reached.' : count > 0 ? `${count}/4 files added` : '';

  // Reset file input so same file can be re-added if removed
  const input = document.getElementById('artwork-input');
  if (input) input.value = '';
}

// Allow forward navigation from next buttons
const origGoStep = goStep;

// ── INIT — runs after all functions are defined ──
(function init() {
  loadCart();
  // Strip any cart items that are missing critical data (corrupted saves)
  cart = cart.filter(item => item && item.product && item.color && Array.isArray(item.sizes) && item.sizes.length > 0);
  saveCart();
  updateCartUI();
})();
</script>

<!-- Optional: load EmailJS if you use Option A above -->
<!-- <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script> -->

</body>
</html>
