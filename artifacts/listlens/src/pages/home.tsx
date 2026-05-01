import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLens } from "@/components/brand/brand-lens";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { BrandBackground } from "@/components/brand/brand-background";
import { BrandGlyph } from "@/components/brand/brand-glyph";

const LENSES = [
  { name: "ShoeLens",      icon: "👟", desc: "Trainers & sneakers",    status: "live" },
  { name: "LPLens",        icon: "🎵", desc: "Vinyl, CDs, cassettes",  status: "live" },
  { name: "TechLens",      icon: "💻", desc: "Electronics & gadgets",  status: "live" },
  { name: "BookLens",      icon: "📚", desc: "Books & editions",       status: "live" },
  { name: "AntiquesLens",  icon: "🏺", desc: "Antiques & collectibles", status: "live" },
  { name: "AutographLens", icon: "✍️", desc: "Signed memorabilia",     status: "live" },
  { name: "WatchLens",     icon: "⌚", desc: "Watches & timepieces",   status: "soon" },
  { name: "CardLens",      icon: "🃏", desc: "Trading & sports cards", status: "soon" },
  { name: "ToyLens",       icon: "🧸", desc: "Toys, LEGO, figures",    status: "soon" },
  { name: "MotorLens",     icon: "🚗", desc: "Vehicles & parts",       status: "later" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "📸",
    title: "Upload photos",
    body: "3–8 photos of your item. We read condition, labels, tags, box art — whatever's visible.",
    accent: "cyan",
  },
  {
    step: "02",
    icon: "🤖",
    title: "AI analyses",
    body: "The specialist Lens runs: title, description, item specifics, pricing bands and missing-evidence warnings.",
    accent: "violet",
  },
  {
    step: "03",
    icon: "📋",
    title: "List or export",
    body: "Copy the draft to Vinted, send the eBay payload, or save to your history. Done in seconds.",
    accent: "green",
  },
];

const FEATURES_STUDIO = [
  "Upload 3–8 photos → AI-drafted listing ready",
  "Title, description, bullet points, item specifics",
  "Quick sale / recommended / high price ranges",
  "Missing-evidence warnings before you list",
  "One-click Vinted export · eBay listing payload",
  "10 specialist Lenses — shoes, vinyl, tech, books & more",
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
  "\"This is fake\"",
  "\"Definitely counterfeit\"",
  "\"This seller is a scammer\"",
  "\"Guaranteed authentic\"",
];

const TRUST_ALWAYS = [
  "\"High replica-risk indicators found\"",
  "\"Authenticity cannot be confirmed from photos\"",
  "\"This listing is missing key evidence\"",
  "\"AI-assisted risk screen, not formal authentication\"",
];

const PRICING = [
  {
    name: "Free trial",
    price: "£0",
    period: "",
    desc: "First 3 listings, no card needed",
    features: ["3 Studio listings", "ShoeLens", "Vinted export", "Listing history"],
    cta: "Start free",
    href: "/dashboard",
    highlight: false,
    accentClass: "",
  },
  {
    name: "Studio Starter",
    price: "£9.99",
    period: "/mo",
    desc: "For regular sellers",
    features: [
      "Unlimited listings",
      "eBay + Vinted export",
      "All 6 live Lenses",
      "Listing history",
      "Priority AI queue",
    ],
    cta: "Get Starter",
    href: "/billing",
    highlight: true,
    accentClass: "brand-card-glow",
  },
  {
    name: "Guard",
    price: "£1.99",
    period: "/check",
    desc: "Or £6.99/mo for 10 checks",
    features: [
      "Full 5-dimension risk report",
      "Red flags + evidence gaps",
      "Seller questions",
      "Price analysis",
    ],
    cta: "Check a listing",
    href: "/guard/new",
    highlight: false,
    accentClass: "",
  },
];

