import { useState, useRef, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FREE_LIMIT = 3;

const PLACEMENT_OPTIONS = [
  "Auto-detect","Full body","Upper body","Lower body",
  "Left wrist","Right wrist","Both wrists","Neck",
  "Left ear","Right ear","Both ears","Shoulders",
  "Feet","Left hand","Right hand","Waist","Head",
];

const CATEGORY_OPTIONS = [
  { id:"top",      label:"Top / Shirt",       icon:"👕" },
  { id:"bottom",   label:"Bottom / Skirt",    icon:"👖" },
  { id:"dress",    label:"Dress / Jumpsuit",  icon:"👗" },
  { id:"outerwear",label:"Jacket / Coat",     icon:"🧥" },
  { id:"shoes",    label:"Shoes / Boots",     icon:"👟" },
  { id:"accessory",label:"Jewellery / Bag",   icon:"💍" },
  { id:"headwear", label:"Hat / Headwear",    icon:"🧢" },
  { id:"swimwear", label:"Swimwear / Lingerie",icon:"👙" },
];

const PHOTO_TIPS = [
  { good:true,  text:"Full body, head to toe" },
  { good:true,  text:"Fitted clothes — shows your shape" },
  { good:true,  text:"Face the camera straight on" },
  { good:true,  text:"Good lighting, plain background" },
  { good:false, text:"No baggy hoodies or oversized fits" },
  { good:false, text:"No heavy coats or bulky layers" },
  { good:false, text:"No cropped or cut-off photos" },
];

const PACKS = [
  { id:"pack1",  looks:1,  price:1.49,  label:"1 Look" },
  { id:"pack5",  looks:5,  price:5.99,  label:"5 Looks" },
  { id:"pack15", looks:15, price:14.99, label:"15 Looks" },
];

const STAR_LABELS = ["","Terrible","Poor","Okay","Great","Amazing"];

// ─── FONTS + GLOBAL CSS ───────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Raleway:wght@200;300;400;500;600&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: #050208; overflow-x: hidden; }

:root {
  --void:       #050208;
  --obsidian:   #0a0710;
  --deep:       #100c1a;
  --glass:      rgba(255,255,255,0.032);
  --glass-b:    rgba(255,255,255,0.07);
  --glass-hov:  rgba(255,255,255,0.06);
  --white:      #f8f4ff;
  --silver:     #c8c0d8;
  --chrome:     linear-gradient(135deg, #e8e0f0 0%, #9890a8 40%, #d4cce4 60%, #787088 100%);
  --crimsont:   linear-gradient(135deg, #8b1a2e 0%, #6b0f20 100%);
  --crimson:    #7a1525;
  --crimson-lt: #9e1e30;
  --crimson-gl: rgba(122,21,37,0.15);
  --gold:       #c9a84c;
  --diamond:    rgba(220,210,240,0.06);
}

/* ── GRAIN ── */
.fitted-root::before {
  content:'';
  position:fixed; inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  pointer-events:none; z-index:9997;
}

/* ── DIAMOND GRID TEXTURE ── */
.fitted-root::after {
  content:'';
  position:fixed; inset:0;
  background-image:
    linear-gradient(45deg, var(--diamond) 1px, transparent 1px),
    linear-gradient(-45deg, var(--diamond) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events:none; z-index:9996;
}

.fitted-root {
  min-height:100vh;
  background: radial-gradient(ellipse 80% 60% at 50% -10%, #1a0a1e 0%, var(--void) 60%),
              radial-gradient(ellipse 40% 40% at 90% 90%, #1a0510 0%, transparent 60%);
  color:var(--white);
  font-family:'Raleway', sans-serif;
  font-weight:300;
  position:relative;
  overflow-x:hidden;
}

/* ── SPARKLE ── */
.sparkle-el {
  position:fixed; pointer-events:none; z-index:9999;
  animation: sp-pop 0.9s ease-out forwards;
}
.sparkle-el::before {
  content:'✦'; position:absolute; font-size:13px;
  color:rgba(220,210,240,0.9); transform:translate(-50%,-50%);
}
.sparkle-el::after {
  content:'✧'; position:absolute; font-size:8px;
  color:rgba(200,192,216,0.6); transform:translate(9px,-13px);
}
@keyframes sp-pop {
  0%   { opacity:1; transform:scale(0.3); }
  50%  { opacity:1; transform:scale(1.4); }
  100% { opacity:0; transform:scale(1)  translateY(-22px); }
}

/* ── HEADER ── */
.hdr {
  position:sticky; top:0; z-index:100;
  height:68px; padding:0 22px;
  display:flex; align-items:center; justify-content:space-between;
  background:rgba(5,2,8,0.9);
  backdrop-filter:blur(24px);
  border-bottom:1px solid var(--glass-b);
}
.hdr::after {
  content:'';
  position:absolute; bottom:0; left:10%; right:10%; height:1px;
  background:linear-gradient(90deg,transparent,rgba(200,192,216,0.25),transparent);
}

.logo-wrap { display:flex; align-items:baseline; gap:2px; cursor:pointer; }
.logo-main {
  font-family:'Playfair Display', serif;
  font-size:1.65rem; font-weight:700; letter-spacing:6px;
  background:linear-gradient(135deg,#f0eaff 0%,#b0a8c0 50%,#f0eaff 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.logo-accent {
  font-family:'Playfair Display', serif;
  font-size:1.65rem; font-weight:400; font-style:italic; letter-spacing:2px;
  background:linear-gradient(135deg,#9e1e30,#6b0f20);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.logo-mark {
  font-family:'Cormorant Garamond', serif;
  font-size:0.5rem; letter-spacing:5px; color:rgba(200,192,216,0.35);
  text-transform:uppercase; margin-left:8px; align-self:center;
}

.looks-chip {
  background:var(--glass); border:1px solid var(--glass-b);
  border-radius:100px; padding:7px 16px;
  font-size:0.58rem; letter-spacing:2.5px; color:var(--silver);
  text-transform:uppercase; backdrop-filter:blur(10px);
  cursor:pointer; transition:all 0.2s;
  display:flex; align-items:center; gap:6px;
}
.looks-chip:hover { background:var(--glass-hov); color:var(--white); }
.looks-chip .chip-num { color:#9e1e30; font-weight:600; }
.looks-chip.unlim .chip-num { color:var(--silver); }

/* ── NAV TABS ── */
.nav-tabs {
  display:flex; border-bottom:1px solid var(--glass-b);
  background:rgba(5,2,8,0.6); backdrop-filter:blur(10px);
  position:sticky; top:68px; z-index:99;
  overflow-x:auto; scrollbar-width:none;
}
.nav-tabs::-webkit-scrollbar { display:none; }
.nav-tab {
  flex:1; min-width:100px; padding:14px 10px;
  background:transparent; border:none;
  font-family:'Raleway',sans-serif; font-size:0.58rem;
  letter-spacing:3px; color:#4a4560; text-transform:uppercase;
  cursor:pointer; transition:all 0.2s; position:relative;
  white-space:nowrap;
}
.nav-tab:hover { color:var(--silver); }
.nav-tab.active { color:var(--white); }
.nav-tab.active::after {
  content:''; position:absolute; bottom:0; left:20%; right:20%;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(200,192,216,0.6),transparent);
}

/* ── CHROME LINE ── */
.chrome-line {
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(200,192,216,0.18),transparent);
}

/* ── GLASS CARD ── */
.g-card {
  background:var(--glass); border:1px solid var(--glass-b);
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border-radius:18px;
}
.g-card-hover { transition:all 0.22s; }
.g-card-hover:hover { background:var(--glass-hov); border-color:rgba(255,255,255,0.12); }

/* ── CRYSTAL BORDER ── */
.crystal-border {
  border:1px solid transparent;
  background:
    linear-gradient(var(--deep),var(--deep)) padding-box,
    linear-gradient(135deg,rgba(220,210,240,0.3),rgba(122,21,37,0.2),rgba(220,210,240,0.3)) border-box;
}

/* ── SECTION TITLE ── */
.sec-eyebrow {
  font-size:0.52rem; letter-spacing:5px; color:rgba(200,192,216,0.3);
  text-transform:uppercase; margin-bottom:6px;
}
.sec-title {
  font-family:'Playfair Display',serif; font-size:1.8rem;
  font-weight:400; line-height:1.2;
}
.sec-title em { font-style:italic; color:rgba(200,192,216,0.7); }

/* ── BUTTONS ── */
.btn-prim {
  width:100%; padding:18px 24px;
  background:linear-gradient(135deg,#f0eaff,#c8c0d8);
  color:#050208; border:none; border-radius:100px;
  font-family:'Raleway',sans-serif; font-weight:600;
  font-size:0.75rem; letter-spacing:5px; text-transform:uppercase;
  cursor:pointer; transition:all 0.22s; position:relative; overflow:hidden;
}
.btn-prim::before {
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent);
  transform:translateX(-100%); transition:transform 0.5s;
}
.btn-prim:hover::before { transform:translateX(100%); }
.btn-prim:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(200,192,216,0.2); }
.btn-prim:disabled { opacity:0.3; cursor:not-allowed; transform:none; }

.btn-crimson {
  width:100%; padding:18px 24px;
  background:var(--crimsont);
  color:rgba(240,234,255,0.9); border:none; border-radius:100px;
  font-family:'Raleway',sans-serif; font-weight:500;
  font-size:0.75rem; letter-spacing:5px; text-transform:uppercase;
  cursor:pointer; transition:all 0.22s;
  box-shadow:0 0 32px rgba(122,21,37,0.25);
}
.btn-crimson:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(122,21,37,0.35); }

.btn-ghost {
  width:100%; padding:16px 24px;
  background:var(--glass); color:var(--silver);
  border:1px solid var(--glass-b); border-radius:100px;
  font-family:'Raleway',sans-serif; font-size:0.72rem;
  letter-spacing:3px; cursor:pointer; transition:all 0.2s;
  text-transform:uppercase; backdrop-filter:blur(10px);
}
.btn-ghost:hover { background:var(--glass-hov); color:var(--white); }

/* ══ SCREENS ══════════════════════════════════════════════════════════════════ */

/* HOME */
.home-wrap {
  min-height:calc(100vh - 68px);
  display:flex; flex-direction:column;
  align-items:center; padding:0 20px 60px;
}
.hero-section {
  width:100%; max-width:520px;
  display:flex; flex-direction:column;
  align-items:center; text-align:center;
  padding:60px 0 48px; gap:24px;
}
.hero-title {
  font-family:'Playfair Display',serif;
  font-size:clamp(3rem,12vw,5.5rem);
  font-weight:400; line-height:1.05; letter-spacing:1px;
}
.hero-title em {
  font-style:italic;
  background:linear-gradient(135deg,#f0eaff 0%,#9890a8 50%,#f0eaff 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.hero-sub {
  font-size:0.7rem; letter-spacing:4px; color:rgba(200,192,216,0.45);
  text-transform:uppercase;
}
.hero-actions { width:100%; display:flex; flex-direction:column; gap:10px; }

.pricing-row { width:100%; max-width:520px; display:flex; flex-direction:column; gap:8px; }
.p-card {
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 20px; border-radius:14px; cursor:pointer; transition:all 0.2s;
}
.p-card.feat { background:rgba(122,21,37,0.08); border-color:rgba(158,30,48,0.25) !important; }
.p-card-l .p-name {
  font-family:'Raleway',sans-serif; font-weight:600;
  font-size:0.75rem; letter-spacing:3px; text-transform:uppercase; color:var(--white);
}
.p-card-l .p-desc { font-size:0.58rem; letter-spacing:1px; color:#4a4560; margin-top:3px; }
.p-price {
  font-family:'Playfair Display',serif; font-size:1.2rem;
  font-weight:400; color:var(--silver);
}
.p-price small { font-size:0.6rem; letter-spacing:1px; color:#4a4560; }
.best-badge {
  font-size:0.48rem; letter-spacing:2px; text-transform:uppercase;
  background:var(--crimson-gl); border:1px solid rgba(158,30,48,0.3);
  border-radius:100px; padding:3px 10px; color:var(--crimson-lt);
  margin-left:8px;
}

/* REVIEWS on home */
.reviews-preview { width:100%; max-width:520px; display:flex; flex-direction:column; gap:12px; }
.rev-card { padding:18px 20px; border-radius:16px; }
.rev-stars { display:flex; gap:3px; margin-bottom:8px; }
.rev-star { font-size:0.75rem; }
.rev-star.filled { color:#c9a84c; }
.rev-star.empty { color:#2a2535; }
.rev-text { font-size:0.75rem; color:#8a8098; line-height:1.7; font-style:italic; margin-bottom:10px; }
.rev-author { font-size:0.55rem; letter-spacing:3px; text-transform:uppercase; color:#4a4560; }
.rev-date { font-size:0.5rem; color:#2a2535; letter-spacing:1px; margin-left:8px; }

/* GUIDE */
.guide-wrap {
  padding:32px 20px 60px; max-width:480px; margin:0 auto;
  display:flex; flex-direction:column; gap:20px;
}
.ai-note-box {
  padding:16px 18px; border-radius:14px;
  background:rgba(122,21,37,0.06); border:1px solid rgba(158,30,48,0.15);
  font-size:0.72rem; color:#7a7090; line-height:1.8;
}
.ai-note-box strong { color:#aaa0b8; }
.tip-row {
  display:flex; align-items:center; gap:14px; padding:13px 16px;
  border-radius:12px; border:1px solid transparent;
}
.tip-row.good { background:rgba(255,255,255,0.022); border-color:var(--glass-b); }
.tip-row.bad  { background:rgba(122,21,37,0.05); border-color:rgba(122,21,37,0.12); }
.tip-ico { font-size:0.7rem; flex-shrink:0; }
.tip-row.good .tip-ico { color:var(--silver); }
.tip-row.bad  .tip-ico { color:var(--crimson-lt); opacity:0.8; }
.tip-txt { font-size:0.78rem; color:#8a8098; }
.tip-row.good .tip-txt { color:#b0a8c0; }

/* BUILD */
.build-wrap {
  padding:20px; max-width:520px; margin:0 auto;
  display:flex; flex-direction:column; gap:16px;
  padding-bottom:140px;
}
.sec-lbl {
  font-size:0.54rem; letter-spacing:4px; color:#2e2a3a; text-transform:uppercase; padding:0 4px;
}
.photo-frame {
  width:100%; aspect-ratio:3/5; border-radius:18px; overflow:hidden;
  position:relative; border:1px solid var(--glass-b);
}
.photo-frame img { width:100%; height:100%; object-fit:cover; }
.chg-photo-btn {
  position:absolute; bottom:14px; right:14px;
  background:rgba(5,2,8,0.85); border:1px solid var(--glass-b);
  color:var(--silver); font-size:0.58rem; letter-spacing:2px;
  text-transform:uppercase; padding:8px 14px; border-radius:100px;
  cursor:pointer; backdrop-filter:blur(12px); transition:all 0.2s;
}
.chg-photo-btn:hover { color:var(--white); }

.outfit-list { display:flex; flex-direction:column; gap:8px; }
.oi-card {
  display:flex; align-items:center; gap:14px; padding:14px;
  border-radius:14px; background:var(--glass); border:1px solid var(--glass-b);
  backdrop-filter:blur(10px); transition:all 0.2s;
}
.oi-card:hover { background:var(--glass-hov); }
.oi-thumb { width:52px; height:52px; border-radius:10px; object-fit:cover; border:1px solid var(--glass-b); flex-shrink:0; }
.oi-info { flex:1; min-width:0; }
.oi-cat { font-size:0.52rem; letter-spacing:3px; color:var(--silver); text-transform:uppercase; opacity:0.45; }
.oi-name { font-size:0.78rem; color:var(--white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:2px 0; }
.oi-place { font-size:0.58rem; letter-spacing:1px; color:#3a3550; }
.oi-acts { display:flex; gap:6px; flex-shrink:0; }
.ico-btn {
  width:32px; height:32px; border-radius:8px; background:transparent;
  border:1px solid #1e1a2a; color:#3a3550; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:0.75rem; transition:all 0.15s;
}
.ico-btn:hover { border-color:var(--white); color:var(--white); }
.ico-btn.del:hover { border-color:var(--crimson-lt); color:var(--crimson-lt); }

.add-panel {
  border-radius:20px; background:var(--glass); border:1px solid var(--glass-b);
  backdrop-filter:blur(20px); padding:20px; display:flex; flex-direction:column; gap:16px;
}
.panel-hdr { display:flex; align-items:center; justify-content:space-between; }
.panel-ttl { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:400; }

.img-upload {
  width:100%; aspect-ratio:1; border-radius:14px;
  border:1px dashed rgba(200,192,216,0.12);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:10px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden;
  background:rgba(0,0,0,0.3);
}
.img-upload:hover { border-color:rgba(200,192,216,0.28); }
.img-upload img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.img-upload-ov {
  position:absolute; inset:0; background:rgba(5,2,8,0.72);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:8px; opacity:0; transition:opacity 0.2s;
}
.img-upload:hover .img-upload-ov { opacity:1; }
.up-plus { font-size:2rem; color:rgba(200,192,216,0.2); }
.up-hint { font-size:0.58rem; letter-spacing:2px; color:#3a3550; text-transform:uppercase; }

.fld-lbl { font-size:0.56rem; letter-spacing:3px; color:#3a3550; text-transform:uppercase; margin-bottom:6px; }
.cat-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.cat-opt {
  padding:10px 8px; border-radius:10px; background:transparent;
  border:1px solid #1a1628; color:#4a4560; font-family:'Raleway',sans-serif;
  font-size:0.63rem; letter-spacing:0.5px; cursor:pointer; transition:all 0.15s; text-align:left;
}
.cat-opt:hover { border-color:#3a3550; color:#8a8098; }
.cat-opt.sel { border-color:var(--silver); color:var(--white); background:rgba(200,192,216,0.05); }

.s-select {
  width:100%; background:rgba(5,2,8,0.6); border:1px solid #1e1a2a;
  border-radius:10px; color:var(--white); font-family:'Raleway',sans-serif;
  font-size:0.75rem; padding:12px 14px; outline:none; appearance:none; cursor:pointer;
}
.s-select:focus { border-color:var(--silver); }
.s-input {
  width:100%; background:rgba(5,2,8,0.6); border:1px solid #1e1a2a;
  border-radius:10px; color:var(--white); font-family:'Raleway',sans-serif;
  font-size:0.75rem; padding:12px 14px; outline:none; letter-spacing:0.5px; margin-top:8px;
}
.s-input::placeholder { color:#2e2a3a; }
.s-input:focus { border-color:var(--silver); }

.add-more-btn {
  width:100%; padding:16px; background:transparent;
  border:1px dashed rgba(200,192,216,0.09); color:#3a3550;
  border-radius:14px; font-size:0.68rem; letter-spacing:3px;
  cursor:pointer; transition:all 0.2s; text-transform:uppercase;
}
.add-more-btn:hover { border-color:rgba(200,192,216,0.22); color:#8a8098; }

.empty-state {
  text-align:center; padding:24px 0;
  font-size:0.62rem; letter-spacing:2px; color:#1e1a2a;
  text-transform:uppercase; line-height:2.2;
}

/* STICKY BOTTOM */
.sticky-bar {
  position:fixed; bottom:0; left:0; right:0;
  padding:16px 20px 30px;
  background:linear-gradient(to top,rgba(5,2,8,1) 55%,transparent);
  z-index:50;
}
.gen-btn {
  width:100%; max-width:520px; margin:0 auto; display:block;
  padding:20px; background:linear-gradient(135deg,#f0eaff,#c8c0d8);
  color:#050208; border:none; border-radius:100px;
  font-family:'Raleway',sans-serif; font-weight:700;
  font-size:0.8rem; letter-spacing:7px; text-transform:uppercase;
  cursor:pointer; transition:all 0.22s; position:relative; overflow:hidden;
}
.gen-btn::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent);
  transform:translateX(-100%); animation:shim 2.8s infinite;
}
@keyframes shim { to { transform:translateX(100%); } }
.gen-btn:hover { transform:translateY(-2px); box-shadow:0 14px 44px rgba(200,192,216,0.22); }
.gen-btn:disabled { opacity:0.3; cursor:not-allowed; transform:none; }
.gen-sub {
  text-align:center; font-size:0.52rem; letter-spacing:2px;
  color:#2e2a3a; text-transform:uppercase; margin-top:8px;
  max-width:520px; margin-left:auto; margin-right:auto;
}
.gen-sub em { color:var(--crimson-lt); font-style:normal; }

/* RESULT */
.result-wrap {
  padding:20px; max-width:520px; margin:0 auto;
  display:flex; flex-direction:column; gap:16px; padding-bottom:40px;
}
.result-frame {
  width:100%; aspect-ratio:3/5; border-radius:20px; overflow:hidden;
  border:1px solid var(--glass-b); position:relative;
}
.result-frame img { width:100%; height:100%; object-fit:cover; }
.result-badge {
  position:absolute; top:16px; left:16px;
  background:rgba(5,2,8,0.85); border:1px solid var(--glass-b);
  border-radius:100px; padding:7px 16px;
  font-size:0.54rem; letter-spacing:3px; color:var(--silver); text-transform:uppercase;
  backdrop-filter:blur(12px);
}
.rend-ov {
  position:absolute; inset:0; background:rgba(5,2,8,0.95);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px;
}
.spin-ring {
  width:54px; height:54px; border:1px solid #1e1a2a; border-top-color:var(--silver);
  border-radius:50%; animation:spin 1.1s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }
.rend-txt { font-size:0.56rem; letter-spacing:3px; color:#3a3550; text-transform:uppercase; text-align:center; max-width:200px; line-height:2.2; }
.res-acts { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
.res-act-btn {
  padding:14px 8px; border-radius:12px;
  background:var(--glass); border:1px solid var(--glass-b);
  color:var(--silver); font-size:0.58rem; letter-spacing:2px; text-transform:uppercase;
  cursor:pointer; transition:all 0.2s; text-align:center; backdrop-filter:blur(10px);
}
.res-act-btn:hover { background:var(--glass-hov); color:var(--white); }
.back-btn {
  width:100%; padding:15px; background:transparent; border:1px solid #1e1a2a;
  border-radius:100px; color:#3a3550; font-size:0.62rem; letter-spacing:3px;
  text-transform:uppercase; cursor:pointer; transition:all 0.2s;
}
.back-btn:hover { border-color:#3a3550; color:#8a8098; }

/* FIND THIS FIT */
.ftf-wrap {
  padding:24px 20px 60px; max-width:520px; margin:0 auto;
  display:flex; flex-direction:column; gap:20px;
}
.ftf-upload {
  width:100%; aspect-ratio:4/5; border-radius:18px;
  border:1px dashed rgba(200,192,216,0.14);
  background:rgba(5,2,8,0.5);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:14px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden;
}
.ftf-upload:hover { border-color:rgba(200,192,216,0.3); }
.ftf-upload img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:18px; }
.ftf-upload-ov {
  position:absolute; inset:0; background:rgba(5,2,8,0.75); border-radius:18px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;
  opacity:0; transition:opacity 0.2s;
}
.ftf-upload:hover .ftf-upload-ov { opacity:1; }
.ftf-icon { font-size:3rem; opacity:0.12; }
.ftf-hint { font-size:0.62rem; letter-spacing:3px; color:#3a3550; text-transform:uppercase; }

.ftf-result {
  padding:22px; border-radius:18px;
  background:var(--glass); border:1px solid var(--glass-b); backdrop-filter:blur(20px);
  display:flex; flex-direction:column; gap:14px;
}
.ftf-result-title {
  font-family:'Playfair Display',serif; font-size:1rem; font-weight:400;
  color:var(--silver); letter-spacing:1px;
}
.ftf-result-text {
  font-size:0.75rem; color:#8a8098; line-height:1.85; letter-spacing:0.3px;
}
.ftf-tags { display:flex; flex-wrap:wrap; gap:8px; }
.ftf-tag {
  padding:6px 14px; border-radius:100px; font-size:0.6rem; letter-spacing:2px;
  text-transform:uppercase; background:rgba(122,21,37,0.1);
  border:1px solid rgba(158,30,48,0.2); color:var(--crimson-lt);
}

/* REVIEWS */
.revs-wrap {
  padding:24px 20px 80px; max-width:520px; margin:0 auto;
  display:flex; flex-direction:column; gap:20px;
}
.add-rev-form {
  padding:22px; border-radius:18px;
  background:var(--glass); border:1px solid var(--glass-b); backdrop-filter:blur(20px);
  display:flex; flex-direction:column; gap:14px;
}
.star-picker { display:flex; gap:8px; }
.star-pick-btn {
  font-size:1.5rem; background:transparent; border:none; cursor:pointer;
  transition:transform 0.15s; line-height:1;
}
.star-pick-btn:hover { transform:scale(1.25); }
.rev-input {
  width:100%; background:rgba(5,2,8,0.6); border:1px solid #1e1a2a;
  border-radius:12px; color:var(--white); font-family:'Raleway',sans-serif;
  font-size:0.75rem; padding:14px 16px; outline:none; resize:none; line-height:1.7;
}
.rev-input::placeholder { color:#2e2a3a; }
.rev-input:focus { border-color:var(--silver); }
.rev-name-row { display:flex; gap:8px; }
.rev-cards-list { display:flex; flex-direction:column; gap:10px; }
.full-rev-card {
  padding:20px; border-radius:16px;
  background:var(--glass); border:1px solid var(--glass-b); backdrop-filter:blur(16px);
}
.no-revs {
  text-align:center; padding:32px 0;
  font-size:0.62rem; letter-spacing:2px; color:#1e1a2a; text-transform:uppercase; line-height:2.5;
}

/* MODAL */
.modal-bg {
  position:fixed; inset:0; background:rgba(5,2,8,0.95);
  backdrop-filter:blur(12px); z-index:200;
  display:flex; align-items:flex-end; justify-content:center;
}
@media(min-width:520px) { .modal-bg { align-items:center; padding:20px; } }
.modal-box {
  width:100%; max-width:460px; background:#080510;
  border:1px solid var(--glass-b); border-radius:24px 24px 0 0;
  padding:28px 22px 40px; max-height:92vh; overflow-y:auto;
}
@media(min-width:520px) { .modal-box { border-radius:24px; } }
.modal-handle { width:34px; height:3px; background:#1e1a2a; border-radius:100px; margin:0 auto 22px; }
.modal-ttl { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:400; margin-bottom:6px; }
.modal-ttl em { font-style:italic; color:var(--silver); }
.modal-sub { font-size:0.62rem; letter-spacing:1.5px; color:#3a3550; line-height:1.9; margin-bottom:22px; }
.modal-sub a { color:var(--silver); }
.tier-cards { display:flex; flex-direction:column; gap:10px; margin-bottom:14px; }
.tier-card {
  border-radius:16px; padding:18px 20px;
  background:var(--glass); border:1px solid var(--glass-b); cursor:pointer; transition:all 0.2s;
}
.tier-card:hover { background:var(--glass-hov); }
.tier-card.feat { border-color:rgba(158,30,48,0.2); background:rgba(122,21,37,0.06); }
.tier-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.tier-nm { font-family:'Raleway',sans-serif; font-weight:600; font-size:0.75rem; letter-spacing:3px; text-transform:uppercase; color:var(--white); }
.tier-pr { font-family:'Playfair Display',serif; font-size:1.3rem; color:var(--silver); }
.tier-pr small { font-size:0.6rem; color:#3a3550; }
.tier-desc { font-size:0.63rem; color:#4a4560; letter-spacing:0.5px; line-height:1.7; }
.tier-perks { list-style:none; margin-top:10px; display:flex; flex-direction:column; gap:6px; }
.tier-perks li { font-size:0.63rem; color:#5a5070; display:flex; align-items:center; gap:8px; }
.tier-perks li::before { content:'✦'; color:rgba(200,192,216,0.4); font-size:0.45rem; flex-shrink:0; }
.pack-grid { display:flex; flex-direction:column; gap:6px; margin-top:10px; }
.pack-btn {
  width:100%; padding:13px 18px; background:transparent;
  border:1px solid #1e1a2a; border-radius:12px; color:#4a4560;
  font-family:'Raleway',sans-serif; font-size:0.7rem; letter-spacing:1px;
  cursor:pointer; transition:all 0.2s; text-align:left;
  display:flex; justify-content:space-between; align-items:center;
}
.pack-btn:hover { border-color:var(--silver); color:var(--white); }
.div-txt { text-align:center; font-size:0.52rem; letter-spacing:2px; color:#1e1a2a; text-transform:uppercase; margin:4px 0; }
.m-input {
  width:100%; background:#050208; border:1px solid #1e1a2a; border-radius:12px;
  color:var(--white); font-family:'Raleway',sans-serif; font-size:0.75rem;
  padding:14px 16px; outline:none; margin-bottom:12px;
}
.m-input:focus { border-color:var(--silver); }
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function FittedApp() {
  const [tab, setTab]               = useState("home");
  const [userPhoto, setUserPhoto]   = useState(null);
  const [outfitItems, setOutfitItems] = useState([]);
  const [renderedLook, setRenderedLook] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [paidLooks, setPaidLooks]   = useState(0);
  const [userPlan, setUserPlan]     = useState("free");
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [apiKey, setApiKey]         = useState("");
  const [showApiModal, setShowApiModal] = useState(false);
  const [renderStep, setRenderStep] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem]       = useState({ category:"top", placement:"Auto-detect", customPlacement:"", image:null, name:"" });
  const [editingId, setEditingId]   = useState(null);
  const [sparkles, setSparkles]     = useState([]);

  // Find This Fit
  const [ftfPhoto, setFtfPhoto]     = useState(null);
  const [ftfResult, setFtfResult]   = useState(null);
  const [ftfLoading, setFtfLoading] = useState(false);

  // Reviews
  const [reviews, setReviews]       = useState([]);
  const [newRev, setNewRev]         = useState({ stars:0, text:"", name:"" });
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revError, setRevError]     = useState("");

  const photoRef    = useRef(null);
  const itemImgRef  = useRef(null);
  const ftfRef      = useRef(null);

  // ── Load reviews from storage ──
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("fitted_reviews", true);
        if (r?.value) setReviews(JSON.parse(r.value));
      } catch(_) {}
    })();
  }, []);

  const totalLooks      = FREE_LIMIT + paidLooks;
  const looksRemaining  = userPlan === "unlimited" ? Infinity : Math.max(0, totalLooks - renderCount);
  const canRender       = userPlan === "unlimited" || looksRemaining > 0;

  // ── Sparkle ──
  const spark = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setSparkles(p => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setSparkles(p => p.filter(s => s.id !== id)), 950);
  };

  // ── Photo uploads ──
  const onPhoto = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = ev => { setUserPhoto(ev.target.result); setTab("try"); };
    rd.readAsDataURL(f);
  };
  const onItemImg = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = ev => setNewItem(p => ({ ...p, image: ev.target.result, name: f.name.replace(/\.[^/.]+$/,"") }));
    rd.readAsDataURL(f);
  };
  const onFtfImg = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = ev => { setFtfPhoto(ev.target.result); setFtfResult(null); };
    rd.readAsDataURL(f);
  };

  // ── Outfit item management ──
  const saveItem = () => {
    if (!newItem.image) return;
    const placement = newItem.customPlacement || newItem.placement;
    const item = { ...newItem, placement, id: editingId || Date.now() };
    if (editingId) {
      setOutfitItems(p => p.map(i => i.id === editingId ? item : i));
      setEditingId(null);
    } else {
      setOutfitItems(p => [...p, item]);
    }
    setNewItem({ category:"top", placement:"Auto-detect", customPlacement:"", image:null, name:"" });
    setAddingItem(false); setRenderedLook(null);
  };
  const editItem = (item) => { setNewItem({...item}); setEditingId(item.id); setAddingItem(true); };
  const removeItem = (id) => { setOutfitItems(p => p.filter(i => i.id !== id)); setRenderedLook(null); };

  // ── Generate look ──
  const handleGetFitted = (e) => {
    spark(e);
    if (!canRender) { setShowPaywall(true); return; }
    if (!apiKey) { setShowApiModal(true); return; }
    generateLook();
  };

  const generateLook = async () => {
    if (!userPhoto || outfitItems.length === 0) return;
    setIsRendering(true); setRenderedLook(null); setTab("result");
    try {
      let cur = userPhoto;
      const catMap = { top:"upper_body", bottom:"lower_body", dress:"upper_body", outerwear:"upper_body", shoes:"lower_body", accessory:"auto", headwear:"auto", swimwear:"upper_body" };
      for (let i = 0; i < outfitItems.length; i++) {
        const item = outfitItems[i];
        setRenderStep(`Fitting ${item.name || item.category}... (${i+1} of ${outfitItems.length})`);
        const res = await fetch("https://api.fashn.ai/v1/run", {
          method:"POST",
          headers:{ "Content-Type":"application/json", Authorization:`Bearer ${apiKey}` },
          body:JSON.stringify({ model_image:cur, garment_image:item.image, category:catMap[item.category]||"auto", mode:"balanced" }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const { id:pid } = await res.json();
        let result = null;
        for (let a = 0; a < 30; a++) {
          await new Promise(r => setTimeout(r,2000));
          const st = await fetch(`https://api.fashn.ai/v1/status/${pid}`, { headers:{ Authorization:`Bearer ${apiKey}` }});
          const sd = await st.json();
          if (sd.status==="completed") { result=sd.output?.[0]; break; }
          if (sd.status==="failed") throw new Error("failed");
        }
        if (!result) throw new Error("timeout");
        cur = result;
      }
      setRenderedLook(cur); setRenderCount(c=>c+1); setRenderStep("");
    } catch(err) {
      alert("Render failed. Check your API key and try again.");
      setRenderStep(""); setTab("try");
    }
    setIsRendering(false);
  };

  // ── Find This Fit ──
  const findThisFit = async () => {
    if (!ftfPhoto) return;
    if (!apiKey) { setShowApiModal(true); return; }
    setFtfLoading(true); setFtfResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{
            role:"user",
            content:[
              { type:"image", source:{ type:"base64", media_type:"image/jpeg", data: ftfPhoto.split(",")[1] }},
              { type:"text", text:`You are a fashion expert. Analyse the clothing and accessories in this image. For each visible item, identify:
1. The type of garment/accessory
2. Key style details (colour, cut, fabric, pattern, details)
3. Which brands/retailers it could be from (give 3-5 realistic options like ZARA, PrettyLittleThing, ASOS, Shein, Fashion Nova, H&M, Mango, Boohoo, Missguided, River Island, Topshop, PLT, Oh Polly, etc.)
4. What search terms to use to find it

Format your response as JSON only, no markdown, like this:
{"items":[{"type":"item type","description":"brief style description","brands":["Brand1","Brand2","Brand3"],"searchTerms":["term1","term2"]},...],"summary":"one sentence overall vibe of the outfit"}`
            }]
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c=>c.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setFtfResult(parsed);
    } catch(e) {
      setFtfResult({ error:true });
    }
    setFtfLoading(false);
  };

  // ── Reviews ──
  const submitReview = async () => {
    if (!newRev.stars) { setRevError("Please select a star rating"); return; }
    if (!newRev.text.trim()) { setRevError("Please write a review"); return; }
    if (!newRev.name.trim()) { setRevError("Please enter your name"); return; }
    setRevSubmitting(true); setRevError("");
    const rev = { ...newRev, id: Date.now(), date: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) };
    const updated = [rev, ...reviews];
    try {
      await window.storage.set("fitted_reviews", JSON.stringify(updated), true);
      setReviews(updated);
      setNewRev({ stars:0, text:"", name:"" });
    } catch(e) {
      setRevError("Failed to save review. Please try again.");
    }
    setRevSubmitting(false);
  };

  const simulatePurchase = (looks) => { setPaidLooks(p=>p+looks); setShowPaywall(false); setShowPricing(false); };
  const simulateSubscribe = () => { setUserPlan("unlimited"); setShowPaywall(false); setShowPricing(false); };

  const Stars = ({ count, size="0.75rem" }) => (
    <div className="rev-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`rev-star ${i<=count?"filled":"empty"}`} style={{fontSize:size}}>★</span>
      ))}
    </div>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="fitted-root">

        {/* SPARKLES */}
        {sparkles.map(s => (
          <div key={s.id} className="sparkle-el" style={{left:s.x,top:s.y}} />
        ))}

        {/* HEADER */}
        <header className="hdr">
          <div className="logo-wrap" onClick={() => setTab("home")}>
            <span className="logo-main">FITT</span>
            <span className="logo-accent">ed</span>
            <span className="logo-mark">✦ AI</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div className={`looks-chip ${userPlan==="unlimited"?"unlim":""}`} onClick={()=>setShowPricing(true)}>
              {userPlan==="unlimited"
                ? <><span className="chip-num">∞</span> unlimited</>
                : <><span className="chip-num">{looksRemaining}</span> looks</>}
            </div>
          </div>
        </header>

        {/* NAV TABS */}
        <nav className="nav-tabs">
          {[
            {id:"home",   label:"Home"},
            {id:"guide",  label:"Photo Guide"},
            {id:"try",    label:"Try On"},
            {id:"find",   label:"Find This Fit"},
            {id:"reviews",label:"Reviews"},
          ].map(t => (
            <button key={t.id} className={`nav-tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* ════ HOME ════ */}
        {tab==="home" && (
          <div className="home-wrap">
            <div className="hero-section">
              <div>
                <div className="hero-title">See it on<br /><em>you.</em></div>
                <div className="hero-sub" style={{marginTop:14}}>Any outfit · Any site · Your body</div>
              </div>
              <div className="chrome-line" style={{width:60}} />
              <div className="hero-actions">
                <button className="btn-prim" onClick={(e)=>{spark(e);photoRef.current?.click();}}>
                  Get Fitted ✦
                </button>
                <button className="btn-ghost" onClick={()=>setTab("find")}>Find This Fit 🔍</button>
                <button className="btn-ghost" onClick={()=>setShowPricing(true)}>View Pricing</button>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={onPhoto} />
            </div>

            {/* Pricing strip */}
            <div className="pricing-row" style={{marginBottom:32}}>
              {[
                {label:"Free",desc:"3 looks, no card needed",price:"£0",feat:false,action:()=>setTab("guide")},
                {label:"Pay Per Look",desc:"Buy looks as you need",price:"£1.49",priceSub:"/look",feat:false,action:()=>setShowPricing(true)},
                {label:"Unlimited",desc:"Unlimited renders + priority",price:"£9.99",priceSub:"/mo",feat:true,badge:"Best Value",action:()=>setShowPricing(true)},
              ].map((p,i)=>(
                <div key={i} className={`p-card g-card g-card-hover ${p.feat?"feat":""}`} onClick={p.action}>
                  <div className="p-card-l">
                    <div className="p-name">{p.label}{p.badge&&<span className="best-badge">{p.badge}</span>}</div>
                    <div className="p-desc">{p.desc}</div>
                  </div>
                  <div className="p-price">{p.price}{p.priceSub&&<small> {p.priceSub}</small>}</div>
                </div>
              ))}
            </div>

            {/* Reviews preview */}
            {reviews.length > 0 && (
              <>
                <div style={{width:"100%",maxWidth:520,marginBottom:12}}>
                  <div className="sec-eyebrow">✦ Community</div>
                  <div className="sec-title">What people <em>say</em></div>
                </div>
                <div className="reviews-preview">
                  {reviews.slice(0,3).map(r=>(
                    <div key={r.id} className="rev-card g-card">
                      <Stars count={r.stars} />
                      <div className="rev-text">"{r.text}"</div>
                      <div>
                        <span className="rev-author">{r.name}</span>
                        <span className="rev-date">{r.date}</span>
                      </div>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <button className="btn-ghost" onClick={()=>setTab("reviews")}>
                      See all {reviews.length} reviews →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ GUIDE ════ */}
        {tab==="guide" && (
          <div className="guide-wrap">
            <div>
              <div className="sec-eyebrow">✦ Before You Start</div>
              <div className="sec-title">Photo <em>Guide</em></div>
            </div>
            <div className="ai-note-box">
              <strong>No nudity needed.</strong> Upload a photo in fitted clothes — leggings, a fitted tee, anything showing your shape. The AI automatically removes what you're wearing and replaces it with your new look.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {PHOTO_TIPS.map((t,i)=>(
                <div key={i} className={`tip-row ${t.good?"good":"bad"}`}>
                  <span className="tip-ico">{t.good?"✦":"✕"}</span>
                  <span className="tip-txt">{t.text}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="btn-prim" onClick={()=>photoRef.current?.click()}>Upload My Photo ✦</button>
              <button className="btn-ghost" onClick={()=>setTab("home")}>← Back</button>
            </div>
            <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={onPhoto} />
          </div>
        )}

        {/* ════ TRY ON ════ */}
        {tab==="try" && (
          <>
            <div className="build-wrap">
              {userPhoto ? (
                <div className="photo-frame">
                  <img src={userPhoto} alt="You" />
                  <button className="chg-photo-btn" onClick={()=>photoRef.current?.click()}>Change Photo</button>
                  <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={onPhoto} />
                </div>
              ) : (
                <div style={{textAlign:"center",padding:"40px 0",display:"flex",flexDirection:"column",gap:14,alignItems:"center"}}>
                  <div style={{fontSize:"0.65rem",letterSpacing:"3px",color:"#2e2a3a",textTransform:"uppercase"}}>No photo uploaded yet</div>
                  <button className="btn-prim" style={{maxWidth:280}} onClick={()=>photoRef.current?.click()}>Upload Your Photo</button>
                  <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={onPhoto} />
                </div>
              )}

              <div className="chrome-line" />
              <div className="sec-lbl">✦ Your Outfit — {outfitItems.length} {outfitItems.length===1?"piece":"pieces"}</div>

              {outfitItems.length===0 && !addingItem && (
                <div className="empty-state">No items yet<br />Add your first piece below</div>
              )}

              <div className="outfit-list">
                {outfitItems.map(item=>(
                  <div key={item.id} className="oi-card">
                    <img src={item.image} alt={item.name} className="oi-thumb" />
                    <div className="oi-info">
                      <div className="oi-cat">{CATEGORY_OPTIONS.find(c=>c.id===item.category)?.label}</div>
                      <div className="oi-name">{item.name||"Item"}</div>
                      <div className="oi-place">↳ {item.placement}</div>
                    </div>
                    <div className="oi-acts">
                      <button className="ico-btn" onClick={()=>editItem(item)}>✎</button>
                      <button className="ico-btn del" onClick={()=>removeItem(item.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {addingItem ? (
                <div className="add-panel">
                  <div className="panel-hdr">
                    <div className="panel-ttl">{editingId?"Edit Item":"Add Item"}</div>
                    <button className="ico-btn" onClick={()=>{setAddingItem(false);setEditingId(null);setNewItem({category:"top",placement:"Auto-detect",customPlacement:"",image:null,name:""});}}>✕</button>
                  </div>

                  <div className="img-upload" onClick={()=>itemImgRef.current?.click()}>
                    {newItem.image && <img src={newItem.image} alt="item" />}
                    <div className="img-upload-ov">
                      <div className="up-plus">＋</div>
                      <div className="up-hint">Change Image</div>
                    </div>
                    {!newItem.image && (<>
                      <div className="up-plus">＋</div>
                      <div className="up-hint">Upload Clothing Image</div>
                      <div style={{fontSize:"0.55rem",color:"#2e2a3a",letterSpacing:"1px"}}>Screenshot from any site or camera roll</div>
                    </>)}
                  </div>
                  <input ref={itemImgRef} type="file" accept="image/*" style={{display:"none"}} onChange={onItemImg} />

                  <div>
                    <div className="fld-lbl">What type of item?</div>
                    <div className="cat-grid">
                      {CATEGORY_OPTIONS.map(c=>(
                        <button key={c.id} className={`cat-opt ${newItem.category===c.id?"sel":""}`} onClick={()=>setNewItem(p=>({...p,category:c.id}))}>
                          {c.icon} {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="fld-lbl">Where does it go?</div>
                    <select className="s-select" value={newItem.placement} onChange={e=>setNewItem(p=>({...p,placement:e.target.value}))}>
                      {PLACEMENT_OPTIONS.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                    <input className="s-input" placeholder='Or type exactly — e.g. "left wrist" or "right ear"' value={newItem.customPlacement} onChange={e=>setNewItem(p=>({...p,customPlacement:e.target.value}))} />
                  </div>

                  <button className="btn-prim" onClick={saveItem} disabled={!newItem.image}>
                    {editingId?"Update Item":"Add to Outfit"} ✦
                  </button>
                </div>
              ) : (
                <button className="add-more-btn" onClick={()=>setAddingItem(true)}>
                  ＋ {outfitItems.length>0?"Add Another Piece":"Add First Piece"}
                </button>
              )}
            </div>

            {!addingItem && outfitItems.length>0 && (
              <div className="sticky-bar">
                <button className="gen-btn" onClick={handleGetFitted} disabled={isRendering||!userPhoto}>
                  Get Fitted ✦
                </button>
                <div className="gen-sub">
                  {outfitItems.length} {outfitItems.length===1?"piece":"pieces"} · {userPlan==="unlimited"?"∞ unlimited":<><em>{looksRemaining}</em> {looksRemaining===1?"render":"renders"} left</>}
                </div>
              </div>
            )}
          </>
        )}

        {/* ════ RESULT ════ */}
        {tab==="result" && (
          <div className="result-wrap">
            <div className="result-frame">
              {isRendering && (
                <div className="rend-ov">
                  <div className="spin-ring" />
                  <div className="rend-txt">{renderStep||"Getting you fitted..."}</div>
                </div>
              )}
              {(renderedLook||userPhoto) && <img src={renderedLook||userPhoto} alt="Your look" />}
              {renderedLook && <div className="result-badge">✦ Fitted</div>}
            </div>
            {renderedLook && (<>
              <div className="res-acts">
                <button className="res-act-btn" onClick={()=>{const a=document.createElement('a');a.href=renderedLook;a.download='fitted-look.jpg';a.click();}}>↓ Save</button>
                <button className="res-act-btn">⤴ Share</button>
                <button className="res-act-btn" onClick={()=>{setRenderedLook(null);setOutfitItems([]);setTab("try");}}>↺ Reset</button>
              </div>
              <button className="back-btn" onClick={()=>setTab("try")}>← Edit Outfit</button>
              <button className="btn-ghost" onClick={()=>setTab("reviews")}>Leave a Review ✦</button>
            </>)}
          </div>
        )}

        {/* ════ FIND THIS FIT ════ */}
        {tab==="find" && (
          <div className="ftf-wrap">
            <div>
              <div className="sec-eyebrow">✦ AI Outfit Detective</div>
              <div className="sec-title">Find <em>This Fit</em></div>
            </div>
            <div style={{fontSize:"0.72rem",color:"#5a5070",lineHeight:1.85,letterSpacing:"0.3px"}}>
              Seen an influencer wearing something fire but they won't say where it's from? Upload the photo and our AI will identify the clothing and tell you exactly where to find it.
            </div>

            <div className="ftf-upload" onClick={()=>ftfRef.current?.click()}>
              {ftfPhoto && <img src={ftfPhoto} alt="Upload" />}
              <div className="ftf-upload-ov">
                <div className="up-plus">＋</div>
                <div className="up-hint">Change Photo</div>
              </div>
              {!ftfPhoto && (<>
                <div className="ftf-icon">🔍</div>
                <div className="ftf-hint">Upload Influencer Photo</div>
                <div style={{fontSize:"0.58rem",color:"#2e2a3a",letterSpacing:"1px"}}>Screenshot, saved photo, anything</div>
              </>)}
            </div>
            <input ref={ftfRef} type="file" accept="image/*" style={{display:"none"}} onChange={onFtfImg} />

            {ftfPhoto && !ftfResult && (
              <button className="btn-crimson" onClick={findThisFit} disabled={ftfLoading}>
                {ftfLoading ? "Analysing Outfit..." : "Find This Fit ✦"}
              </button>
            )}

            {ftfLoading && (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div className="spin-ring" style={{margin:"0 auto 16px"}} />
                <div style={{fontSize:"0.58rem",letterSpacing:"3px",color:"#3a3550",textTransform:"uppercase"}}>Analysing the outfit...</div>
              </div>
            )}

            {ftfResult && !ftfResult.error && (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {ftfResult.summary && (
                  <div style={{fontSize:"0.78rem",color:"#8a8098",fontStyle:"italic",lineHeight:1.7,padding:"0 4px"}}>
                    "{ftfResult.summary}"
                  </div>
                )}
                {ftfResult.items?.map((item,i)=>(
                  <div key={i} className="ftf-result">
                    <div className="ftf-result-title">{item.type}</div>
                    <div className="ftf-result-text">{item.description}</div>
                    <div className="fld-lbl" style={{marginBottom:8}}>Could be from:</div>
                    <div className="ftf-tags">
                      {item.brands?.map((b,j)=>(
                        <span key={j} className="ftf-tag">{b}</span>
                      ))}
                    </div>
                    {item.searchTerms?.length > 0 && (
                      <>
                        <div className="fld-lbl" style={{marginTop:12,marginBottom:8}}>Search terms:</div>
                        <div style={{fontSize:"0.7rem",color:"#5a5070",lineHeight:2}}>
                          {item.searchTerms.join(" · ")}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <button className="btn-ghost" onClick={()=>{setFtfPhoto(null);setFtfResult(null);}}>
                  Try Another Photo
                </button>
              </div>
            )}

            {ftfResult?.error && (
              <div style={{textAlign:"center",padding:"20px 0",fontSize:"0.7rem",color:"#5a5070",letterSpacing:"1px"}}>
                Something went wrong. Please try again.
              </div>
            )}
          </div>
        )}

        {/* ════ REVIEWS ════ */}
        {tab==="reviews" && (
          <div className="revs-wrap">
            <div>
              <div className="sec-eyebrow">✦ Community</div>
              <div className="sec-title">Real <em>Reviews</em></div>
            </div>

            {/* Add review form */}
            <div className="add-rev-form">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1rem",fontWeight:400,color:""}}> Leave Your Review</div>
              <div>
                <div className="fld-lbl">Your Rating</div>
                <div className="star-picker">
                  {[1,2,3,4,5].map(i=>(
                    <button key={i} className="star-pick-btn" onClick={()=>setNewRev(p=>({...p,stars:i}))}>
                      <span style={{color: i<=newRev.stars ? "#c9a84c" : "#1e1a2a", fontSize:"1.6rem"}}>★</span>
                    </button>
                  ))}
                </div>
                {newRev.stars > 0 && (
                  <div style={{fontSize:"0.58rem",letterSpacing:"2px",color:"#5a5070",marginTop:6,textTransform:"uppercase"}}>
                    {STAR_LABELS[newRev.stars]}
                  </div>
                )}
              </div>
              <div>
                <div className="fld-lbl">Your Review</div>
                <textarea className="rev-input" rows={4} placeholder="Tell others about your experience with FITTED..." value={newRev.text} onChange={e=>setNewRev(p=>({...p,text:e.target.value}))} />
              </div>
              <div className="rev-name-row">
                <input className="s-input" style={{margin:0,flex:1}} placeholder="Your name" value={newRev.name} onChange={e=>setNewRev(p=>({...p,name:e.target.value}))} />
              </div>
              {revError && <div style={{fontSize:"0.62rem",color:""+(122/255*100)+"% 21% 37%",letterSpacing:"1px",color:"#9e1e30"}}>{revError}</div>}
              <button className="btn-prim" onClick={submitReview} disabled={revSubmitting}>
                {revSubmitting ? "Submitting..." : "Submit Review ✦"}
              </button>
            </div>

            <div className="chrome-line" />

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="no-revs">
                No reviews yet<br />Be the first to share your experience
              </div>
            ) : (
              <div className="rev-cards-list">
                {reviews.map(r=>(
                  <div key={r.id} className="full-rev-card">
                    <Stars count={r.stars} />
                    <div className="rev-text" style={{marginTop:10}}>"{r.text}"</div>
                    <div style={{marginTop:10}}>
                      <span className="rev-author">{r.name}</span>
                      <span className="rev-date">{r.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ PRICING MODAL ════ */}
        {showPricing && (
          <div className="modal-bg" onClick={()=>setShowPricing(false)}>
            <div className="modal-box" onClick={e=>e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-ttl">Choose Your <em>Plan</em></div>
              <div className="modal-sub">Try free. Pay when you're obsessed.</div>
              <div className="tier-cards">
                <div className="tier-card">
                  <div className="tier-hdr"><div className="tier-nm">Free</div><div className="tier-pr">£0</div></div>
                  <div className="tier-desc">3 looks, no card needed. Just try it.</div>
                </div>
                <div className="tier-card">
                  <div className="tier-hdr"><div className="tier-nm">Pay Per Look</div><div className="tier-pr">£1.49 <small>/look</small></div></div>
                  <div className="tier-desc">For occasional shoppers. No commitment.</div>
                  <div className="pack-grid">
                    {PACKS.map(p=>(
                      <button key={p.id} className="pack-btn" onClick={()=>simulatePurchase(p.looks)}>
                        <span>{p.label}</span><span style={{color:"var(--silver)"}}>£{p.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="tier-card feat">
                  <div className="tier-hdr"><div className="tier-nm">Fitted Unlimited <span className="best-badge">Best</span></div><div className="tier-pr">£9.99 <small>/mo</small></div></div>
                  <div className="tier-desc">For the fashion obsessed.</div>
                  <ul className="tier-perks">
                    <li>Unlimited AI renders</li><li>Priority rendering speed</li>
                    <li>Save & share your looks</li><li>Find This Fit — unlimited searches</li>
                    <li>Early access to new features</li>
                  </ul>
                  <button className="btn-crimson" style={{marginTop:16}} onClick={simulateSubscribe}>Subscribe ✦</button>
                </div>
              </div>
              <button className="btn-ghost" onClick={()=>setShowPricing(false)}>Close</button>
            </div>
          </div>
        )}

        {/* ════ PAYWALL ════ */}
        {showPaywall && (
          <div className="modal-bg" onClick={()=>setShowPaywall(false)}>
            <div className="modal-box" onClick={e=>e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-ttl">Free looks <em>used up.</em> 🖤</div>
              <div className="modal-sub">Keep going — pick how you want to continue.</div>
              <div className="tier-cards">
                <div className="tier-card">
                  <div className="tier-hdr"><div className="tier-nm">Pay Per Look</div><div className="tier-pr">from £1.49</div></div>
                  <div className="pack-grid">
                    {PACKS.map(p=>(
                      <button key={p.id} className="pack-btn" onClick={()=>simulatePurchase(p.looks)}>
                        <span>{p.label}</span><span style={{color:"var(--silver)"}}>£{p.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="div-txt">or</div>
                <div className="tier-card feat">
                  <div className="tier-hdr"><div className="tier-nm">Go Unlimited</div><div className="tier-pr">£9.99 <small>/mo</small></div></div>
                  <div className="tier-desc">Unlimited renders, priority speed, save & share.</div>
                  <button className="btn-crimson" style={{marginTop:14}} onClick={simulateSubscribe}>Unlock Unlimited ✦</button>
                </div>
              </div>
              <button className="btn-ghost" onClick={()=>setShowPaywall(false)}>Not now</button>
            </div>
          </div>
        )}

        {/* ════ API KEY MODAL ════ */}
        {showApiModal && (
          <div className="modal-bg">
            <div className="modal-box">
              <div className="modal-handle" />
              <div className="modal-ttl">Connect <em>AI</em></div>
              <div className="modal-sub">
                Get your free API key from <a href="https://fashn.ai" target="_blank" rel="noreferrer">fashn.ai</a> to activate realistic AI rendering. Free trial — no card needed.
              </div>
              <input className="m-input" type="password" placeholder="Paste your Fashn.ai API key..." value={apiKey} onChange={e=>setApiKey(e.target.value)} />
              <button className="btn-prim" style={{marginBottom:10}} onClick={()=>{if(apiKey.trim()){setShowApiModal(false);generateLook();}}}>
                Activate & Render ✦
              </button>
              <button className="btn-ghost" onClick={()=>setShowApiModal(false)}>Cancel</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
