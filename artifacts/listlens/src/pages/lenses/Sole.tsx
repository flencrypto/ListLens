import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  SOLE-LENS™ UI Prototype
  Clean rebuilt version after syntax corruption.
  - No lucide-react dependency
  - Inline SVG icon system
  - Demo sneaker, comps, marketplace, dashboard and activity data
  - Lightweight console.assert tests
*/

const fontSystem = {
  app: "font-sans antialiased [font-family:'Inter',ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]",
  display: "[font-family:'Space_Grotesk','Inter',ui-sans-serif,system-ui,sans-serif]",
  mono: "[font-family:'JetBrains_Mono','SFMono-Regular',Consolas,monospace]",
};

const demoSneakers = [
  {
    id: "scan-001",
    name: "Nike Dunk Low Retro",
    colourway: "Black / White ‘Panda’",
    size: "UK 9",
    sku: "DD1391-100",
    confidence: 98,
    authenticity: "Low risk",
    condition: "Used · Excellent",
    priceRange: "£85–£115",
    quickSell: "£80",
    maxValue: "£119",
    platform: "eBay + Vinted ready",
    listingScore: 92,
    photoEvidence: "3 strong, 1 needed",
    demand: "High",
    sellThrough: "72%",
    avgSellTime: "3.2d",
    margin: "£34 est.",
  },
  {
    id: "scan-002",
    name: "Adidas Handball Spezial",
    colourway: "Navy / Gum",
    size: "UK 8.5",
    sku: "BD7633",
    confidence: 94,
    authenticity: "Low risk",
    condition: "Used · Good",
    priceRange: "£48–£72",
    quickSell: "£45",
    maxValue: "£76",
    platform: "eBay best fit",
    listingScore: 86,
    photoEvidence: "4 strong",
    demand: "Rising",
    sellThrough: "61%",
    avgSellTime: "5.1d",
    margin: "£22 est.",
  },
  {
    id: "scan-003",
    name: "New Balance 2002R",
    colourway: "Protection Pack Rain Cloud",
    size: "UK 10",
    sku: "M2002RDA",
    confidence: 91,
    authenticity: "Medium risk",
    condition: "Used · Very Good",
    priceRange: "£95–£145",
    quickSell: "£90",
    maxValue: "£154",
    platform: "eBay + StockX ref",
    listingScore: 89,
    photoEvidence: "2 strong, 2 needed",
    demand: "Collector",
    sellThrough: "54%",
    avgSellTime: "6.8d",
    margin: "£46 est.",
  },
];

const fallbackSneaker = demoSneakers[0];
const sneaker = fallbackSneaker;