const STATS = [
  { value: "10", label: "Specialist Lenses" },
  { value: "6", label: "Live now" },
  { value: "£1.99", label: "Per Guard check" },
  { value: "< 30s", label: "Avg listing time" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#040a14] text-zinc-50">

      {/* Nav */}
      <nav className="border-b border-cyan-400/10 bg-[#040a14]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/splash" aria-label="Mr.FLENS List-LENS">
            <BrandWordmark layout="inline" size="sm" />
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">How it works</a>
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Features</a>
            <a href="#lenses" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Lenses</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Pricing</a>
            <Button asChild size="sm">
              <Link href="/dashboard">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <BrandBackground />

        {/* Radial glow behind the lens */}
        <div
          className="pointer-events-none absolute inset-0 flex items-start justify-center"
          aria-hidden
        >
          <div className="mt-8 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Animated lens */}
          <div className="flex justify-center mb-6">
            <BrandLens size={240} hideLabels />
          </div>

          {/* Pill badge */}
          <div className="mb-5 inline-flex items-center gap-2">
            <Badge className="bg-cyan-950/80 text-cyan-200 border border-cyan-700/50 backdrop-blur px-3 py-1">
              <span className="font-mono-hud text-[10px] uppercase tracking-[0.25em]">
                Mr.FLENS · List-LENS — UK-first AI resale platform
              </span>
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight mb-5 leading-none">
            <span className="text-white">List smarter.</span>
            <br />
            <span className="bg-gradient-to-r from-[#3ea8ff] via-[#22d3ee] to-[#4ade80] bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(34,211,238,0.4)]">
              Buy safer.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300/90 max-w-2xl mx-auto mb-8">
            AI-powered listing studio and buyer protection for eBay and Vinted.
            Photos → listing in under 30 seconds. Paste a URL → risk report instantly.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white border-0 px-8 shadow-[0_0_40px_-8px_rgba(34,211,238,0.7)]"
            >
              <Link href="/studio/new">Start listing free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cyan-700/60 text-cyan-100 hover:text-white hover:bg-cyan-950/40 px-8"
            >
              <Link href="/guard/new">Check a listing</Link>
            </Button>
          </div>
          <p className="text-sm text-zinc-500 mt-3">No credit card needed · First 3 listings free</p>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-cyan-800/30 bg-cyan-950/20 py-4 px-3 backdrop-blur"
              >
                <p className="text-2xl font-extrabold text-cyan-300">{s.value}</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Lens ticker */}
          <div className="mt-8 flex items-center justify-center gap-3 opacity-70">
            <BrandGlyph size={24} animated showSparks={false} />
            <span className="font-mono-hud text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">
              ShoeLens · LPLens · TechLens · BookLens · AntiquesLens · AutographLens
            </span>
          </div>
        </div>

        <div className="hud-divider absolute inset-x-0 bottom-0 opacity-50" />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-2">How it works</h2>
          <p className="text-center text-zinc-400 mb-12">
            From photos to a publish-ready listing in three steps.
          </p>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-9 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gradient-to-r from-cyan-500/30 via-violet-500/30 to-emerald-500/30" />

            {HOW_IT_WORKS.map((step) => {
              const ringColor =
                step.accent === "cyan"
                  ? "border-cyan-500/50 shadow-[0_0_24px_-8px_rgba(34,211,238,0.5)]"
                  : step.accent === "violet"
                  ? "border-violet-500/50 shadow-[0_0_24px_-8px_rgba(139,92,246,0.5)]"
                  : "border-emerald-500/50 shadow-[0_0_24px_-8px_rgba(74,222,128,0.5)]";
              const numColor =
                step.accent === "cyan"
                  ? "text-cyan-400"
                  : step.accent === "violet"
                  ? "text-violet-400"
                  : "text-emerald-400";
              return (
                <div key={step.step} className="flex flex-col items-center text-center">
                  <div
                    className={`relative w-16 h-16 rounded-full border-2 bg-[#040a14] flex items-center justify-center text-2xl mb-5 ${ringColor}`}
                  >
                    {step.icon}
                    <span
                      className={`absolute -top-2 -right-2 text-[10px] font-mono-hud font-bold ${numColor} bg-[#040a14] px-1 rounded`}
                    >
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-[220px]">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Two tools. One trust layer.</h2>
          <p className="text-center text-zinc-400 mb-14">
            Studio for sellers who want to list fast. Guard for buyers who want to buy safely.
          </p>
          <div className="grid md:grid-cols-2 gap-8">

            {/* Studio */}
            <div className="brand-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-[0_0_28px_-4px_rgba(34,211,238,0.7)]">
                  📸
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">ListLens Studio</h3>
                  <p className="text-zinc-400 text-sm">For sellers — list faster, list better</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {FEATURES_STUDIO.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="text-cyan-400 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 px-4 py-3 mb-5 text-xs text-cyan-300/80 font-mono-hud uppercase tracking-widest">
                Photos → Title · Desc · Bullets · Price · Flags
              </div>
              <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-500">
                <Link href="/studio/new">Create a listing →</Link>
              </Button>
            </div>

            {/* Guard */}
            <div className="brand-card brand-card-violet p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xl shadow-[0_0_28px_-4px_rgba(139,92,246,0.7)]">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">ListLens Guard</h3>
                  <p className="text-zinc-400 text-sm">For buyers — know before you bid</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {FEATURES_GUARD.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="text-violet-400 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border border-violet-900/50 bg-violet-950/20 px-4 py-3 mb-5 text-xs text-violet-300/80 font-mono-hud uppercase tracking-widest">
                URL → Risk · Flags · Score · Questions · Price
              </div>
              <Button asChild className="w-full bg-violet-600 hover:bg-violet-500">
                <Link href="/guard/new">Check a listing →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Specialist Lenses */}
      <section id="lenses" className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Specialist Lenses</h2>
          <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
            Each Lens knows its category deeply — the photos that matter, the fields that sell, and the red flags that protect.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {LENSES.map((lens) => (
              <div
                key={lens.name}
                className={`rounded-xl border p-4 text-center transition-all ${
                  lens.status === "live"
                    ? "border-cyan-700/60 bg-cyan-950/30 shadow-[0_0_28px_-12px_rgba(34,211,238,0.6)] hover:shadow-[0_0_32px_-8px_rgba(34,211,238,0.8)] hover:border-cyan-600/80 transition-shadow cursor-default"
                    : "border-zinc-800/80 bg-zinc-900/40 opacity-60"
                }`}
              >
                <div className="text-3xl mb-2">{lens.icon}</div>
                <p className="font-semibold text-sm text-white">{lens.name}</p>
                <p className="text-xs text-zinc-400 mt-1 leading-tight">{lens.desc}</p>
                <div className="mt-2.5">
                  {lens.status === "live" && (
                    <span className="inline-block text-[10px] bg-cyan-900/80 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-700/50">
                      Live
                    </span>
                  )}
                  {lens.status === "soon" && (
                    <span className="inline-block text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      Coming soon
                    </span>
                  )}
                  {lens.status === "later" && (
                    <span className="inline-block text-[10px] bg-zinc-900 text-zinc-600 px-2 py-0.5 rounded-full">
                      Planned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-600 mt-8 font-mono-hud uppercase tracking-widest">
            More Lenses shipping quarterly · Request a category
          </p>
        </div>
      </section>

      {/* Trust / Safety */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full border border-amber-800/50 bg-amber-950/30">
            <span className="text-amber-400 text-sm">⚠</span>
            <span className="text-sm text-amber-300 font-medium">Responsible AI language</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">We never over-claim. Ever.</h2>
          <p className="text-zinc-400 mb-8">
            Guard is an AI-assisted risk screen, not a formal authentication service.
            Every report is calibrated to inform, never to accuse.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-5">
              <p className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <span>✗</span> We never say
              </p>
              <ul className="space-y-2.5 text-sm text-red-300/80">
                {TRUST_NEVER.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-red-600 shrink-0 mt-0.5">—</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
              <p className="text-xs font-semibold text-emerald-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <span>✓</span> We always say
              </p>
              <ul className="space-y-2.5 text-sm text-emerald-300/80">
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

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Simple pricing</h2>
          <p className="text-center text-zinc-400 mb-12">Start free. Scale when you're ready.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`brand-card p-6 flex flex-col ${plan.accentClass}`}
              >
                {plan.highlight && (
                  <div className="text-xs font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
                    ★ Most popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-2 mb-1 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-zinc-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-zinc-500 text-sm mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-cyan-400 shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${
                    plan.highlight
                      ? "bg-gradient-to-r from-cyan-500 to-violet-600 border-0 shadow-[0_0_24px_-6px_rgba(34,211,238,0.6)]"
                      : ""
                  }`}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-600 mt-8">
            All plans include listing history · No hidden fees · Cancel anytime
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div className="h-64 w-64 rounded-full bg-cyan-500/8 blur-[60px]" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <BrandGlyph size={44} animated showSparks className="mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to list smarter?
          </h2>
          <p className="text-zinc-400 mb-8">
            No credit card. No commitment. Your first three listings are completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white border-0 px-10 shadow-[0_0_40px_-8px_rgba(34,211,238,0.7)]"
            >
              <Link href="/studio/new">Start listing free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cyan-700/60 text-cyan-100 hover:text-white hover:bg-cyan-950/40 px-8"
            >
              <Link href="/guard/new">Run a Guard check</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-400/10 py-10 px-4">
        <div className="hud-divider mb-8 opacity-30" />
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BrandGlyph size={20} />
                <BrandWordmark layout="inline" size="sm" />
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed">
                AI resale trust layer for eBay &amp; Vinted.
                <br />UK-first · Evidence-led · Responsible AI.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Tools</p>
              <div className="flex flex-col gap-2">
                <Link href="/studio/new" className="text-sm text-zinc-500 hover:text-white transition-colors">Studio — list an item</Link>
                <Link href="/guard/new" className="text-sm text-zinc-500 hover:text-white transition-colors">Guard — check a listing</Link>
                <Link href="/history" className="text-sm text-zinc-500 hover:text-white transition-colors">History</Link>
                <Link href="/billing" className="text-sm text-zinc-500 hover:text-white transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Legal</p>
              <div className="flex flex-col gap-2">
                <Link href="/legal/terms" className="text-sm text-zinc-500 hover:text-white transition-colors">Terms of use</Link>
                <Link href="/legal/privacy" className="text-sm text-zinc-500 hover:text-white transition-colors">Privacy policy</Link>
                <Link href="/legal/ai-disclaimer" className="text-sm text-zinc-500 hover:text-white transition-colors">AI disclaimer</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-600 text-xs">© 2026 Mr.FLENS · List-LENS. All rights reserved.</p>
            <p className="text-zinc-700 text-xs font-mono-hud uppercase tracking-widest">AI · Evidence · Confidence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
