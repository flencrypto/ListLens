import { Link } from "wouter";
import {
  ShieldCheck, Sparkles, CheckCircle, AlertTriangle, Info,
  Zap, HelpCircle, AlertCircle, TrendingUp, Download, FolderOpen, Puzzle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { BrandGlyph } from "@/components/brand/brand-glyph";
import { BrandLens } from "@/components/brand/brand-lens";
import { LENS_REGISTRY, LENS_ICON_MAP } from "@/lib/lenses-registry";

const PRICING = [
  {
    name: "Free trial",
    price: "£0",
    period: "",
    desc: "3 listings, no card needed",
    features: ["3 Studio listings", "1 Guard risk check", "Access to all active Lenses"],
    cta: "Start free trial",
    href: "/dashboard",
    highlight: false,
    accentClass: "border-white/10",
    btnVariant: "outline" as const,
    btnClass: "border-white/20 text-white hover:bg-white/5",
  },
  {
    name: "Studio Starter",
    price: "£9.99",
    period: "/mo",
    desc: "List faster, sell higher.",
    features: ["50 Studio listings per month", "AI pricing recommendations", "Missing evidence warnings", "Export directly to platforms"],
    cta: "Get Studio",
    href: "/billing",
    highlight: true,
    accentClass: "border-cyan-500/30 shadow-2xl shadow-cyan-900/20",
    btnVariant: "default" as const,
    btnClass: "bg-cyan-600 hover:bg-cyan-500 text-white border-0",
    badge: "For Sellers",
  },
  {
    name: "Guard Passes",
    price: "£1.99",
    period: "/check",
    desc: "Pay as you go. No subscription.",
    features: ["Detailed 5-dimension risk report", "Photo & text anomaly detection", "Generates questions for sellers"],
    cta: "Buy a pass",
    href: "/guard/new",
    highlight: false,
    accentClass: "border-violet-500/30",
    btnVariant: "outline" as const,
    btnClass: "border-violet-500/50 text-violet-100 hover:bg-violet-500/10",
  },
];

const RISK_DIMS = [
  { label: "Material Texture",   score: 85, color: "bg-emerald-500" },
  { label: "Stitching Patterns", score: 70, color: "bg-amber-500" },
  { label: "Shape & Proportions",score: 92, color: "bg-emerald-500" },
  { label: "Box & Packaging",    score: 45, color: "bg-rose-500" },
  { label: "Seller History",     score: 60, color: "bg-amber-500" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#040a14] text-slate-200 font-sans selection:bg-cyan-500/30">

      {/* Dot-grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(34,211,238,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#040a14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/splash" aria-label="Mr.FLENS List-LENS">
            <BrandWordmark layout="inline" size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#lenses"       className="hover:text-white transition-colors">Lenses</a>
            <a href="#pricing"      className="hover:text-white transition-colors">Pricing</a>
            <a href="#extension"    className="hover:text-white transition-colors">Extension</a>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex text-slate-300 hover:text-white">
              <Link href="/dashboard">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 shadow-[0_0_20px_-6px_rgba(34,211,238,0.6)]">
              <Link href="/studio/new">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero — "This is what you get." ──────────────────────────── */}
      <section className="pt-24 pb-20 px-6 relative overflow-hidden">
        {/* HUD lens — ambient backdrop, slowly rotating, behind all content */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden"
        >
          <div className="opacity-[0.12] -mt-24 w-[700px] h-[700px]">
            <BrandLens className="w-full h-full" />
          </div>
        </div>
        {/* Glow orbs */}
        <div aria-hidden className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/15 blur-[120px] rounded-full" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/4  w-[600px] h-[300px] bg-violet-500/15 blur-[100px] rounded-full" />

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white tracking-tight mb-6 leading-[0.95]">
              This is what you get.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              AI output in under 30 seconds. No guesswork.<br className="hidden md:block" />
              Studio for sellers, Guard for buyers — powered by specialist AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 px-8 shadow-[0_0_40px_-6px_rgba(34,211,238,0.55)] text-base">
                <Link href="/studio/new">Start listing free →</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cyan-700/40 text-cyan-200 hover:text-white hover:bg-cyan-950/40 px-8 text-base">
                <Link href="/guard/new">Check a listing →</Link>
              </Button>
            </div>
            <p className="text-xs text-zinc-600 mt-4">No credit card · First 3 listings free</p>
          </div>

          {/* Dual output panels */}
          <div className="grid md:grid-cols-2 gap-8 items-start">

            {/* Guard panel */}
            <div className="bg-[#0a1122] rounded-2xl border border-violet-500/30 shadow-2xl shadow-violet-900/20 overflow-hidden flex flex-col" style={{ height: 640 }}>
              <div className="h-12 bg-[#0d152a] border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <div className="mx-auto flex items-center gap-2 text-violet-400 text-xs font-medium bg-violet-500/10 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Guard Risk Report
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.3) transparent" }}>
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Jordan 1 Retro High OG</h3>
                    <p className="text-slate-400 text-sm">"Chicago Lost and Found"</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-center shrink-0">
                    <div className="text-[10px] uppercase tracking-wider font-bold mb-0.5">Risk Score</div>
                    <div className="text-lg font-bold">MEDIUM</div>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Red flags */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">
                      <AlertTriangle className="w-3.5 h-3.5" /> 2 Red Flags Detected
                    </h4>
                    <div className="space-y-2">
                      {[
                        { title: "Box label typography inconsistency", body: "The font weight on the sizing tag appears unusually thin compared to retail examples." },
                        { title: "Missing medial panel shots", body: "Crucial authentication points (Swoosh placement, leather cracking pattern) are obscured." },
                      ].map((flag) => (
                        <div key={flag.title} className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex gap-3">
                          <div className="mt-0.5 text-rose-400 shrink-0"><AlertCircle className="w-4 h-4" /></div>
                          <div>
                            <p className="text-rose-200 text-sm font-medium">{flag.title}</p>
                            <p className="text-rose-300/70 text-xs mt-1">{flag.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk dimensions */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Dimensions</h4>
                    <div className="space-y-3 bg-[#0d152a] rounded-xl p-4 border border-white/5">
                      {RISK_DIMS.map((dim) => (
                        <div key={dim.label} className="flex items-center gap-4">
                          <span className="text-xs text-slate-300 w-36 shrink-0">{dim.label}</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${dim.color}`} style={{ width: `${dim.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Authenticity signal */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                      <CheckCircle className="w-3.5 h-3.5" /> Authenticity Signal
                    </h4>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex gap-3">
                      <div className="mt-0.5 text-emerald-400 shrink-0"><CheckCircle className="w-4 h-4" /></div>
                      <div>
                        <p className="text-emerald-200 text-sm font-medium">Collar cracking aligns with retail</p>
                        <p className="text-emerald-300/70 text-xs mt-1">Pattern and depth of the black collar cracking matches verified retail pairs from this release.</p>
                      </div>
                    </div>
                  </div>

                  {/* Seller questions */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
                      <HelpCircle className="w-3.5 h-3.5" /> Questions to ask the seller
                    </h4>
                    <ol className="space-y-2 list-decimal list-inside text-sm text-slate-300 ml-1">
                      {[
                        "Can you provide a close-up photo of the size tag inside the shoe?",
                        "Do you have a picture of the back of the insole?",
                        "Is the original purchase receipt available?",
                      ].map((q) => (
                        <li key={q} className="pl-1 pb-1.5 border-b border-white/5 last:border-0">{q}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio panel */}
            <div className="bg-[#0a1122] rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-900/20 overflow-hidden flex flex-col mt-6 md:mt-0" style={{ height: 640 }}>
              <div className="h-12 bg-[#0d152a] border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <div className="mx-auto flex items-center gap-2 text-cyan-400 text-xs font-medium bg-cyan-500/10 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  Studio Listing Output
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1 relative" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(34,211,238,0.3) transparent" }}>

                {/* Missing evidence */}
                <div className="mb-5 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-200 text-sm font-medium">Missing Evidence</p>
                    <p className="text-amber-300/70 text-xs mt-1">For maximum buyer trust, add a photo of the heel tabs. Buyers often look for this to verify condition.</p>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Optimised Title</label>
                  <div className="p-3 bg-[#0d152a] border border-white/10 rounded-lg text-white text-sm font-medium leading-snug">
                    Sony Alpha a7 III Mirrorless Camera Body Only — Mint Condition, Low Shutter Count
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] text-slate-500">78/80 characters</span>
                    <span className="text-[10px] text-cyan-400 font-medium">High search visibility</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Market Pricing Data</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0d152a] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-medium">Quick Sale</span>
                      </div>
                      <div className="text-xl font-bold text-white">£850–920</div>
                    </div>
                    <div className="bg-[#0d152a] border border-cyan-500/20 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center gap-2 text-cyan-400 mb-1 relative z-10">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Recommended</span>
                      </div>
                      <div className="text-xl font-bold text-white relative z-10">£980–1,050</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">AI-Drafted Description</label>
                  <div className="bg-[#0d152a] border border-white/10 rounded-xl p-4 text-sm text-slate-300 space-y-3 font-mono leading-relaxed">
                    <p>Up for sale is a meticulously cared for Sony Alpha a7 III (Body Only).</p>
                    <div>
                      <p className="text-white font-semibold mb-1">Condition Details:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Mint condition with zero visible scratches on the sensor.</li>
                        <li>Screen protector applied since day one (included).</li>
                        <li>Shutter count is exceptionally low at roughly 12,500.</li>
                      </ul>
                    </div>
                    <p className="italic text-slate-500">Dispatched via Royal Mail Special Delivery Guaranteed by 1pm.</p>
                  </div>
                </div>

                {/* Action strip */}
                <div className="sticky bottom-0 pt-4 mt-4 bg-gradient-to-t from-[#0a1122] via-[#0a1122]/90 to-transparent flex gap-3">
                  <Button asChild variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">
                    <Link href="/dashboard">View in Studio</Link>
                  </Button>
                  <Button asChild className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white border-0 shadow-lg shadow-cyan-900/50">
                    <Link href="/studio/new">Try it free →</Link>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 border-y border-white/5 bg-[#070e1c]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">

          {/* Studio steps */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white">How Studio works</h3>
            </div>
            <div className="space-y-6">
              {[
                { n: "1", title: "Upload photos", body: "3–8 photos of your item. No professional lighting needed.", accent: "border-white/10 text-slate-400" },
                { n: "2", title: "AI analysis", body: "The specialist Lens identifies the exact model, condition, and missing evidence.", accent: "border-cyan-500/30 text-cyan-400" },
                { n: "3", title: "Ready to list", body: "Get an optimised title, description, and accurate pricing data instantly.", accent: "border-white/10 text-slate-400" },
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full bg-[#0d152a] border ${step.accent} flex items-center justify-center font-bold shrink-0 text-sm`}>{step.n}</div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{step.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild className="bg-cyan-600/25 hover:bg-cyan-600/40 border border-cyan-600/40 text-cyan-200 font-semibold">
                <Link href="/studio/new">Create a listing →</Link>
              </Button>
            </div>
          </div>

          {/* Guard steps */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white">How Guard works</h3>
            </div>
            <div className="space-y-6">
              {[
                { n: "1", title: "Paste a link", body: "Found a deal on eBay or Vinted? Paste the URL into Guard.", accent: "border-white/10 text-slate-400" },
                { n: "2", title: "Deep scan", body: "AI examines seller history, photo inconsistencies, and pricing anomalies.", accent: "border-violet-500/30 text-violet-400" },
                { n: "3", title: "Risk report", body: "Review the red flags, green signals, and know exactly what to ask the seller.", accent: "border-white/10 text-slate-400" },
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full bg-[#0d152a] border ${step.accent} flex items-center justify-center font-bold shrink-0 text-sm`}>{step.n}</div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{step.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild className="bg-violet-600/25 hover:bg-violet-600/40 border border-violet-600/40 text-violet-200 font-semibold">
                <Link href="/guard/new">Check a listing →</Link>
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Specialist Lenses ────────────────────────────────────────── */}
      <section id="lenses" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Which category are you in?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Generic AI hallucinates. Our specialist Lenses are trained on millions of data points specific to their domain.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {LENS_REGISTRY.map((lens) => {
              const isLive = lens.status === "live";
              const LensIcon = LENS_ICON_MAP[lens.id];
              const card = (
                <div className={`p-5 rounded-2xl border text-center transition-all ${
                  isLive
                    ? "bg-[#0d152a] border-white/10 hover:border-cyan-500/50 hover:bg-[#121c36] cursor-pointer"
                    : "bg-[#040a14] border-white/5 opacity-50 grayscale cursor-default"
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    {LensIcon
                      ? <LensIcon className={`w-6 h-6 ${isLive ? "text-cyan-400" : "text-zinc-500"}`} />
                      : <span className="text-2xl">{lens.icon}</span>
                    }
                  </div>
                  <p className={`text-sm font-semibold ${isLive ? "text-white" : "text-slate-500"}`}>{lens.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{lens.category}</p>
                  <div className="mt-2">
                    {isLive && <span className="inline-block text-[9px] bg-cyan-900/70 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-700/40">Live</span>}
                    {lens.status === "planned" && <span className="inline-block text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">Soon</span>}
                  </div>
                </div>
              );
              if (isLive && lens.href) {
                return (
                  <Link key={lens.id} href={lens.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040a14] rounded-2xl">
                    {card}
                  </Link>
                );
              }
              return <div key={lens.id}>{card}</div>;
            })}
          </div>
        </div>
      </section>

      {/* ── Responsible AI / Trust ───────────────────────────────────── */}
      <section className="py-24 px-6 border-y border-white/5 bg-[#0a1122]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full border border-amber-800/50 bg-amber-950/20">
            <span className="text-amber-400 text-sm">⚠</span>
            <span className="text-sm text-amber-300 font-medium">Responsible AI language</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Responsible AI, built for resale.</h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">
            Guard is an AI-assisted risk screen, not a formal authentication service.
            Every report is calibrated to inform — never to accuse.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-8">
              <h3 className="text-rose-400 font-bold mb-5 uppercase tracking-wider text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                What we never do
              </h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                {[
                  'We never definitively declare an item "fake" or "counterfeit".',
                  'We never call a seller a "scammer".',
                  "We never automatically report listings to platforms.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-rose-500 mt-0.5 shrink-0">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8">
              <h3 className="text-emerald-400 font-bold mb-5 uppercase tracking-wider text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                What we always do
              </h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                {[
                  "We highlight probabilistic risk factors and anomalies.",
                  "We surface missing evidence needed for verification.",
                  "We empower buyers with the right questions to ask.",
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

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, transparent pricing.</h2>
            <p className="text-slate-400">Start for free. Upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`bg-gradient-to-b from-[#0d152a] to-[#040a14] border ${plan.accentClass} rounded-2xl p-8 flex flex-col relative ${plan.highlight ? "md:-translate-y-4" : ""}`}>
                {plan.badge && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-slate-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <h3 className={`text-lg font-bold mb-2 ${plan.highlight ? "text-cyan-400" : "text-white"}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1 text-slate-300 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-cyan-500" : plan.name === "Guard Passes" ? "text-violet-500" : "text-slate-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.btnVariant} className={`w-full ${plan.btnClass}`}>
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-700 mt-8">
            All plans include listing history · No hidden fees · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Guard Browser Extension ──────────────────────────────────── */}
      <section id="extension" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/25 to-[#040a14] p-10 relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-violet-500/8 blur-[60px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-cyan-500/6 blur-[50px]" />

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg border border-violet-700/30 bg-violet-950/30">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span className="font-mono-hud text-[10px] uppercase tracking-[0.22em] text-violet-300/90">Chrome Extension · Free</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Guard while you browse</h2>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                    Run an AI risk check on any eBay or Vinted listing without leaving the tab.
                    One click — full Guard report, right in the page.
                  </p>
                </div>
                <a
                  href="/listlens-guard.zip"
                  download="listlens-guard.zip"
                  className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold text-sm shadow-[0_0_28px_-8px_rgba(139,92,246,0.7)] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download extension .zip
                </a>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { n: "01", Icon: Download,    title: "Download the zip", body: 'Click "Download extension .zip" above and save the file anywhere on your computer.' },
                  { n: "02", Icon: FolderOpen,  title: "Unzip the file", body: "Extract the downloaded zip to a folder — you'll point Chrome at this folder." },
                  { n: "03", Icon: Puzzle,      title: "Load unpacked in Chrome", body: 'Go to chrome://extensions, enable "Developer mode", click "Load unpacked", and select the folder.' },
                ].map((step) => (
                  <div key={step.n} className="rounded-2xl border border-violet-700/25 bg-violet-950/15 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono-hud text-[10px] font-bold tracking-[0.2em] text-violet-500">{step.n}</span>
                      <step.Icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1.5">{step.title}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{step.body}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[11px] text-zinc-600 text-center">
                Works on Chrome and Chromium-based browsers (Edge, Brave, Arc) · eBay UK/US and Vinted UK/EU supported
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[520px] h-[520px] rounded-full bg-cyan-500/7 blur-[80px]" />
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full border-2 border-cyan-500/40 bg-cyan-950/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_32px_-8px_rgba(34,211,238,0.6)]">
            <BrandGlyph size={28} animated showSparks={false} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Ready to list smarter?
          </h2>
          <p className="text-slate-400 mb-8 text-base leading-relaxed">
            No credit card. No commitment. Your first three listings are completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 px-10 shadow-[0_0_44px_-8px_rgba(34,211,238,0.7)] text-base">
              <Link href="/studio/new">Start listing free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cyan-700/40 text-cyan-200 hover:text-white hover:bg-cyan-950/40 px-8 text-base">
              <Link href="/guard/new">Run a Guard check</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#040a14]">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BrandWordmark layout="inline" size="sm" />
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                AI resale trust layer for eBay &amp; Vinted.<br />
                UK-first · Evidence-led · Responsible AI.
              </p>
            </div>
            <div>
              <p className="font-mono-hud text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Tools</p>
              <nav className="space-y-2.5">
                <Link href="/studio/new" className="block text-sm text-zinc-500 hover:text-white transition-colors">Studio — list an item</Link>
                <Link href="/guard/new"  className="block text-sm text-zinc-500 hover:text-white transition-colors">Guard — check a listing</Link>
                <Link href="/history"    className="block text-sm text-zinc-500 hover:text-white transition-colors">History</Link>
                <Link href="/billing"    className="block text-sm text-zinc-500 hover:text-white transition-colors">Pricing</Link>
                <a href="/listlens-guard.zip" download="listlens-guard.zip" className="block text-sm text-zinc-500 hover:text-white transition-colors">Guard Extension ↓</a>
              </nav>
            </div>
            <div>
              <p className="font-mono-hud text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Legal</p>
              <nav className="space-y-2.5">
                <Link href="/terms"          className="block text-sm text-zinc-500 hover:text-white transition-colors">Terms of use</Link>
                <Link href="/privacy"        className="block text-sm text-zinc-500 hover:text-white transition-colors">Privacy policy</Link>
                <Link href="/ai-disclaimer"  className="block text-sm text-zinc-500 hover:text-white transition-colors">AI disclaimer</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-zinc-800/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-zinc-700">© {new Date().getFullYear()} Mr.FLENS · List-LENS. All rights reserved.</p>
            <p className="font-mono-hud text-[10px] text-zinc-700 uppercase tracking-[0.3em]">AI · Evidence · Confidence</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