type DemoSneaker = typeof fallbackSneaker;
type LiveAnalysis = Record<string, unknown> | null;
type DisplaySneaker = DemoSneaker & {
  brand: string;
  source: "Demo" | "KicksCrew";
  imageUrl: string | null;
  retailPrice: string;
  liveProductUrl: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatMoney(currency: string | null, price: number | null): string | null {
  if (price === null) return null;
  const symbol = currency === "GBP" || currency === "£" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency ? `${currency} ` : "£";
  return `${symbol}${Math.round(price)}`;
}

function buildDisplaySneaker(analysis: LiveAnalysis): DisplaySneaker {
  const analysisRecord = asRecord(analysis);
  const kickscrewProduct = asRecord(analysisRecord?.["kickscrew_product"]);
  const marketplaceCandidates = Array.isArray(analysisRecord?.["marketplace_candidates"])
    ? (analysisRecord?.["marketplace_candidates"] as unknown[])
    : [];
  const kickscrewCandidate = marketplaceCandidates.map(asRecord).find((candidate) => candidate?.["source"] === "KicksCrew") ?? null;
  const product = kickscrewProduct ?? kickscrewCandidate;

  if (!product) {
    return {
      ...fallbackSneaker,
      brand: "Nike",
      source: "Demo",
      imageUrl: null,
      retailPrice: fallbackSneaker.maxValue,
      liveProductUrl: null,
    };
  }

  const name = asText(product["name"]) ?? asText(product["title"]) ?? fallbackSneaker.name;
  const brand = asText(product["brand"]) ?? name.split(" ")[0] ?? "Unknown";
  const colourway = asText(product["colourway"]) ?? asText(product["colorway"]) ?? fallbackSneaker.colourway;
  const sku = asText(product["style_code"]) ?? asText(product["sku"]) ?? fallbackSneaker.sku;
  const imageUrl = asText(product["image_url"]);
  const retailPriceNumber = asNumber(product["retail_price"]) ?? asNumber(product["price"]);
  const currency = asText(product["currency"]) ?? "GBP";
  const retailPrice = formatMoney(currency, retailPriceNumber) ?? fallbackSneaker.maxValue;

  return {
    ...fallbackSneaker,
    name,
    brand,
    colourway,
    sku,
    source: "KicksCrew",
    platform: "KicksCrew live data",
    maxValue: retailPrice,
    priceRange: retailPriceNumber ? `${retailPrice} retail` : fallbackSneaker.priceRange,
    quickSell: retailPriceNumber ? formatMoney(currency, Math.round(retailPriceNumber * 0.82)) ?? fallbackSneaker.quickSell : fallbackSneaker.quickSell,
    imageUrl,
    retailPrice,
    liveProductUrl: asText(product["product_url"]),
  };
}

const tabs = [
  { id: "scan", label: "Scan", icon: "camera" },
  { id: "result", label: "Result", icon: "sparkles" },
  { id: "listing", label: "Listing", icon: "bag" },
  { id: "dashboard", label: "Dashboard", icon: "chart" },
];

const stats = [
  { label: "Active listings", value: "24", icon: "box", change: "+6 this week", tone: "cyan" },
  { label: "Projected sales", value: "£1,420", icon: "pound", change: "+18%", tone: "green" },
  { label: "Avg sell time", value: "3.2d", icon: "clock", change: "fast", tone: "blue" },
  { label: "Avg margin", value: "£34", icon: "trending", change: "+£6", tone: "green" },
];

const comps = [
  { title: "Nike Dunk Low Panda UK 9", platform: "eBay Sold", price: "£102", state: "Used", match: 94, date: "Yesterday" },
  { title: "Nike Dunk Low Retro Black White", platform: "Vinted", price: "£88", state: "Good", match: 88, date: "2 days" },
  { title: "Dunk Low Panda 2022 UK9", platform: "StockX Ref", price: "£116", state: "Clean", match: 91, date: "4 days" },
  { title: "Nike Dunk Panda UK 9 Boxed", platform: "eBay Sold", price: "£124", state: "Excellent", match: 86, date: "6 days" },
];

const marketplaceDrafts = [
  { platform: "eBay", status: "Ready", price: "£109 BIN", fee: "12.8% fee", reach: "High", selected: true },
  { platform: "Vinted", status: "Ready", price: "£89", fee: "Buyer-paid", reach: "Fast", selected: false },
  { platform: "Depop", status: "Needs crop", price: "£99", fee: "10% fee", reach: "Style-led", selected: false },
];

const recentScans = [
  { id: "RS-1048", item: "Nike Dunk Low Panda", value: "£109", status: "Listed", confidence: 98 },
  { id: "RS-1047", item: "Adidas Spezial Navy Gum", value: "£68", status: "Draft", confidence: 94 },
  { id: "RS-1046", item: "NB 2002R Rain Cloud", value: "£139", status: "Review", confidence: 91 },
];

const activityFeed = [
  { event: "eBay draft generated", detail: "Nike Dunk Low Retro · £109 BIN", time: "2m ago", tone: "cyan" },
  { event: "Price alert", detail: "Adidas Spezial sold comps up 11%", time: "18m ago", tone: "green" },
  { event: "Photo warning", detail: "NB 2002R needs label close-up", time: "1h ago", tone: "warn" },
];

const listingAnalytics = [
  { label: "Views", value: "1,842", change: "+24%" },
  { label: "Watchers", value: "117", change: "+31%" },
  { label: "Drafts", value: "8", change: "+3" },
];

const captureSteps = ["Toe", "Side", "Sole", "Label"];

const qualityChecks = [
  { label: "Logo shape", status: "Matched", tone: "success" },
  { label: "Stitch pattern", status: "Clean", tone: "success" },
  { label: "Size label", status: "Needed", tone: "warn" },
];

function runPrototypeTests() {
  const validTabIds = tabs.map((tab) => tab.id);
  console.assert(validTabIds.includes("scan"), "Expected scan tab to exist");
  console.assert(validTabIds.includes("result"), "Expected result tab to exist");
  console.assert(validTabIds.includes("listing"), "Expected listing tab to exist");
  console.assert(validTabIds.includes("dashboard"), "Expected dashboard tab to exist");
  console.assert(stats.length >= 4, "Expected at least four dashboard stat cards");
  console.assert(comps.length >= 4, "Expected at least four pricing comps");
  console.assert(demoSneakers.length >= 3, "Expected at least three demo sneaker records");
  console.assert(marketplaceDrafts.some((draft) => draft.selected), "Expected one selected marketplace draft");
  console.assert(recentScans.length >= 3, "Expected at least three recent scans");
  console.assert(activityFeed.length >= 3, "Expected at least three activity feed items");
  console.assert(captureSteps.length === 4, "Expected four guided capture steps");
  console.assert(qualityChecks.every((check) => check.label && check.status), "Quality checks need label and status");
  console.assert(sneaker.confidence >= 0 && sneaker.confidence <= 100, "Confidence must be a percentage");
}

runPrototypeTests();

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type IconName =
  | "camera"
  | "sparkles"
  | "shield"
  | "trending"
  | "upload"
  | "zap"
  | "pound"
  | "bag"
  | "chart"
  | "scan"
  | "check"
  | "alert"
  | "wand"
  | "layers"
  | "search"
  | "chevron"
  | "plus"
  | "bell"
  | "menu"
  | "star"
  | "clock"
  | "box"
  | "sliders";

function Icon({ name, size = 18, className = "" }: { name: IconName | string; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  const icons: Record<string, React.ReactNode> = {
    camera: <svg {...common}><path d="M14.5 4l1.4 2H20a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4.1l1.4-2h5z" /><circle cx="12" cy="13" r="4" /></svg>,
    sparkles: <svg {...common}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" /></svg>,
    shield: <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-5" /></svg>,
    trending: <svg {...common}><path d="M3 17l6-6 4 4 7-7" /><path d="M14 8h6v6" /></svg>,
    upload: <svg {...common}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>,
    zap: <svg {...common}><path d="M13 2L3 14h8l-1 8 11-13h-8l1-7z" /></svg>,
    pound: <svg {...common}><path d="M6 21h12" /><path d="M8 12h7" /><path d="M9 21c2-3 2-6 1-9-.7-2.2.6-5 4-5 1.6 0 2.8.6 4 1.7" /></svg>,
    bag: <svg {...common}><path d="M6 7h12l1 14H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></svg>,
    chart: <svg {...common}><path d="M4 19V5" /><path d="M4 19h16" /><rect x="7" y="11" width="3" height="5" /><rect x="12" y="7" width="3" height="9" /><rect x="17" y="9" width="3" height="7" /></svg>,
    scan: <svg {...common}><path d="M4 7V5a1 1 0 011-1h2" /><path d="M17 4h2a1 1 0 011 1v2" /><path d="M20 17v2a1 1 0 01-1 1h-2" /><path d="M7 20H5a1 1 0 01-1-1v-2" /><path d="M7 12h10" /></svg>,
    check: <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></svg>,
    alert: <svg {...common}><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
    wand: <svg {...common}><path d="M15 4l5 5" /><path d="M14 5l5 5-9 9-5-5 9-9z" /><path d="M5 4v3" /><path d="M3.5 5.5h3" /></svg>,
    layers: <svg {...common}><path d="M12 2l9 5-9 5-9-5 9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 17l9 5 9-5" /></svg>,
    search: <svg {...common}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>,
    chevron: <svg {...common}><path d="M9 18l6-6-6-6" /></svg>,
    plus: <svg {...common}><path d="M12 5v14" /><path d="M5 12h14" /></svg>,
    bell: <svg {...common}><path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>,
    menu: <svg {...common}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>,
    star: <svg {...common}><path d="M12 2l3 6 6.5 1-4.7 4.6 1.1 6.4L12 17l-5.9 3 1.1-6.4L2.5 9 9 8l3-6z" /></svg>,
    clock: <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    box: <svg {...common}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>,
    sliders: <svg {...common}><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M2 14h4" /><path d="M10 8h4" /><path d="M18 16h4" /></svg>,
  };

  return <>{icons[name] || icons.sparkles}</>;
}

function GlowBlob({ className = "" }: { className?: string }) {
  return <div className={cx("pointer-events-none absolute rounded-full blur-3xl", className)} />;
}

function GlassPanel({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cx("relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/20 backdrop-blur-xl", className)}>
      {glow && <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl" />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Badge({ children, tone = "cyan", icon, className = "" }: { children: React.ReactNode; tone?: string; icon?: IconName; className?: string }) {
  const tones: Record<string, string> = {
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    blue: "border-blue-300/20 bg-blue-300/10 text-blue-200",
    neutral: "border-white/10 bg-white/5 text-white/65",
    warn: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  };

  return (
    <span className={cx(fontSystem.mono, "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]", tones[tone], className)}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

function Button({
  children,
  onClick,
  variant = "solid",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
}) {
  const variants = {
    solid: "bg-cyan-300 text-black shadow-lg shadow-cyan-300/20 hover:bg-cyan-200",
    outline: "border border-white/15 bg-white/5 text-white hover:border-cyan-300/25 hover:bg-white/10",
    ghost: "bg-transparent text-white/75 hover:bg-white/5 hover:text-white",
  };

  return (
    <button type="button" onClick={onClick} className={cx(fontSystem.display, "inline-flex items-center justify-center rounded-2xl px-4 font-black tracking-[-0.03em] transition active:scale-[0.98]", variants[variant], className)}>
      {children}
    </button>
  );
}

function IconButton({ icon, label }: { icon: IconName; label: string }) {
  return (
    <button type="button" aria-label={label} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/75 shadow-lg shadow-black/10 backdrop-blur transition hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-200">
      <Icon name={icon} size={18} />
    </button>
  );
}

function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <div className={cx(fontSystem.mono, "mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40")}>{eyebrow}</div>}
        <h3 className={cx(fontSystem.display, "text-base font-black tracking-[-0.04em] text-white")}>{title}</h3>
      </div>
      {action}
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[390px] rounded-[2.4rem] border border-white/15 bg-black/70 p-3 shadow-2xl shadow-cyan-500/10">
      <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
      <div className="absolute inset-0 rounded-[2.4rem] bg-gradient-to-br from-white/10 via-transparent to-cyan-300/10" />
      <div className="relative min-h-[740px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#05070c]">
        {children}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="relative z-10 flex items-center justify-between p-5 pt-8">
      <div>
        <div className={cx(fontSystem.mono, "text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80")}>Mr.FLEN</div>
        <div className={cx(fontSystem.display, "mt-1 text-2xl font-black tracking-[-0.04em] text-white")}>SOLE-LENS™</div>
      </div>
      <div className="flex gap-2">
        <IconButton icon="bell" label="Notifications" />
        <IconButton icon="menu" label="Menu" />
      </div>
    </div>
  );
}

function BottomNav({ active, setActive }: { active: string; setActive: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/70 px-3 py-3 backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => setActive(tab.id)} className={cx(fontSystem.display, "relative overflow-hidden rounded-2xl px-2 py-3 text-xs font-bold tracking-[-0.02em] transition", selected ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/30" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white")}>
              {selected && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-black/40" />}
              <Icon name={tab.icon} className="mx-auto mb-1" size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroNotice() {
  return (
    <GlassPanel className="mb-4 p-4" glow>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-black shadow-lg shadow-cyan-300/25">
          <Icon name="zap" size={21} />
        </div>
        <div className="min-w-0">
          <div className={cx(fontSystem.display, "font-bold tracking-[-0.03em]")}>Scan trainers. Price them. List them.</div>
          <div className="text-sm leading-5 text-white/60">Camera-first resale intelligence.</div>
        </div>
      </div>
    </GlassPanel>
  );
}

function DemoScanStrip() {
  return (
    <div className="mb-4 grid grid-cols-3 gap-2">
      {demoSneakers.map((item) => (
        <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className={cx(fontSystem.display, "truncate text-xs font-black tracking-[-0.03em] text-white/85")}>{item.name.replace("Nike ", "")}</div>
          <div className="mt-1 truncate text-[10px] text-white/40">{item.size} · {item.condition.replace("Used · ", "")}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className={cx(fontSystem.display, "text-sm font-black text-cyan-200")}>{item.maxValue}</span>
            <span className="text-[10px] text-white/35">{item.confidence}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CaptureProgress({ active = 0 }: { active?: number }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {captureSteps.map((step, index) => {
        const done = index <= active;
        return (
          <div key={step} className="min-w-0">
            <div className={cx("mb-1 h-1.5 rounded-full", done ? "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.65)]" : "bg-white/15")} />
            <div className={cx(fontSystem.mono, "truncate text-[9px] uppercase tracking-[0.12em]", done ? "text-cyan-100" : "text-white/35")}>{step}</div>
          </div>
        );
      })}
    </div>
  );
}

function SneakerSilhouette() {
  return (
    <div className="relative h-28 w-56 rounded-[55%_45%_45%_55%] bg-white/10 shadow-2xl shadow-cyan-400/10">
      <div className="absolute -left-2 bottom-2 h-12 w-16 rounded-[60%_45%_45%_55%] bg-white/10" />
      <div className="absolute bottom-3 left-8 right-5 h-9 rounded-full bg-white/15" />
      <div className="absolute left-10 top-6 h-7 w-28 rounded-full bg-cyan-200/20" />
      <div className="absolute right-8 top-7 h-5 w-14 rounded-full bg-white/10" />
      <div className="absolute bottom-0 left-12 right-6 h-4 rounded-full bg-cyan-300/50" />
      <div className="absolute left-24 top-12 flex gap-1.5">
        {[0, 1, 2, 3].map((lace) => <span key={lace} className="h-1.5 w-6 rotate-[-18deg] rounded-full bg-white/25" />)}
      </div>
    </div>
  );
}

function ScanViewport() {
  return (
    <div className="relative h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 35%, rgba(34,211,238,.42), transparent 28%), linear-gradient(135deg, rgba(255,255,255,.09) 0 1px, transparent 1px)", backgroundSize: "100% 100%, 24px 24px" }} />
      <div className="absolute inset-x-8 top-20 h-64 rounded-[2rem] border-2 border-dashed border-cyan-300/50" />
      <motion.div animate={{ y: [0, 260, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} className="absolute left-8 right-8 top-20 h-[2px] bg-cyan-300 shadow-[0_0_22px_rgba(103,232,249,.9)]" />
      <div className="absolute inset-0 grid place-items-center"><SneakerSilhouette /></div>
      <div className="absolute left-5 top-5 flex gap-2">
        <Badge tone="green" icon="check">Lens ready</Badge>
        <Badge tone="neutral">Auto crop</Badge>
      </div>
      <GlassPanel className="absolute bottom-5 left-5 right-5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className={cx(fontSystem.display, "text-sm font-bold tracking-[-0.03em]")}>Guided capture</div>
            <div className="text-xs text-white/45">Complete the angles for stronger ID confidence.</div>
          </div>
          <div className="rounded-2xl bg-cyan-300/10 px-3 py-2 text-right ring-1 ring-cyan-300/15">
            <div className={cx(fontSystem.display, "text-sm font-black text-cyan-200")}>1/4</div>
            <div className={cx(fontSystem.mono, "text-[9px] uppercase tracking-[0.12em] text-white/35")}>Shots</div>
          </div>
        </div>
        <CaptureProgress active={0} />
      </GlassPanel>
    </div>
  );
}

function ScanScreen({
  kickscrewUrl,
  setKickscrewUrl,
  onAnalyse,
  isAnalysing,
  error,
}: {
  kickscrewUrl: string;
  setKickscrewUrl: React.Dispatch<React.SetStateAction<string>>;
  onAnalyse: () => void;
  isAnalysing: boolean;
  error: string | null;
}) {
  return (
    <div className="relative min-h-[740px] pb-24 text-white">
      <GlowBlob className="-top-20 right-0 h-56 w-56 bg-cyan-500/25" />
      <GlowBlob className="bottom-24 left-0 h-64 w-64 bg-blue-600/20" />
      <Header />
      <div className="relative z-10 px-5">
        <HeroNotice />
        <DemoScanStrip />
        <ScanViewport />
        <GlassPanel className="mt-4 p-4">
          <label className="block">
            <span className={cx(fontSystem.mono, "mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/45")}>KicksCrew product URL · optional</span>
            <input
              value={kickscrewUrl}
              onChange={(event) => setKickscrewUrl(event.target.value)}
              placeholder="Paste a KicksCrew product URL"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>
          {error ? <p className="mt-2 text-xs text-amber-200">{error}</p> : null}
        </GlassPanel>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button onClick={onAnalyse} className="h-14"><Icon name="scan" className="mr-2" size={19} /> {isAnalysing ? "Analysing..." : "Scan now"}</Button>
          <Button variant="outline" className="h-14"><Icon name="upload" className="mr-2" size={19} /> Upload</Button>
        </div>
      </div>
    </div>
  );
}

function ConfidenceRing({ value }: { value: number }) {
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-cyan-300/10 ring-1 ring-cyan-300/20">
      <div className="absolute inset-1 rounded-full border-4 border-cyan-300 border-b-white/10 border-r-white/10" />
      <div className="text-center">
        <div className={cx(fontSystem.display, "text-lg font-black leading-4 tracking-[-0.04em] text-cyan-100")}>{value}%</div>
        <div className={cx(fontSystem.mono, "text-[8px] uppercase tracking-[0.14em] text-cyan-100/55")}>Match</div>
      </div>
    </div>
  );
}

function ProductImageCard({ sneaker }: { sneaker: DisplaySneaker }) {
  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-white/12 via-slate-500/10 to-cyan-400/10 p-4">
      <div className="absolute right-4 top-4"><Badge tone="cyan">{sneaker.platform}</Badge></div>
      <div className="grid h-36 place-items-center overflow-hidden rounded-3xl">{sneaker.imageUrl ? <img src={sneaker.imageUrl} alt={sneaker.name} className="h-full w-full object-contain" /> : <SneakerSilhouette />}</div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-black/45 p-3 backdrop-blur">
        <div>
          <div className={cx(fontSystem.display, "text-sm font-black tracking-[-0.03em]")}>{sneaker.condition}</div>
          <div className="text-xs text-white/45">Photo evidence: {sneaker.photoEvidence}</div>
        </div>
        <Badge tone="green" icon="shield">{sneaker.authenticity}</Badge>
      </div>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 shadow-lg shadow-black/10">
      <Icon name={icon} size={18} className="mb-2 text-cyan-300" />
      <div className={cx(fontSystem.display, "text-sm font-black tracking-[-0.04em]")}>{value}</div>
      <div className={cx(fontSystem.mono, "text-[10px] uppercase tracking-[0.12em] text-white/45")}>{label}</div>
    </div>
  );
}

function ResultHero({ sneaker }: { sneaker: DisplaySneaker }) {
  return (
    <GlassPanel className="relative mb-4 p-5" glow>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <Badge tone="cyan" icon="sparkles">{sneaker.source === "KicksCrew" ? "Live KicksCrew match" : "AI match found"}</Badge>
          <h2 className={cx(fontSystem.display, "mt-3 text-2xl font-black leading-7 tracking-[-0.045em]")}>{sneaker.name}</h2>
          <p className="mt-1 text-sm leading-5 text-white/60">{sneaker.colourway} · {sneaker.size}</p>
        </div>
        <ConfidenceRing value={sneaker.confidence} />
      </div>
      <ProductImageCard sneaker={sneaker} />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Price range" value={sneaker.priceRange} icon="pound" />
        <Metric label="Quick sell" value={sneaker.quickSell} icon="zap" />
        <Metric label="Max value" value={sneaker.maxValue} icon="trending" />
      </div>
    </GlassPanel>
  );
}

function AuthenticityPanel({ sneaker }: { sneaker: DisplaySneaker }) {
  return (
    <GlassPanel className="mb-4 p-4">
      <SectionHeader title="Authenticity intelligence" eyebrow="Risk scan" action={<Badge tone="green" icon="shield">{sneaker.authenticity}</Badge>} />
      <div className="grid grid-cols-3 gap-2">
        {qualityChecks.map((check) => (
          <div key={check.label} className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <Icon name={check.tone === "success" ? "check" : "alert"} size={15} className={check.tone === "success" ? "text-emerald-300" : "text-amber-300"} />
            <div className={cx(fontSystem.display, "mt-2 text-xs font-black tracking-[-0.02em] text-white/80")}>{check.label}</div>
            <div className="mt-1 text-[11px] text-white/45">{check.status}</div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function MarketSignalPanel({ sneaker }: { sneaker: DisplaySneaker }) {
  return (
    <GlassPanel className="mb-4 p-4">
      <SectionHeader title="Market signal" eyebrow="Sell-through" action={<Badge tone="green">{sneaker.demand}</Badge>} />
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Sell-through" value={sneaker.sellThrough} icon="trending" />
        <Metric label="Avg time" value={sneaker.avgSellTime} icon="clock" />
        <Metric label="Margin" value={sneaker.margin} icon="pound" />
      </div>
    </GlassPanel>
  );
}

function CompRow({ comp }: { comp: (typeof comps)[number] }) {
  return (
    <div className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan-300/20 hover:bg-cyan-300/10">
      <div className="min-w-0 pr-3">
        <div className="truncate text-sm font-semibold tracking-[-0.02em] text-white/90">{comp.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/45">
          <span>{comp.platform}</span><span className="h-1 w-1 rounded-full bg-white/25" /><span>{comp.state}</span><span className="h-1 w-1 rounded-full bg-white/25" /><span>{comp.match}% fit</span><span className="h-1 w-1 rounded-full bg-white/25" /><span>{comp.date}</span>
        </div>
      </div>
      <div className={cx(fontSystem.display, "font-black tracking-[-0.04em] text-cyan-200")}>{comp.price}</div>
    </div>
  );
}

function CompsPanel() {
  return (
    <div className="mb-4">
      <SectionHeader title="Live comps" eyebrow="Pricing evidence" action={<button type="button" className="text-xs font-bold text-cyan-300">View all</button>} />
      <div className="space-y-2">{comps.map((comp) => <CompRow key={comp.title} comp={comp} />)}</div>
    </div>
  );
}

function ResultScreen({ setActive, sneaker }: { setActive: React.Dispatch<React.SetStateAction<string>>; sneaker: DisplaySneaker }) {
  return (
    <div className="relative min-h-[740px] pb-24 text-white">
      <GlowBlob className="-right-14 top-16 h-64 w-64 bg-cyan-400/20" />
      <Header />
      <div className="relative z-10 px-5">
        <ResultHero sneaker={sneaker} />
        <AuthenticityPanel sneaker={sneaker} />
        <MarketSignalPanel sneaker={sneaker} />
        <CompsPanel />
        <Button onClick={() => setActive("listing")} className="h-14 w-full">Generate listing <Icon name="chevron" className="ml-2" size={18} /></Button>
      </div>
    </div>
  );
}

function ListingScoreCard({ sneaker }: { sneaker: DisplaySneaker }) {
  return (
    <GlassPanel className="mb-4 p-4" glow>
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-black shadow-lg shadow-cyan-300/25"><Icon name="wand" size={20} /></div>
        <div className="min-w-0 flex-1">
          <div className={cx(fontSystem.display, "font-black tracking-[-0.035em]")}>Listing generated</div>
          <div className="text-sm leading-5 text-white/60">SEO, condition notes and item specifics ready.</div>
        </div>
        <div className="text-right">
          <div className={cx(fontSystem.display, "text-xl font-black text-cyan-200")}>{sneaker.listingScore}</div>
          <div className={cx(fontSystem.mono, "text-[9px] uppercase tracking-[0.14em] text-white/35")}>Score</div>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,.45)]" style={{ width: `${sneaker.listingScore}%` }} /></div>
    </GlassPanel>
  );
}

function ListingAnalyticsStrip() {
  return (
    <div className="mb-4 grid grid-cols-3 gap-2">
      {listingAnalytics.map((metric) => (
        <GlassPanel key={metric.label} className="p-3">
          <div className={cx(fontSystem.display, "text-lg font-black tracking-[-0.05em] text-white")}>{metric.value}</div>
          <div className={cx(fontSystem.mono, "text-[9px] uppercase tracking-[0.12em] text-white/35")}>{metric.label}</div>
          <div className="mt-1 text-[10px] font-bold text-cyan-200">{metric.change}</div>
        </GlassPanel>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <GlassPanel className="p-4">
      <div className={cx(fontSystem.mono, "mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40")}>{label}</div>
      <div className={cx(fontSystem.display, "text-sm font-semibold leading-5 tracking-[-0.025em] text-white/85")}>{value}</div>
    </GlassPanel>
  );
}

function ItemSpecificsGrid({ sneaker }: { sneaker: DisplaySneaker }) {
  const specifics = [`Brand: ${sneaker.brand}`, `Model: ${sneaker.name}`, `Size: ${sneaker.size}`, `SKU: ${sneaker.sku}`];
  return <div className="grid grid-cols-2 gap-2 text-xs">{specifics.map((item) => <div key={item} className="rounded-2xl bg-white/5 p-3 text-white/65 ring-1 ring-white/10">{item}</div>)}</div>;
}

function PublishCard({ draft }: { draft: (typeof marketplaceDrafts)[number] }) {
  const detail = draft.platform === "eBay" ? "Best for max value" : draft.platform === "Vinted" ? "Best for quick sale" : "Best for style discovery";
  return (
    <div className={cx("rounded-3xl border p-4 transition", draft.selected ? "border-cyan-300/30 bg-cyan-300/10" : "border-white/10 bg-white/5")}>
      <div className="mb-3 flex items-center justify-between">
        <div className={cx(fontSystem.display, "font-black tracking-[-0.03em]")}>{draft.platform}</div>
        <Icon name="check" size={18} className={draft.selected ? "text-cyan-200" : "text-white/35"} />
      </div>
      <div className="text-xs leading-5 text-white/50">{detail}</div>
      <div className={cx(fontSystem.display, "mt-2 text-xl font-black tracking-[-0.05em] text-cyan-200")}>{draft.price}</div>
      <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone={draft.selected ? "cyan" : "neutral"}>{draft.status}</Badge><Badge tone="neutral">{draft.fee}</Badge><Badge tone="blue">{draft.reach}</Badge></div>
    </div>
  );
}

function ListingScreen({ sneaker }: { sneaker: DisplaySneaker }) {
  return (
    <div className="relative min-h-[740px] pb-24 text-white">
      <GlowBlob className="left-0 top-20 h-64 w-64 bg-blue-500/20" />
      <Header />
      <div className="relative z-10 px-5">
        <ListingScoreCard sneaker={sneaker} />
        <ListingAnalyticsStrip />
        <div className="space-y-3">
          <Field label="SEO title" value={`${sneaker.name} ${sneaker.colourway} Trainers ${sneaker.size} ${sneaker.condition}`} />
          <Field label="Subtitle" value="AI-priced · Clean condition · Fast dispatch · Genuine pair" />
          <GlassPanel className="p-4">
            <div className={cx(fontSystem.mono, "mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40")}>Description</div>
            <p className="text-sm leading-6 text-white/75">{sneaker.name} in the {sneaker.colourway} colourway. {sneaker.size}. {sneaker.condition} condition with clear resale demand, AI-supported pricing and marketplace-ready item specifics.</p>
            <div className="mt-4"><ItemSpecificsGrid sneaker={sneaker} /></div>
          </GlassPanel>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3">{marketplaceDrafts.map((draft) => <PublishCard key={draft.platform} draft={draft} />)}</div>
        <Button className="mt-5 h-14 w-full">Publish draft listing</Button>
      </div>
    </div>
  );
}

function StatCard({ stat }: { stat: (typeof stats)[number] }) {
  const toneClass = { cyan: "bg-cyan-300/15 text-cyan-200", green: "bg-emerald-300/15 text-emerald-200", blue: "bg-blue-300/15 text-blue-200" }[stat.tone] || "bg-white/10 text-white";
  return (
    <GlassPanel className="p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", toneClass)}><Icon name={stat.icon} size={19} /></div>
          <div className="min-w-0">
            <div className={cx(fontSystem.mono, "truncate text-[10px] uppercase tracking-[0.14em] text-white/50")}>{stat.label}</div>
            <div className={cx(fontSystem.display, "text-xl font-black tracking-[-0.05em]")}>{stat.value}</div>
          </div>
        </div>
      </div>
      <div className="mt-3"><Badge tone={stat.tone === "green" ? "green" : stat.tone === "blue" ? "blue" : "cyan"}>{stat.change}</Badge></div>
    </GlassPanel>
  );
}

function Insight({ icon, title, body, tone = "cyan" }: { icon: IconName; title: string; body: string; tone?: string }) {
  const iconTone = tone === "warn" ? "text-amber-300" : tone === "green" ? "text-emerald-300" : "text-cyan-300";
  return (
    <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/10 transition hover:bg-white/5">
      <div className={cx(fontSystem.display, "mb-1 flex items-center gap-2 font-bold tracking-[-0.025em]")}><Icon name={icon} size={16} className={iconTone} /> {title}</div>
      <p className="text-xs leading-5 text-white/50">{body}</p>
    </div>
  );
}

function RecentScansPanel() {
  return (
    <GlassPanel className="mt-4 p-4">
      <SectionHeader title="Recent scans" eyebrow="Demo inventory" action={<Badge tone="cyan">{recentScans.length} items</Badge>} />
      <div className="space-y-2">
        {recentScans.map((scan) => (
          <div key={scan.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="min-w-0"><div className="truncate text-sm font-bold text-white/85">{scan.item}</div><div className="mt-1 text-[11px] text-white/40">{scan.id} · {scan.confidence}% confidence</div></div>
            <div className="text-right"><div className={cx(fontSystem.display, "text-sm font-black text-cyan-200")}>{scan.value}</div><div className="text-[10px] text-white/35">{scan.status}</div></div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function ActivityPanel() {
  return (
    <GlassPanel className="mt-4 p-4">
      <SectionHeader title="Activity feed" eyebrow="Live demo events" />
      <div className="space-y-2">
        {activityFeed.map((item) => (
          <div key={item.event} className="flex gap-3 rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
            <div className={cx("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", item.tone === "green" ? "bg-emerald-300" : item.tone === "warn" ? "bg-amber-300" : "bg-cyan-300")} />
            <div className="min-w-0 flex-1"><div className="text-xs font-bold text-white/85">{item.event}</div><div className="truncate text-[11px] text-white/45">{item.detail}</div></div>
            <div className="text-[10px] text-white/35">{item.time}</div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

function DashboardScreen() {
  return (
    <div className="relative min-h-[740px] pb-24 text-white">
      <GlowBlob className="right-0 top-0 h-72 w-72 bg-cyan-500/20" />
      <Header />
      <div className="relative z-10 px-5">
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/10"><Icon name="search" size={17} className="text-white/40" /><span className="text-sm text-white/40">Search scans, brands, listings...</span><Icon name="sliders" size={17} className="ml-auto text-white/35" /></div>
        <div className="grid grid-cols-2 gap-3">{stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
        <RecentScansPanel />
        <GlassPanel className="mt-4 p-4" glow>
          <SectionHeader title="AI recommendations" eyebrow="Profit moves" action={<Icon name="sparkles" size={18} className="text-cyan-300" />} />
          <div className="space-y-2">
            <Insight icon="trending" title="Raise Nike listings by 8%" body="Recent comps show stronger pricing for clean UK 8–10 pairs." />
            <Insight icon="alert" tone="warn" title="Add sole photos" body="Listings with clear sole shots reduce buyer questions and returns." />
            <Insight icon="star" tone="green" title="Best next niche" body="Adidas Spezial and New Balance 2002R are trending in your range." />
          </div>
        </GlassPanel>
        <ActivityPanel />
        <Button variant="outline" className="mt-5 h-14 w-full"><Icon name="plus" className="mr-2" size={18} /> New scan</Button>
      </div>
    </div>
  );
}

function HeroCard({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <GlassPanel className="p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-300/10">
      <Icon name={icon} className="mb-4 text-cyan-300" size={26} />
      <div className={cx(fontSystem.display, "font-black tracking-[-0.035em]")}>{title}</div>
      <div className="mt-1 text-sm leading-5 text-white/50">{text}</div>
    </GlassPanel>
  );
}

export default function SoleLensPrototype() {
  const [active, setActive] = useState("scan");
  const [kickscrewUrl, setKickscrewUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<LiveAnalysis>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const displaySneaker = useMemo(() => buildDisplaySneaker(analysisResult), [analysisResult]);

  async function handleAnalyse() {
    setIsAnalysing(true);
    setAnalysisError(null);
    try {
      const itemResponse = await fetch("/api/listlens/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lens: "ShoeLens", marketplace: "eBay", photoUrls: [] }),
      });
      if (!itemResponse.ok) throw new Error("Could not create ShoeLens item.");
      const item = await itemResponse.json() as { id?: string };
      if (!item.id) throw new Error("ShoeLens item response did not include an id.");

      const analyseResponse = await fetch(`/api/listlens/items/${item.id}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lens: "ShoeLens",
          photoUrls: [],
          kickscrewUrl: kickscrewUrl.trim() || undefined,
        }),
      });
      if (!analyseResponse.ok) throw new Error("ShoeLens analysis failed.");
      const payload = await analyseResponse.json() as { analysis?: Record<string, unknown> };
      setAnalysisResult(payload.analysis ?? null);
      setActive("result");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "ShoeLens analysis failed.");
      setActive("result");
    } finally {
      setIsAnalysing(false);
    }
  }

  const currentScreen = useMemo(() => {
    if (active === "scan") return (
      <ScanScreen
        kickscrewUrl={kickscrewUrl}
        setKickscrewUrl={setKickscrewUrl}
        onAnalyse={handleAnalyse}
        isAnalysing={isAnalysing}
        error={analysisError}
      />
    );
    if (active === "result") return <ResultScreen setActive={setActive} sneaker={displaySneaker} />;
    if (active === "listing") return <ListingScreen sneaker={displaySneaker} />;
    return <DashboardScreen />;
  }, [active, kickscrewUrl, isAnalysing, analysisError, displaySneaker]);

  return (
    <div className={cx(fontSystem.app, "relative min-h-screen overflow-hidden bg-[#03050a] px-4 py-8 text-white")}>
      <GlowBlob className="left-1/2 top-0 h-96 w-96 -translate-x-1/2 bg-cyan-500/20" />
      <GlowBlob className="bottom-0 right-0 h-80 w-80 bg-blue-600/10" />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1fr_430px]">
        <div className="hidden lg:block">
          <Badge tone="cyan" icon="sparkles" className="mb-5">AI resale operating system · vertical prototype</Badge>
          <h1 className={cx(fontSystem.display, "max-w-3xl text-6xl font-black leading-[0.94] tracking-[-0.065em]")}>Turn a trainer photo into a sell-ready listing.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 tracking-[-0.01em] text-white/60">SOLE-LENS™ identifies sneakers, checks risk, prices against live comps and generates platform-ready listings with a camera-first UX built for casual sellers and power resellers.</p>
          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            <HeroCard icon="camera" title="Scan" text={`${demoSneakers.length} demo records`} />
            <HeroCard icon="layers" title="Analyse" text={`${comps.length} live-style comps`} />
            <HeroCard icon="bag" title="List" text={`${marketplaceDrafts.length} marketplace drafts`} />
          </div>
        </div>

        <PhoneFrame>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}>
              {currentScreen}
            </motion.div>
          </AnimatePresence>
          <BottomNav active={active} setActive={setActive} />
        </PhoneFrame>
      </div>
    </div>
  );
}
