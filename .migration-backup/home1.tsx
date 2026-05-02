import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BrandLens } from "@/components/brand/brand-lens";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { BrandGlyph } from "@/components/brand/brand-glyph";
import { BrandBackground } from "@/components/brand/brand-background";

const LENSES = [
  { name: "ShoeLens",      icon: "👟", desc: "Trainers & sneakers",     status: "live" },
  { name: "LPLens",        icon: "🎵", desc: "Vinyl, CDs, cassettes",   status: "live" },
  { name: "TechLens",      icon: "💻", desc: "Electronics & gadgets",   status: "live" },
  { name: "BookLens",      icon: "📚", desc: "Books & editions",        status: "live" },
  { name: "AntiquesLens",  icon: "🏺", desc: "Antiques & collectibles", status: "live" },
  { name: "AutographLens", icon: "✍️", desc: "Signed memorabilia",      status: "live" },
  { name: "WatchLens",     icon: "⌚", desc: "Watches & timepieces",    status: "soon" },
  { name: "CardLens",      icon: "🃏", desc: "Trading & sports cards",  status: "soon" },
  { name: "ToyLens",       icon: "🧸", desc: "Toys, LEGO, figures",     status: "soon" },
  { name: "MotorLens",     icon: "🚗", desc: "Vehicles & parts",        status: "later" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "📸",
    title: "Upload photos",
    body: "3–8 photos of your item. We read condition, labels, tags, box art — whatever's visible.",
    accent: "cyan" as const,
  },
  {
    step: "02",
    icon: "🤖",
    title: "AI analyses",
    body: "The specialist Lens runs: title, description, item specifics, pricing bands and missing-evidence warnings.",
    accent: "violet" as const,
  },
  {
    step: "03",
    icon: "📋",
    title: "List or export",
    body: "Copy the draft to Vinted, send the eBay payload, or save to your history. Done in seconds.",
    accent: "green" as const,
  },
];

const FEATURES_STUDIO = [
  "Upload 3–8 photos → AI-drafted listing ready",
  "Title, description, bullet points, item specifics",
  "Quick sale / recommended / high price ranges",
  "Missing-evidence warnings before you list",
  "One-click Vinted export · eBay listing payload",
  "6 live Lenses across multiple categories",
];

const FEATURES_GUARD = [
  "Paste a listing URL or upload screenshots",
  "AI risk report: low / medium / high / inconclusive",
  "Red flags with specific observed evidence",
  "5-dimension risk scorecard with verdict text",
  "Suggested seller questions, numbered and actionable",
  "Safe trust language — never over-claims authenticity",
];

const TRUST_NEVER = [
  '"This is fake"',
  '"Definitely counterfeit"',
  '"This seller is a scammer"',
  '"Guaranteed authentic"',
];

const TRUST_ALWAYS = [
  '"High replica-risk indicators found"',
  '"Authenticity cannot be confirmed from photos"',
  '"This listing is missing key evidence"',
  '"AI-assisted risk screen, not formal authentication"',
];

const PRICING = [
  {
    name: "Free trial",
    price: "£0",
    period: "",
    desc: "3 listings, no card needed",
    features: ["3 Studio listings", "ShoeLens", "Vinted export", "Listing history"],
    cta: "Start free",
    href: "/dashboard",
    highlight: false,
  },
  {
    name: "Studio Starter",
    price: "£9.99",
    period: "/mo",
    desc: "For regular sellers",
    features: ["Unlimited listings", "eBay + Vinted export", "All 6 live Lenses", "Priority AI queue"],
    cta: "Get Starter",
    href: "/billing",
    highlight: true,
  },
  {
    name: "Guard",
    price: "£1.99",
    period: "/check",
    desc: "Or £6.99/mo · 10 checks",
    features: ["Full 5-dimension risk report", "Red flags + evidence gaps", "Seller questions", "Price analysis"],
    cta: "Check a listing",
    href: "/guard/new",
    highlight: false,
  },
];

