import { Link } from "wouter";
import {
  TrendingUp, BarChart2, Globe, Lock, ShieldCheck,
  Sparkles, CheckCircle, Smartphone, ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { BrandGlyph } from "@/components/brand/brand-glyph";

/* ── Data ──────────────────────────────────────────────────────────── */

const MARKET_STATS = [
  { value: "£50B+", label: "UK + EU resale market", sub: "Growing 15% YoY" },
  { value: "30M+",  label: "eBay UK listings / month", sub: "Active seller base" },
  { value: "£9B+",  label: "Annual cost of fakes",  sub: "UK consumer harm" },
  { value: "12",    label: "Specialist AI Lenses", sub: "Live or in development" },
];

const COMPARISON = [
  { feature: "Specialist per-category AI",      us: true,  generic: false },
  { feature: "Live market price comps",         us: true,  generic: false },
  { feature: "Buyer risk report (Guard)",       us: true,  generic: false },
  { feature: "Evidence checklist per Lens",     us: true,  generic: false },
  { feature: "eBay + Vinted direct export",     us: true,  generic: false },
  { feature: "Browser extension (free)",        us: true,  generic: false },
  { feature: "Mobile app (iOS + Android)",      us: true,  generic: false },
  { feature: "Safe-language AI output",         us: true,  generic: false },
  { feature: "Responsible AI trust framework",  us: true,  generic: false },
];

const PLATFORMS = [
  { name: "eBay",    emoji: "🛒", phase: "Live",    color: "text-amber-400",   dot: "bg-amber-400" },
  { name: "Vinted",  emoji: "👗", phase: "Live",    color: "text-emerald-400", dot: "bg-emerald-400" },
  { name: "Discogs", emoji: "💿", phase: "Phase 2", color: "text-cyan-400",    dot: "bg-cyan-400/50" },
  { name: "Depop",   emoji: "📦", phase: "Phase 2", color: "text-violet-400",  dot: "bg-violet-400/50" },
  { name: "Etsy",    emoji: "🎨", phase: "Phase 3", color: "text-rose-400",    dot: "bg-rose-400/40" },
  { name: "Reverb",  emoji: "🎸", phase: "Phase 3", color: "text-orange-400",  dot: "bg-orange-400/40" },
  { name: "Poshmark",emoji: "👔", phase: "Phase 4", color: "text-pink-400",    dot: "bg-pink-400/30" },
  { name: "Mercari", emoji: "🏷️", phase: "Phase 4", color: "text-blue-400",   dot: "bg-blue-400/30" },
];

const BUSINESS_MODEL = [
  {
    icon: "📸",
    name: "Studio Starter",
    price: "£19/mo",
    type: "SaaS — Seller",
    desc: "50 AI listings per month. eBay + Vinted export. All active Lenses.",
    accent: "border-cyan-500/30 bg-cyan-950/10",
  },
  {
    icon: "🔁",
    name: "Studio Reseller",
    price: "£49/mo",
    type: "SaaS — Power Seller",
    desc: "Unlimited listings. All Lenses as released. Bulk tools. API access.",
    accent: "border-violet-500/30 bg-violet-950/10",
  },
  {
    icon: "🛡️",
    name: "Guard Monthly",
    price: "£9.99/mo",
    type: "SaaS — Buyer",
    desc: "100 Guard risk checks per month. Full report archive.",
    accent: "border-emerald-500/30 bg-emerald-950/10",
  },
  {
    icon: "⚡",
    name: "Guard Pay-per-check",
    price: "£1.99/check",
    type: "Pay-per-use",
    desc: "Single check. No subscription needed. Low barrier to try.",
    accent: "border-white/10 bg-white/[0.02]",
  },
  {
    icon: "🔌",
    name: "API + Licensing",
    price: "Enterprise",
    type: "B2B",
    desc: "Platform-level integrations. White-label. Resale marketplace partnerships.",
    accent: "border-amber-500/30 bg-amber-950/10",
  },
];

const LENSES = [
  { name: "ShoeLens",     emoji: "👟", status: "live" },
  { name: "RecordLens",   emoji: "💿", status: "live" },
  { name: "ClothingLens", emoji: "👕", status: "live" },
  { name: "CardLens",     emoji: "🎴", status: "live" },
  { name: "ToyLens",      emoji: "🧸", status: "live" },
  { name: "WatchLens",    emoji: "⌚", status: "live" },
  { name: "MeasureLens",  emoji: "📐", status: "live" },
  { name: "MotorLens",    emoji: "🚗", status: "live" },
  { name: "TechLens",     emoji: "💻", status: "dev" },
  { name: "BookLens",     emoji: "📚", status: "dev" },
  { name: "AntiquesLens", emoji: "🏺", status: "dev" },
  { name: "AutographLens",emoji: "✍️", status: "dev" },
];

const ROADMAP = [
  {
    phase: "POC · Now",
    color: "border-cyan-500/50 bg-cyan-950/20",
    labelColor: "text-cyan-400",
    dot: "bg-cyan-500",
    items: [
      "Studio — photo → listing draft",
      "Guard — URL → risk report",
      "8 live Lenses (Shoe, Record, Clothing, Card, Toy, Watch, Measure, Motor)",
      "eBay sandbox + Vinted export",
      "Stripe billing (Starter + Reseller)",
      "Chrome extension (Guard while you browse)",
      "iOS + Android app (Expo / React Native)",
    ],
  },
  {
    phase: "MVP · Q3 2026",
    color: "border-violet-500/40 bg-violet-950/15",
    labelColor: "text-violet-400",
    dot: "bg-violet-500",
    items: [
      "TechLens, BookLens, AntiquesLens, AutographLens",
      "Discogs + Depop marketplace connectors",
      "MeasureLens physical accessory (3D-printed hardware)",
      "MotorMeasureLens (vehicle damage reference object)",
      "Guard Browser Extension v2 — side panel UI",
      "Bulk listing tools for Studio Reseller",
      "Multi-photo drag-and-drop upload queue",
    ],
  },
  {
    phase: "Expansion · Q1 2027",
    color: "border-emerald-500/30 bg-emerald-950/10",
    labelColor: "text-emerald-400",
    dot: "bg-emerald-500/60",
    items: [
      "Etsy, Shopify, WooCommerce export",
      "Reverb (music gear marketplace)",
      "API licensing for resale platforms",
      "BullMQ / Redis async AI job queue",
      "White-label Guard for insurance & logistics",
    ],
  },
  {
    phase: "Scale · 2027+",
    color: "border-white/10 bg-white/[0.02]",
    labelColor: "text-slate-400",
    dot: "bg-slate-500/40",
    items: [
      "Poshmark + Mercari (US market expansion)",
      "Catawiki / auction channels (antiques, books)",
      "MotorLens full CV pipeline",
      "Platform partnerships & licensing deals",
      "Institutional data licensing",
    ],
  },
];

const AI_PIPELINE = [
  { stage: "Capture Agent",       desc: "Normalises images and extracts listing context" },
  { stage: "Quality Agent",       desc: "Blur, lighting, missing angles, sensitive data" },
  { stage: "Category Router",     desc: "Selects the correct specialist Lens" },
  { stage: "Identity Agent",      desc: "Identifies item, model, release, or variant" },
  { stage: "Evidence Agent",      desc: "Labels, barcodes, matrix, ISBN, serial numbers" },
  { stage: "Specialist Lens",     desc: "Applies category-specific rules and field schemas" },
  { stage: "Comps Agent",         desc: "Searches and filters comparable sold listings" },
  { stage: "Pricing Agent",       desc: "Quick-sale vs recommended price range + confidence" },
  { stage: "Guard Risk Agent",    desc: "Missing evidence, safe risk language, red flags" },
  { stage: "MeasureLens Agent",   desc: "Marker detection, pose estimation, geometry" },
  { stage: "Copy Agent",          desc: "Marketplace-specific listing title + description" },
  { stage: "Validator Agent",     desc: "Schema check, contradiction detection" },
  { stage: "Adjudicator Agent",   desc: "Resolves conflicts, escalates when needed" },
];

/* ── Component ──────────────────────────────────────────────────────── */

export default function InvestPage() {
  return (
    <div className="min-h-screen bg-[#040a14] text-slate-200 font-sans selection:bg-violet-500/30">

      {/* Dot-grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#040a14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/splash" aria-label="Mr.FLENS List-LENS">
            <BrandWordmark layout="inline" size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#market"   className="hover:text-white transition-colors">Market</a>
            <a href="#product"  className="hover:text-white transition-colors">Product</a>
            <a href="#model"    className="hover:text-white transition-colors">Business model</a>
            <a href="#roadmap"  className="hover:text-white transition-colors">Roadmap</a>
            <Link href="/" className="text-cyan-300 hover:text-cyan-100 transition-colors">Customer site</Link>
          </div>
          <Button asChild size="sm" className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 border-0 shadow-[0_0_20px_-6px_rgba(139,92,246,0.6)]">
            <Link href="/dashboard">Try the product →</Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-6 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-500/12 blur-[120px] rounded-full" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/4 w-[500px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full" />

        <div className="relative max-w-4xl mx-auto z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full border border-violet-500/40 bg-violet-950/30 text-violet-300 text-xs font-semibold tracking-wider uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
            </span>
            Investor Overview · Mr.FLENS · List-LENS
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[0.95]">
            The AI trust layer<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> for resale.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            A £50B+ market growing at 15% YoY — with a structural trust problem that costs sellers and buyers billions every year. ListLens is the category-specialist AI intelligence layer that fixes it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 border-0 px-8 shadow-[0_0_36px_-6px_rgba(139,92,246,0.6)] text-base">
              <Link href="/dashboard">Try the live product →</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-violet-700/40 text-violet-200 hover:text-white hover:bg-violet-950/40 px-8 text-base">
              <a href="mailto:invest@listlens.ai">Request a deck →</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Market stats ───────────────────────────────────────────── */}
      <section id="market" className="py-20 px-6 border-t border-white/5 bg-[#070e1c]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Market opportunity
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">A £50B+ market with a trust problem.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The second-hand economy is one of the fastest-growing retail sectors globally. But fraud, misdescription, and poor listing quality cost buyers and sellers billions every year — and existing AI tools are not built for this domain.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {MARKET_STATS.map((s) => (
              <div key={s.label} className="bg-[#0d152a] border border-white/8 rounded-2xl p-7 text-center">
                <div className="text-5xl font-extrabold text-white mb-2">{s.value}</div>
                <div className="text-sm font-semibold text-slate-300 mb-1">{s.label}</div>
                <div className="text-xs text-slate-500">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Problem / solution */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-8">
              <h3 className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> The problem
              </h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                {[
                  "Sellers spend 30–60 min manually writing a single listing.",
                  "Generic AI hallucinates item specifics and pricing data.",
                  "Buyers can't verify authenticity from listings alone.",
                  "£9B+ of counterfeit and misdescribed goods sold annually in the UK.",
                  "No purpose-built AI for the resale domain exists at scale.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-rose-500 mt-0.5 shrink-0">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-8">
              <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> The ListLens solution
              </h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                {[
                  "Studio: photos → fully optimised marketplace listing in &lt;30 seconds.",
                  "12 specialist Lenses — each trained on domain-specific evidence rules.",
                  "Guard: live buyer risk check with 5-dimension AI analysis.",
                  "Marketplace-ready exports: eBay, Vinted, and 6+ platforms on roadmap.",
                  "Responsible AI framework — no false accusations, no unverified claims.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span dangerouslySetInnerHTML={{ __html: t }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison ─────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">ListLens vs the alternatives</h2>
            <p className="text-slate-400 text-sm">No competitor combines specialist AI, direct marketplace export, buyer risk checks, and a responsible AI trust framework in a single product.</p>
          </div>
          <div className="bg-[#0a1122] rounded-2xl border border-white/8 overflow-hidden">
            <div className="grid grid-cols-3 text-[11px] font-bold uppercase tracking-wider px-6 py-3 border-b border-white/8 text-slate-400">
              <div className="col-span-1">Feature</div>
              <div className="text-center text-violet-400">ListLens</div>
              <div className="text-center">Generic AI</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 px-6 py-3.5 text-sm items-center ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                <div className="col-span-1 text-slate-300">{row.feature}</div>
                <div className="text-center">{row.us ? <span className="text-emerald-400 font-bold text-base">✓</span> : <span className="text-zinc-600">–</span>}</div>
                <div className="text-center">{row.generic ? <span className="text-emerald-400 font-bold text-base">✓</span> : <span className="text-zinc-600">–</span>}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product overview ───────────────────────────────────────── */}
      <section id="product" className="py-20 px-6 border-t border-white/5 bg-[#070e1c]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Core products
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Two products. One platform.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Studio serves sellers. Guard serves buyers. Both are powered by the same specialist Lens infrastructure — and both monetise independently.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Studio */}
            <div className="bg-[#0a1122] border border-cyan-500/25 rounded-2xl p-8">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Studio — AI listing creation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Sellers upload 3–8 photos. The correct specialist Lens activates automatically, identifying the exact item, condition, and missing evidence. Output: optimised title, AI description, live market pricing, one-click marketplace export.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                {["Photos → draft in &lt;30 seconds", "Live market comps (comparable sold prices)", "Missing evidence warnings before listing", "eBay + Vinted direct export (more on roadmap)"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Guard */}
            <div className="bg-[#0a1122] border border-violet-500/25 rounded-2xl p-8">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Guard — buyer risk check</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Buyers paste a listing URL (or use the Chrome extension). The 13-stage AI pipeline analyses photos, pricing, seller signals, and evidence completeness. Output: risk level, red flags, missing evidence, ready-made seller questions.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                {["5-dimension risk report (photo, price, evidence, seller, authenticity)", "AI-generated questions to ask the seller", "Responsible AI language — no false accusations", "Chrome extension: Guard without leaving the listing"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 12 Lenses */}
          <div>
            <h3 className="text-center text-xl font-bold text-white mb-3">12 Specialist Lenses</h3>
            <p className="text-center text-slate-400 text-sm mb-8 max-w-xl mx-auto">Each Lens is a purpose-built specialist with its own evidence rules, attribute schema, safe-language layer, and marketplace field mappings.</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
              {LENSES.map((l) => (
                <div
                  key={l.name}
                  className={`rounded-xl border p-3 text-center ${l.status === "live" ? "bg-[#0d152a] border-cyan-500/20" : "bg-[#040a14] border-white/5 opacity-50"}`}
                >
                  <div className="text-xl mb-1">{l.emoji}</div>
                  <div className={`text-[9px] font-semibold leading-tight ${l.status === "live" ? "text-zinc-300" : "text-zinc-600"}`}>{l.name.replace("Lens","")}</div>
                  <div className="mt-1">
                    {l.status === "live"
                      ? <span className="inline-block text-[8px] bg-cyan-900/70 text-cyan-400 px-1.5 py-0.5 rounded-full">Live</span>
                      : <span className="inline-block text-[8px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded-full">Dev</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI pipeline ────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> 13-stage AI pipeline
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Layered intelligence architecture.</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Not a single monolithic prompt. A structured pipeline where each agent has a defined scope, schema-validated output, confidence score, and escalation path.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AI_PIPELINE.map((a, i) => (
              <div key={a.stage} className="bg-[#0d152a] border border-white/8 rounded-xl p-4 flex gap-3 items-start">
                <span className="text-[10px] font-bold text-amber-500/70 shrink-0 font-mono w-4 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-xs font-semibold text-white mb-0.5">{a.stage}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-xs text-zinc-600">All AI outputs are schema-validated (Zod). Every job stores: prompt version, model, schema version, output, warnings, cost, confidence.</div>
        </div>
      </section>

      {/* ── Business model ─────────────────────────────────────────── */}
      <section id="model" className="py-20 px-6 border-t border-white/5 bg-[#070e1c]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-950/20 text-violet-300 text-xs font-semibold uppercase tracking-wider">
              <BarChart2 className="w-3.5 h-3.5" /> Business model
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Multiple revenue streams. Stacked LTV.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">SaaS subscriptions for sellers. Pay-per-check for buyers. API licensing for platforms. Each adds a layer of recurring and high-margin revenue.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
            {BUSINESS_MODEL.map((bm) => (
              <div key={bm.name} className={`border ${bm.accent} rounded-2xl p-6`}>
                <div className="text-2xl mb-3">{bm.icon}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{bm.type}</div>
                <p className="font-bold text-white text-sm mb-1">{bm.name}</p>
                <p className="text-xl font-bold text-violet-300 mb-2">{bm.price}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{bm.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0a1122] border border-white/8 rounded-2xl p-7 grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-white mb-1">Seller SaaS</div>
              <div className="text-xs text-slate-400 leading-relaxed">Recurring monthly subscriptions. Unlimited listings. All Lenses. High retention from deep marketplace integration.</div>
            </div>
            <div className="sm:border-x border-white/8 px-4">
              <div className="text-xl font-bold text-white mb-1">Buyer Pay-per-use</div>
              <div className="text-xs text-slate-400 leading-relaxed">Low-friction £1.99/check. No subscription needed to start. Natural upgrade path to Guard Monthly.</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white mb-1">API + Licensing</div>
              <div className="text-xs text-slate-400 leading-relaxed">Platform-level integrations, white-label Guard for insurers / logistics, and resale marketplace partnerships.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform roadmap ───────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" /> Marketplace coverage
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Built for every resale platform.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">eBay and Vinted are live. 6 more platforms on the roadmap across 4 expansion phases. One platform — every marketplace.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="bg-[#0d152a] border border-white/8 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{p.emoji}</div>
                <p className="text-xs font-semibold text-white mb-1">{p.name}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                  <span className={`text-[9px] font-medium ${p.color}`}>{p.phase}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile app ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5 bg-[#070e1c]">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-[#040a14] p-10 relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-500/8 blur-[60px]" />
            <div className="relative flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg border border-cyan-700/30 bg-cyan-950/30">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/90 font-semibold">iOS + Android · Expo / React Native</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Studio &amp; Guard in your pocket.</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                  Full Studio and Guard on iOS and Android. Camera-first photo capture, RevenueCat in-app billing, PostHog analytics, deep-link Guard checks, and push notifications for listing status.
                </p>
                <ul className="space-y-2 text-sm text-slate-300">
                  {["In-app eBay OAuth + listing publish", "Offline-capable image upload queue", "RevenueCat subscription management", "Deep-link: open listing URL → instant Guard check"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 text-center">
                <div className="w-28 h-52 bg-[#0d152a] border-2 border-cyan-500/30 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-cyan-900/30 mx-auto">
                  <div className="text-4xl">📱</div>
                </div>
                <p className="text-xs text-zinc-500 mt-3">Coming soon to App Store &amp; Google Play</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Responsible AI ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-amber-800/50 bg-amber-950/20">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Responsible AI — our defensible moat</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Safe language is a feature, not a constraint.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every competitor who skips this creates legal and regulatory risk. Our responsible AI framework is both the right thing to do and a sustainable competitive moat — platforms and insurers will only integrate AI that doesn't make accusatory claims.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-7">
              <h3 className="text-rose-400 font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Non-negotiable exclusions
              </h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                {[
                  'Never: "This is fake / counterfeit"',
                  'Never: "This seller is scamming"',
                  'Never: "Guaranteed authentic / genuine"',
                  'Never: "First pressing / mint" without evidence',
                  "Never: auto-publish or auto-report to platforms",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-rose-500 mt-0.5 shrink-0">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-7">
              <h3 className="text-emerald-400 font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Safe, actionable language always
              </h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                {[
                  '"High replica-risk indicators found."',
                  '"Authenticity cannot be confirmed from available evidence."',
                  '"This listing is missing key evidence."',
                  '"Likely UK 1997 issue, 72% confidence from label photo."',
                  '"This is an AI-assisted risk screen, not formal authentication."',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Roadmap ────────────────────────────────────────────────── */}
      <section id="roadmap" className="py-20 px-6 border-t border-white/5 bg-[#070e1c]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-950/20 text-violet-300 text-xs font-semibold uppercase tracking-wider">
              <ArrowRight className="w-3.5 h-3.5" /> Product roadmap
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Four phases. Growing moat.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Each phase adds Lenses, marketplaces, and revenue streams — while deepening the data flywheel that competitors can't replicate.</p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {ROADMAP.map((r) => (
              <div key={r.phase} className={`border ${r.color} rounded-2xl p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${r.dot}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${r.labelColor}`}>{r.phase}</span>
                </div>
                <ul className="space-y-2.5">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-slate-600 mt-0.5 shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack ─────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-xl font-bold text-white mb-8">Technology stack</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Frontend", value: "React + Vite (TypeScript strict)", icon: "⚛️" },
              { label: "Mobile", value: "Expo / React Native (iOS + Android)", icon: "📱" },
              { label: "Backend", value: "Express API (Node.js, port 8080)", icon: "🔧" },
              { label: "Database", value: "PostgreSQL + Drizzle ORM", icon: "🗄️" },
              { label: "AI", value: "xAI Grok-2-Vision (multimodal)", icon: "🤖" },
              { label: "Auth", value: "Replit OIDC / mobile token exchange", icon: "🔐" },
              { label: "Storage", value: "Replit Object Storage (presigned URLs)", icon: "☁️" },
              { label: "Payments web", value: "Stripe (subscription + pay-per-use)", icon: "💳" },
              { label: "Payments mobile", value: "RevenueCat", icon: "📲" },
              { label: "Analytics", value: "PostHog (web + React Native)", icon: "📊" },
              { label: "Validation", value: "Zod (all API + AI schema boundaries)", icon: "✅" },
              { label: "Extension", value: "Chrome MV3 (WXT / Plasmo ready)", icon: "🧩" },
            ].map((t) => (
              <div key={t.label} className="bg-[#0d152a] border border-white/8 rounded-xl px-5 py-4 flex items-center gap-3">
                <span className="text-xl shrink-0">{t.icon}</span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{t.label}</p>
                  <p className="text-sm text-slate-200 font-medium leading-tight">{t.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 relative overflow-hidden border-t border-white/5 bg-[#070e1c]">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-violet-500/7 blur-[100px]" />
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full border-2 border-violet-500/40 bg-violet-950/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_32px_-8px_rgba(139,92,246,0.6)]">
            <BrandGlyph size={28} animated showSparks={false} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Ready to learn more?
          </h2>
          <p className="text-slate-400 mb-8 text-base leading-relaxed">
            Try the live product, request a full investor deck, or reach out to the team directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 border-0 px-10 shadow-[0_0_44px_-8px_rgba(139,92,246,0.7)] text-base">
              <Link href="/dashboard">Try the product live</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-violet-700/40 text-violet-200 hover:text-white hover:bg-violet-950/40 px-8 text-base">
              <a href="mailto:invest@listlens.ai">Request investor deck →</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6 bg-[#040a14]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandWordmark layout="inline" size="sm" />
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/"       className="hover:text-white transition-colors">Customer site</Link>
            <Link href="/splash" className="hover:text-white transition-colors">Splash</Link>
            <Link href="/terms"  className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p className="text-xs text-zinc-700">© {new Date().getFullYear()} Mr.FLENS · List-LENS</p>
        </div>
      </footer>

    </div>
  );
}
