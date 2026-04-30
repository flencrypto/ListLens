/**
 * gen-store-screenshots.mjs
 *
 * Generates App Store / Google Play submission-ready screenshot frames for
 * the three required device sizes by rendering pixel-perfect SVG mockups of
 * key in-app screens via ImageMagick's librsvg renderer.
 *
 * No external browser or headless chrome required — pure SVG → PNG pipeline.
 *
 * Output: artifacts/listlens-mobile/docs/store-screenshots/
 *
 * Devices & resolutions
 *   iPhone SE (3rd gen)     750 × 1334
 *   iPhone 15 Pro Max       1290 × 2796
 *   Pixel 7                 1080 × 2400
 */

import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../docs/store-screenshots");
mkdirSync(OUT_DIR, { recursive: true });

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  navy: "#040a14",
  navy2: "#081325",
  cardSurface: "#0a1628",
  cardSurfaceSoft: "#0c1e38",
  foreground: "#fafafa",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  zinc300: "#d4d4d8",
  brandCyan: "#22d3ee",
  brandViolet: "#8b5cf6",
  brandGreen: "#4ade80",
  brandAmber: "#fb923c",
  brandBlue: "#3ea8ff",
  red400: "#f87171",
  amber300: "#fcd34d",
  brandStroke: "rgba(34,211,238,0.18)",
  cyanStroke: "#1e7a8a",
  violetStroke: "#5b3f9a",
  cyanGlow: "rgba(34,211,238,0.25)",
  redStroke: "#7a3535",
  redBg: "#1a0a0a",
};

// ─── Device configurations ───────────────────────────────────────────────────
const DEVICES = [
  {
    id: "iphone-se",
    label: "iPhone SE (3rd gen)",
    W: 750,
    H: 1334,
    statusH: 40,
    tabH: 80,
    headerH: 88,
    pad: 32,
    notch: null,
    fs: { xs: 18, sm: 22, base: 26, lg: 44, xl: 52, h1: 64 },
    r: 28,
  },
  {
    id: "iphone-15-pro-max",
    label: "iPhone 15 Pro Max",
    W: 1290,
    H: 2796,
    statusH: 100,
    tabH: 148,
    headerH: 148,
    pad: 52,
    notch: { type: "island", w: 376, h: 88, top: 22 },
    fs: { xs: 30, sm: 36, base: 44, lg: 72, xl: 84, h1: 108 },
    r: 44,
  },
  {
    id: "pixel-7",
    label: "Pixel 7",
    W: 1080,
    H: 2400,
    statusH: 64,
    tabH: 112,
    headerH: 124,
    pad: 44,
    notch: { type: "hole", r: 40, top: 24 },
    fs: { xs: 24, sm: 30, base: 36, lg: 60, xl: 70, h1: 90 },
    r: 36,
  },
];

// ─── SVG helpers ─────────────────────────────────────────────────────────────
function svgRect(x, y, w, h, r, fill, stroke = "none", sw = 0, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}"
    fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function svgText(x, y, text, fs, fw, fill, anchor = "start", opacity = 1) {
  const weight = fw >= 700 ? "bold" : fw >= 600 ? "bold" : fw >= 500 ? "bold" : "normal";
  return `<text x="${x}" y="${y}" font-family="DejaVu Sans, sans-serif"
    font-size="${fs}" font-weight="${weight}" fill="${fill}"
    text-anchor="${anchor}" opacity="${opacity}">${escXml(String(text))}</text>`;
}

function escXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svgLine(x1, y1, x2, y2, stroke, sw, opacity = 1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
    stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function svgCircle(cx, cy, r, fill, stroke = "none", sw = 0) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

// ─── Status bar ──────────────────────────────────────────────────────────────
function statusBar(d) {
  const mid = d.W / 2;
  let notchEl = "";
  if (d.notch?.type === "island") {
    const nw = d.notch.w, nh = d.notch.h;
    notchEl = svgRect(mid - nw / 2, d.notch.top, nw, nh, nh / 2, "#000000");
  } else if (d.notch?.type === "hole") {
    notchEl = svgCircle(mid, d.notch.top + d.notch.r, d.notch.r, "#000000");
  }

  const textY = d.statusH - 10;
  const timeSize = d.fs.xs;
  return `
  ${svgRect(0, 0, d.W, d.statusH, 0, C.navy)}
  ${notchEl}
  ${svgText(d.pad, textY, "9:41", timeSize, 600, C.foreground)}
  ${svgText(d.W - d.pad, textY, "▮▮▮  ▮▮▮  ▓▓▓", timeSize, 400, C.foreground, "end", 0.7)}`;
}

// ─── App header bar ──────────────────────────────────────────────────────────
function headerBar(d) {
  const y = d.statusH;
  const h = d.headerH - d.statusH;
  const textY = y + h / 2 + d.fs.base * 0.38;
  return `
  ${svgRect(0, y, d.W, h, 0, C.navy)}
  ${svgLine(0, y + h - 1, d.W, y + h - 1, C.cyanStroke, 1, 0.5)}
  ${svgText(d.W / 2, textY, "MR.FLENS · LIST-LENS", d.fs.base, 700, C.foreground, "middle")}`;
}

// ─── Bottom tab bar ───────────────────────────────────────────────────────────
function tabBar(d, activeTab) {
  const tabs = ["Home", "Lenses", "Studio", "Guard", "More"];
  const tabW = d.W / tabs.length;
  const y = d.H - d.tabH;
  const itemH = d.tabH;
  const iconSize = d.fs.sm;
  const labelSize = d.fs.xs - 4;

  let els = `
  ${svgRect(0, y, d.W, d.tabH, 0, "#050e1e", C.cyanStroke, 1, 0.9)}`;

  tabs.forEach((tab, i) => {
    const cx = tabW * i + tabW / 2;
    const active = tab.toLowerCase() === activeTab.toLowerCase();
    const color = active ? C.brandCyan : C.zinc500;
    const iconY = y + itemH * 0.3;
    const labelY = y + itemH * 0.72;

    const icons = {
      Home: "⌂", Lenses: "◎", Studio: "⊙", Guard: "⛨", More: "···"
    };

    els += svgText(cx, iconY, icons[tab] || "·", iconSize * 1.2, 400, color, "middle");
    els += svgText(cx, labelY, tab, labelSize, active ? 600 : 400, color, "middle");

    if (active) {
      els += svgLine(cx - tabW * 0.25, y + 2, cx + tabW * 0.25, y + 2, C.brandCyan, 3);
    }
  });

  return els;
}

// ─── Card helper ─────────────────────────────────────────────────────────────
function card(x, y, w, h, d, glow = false) {
  const stroke = glow ? C.cyanStroke : C.cyanStroke;
  const strokeW = glow ? 1.5 : 1;
  const fill = C.cardSurface;
  let el = svgRect(x, y, w, h, d.r, fill, stroke, strokeW, 0.9);
  if (glow) {
    el = `<filter id="glow_${x}_${y}"><feGaussianBlur stdDeviation="12" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${d.r}" ry="${d.r}" fill="${fill}" stroke="${C.brandCyan}" stroke-width="1.5" opacity="0.9" filter="url(#glow_${x}_${y})"/>`;
  }
  return el;
}

// ─── Dot badge ────────────────────────────────────────────────────────────────
function badge(x, y, label, color, bgColor, d) {
  const fs = d.fs.xs - 2;
  const ph = d.pad * 0.55;
  const pv = d.pad * 0.22;
  const bh = fs * 0.65 + pv * 2;
  const bw = label.length * fs * 0.58 + ph * 2;
  return `
  ${svgRect(x - bw / 2, y - bh * 0.75, bw, bh, bh / 2, bgColor, color, 1)}
  ${svgText(x, y, label, fs, 600, color, "middle")}`;
}

// ─── Brand Lens SVG ───────────────────────────────────────────────────────────
function brandLens(cx, cy, r) {
  return `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.brandCyan}" stroke-width="1.5" opacity="0.7"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.65}" fill="none" stroke="${C.brandCyan}" stroke-width="1" opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="${C.brandCyan}" opacity="0.12"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.16}" fill="${C.brandCyan}" opacity="0.45"/>
  <line x1="${cx - r * 0.85}" y1="${cy}" x2="${cx + r * 0.85}" y2="${cy}" stroke="${C.brandCyan}" stroke-width="0.8" opacity="0.3"/>
  <line x1="${cx}" y1="${cy - r * 0.85}" x2="${cx}" y2="${cy + r * 0.85}" stroke="${C.brandCyan}" stroke-width="0.8" opacity="0.3"/>`;
}

// ─── Gradient defs ───────────────────────────────────────────────────────────
function gradDefs(d) {
  return `
  <defs>
    <linearGradient id="studioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="guardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="historyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#52525b"/>
      <stop offset="100%" stop-color="#3f3f46"/>
    </linearGradient>
    <linearGradient id="billingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#040a14"/>
      <stop offset="100%" stop-color="#020610"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

// ─── Screen 1: Home / Dashboard ──────────────────────────────────────────────
function buildHomeScreen(d) {
  const { W, H, statusH, tabH, headerH, pad, fs, r } = d;
  const contentTop = headerH + pad;
  const contentW = W - pad * 2;
  let els = [];
  let y = contentTop;

  // Greeting
  els.push(svgText(pad, y + fs.xs, "WELCOME BACK", fs.xs - 2, 500, C.zinc400));
  y += fs.xs + 8;
  els.push(svgText(pad, y + fs.h1 * 0.75, "Dashboard", fs.h1, 700, C.foreground));

  // Free trial badge (right-aligned)
  const bw = fs.base * 4.5;
  const bh = fs.xs + pad * 0.5;
  els.push(svgRect(W - pad - bw, y + 4, bw, bh, bh / 2, "rgba(34,211,238,0.12)", C.cyanStroke, 1.5));
  els.push(svgText(W - pad - bw / 2, y + bh * 0.68, "Free trial", fs.xs - 2, 600, C.brandCyan, "middle"));

  y += fs.h1 + pad;

  // Quick action grid (2×2)
  const gridGap = pad * 0.6;
  const cellW = (contentW - gridGap) / 2;
  const cellH = cellW * 0.75;
  const iconSz = cellH * 0.28;
  const gridData = [
    { label: "New Listing", desc: "Photos → AI draft", grad: "url(#studioGrad)", icon: "📷" },
    { label: "Check Listing", desc: "URL → Risk report", grad: "url(#guardGrad)", icon: "🛡" },
    { label: "History", desc: "Past activity", grad: "url(#historyGrad)", icon: "🕐" },
    { label: "Billing", desc: "Plans & credits", grad: "url(#billingGrad)", icon: "💳" },
  ];
  [[0, 1], [2, 3]].forEach(([a, b], row) => {
    [a, b].forEach((idx, col) => {
      const gd = gridData[idx];
      const gx = pad + col * (cellW + gridGap);
      const gy = y + row * (cellH + gridGap);
      els.push(svgRect(gx, gy, cellW, cellH, r, C.cardSurfaceSoft, C.cyanStroke, 1, 0.9));
      els.push(svgRect(gx + cellW * 0.06, gy + cellH * 0.1, iconSz, iconSz, r * 0.7, gd.grad));
      els.push(svgText(gx + cellW * 0.06 + iconSz / 2, gy + cellH * 0.1 + iconSz * 0.72, gd.icon, iconSz * 0.6, 400, C.foreground, "middle"));
      els.push(svgText(gx + pad * 0.5, gy + cellH * 0.62, gd.label, fs.sm, 600, C.foreground));
      els.push(svgText(gx + pad * 0.5, gy + cellH * 0.82, gd.desc, fs.xs - 2, 400, C.zinc500));
    });
  });
  y += 2 * (cellH + gridGap) - gridGap + pad;

  // Studio card
  const cardH1 = cellH * 0.9;
  els.push(card(pad, y, contentW, cardH1, d));
  els.push(svgText(pad + pad * 0.6, y + pad * 0.8, "Studio", fs.base, 600, C.foreground));
  els.push(svgText(W - pad - pad * 0.5, y + pad * 0.8, "View all", fs.xs - 2, 400, C.zinc400, "end"));
  els.push(svgLine(pad + pad * 0.5, y + pad * 1.2, W - pad - pad * 0.5, y + pad * 1.2, C.zinc800, 1));
  els.push(svgText(W / 2, y + cardH1 * 0.64, "No listings yet", fs.xs, 400, C.zinc500, "middle"));
  const btn1W = fs.base * 7;
  const btn1H = fs.base + pad * 0.7;
  els.push(svgRect(W / 2 - btn1W / 2, y + cardH1 - btn1H - pad * 0.4, btn1W, btn1H, r * 0.6, C.brandCyan));
  els.push(svgText(W / 2, y + cardH1 - btn1H / 2 - pad * 0.4 + btn1H * 0.38, "Create first listing", fs.xs - 2, 700, C.navy, "middle"));
  y += cardH1 + pad * 0.8;

  // Guard card
  const cardH2 = cardH1;
  els.push(card(pad, y, contentW, cardH2, d));
  els.push(svgText(pad + pad * 0.6, y + pad * 0.8, "Guard", fs.base, 600, C.foreground));
  els.push(svgText(W - pad - pad * 0.5, y + pad * 0.8, "View all", fs.xs - 2, 400, C.zinc400, "end"));
  els.push(svgLine(pad + pad * 0.5, y + pad * 1.2, W - pad - pad * 0.5, y + pad * 1.2, C.zinc800, 1));
  els.push(svgText(W / 2, y + cardH2 * 0.64, "No checks yet", fs.xs, 400, C.zinc500, "middle"));
  const btn2W = fs.base * 6.5;
  els.push(svgRect(W / 2 - btn2W / 2, y + cardH2 - btn1H - pad * 0.4, btn2W, btn1H, r * 0.6, C.brandViolet));
  els.push(svgText(W / 2, y + cardH2 - btn1H / 2 - pad * 0.4 + btn1H * 0.38, "Check a listing", fs.xs - 2, 700, C.foreground, "middle"));
  y += cardH2 + pad * 0.8;

  // Upgrade card (glow)
  const upgH = cardH1 * 0.6;
  els.push(card(pad, y, contentW, upgH, d, true));
  els.push(svgText(pad + pad * 0.6, y + upgH * 0.38, "3 Studio credits remaining", fs.sm, 600, C.foreground));
  els.push(svgText(pad + pad * 0.6, y + upgH * 0.7, "Upgrade to Studio Starter · from £9.99/month", fs.xs - 4, 400, C.zinc400));
  const upgBtnW = fs.base * 4;
  els.push(svgRect(W - pad - upgBtnW - pad * 0.5, y + (upgH - btn1H) / 2, upgBtnW, btn1H, r * 0.6, C.brandCyan));
  els.push(svgText(W - pad - upgBtnW / 2 - pad * 0.5, y + upgH / 2 + btn1H * 0.18, "Upgrade", fs.xs - 2, 700, C.navy, "middle"));
  y += upgH + pad * 1.2;

  // Brand panel
  const lensR = Math.min(W * 0.09, 80);
  els.push(brandLens(W / 2, y + lensR, lensR));
  y += lensR * 2 + pad * 0.8;
  els.push(svgText(W / 2, y, "List smarter. Buy safer.", fs.lg, 700, C.foreground, "middle"));
  y += fs.lg + pad * 0.5;
  els.push(svgText(W / 2, y, "AI-powered listings for eBay & Vinted", fs.xs, 400, C.zinc400, "middle"));

  return buildSVG(d, "home", els.join("\n"));
}

// ─── Screen 2: Studio ────────────────────────────────────────────────────────
function buildStudioScreen(d) {
  const { W, H, statusH, tabH, headerH, pad, fs, r } = d;
  const contentTop = headerH + pad;
  const contentW = W - pad * 2;
  let els = [];
  let y = contentTop;

  // Header with icon
  const iconSz = fs.xl * 0.9;
  els.push(svgRect(pad, y, iconSz, iconSz, r, "url(#studioGrad)"));
  els.push(svgText(pad + iconSz / 2, y + iconSz * 0.65, "📷", iconSz * 0.55, 400, C.foreground, "middle"));
  els.push(svgText(pad + iconSz + pad * 0.8, y + iconSz * 0.55, "Studio", fs.xl, 700, C.foreground));
  els.push(svgText(pad + iconSz + pad * 0.8, y + iconSz * 0.9, "AI-powered listing creator", fs.sm, 400, C.zinc400));
  y += iconSz + pad;

  // "What you get" feature card
  const features = [
    "Photo-to-listing AI draft in seconds",
    "Editable title, description & highlights",
    "Smart pricing: Quick / Recommended / High",
    "1-tap export to eBay and Vinted",
    "Built-in evidence accuracy check",
  ];
  const featLineH = fs.base * 1.65;
  const featCardH = pad * 1.5 + features.length * featLineH + pad;
  els.push(card(pad, y, contentW, featCardH, d, true));
  els.push(svgText(pad + pad * 0.7, y + pad, "What you get", fs.base, 600, C.foreground));
  features.forEach((f, i) => {
    const fy = y + pad * 1.8 + i * featLineH;
    els.push(svgCircle(pad + pad * 0.7 + pad * 0.15, fy - fs.sm * 0.25, fs.sm * 0.3, C.brandCyan));
    els.push(svgText(pad + pad * 0.7 + pad * 0.6, fy, f, fs.sm, 400, C.zinc300));
  });
  y += featCardH + pad;

  // Primary CTA button
  const btnH = fs.xl * 0.7;
  els.push(svgRect(pad, y, contentW, btnH, r, C.brandCyan));
  els.push(svgText(W / 2, y + btnH * 0.62, "Start a new listing", fs.lg * 0.75, 700, C.navy, "middle"));
  y += btnH + pad;

  // Choose a Lens grid
  const lensLabelH = fs.base + pad * 0.6;
  els.push(svgText(pad, y + lensLabelH * 0.75, "Choose a Lens", fs.base, 600, C.foreground));
  y += lensLabelH + pad * 0.5;

  const lenses = [
    { icon: "👕", name: "Fashion & Clothing", cat: "Apparel", active: true },
    { icon: "📱", name: "Electronics", cat: "Tech", active: false },
    { icon: "🪑", name: "Home & Furniture", cat: "Home", active: false },
    { icon: "🎮", name: "Toys & Collectibles", cat: "Hobbies", active: false },
  ];
  const gridGap = pad * 0.6;
  const cellW = (contentW - gridGap) / 2;
  const cellH = cellW * 0.55;
  [[0, 1], [2, 3]].forEach(([a, b], row) => {
    [a, b].forEach((idx, col) => {
      const l = lenses[idx];
      const gx = pad + col * (cellW + gridGap);
      const gy = y + row * (cellH + gridGap);
      const stroke = l.active ? C.brandCyan : C.cyanStroke;
      const sw = l.active ? 2 : 1;
      els.push(svgRect(gx, gy, cellW, cellH, r * 0.7, C.navy2, stroke, sw));
      els.push(svgText(gx + pad * 0.6, gy + cellH * 0.52, l.icon + " " + l.name, fs.sm, l.active ? 700 : 400, l.active ? C.foreground : C.zinc300));
      els.push(svgText(gx + pad * 0.6, gy + cellH * 0.8, l.cat, fs.xs - 2, 400, C.zinc500));
    });
  });
  y += 2 * (cellH + gridGap) - gridGap + pad;

  // Marketplace chips
  const marketLabel = "Marketplace";
  els.push(svgText(pad, y + fs.base * 0.8, marketLabel, fs.base, 600, C.foreground));
  y += fs.base + pad * 0.5;
  const chips = ["eBay + Vinted", "eBay only", "Vinted only"];
  const chipGap = pad * 0.5;
  let cx2 = pad;
  chips.forEach((chip, i) => {
    const cw = chip.length * fs.xs * 0.55 + pad * 1.2;
    const ch = fs.sm + pad * 0.5;
    const isActive = i === 0;
    els.push(svgRect(cx2, y, cw, ch, ch / 2, isActive ? "rgba(34,211,238,0.12)" : "transparent", isActive ? C.brandCyan : C.cyanStroke, isActive ? 1.5 : 1));
    els.push(svgText(cx2 + cw / 2, y + ch * 0.68, chip, fs.xs - 2, isActive ? 600 : 400, isActive ? C.brandCyan : C.zinc400, "middle"));
    cx2 += cw + chipGap;
  });

  return buildSVG(d, "studio", els.join("\n"));
}

// ─── Screen 3: Guard – Risk Report ───────────────────────────────────────────
function buildGuardReportScreen(d) {
  const { W, H, statusH, tabH, headerH, pad, fs, r } = d;
  const contentTop = headerH + pad;
  const contentW = W - pad * 2;
  let els = [];
  let y = contentTop;

  // Title row
  els.push(svgText(pad, y + fs.xl * 0.75, "Risk Report", fs.xl, 700, C.foreground));
  // HIGH RISK badge right-aligned
  const brisk_w = fs.base * 5.5, brisk_h = fs.sm + pad * 0.4;
  els.push(svgRect(W - pad - brisk_w, y + 4, brisk_w, brisk_h, brisk_h / 2, "rgba(248,113,113,0.12)", C.redStroke, 1.5));
  els.push(svgText(W - pad - brisk_w / 2, y + brisk_h * 0.72, "HIGH RISK", fs.xs - 4, 700, C.red400, "middle"));

  y += fs.xl + pad * 0.5;
  els.push(svgText(pad, y, "Fashion Lens  ·  ebay.co.uk/item/123", fs.xs, 400, C.zinc400));
  y += fs.sm + pad * 0.7;

  // Score card
  const scoreCardH = contentW * 0.4;
  els.push(svgRect(pad, y, contentW, scoreCardH, r, "rgba(248,113,113,0.06)", C.redStroke, 1.5));
  const dotR = scoreCardH * 0.22;
  const dotCX = pad + pad * 1.5 + dotR;
  const dotCY = y + scoreCardH / 2;
  els.push(svgCircle(dotCX, dotCY, dotR + 4, "rgba(248,113,113,0.12)"));
  els.push(svgCircle(dotCX, dotCY, dotR, "transparent", C.red400, 2.5));
  els.push(svgText(dotCX, dotCY + fs.lg * 0.4, "72", fs.lg, 800, C.red400, "middle"));
  const scoreX = dotCX + dotR + pad;
  els.push(svgText(scoreX, y + scoreCardH * 0.35, "High Risk", fs.lg * 0.7, 700, C.foreground));
  els.push(svgText(scoreX, y + scoreCardH * 0.52, "Proceed with caution", fs.sm, 600, C.red400));
  els.push(svgText(scoreX, y + scoreCardH * 0.7, "Several red flags detected.", fs.xs, 400, C.zinc400));
  els.push(svgText(scoreX, y + scoreCardH * 0.85, "Verify with seller before purchasing.", fs.xs, 400, C.zinc400));
  y += scoreCardH + pad;

  // Red flags card
  const flags = [
    { sev: "HIGH", label: "Price significantly below market value", color: C.red400 },
    { sev: "HIGH", label: "No returns policy mentioned in listing", color: C.red400 },
    { sev: "MED", label: "Vague item condition description", color: C.brandAmber },
    { sev: "MED", label: "Limited seller feedback history", color: C.brandAmber },
    { sev: "LOW", label: "No original packaging mentioned", color: C.brandGreen },
  ];
  const flagLineH = fs.base * 1.8;
  const flagCardH = pad * 1.5 + flags.length * flagLineH + pad * 0.5;
  els.push(card(pad, y, contentW, flagCardH, d));
  els.push(svgText(pad + pad * 0.7, y + pad, "Red Flags", fs.base, 600, C.foreground));
  flags.forEach((f, i) => {
    const fy = y + pad * 1.8 + i * flagLineH;
    const dotSz = fs.xs * 0.4;
    // severity chip
    const chipW = fs.xs * 2.2;
    const chipH = fs.xs * 1.1;
    els.push(svgRect(pad + pad * 0.7, fy - chipH * 0.8, chipW, chipH, chipH / 2, "transparent", f.color, 1));
    els.push(svgText(pad + pad * 0.7 + chipW / 2, fy - chipH * 0.8 + chipH * 0.72, f.sev, fs.xs * 0.55, 700, f.color, "middle"));
    els.push(svgText(pad + pad * 0.7 + chipW + pad * 0.4, fy, f.label, fs.sm, 400, C.zinc300));
  });
  y += flagCardH + pad;

  // Suggested questions card
  const questions = [
    "Can you provide more photos from different angles?",
    "What is the reason for selling at this price?",
    "Do you offer any buyer protection or returns?",
  ];
  const qLineH = fs.base * 1.8;
  const qCardH = pad * 1.5 + questions.length * qLineH + pad * 0.5;
  els.push(card(pad, y, contentW, qCardH, d));
  els.push(svgText(pad + pad * 0.7, y + pad, "Ask the seller", fs.base, 600, C.foreground));
  questions.forEach((q, i) => {
    const qy = y + pad * 1.8 + i * qLineH;
    const numSz = fs.xs * 0.85;
    els.push(svgCircle(pad + pad * 0.7 + numSz, qy - numSz * 0.6, numSz, "rgba(34,211,238,0.12)", C.cyanStroke, 1));
    els.push(svgText(pad + pad * 0.7 + numSz, qy - numSz * 0.2, String(i + 1), numSz * 0.85, 700, C.brandCyan, "middle"));
    els.push(svgText(pad + pad * 0.7 + numSz * 2.5, qy, q, fs.sm, 400, C.zinc300));
  });
  y += qCardH + pad;

  // Action buttons
  const btnH2 = fs.xl * 0.65;
  const btnW2 = (contentW - pad * 0.6) / 2;
  els.push(svgRect(pad, y, btnW2, btnH2, r, "transparent", C.brandViolet, 2));
  els.push(svgText(pad + btnW2 / 2, y + btnH2 * 0.62, "Save report", fs.sm, 600, C.brandViolet, "middle"));
  els.push(svgRect(pad + btnW2 + pad * 0.6, y, btnW2, btnH2, r, C.brandViolet));
  els.push(svgText(pad + btnW2 + pad * 0.6 + btnW2 / 2, y + btnH2 * 0.62, "New check", fs.sm, 600, C.foreground, "middle"));

  return buildSVG(d, "guard", els.join("\n"));
}

// ─── Assemble final SVG ──────────────────────────────────────────────────────
function buildSVG(d, activeTab, contentEls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
  width="${d.W}" height="${d.H}" viewBox="0 0 ${d.W} ${d.H}">
  ${gradDefs(d)}
  <!-- Background -->
  <rect width="${d.W}" height="${d.H}" fill="${C.navy}"/>
  <!-- Status bar -->
  ${statusBar(d)}
  <!-- Header -->
  ${headerBar(d)}
  <!-- Screen content -->
  <clipPath id="contentClip">
    <rect x="0" y="${d.headerH}" width="${d.W}" height="${d.H - d.headerH - d.tabH}"/>
  </clipPath>
  <g clip-path="url(#contentClip)">
    ${contentEls}
  </g>
  <!-- Tab bar -->
  ${tabBar(d, activeTab)}
</svg>`;
}

// ─── Render SVG → PNG via ImageMagick ────────────────────────────────────────
function renderSVG(svgPath, pngPath, W, H) {
  execSync(
    `magick -background "${C.navy}" -density 96 "${svgPath}" -resize ${W}x${H}! "${pngPath}"`,
    { stdio: "pipe" }
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
const SCREENS = [
  { id: "home", label: "Home – Dashboard", build: buildHomeScreen },
  { id: "studio", label: "Studio", build: buildStudioScreen },
  { id: "guard-report", label: "Guard – Risk Report", build: buildGuardReportScreen },
];

const generated = [];

for (const dev of DEVICES) {
  for (const screen of SCREENS) {
    const svg = screen.build(dev);
    const slug = `${screen.id}-${dev.id}-${dev.W}x${dev.H}`;
    const svgPath = join(OUT_DIR, slug + ".svg");
    const pngPath = join(OUT_DIR, slug + ".png");

    writeFileSync(svgPath, svg);
    try {
      renderSVG(svgPath, pngPath, dev.W, dev.H);
      process.stdout.write(`  ✓ ${slug}.png (${dev.W}×${dev.H})\n`);
      generated.push({
        screen: screen.label,
        device: dev.label,
        file: slug + ".png",
        resolution: `${dev.W}×${dev.H}`,
      });
    } catch (err) {
      process.stderr.write(`  ✗ ${slug}: ${err.message}\n`);
    }
  }
}

// Manifest
const manifest = {
  generated: new Date().toISOString(),
  description: "App Store / Google Play submission-ready screenshot frames — Task #22",
  methodology: "SVG mockups rendered via ImageMagick librsvg. Dimensions match Apple App Store and Google Play requirements.",
  devices: DEVICES.map((d) => ({
    id: d.id,
    label: d.label,
    resolution: `${d.W}×${d.H}`,
    appleRequired: d.id !== "pixel-7",
    googleRequired: d.id === "pixel-7",
  })),
  screens: SCREENS.map((s) => ({ id: s.id, label: s.label })),
  files: generated,
};
writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

process.stdout.write(`\n✓ ${generated.length} / ${DEVICES.length * SCREENS.length} screenshots rendered\n`);
process.stdout.write(`✓ manifest.json written\n`);
process.stdout.write(`→ ${OUT_DIR}\n`);