const STEP_CLASSES = {
  cyan:   { card: "border-cyan-500/20 bg-cyan-950/10",   num: "text-cyan-400",   arrow: "text-cyan-500/30" },
  violet: { card: "border-violet-500/20 bg-violet-950/10", num: "text-violet-400", arrow: "text-violet-500/30" },
  green:  { card: "border-emerald-500/20 bg-emerald-950/10", num: "text-emerald-400", arrow: "" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#040a14] text-zinc-50">

      {/* Dot-grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(34,211,238,0.055) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-cyan-400/8 backdrop-blur-xl bg-[#040a14]/90">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/splash" aria-label="Mr.FLENS List-LENS">
            <BrandWordmark layout="inline" size="sm" />
          </Link>
          <div className="flex items-center gap-7">
            <a href="#how-it-works" className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">How it works</a>
            <a href="#features"     className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#lenses"       className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Lenses</a>
            <a href="#pricing"      className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <Button asChild size="sm" className="bg-gradient-to-r from-cyan-500 to-violet-600 border-0 shadow-[0_0_20px_-6px_rgba(34,211,238,0.7)]">
              <Link href="/dashboard">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero — two-column split ─────────────────────────────── */}
      <section className="relative overflow-hidden py-16 px-6">
        <BrandBackground />

        {/* Glow behind lens (right column) */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 w-[55%] h-full flex items-center justify-center"
        >
          <div className="w-[480px] h-[480px] rounded-full bg-cyan-500/7 blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-lg border border-cyan-700/30 bg-cyan-950/30 backdrop-blur">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              <span className="font-mono-hud text-[10px] uppercase tracking-[0.22em] text-cyan-300/90">
                UK-first AI resale platform
              </span>
            </div>

            {/* Headline — stacked */}
            <h1 className="text-6xl sm:text-7xl font-black tracking-tight leading-[0.95] mb-5">
              List<br />
              <span className="bg-gradient-to-r from-[#3ea8ff] to-[#22d3ee] bg-clip-text text-transparent">
                smarter.
              </span><br />
              Buy<br />
              <span className="bg-gradient-to-r from-[#22d3ee] to-[#4ade80] bg-clip-text text-transparent">
                safer.
              </span>
            </h1>

            <p className="text-lg text-zinc-300/70 leading-relaxed mb-8 max-w-md">
              AI-powered listing studio and buyer protection for eBay and Vinted.
              Photos → listing in under 30 seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-9">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 px-8 shadow-[0_0_40px_-6px_rgba(34,211,238,0.6)] text-base"
              >
                <Link href="/studio/new">Start listing free →</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-cyan-700/40 text-cyan-200 hover:text-white hover:bg-cyan-950/40 px-8 text-base"
              >
                <Link href="/guard/new">Check a listing →</Link>
              </Button>
            </div>

            <p className="text-xs text-zinc-600 mb-8">No credit card · First 3 listings free</p>

            {/* Mini stats */}
            <div className="flex gap-8">
              {[["10", "Lenses"], ["6", "Live now"], ["< 30s", "To list"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-black text-cyan-300">{v}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated lens */}
          <div className="flex justify-center lg:justify-end items-center">
            <BrandLens size={320} hideLabels />
          </div>
        </div>

        <div className="hud-divider absolute inset-x-0 bottom-0 opacity-40" />
      </section>

      {/* ── How it works — horizontal card-flow ─────────────────── */}
      <section id="how-it-works" className="py-20 px-6 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="font-mono-hud text-[10px] uppercase tracking-[0.3em] text-cyan-400 mb-2">Studio workflow</p>
              <h2 className="text-3xl font-bold text-white">From photos to listing in 3 steps</h2>
            </div>
            <Button asChild variant="link" className="text-zinc-400 hover:text-white px-0 text-sm self-start sm:self-auto">
              <Link href="/studio/new">Try Studio free →</Link>
            </Button>
          </div>

          {/* Card row with arrows */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-stretch">
            {HOW_IT_WORKS.map((step, i) => {
              const cls = STEP_CLASSES[step.accent];
              return (
                <div key={step.step} className="contents">
                  <div className={`flex-1 flex flex-col p-7 rounded-2xl border ${cls.card} relative`}>
                    <p className={`font-mono-hud text-[10px] font-bold tracking-[0.2em] ${cls.num} mb-4`}>
                      {step.step}
                    </p>
                    <div className="text-3xl mb-4">{step.icon}</div>
                    <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:flex items-center px-3 text-zinc-700 text-xl shrink-0">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Two tools. One trust layer.</h2>
            <p className="text-zinc-400">Studio for sellers. Guard for buyers.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Studio card */}
            <div className="relative overflow-hidden rounded-3xl border border-cyan-500/18 bg-gradient-to-br from-cyan-950/30 to-[#040a14] p-9">
              <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-cyan-500/8 blur-3xl" aria-hidden />
              <div className="flex items-center gap-4 mb-7">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-[0_8px_32px_-8px_rgba(34,211,238,0.7)] shrink-0">
                  📸
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Studio</h3>
                  <p className="text-xs text-cyan-400 tracking-wide">For sellers</p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {FEATURES_STUDIO.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-200/85">
                    <span className="text-cyan-400 shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {/* Pipeline strip */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-cyan-900/40 bg-cyan-950/20 px-4 py-2.5 mb-5">
                {["Photos", "→", "Title", "·", "Bullets", "·", "Price", "·", "Flags"].map((t, i) => (
                  <span
                    key={i}
                    className={`font-mono-hud text-[10px] uppercase tracking-widest ${
                      t === "→" || t === "·" ? "text-zinc-700" : "text-cyan-400/80"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Button asChild className="w-full bg-cyan-600/25 hover:bg-cyan-600/40 border border-cyan-600/40 text-cyan-200 font-bold">
                <Link href="/studio/new">Create a listing →</Link>
              </Button>
            </div>

            {/* Guard card */}
            <div className="relative overflow-hidden rounded-3xl border border-violet-500/18 bg-gradient-to-br from-violet-950/30 to-[#040a14] p-9">
              <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-violet-500/8 blur-3xl" aria-hidden />
              <div className="flex items-center gap-4 mb-7">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-2xl shadow-[0_8px_32px_-8px_rgba(139,92,246,0.7)] shrink-0">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Guard</h3>
                  <p className="text-xs text-violet-400 tracking-wide">For buyers</p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {FEATURES_GUARD.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-200/85">
                    <span className="text-violet-400 shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {/* Pipeline strip */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-violet-900/40 bg-violet-950/20 px-4 py-2.5 mb-5">
                {["URL", "→", "Risk", "·", "Score", "·", "Flags", "·", "Questions"].map((t, i) => (
                  <span
                    key={i}
                    className={`font-mono-hud text-[10px] uppercase tracking-widest ${
                      t === "→" || t === "·" ? "text-zinc-700" : "text-violet-400/80"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Button asChild className="w-full bg-violet-600/25 hover:bg-violet-600/40 border border-violet-600/40 text-violet-200 font-bold">
                <Link href="/guard/new">Check a listing →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specialist Lenses — editorial layout ─────────────────── */}
      <section id="lenses" className="py-20 px-6 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-16 items-start">

          {/* Left — editorial copy */}
          <div>
            <p className="font-mono-hud text-[10px] uppercase tracking-[0.3em] text-cyan-400 mb-3">Specialist Lenses</p>
            <h2 className="text-3xl font-bold text-white mb-4">Category-deep intelligence</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">
              Every Lens knows the right photos, the fields that drive sales, and the red flags that protect — tuned for its own niche.
              6 live now, 4 shipping soon.
            </p>
            <p className="font-mono-hud text-[10px] text-zinc-700 uppercase tracking-[0.25em]">
              New Lenses shipping quarterly
            </p>
          </div>

          {/* Right — 5-col grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {LENSES.map((lens) => (
              <div
                key={lens.name}
                className={`rounded-2xl border p-3.5 text-center transition-all ${
                  lens.status === "live"
                    ? "border-cyan-700/50 bg-cyan-950/25 shadow-[0_0_28px_-12px_rgba(34,211,238,0.5)] hover:border-cyan-600/70 hover:shadow-[0_0_32px_-8px_rgba(34,211,238,0.7)] cursor-default"
                    : "border-zinc-800/60 bg-zinc-900/30 opacity-50"
                }`}
              >
                <div className="text-2xl mb-1.5">{lens.icon}</div>
                <p className="text-xs font-semibold text-white">{lens.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{lens.desc}</p>
                <div className="mt-2">
                  {lens.status === "live" && (
                    <span className="inline-block text-[9px] bg-cyan-900/70 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-700/40">Live</span>
                  )}
                  {lens.status === "soon" && (
                    <span className="inline-block text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">Soon</span>
                  )}
                  {lens.status === "later" && (
                    <span className="inline-block text-[9px] bg-zinc-900 text-zinc-700 px-2 py-0.5 rounded-full">Planned</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Responsible AI / Trust ───────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full border border-amber-800/50 bg-amber-950/20">
            <span className="text-amber-400 text-sm">⚠</span>
            <span className="text-sm text-amber-300 font-medium">Responsible AI language</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">We never over-claim. Ever.</h2>
          <p className="text-zinc-400 mb-8">
            Guard is an AI-assisted risk screen, not a formal authentication service.
            Every report is calibrated to inform — never to accuse.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div className="rounded-2xl border border-red-900/40 bg-red-950/15 p-6">
              <p className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <span>✗</span> We never say
              </p>
              <ul className="space-y-2.5 text-sm text-red-300/75">
                {TRUST_NEVER.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-red-600 shrink-0 mt-0.5">—</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/15 p-6">
              <p className="text-xs font-semibold text-emerald-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <span>✓</span> We always say
              </p>
              <ul className="space-y-2.5 text-sm text-emerald-300/75">
                {TRUST_ALWAYS.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-emerald-600 shrink-0 mt-0.5">—</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Simple pricing</h2>
            <p className="text-zinc-400">Start free. Scale when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border flex flex-col p-7 ${
                  plan.highlight
                    ? "border-cyan-500/30 bg-gradient-to-br from-cyan-950/25 to-violet-950/15 shadow-[0_0_48px_-12px_rgba(34,211,238,0.25)]"
                    : "border-zinc-800/60 bg-zinc-900/20"
                }`}
              >
                {plan.highlight && (
                  <div className="text-[10px] font-bold text-cyan-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <span>★</span> Most popular
                  </div>
                )}
                <h3 className="text-base font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                  <span className="text-sm text-zinc-500">{plan.period}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-cyan-400 shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full font-bold ${
                    plan.highlight
                      ? "bg-gradient-to-r from-cyan-500 to-violet-600 border-0 shadow-[0_0_28px_-6px_rgba(34,211,238,0.55)] hover:from-cyan-400 hover:to-violet-500"
                      : ""
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
                >
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

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="w-[520px] h-[520px] rounded-full bg-cyan-500/7 blur-[80px]" />
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full border-2 border-cyan-500/40 bg-cyan-950/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_32px_-8px_rgba(34,211,238,0.6)]">
            <BrandGlyph size={28} animated showSparks={false} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Ready to list smarter?
          </h2>
          <p className="text-zinc-400 mb-8 text-base leading-relaxed">
            No credit card. No commitment. Your first three listings are completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 border-0 px-10 shadow-[0_0_44px_-8px_rgba(34,211,238,0.7)] text-base"
            >
              <Link href="/studio/new">Start listing free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cyan-700/40 text-cyan-200 hover:text-white hover:bg-cyan-950/40 px-8 text-base"
            >
              <Link href="/guard/new">Run a Guard check</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-cyan-400/8 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full border border-cyan-500/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                </div>
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
              </nav>
            </div>
            <div>
              <p className="font-mono-hud text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Legal</p>
              <nav className="space-y-2.5">
                <Link href="/terms"   className="block text-sm text-zinc-500 hover:text-white transition-colors">Terms of use</Link>
                <Link href="/privacy" className="block text-sm text-zinc-500 hover:text-white transition-colors">Privacy policy</Link>
                <Link href="/ai-disclaimer" className="block text-sm text-zinc-500 hover:text-white transition-colors">AI disclaimer</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-zinc-800/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-zinc-700">© 2026 Mr.FLENS · List-LENS. All rights reserved.</p>
            <p className="font-mono-hud text-[10px] text-zinc-700 uppercase tracking-[0.3em]">
              AI · Evidence · Confidence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
