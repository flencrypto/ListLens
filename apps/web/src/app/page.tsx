import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LENSES = [
  { name: "ShoeLens", icon: "👟", desc: "Trainers, sneakers, shoes", status: "live" },
  { name: "LPLens", icon: "🎵", desc: "Vinyl, CDs, cassettes", status: "soon" },
  { name: "WatchLens", icon: "⌚", desc: "Watches & timepieces", status: "later" },
  { name: "MotorLens", icon: "🚗", desc: "Vehicles & parts", status: "later" },
  { name: "CardLens", icon: "🃏", desc: "Trading & sports cards", status: "soon" },
  { name: "ToyLens", icon: "🧸", desc: "Toys, LEGO, figures", status: "soon" },
];

const FEATURES_STUDIO = [
  "Upload 3–8 photos and get an AI-drafted listing",
  "Title, description, bullet points, item specifics",
  "Quick sale / recommended / high price ranges",
  "Missing evidence warnings before you list",
  "One-click Vinted export or eBay draft payload",
];

const FEATURES_GUARD = [
  "Paste a listing URL or upload screenshots",
  "AI risk report: low / medium / high / inconclusive",
  "Red flags with severity — missing photos, price anomalies",
  "Suggested questions to ask the seller",
  "Safe trust language — never over-claims authenticity",
];

const PRICING = [
  {
    name: "Free trial",
    price: "£0",
    period: "",
    desc: "First 3 listings",
    features: ["3 Studio listings", "ShoeLens", "Vinted export"],
    cta: "Start free",
    href: "/dashboard",
    highlight: false,
  },
  {
    name: "Studio Starter",
    price: "£9.99",
    period: "/month",
    desc: "For casual sellers",
    features: ["Unlimited listings", "eBay + Vinted export", "ShoeLens + LPLens", "Listing history"],
    cta: "Get Starter",
    href: "/billing",
    highlight: true,
  },
  {
    name: "Guard",
    price: "£1.99",
    period: "/check",
    desc: "Or £6.99/mo for 10",
    features: ["Full risk report", "Red flags + evidence gaps", "Seller questions", "PDF export"],
    cta: "Check a listing",
    href: "/guard/new",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Nav */}
      <nav className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
            ListLens
          </span>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Features</Link>
            <Link href="#lenses" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Lenses</Link>
            <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Pricing</Link>
            <Link href="/dashboard">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-violet-950/30 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-cyan-950 text-cyan-400 border border-cyan-800/50">
            UK-first AI resale platform
          </Badge>
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-white">List smarter.</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              Buy safer.
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            AI-powered listing studio and buyer protection for eBay and Vinted.
            Photos → listing in seconds. Paste a URL → risk report instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/studio/new">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white border-0 px-8">
                Start listing free
              </Button>
            </Link>
            <Link href="/guard/new">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white px-8">
                Check a listing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-zinc-500 mt-4">No credit card needed · First 3 listings free</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-14">Two tools. One trust layer.</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Studio */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg">
                  📸
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">ListLens Studio</h3>
                  <p className="text-zinc-400 text-sm">For sellers</p>
                </div>
              </div>
              <ul className="space-y-3">
                {FEATURES_STUDIO.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="text-cyan-400 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/studio/new">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-500">Create a listing</Button>
                </Link>
              </div>
            </div>

            {/* Guard */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">ListLens Guard</h3>
                  <p className="text-zinc-400 text-sm">For buyers</p>
                </div>
              </div>
              <ul className="space-y-3">
                {FEATURES_GUARD.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="text-violet-400 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/guard/new">
                  <Button className="w-full bg-violet-600 hover:bg-violet-500">Check a listing</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialist Lenses */}
      <section id="lenses" className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Specialist Lenses</h2>
          <p className="text-center text-zinc-400 mb-12">
            Category-specific intelligence. Every lens knows the right photos, fields, and red flags for its niche.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {LENSES.map((lens) => (
              <div
                key={lens.name}
                className={`rounded-xl border p-4 text-center ${
                  lens.status === "live"
                    ? "border-cyan-800/60 bg-cyan-950/30"
                    : "border-zinc-800 bg-zinc-900/40 opacity-70"
                }`}
              >
                <div className="text-3xl mb-2">{lens.icon}</div>
                <p className="font-semibold text-sm text-white">{lens.name}</p>
                <p className="text-xs text-zinc-400 mt-1">{lens.desc}</p>
                {lens.status === "live" && (
                  <span className="inline-block mt-2 text-[10px] bg-cyan-900 text-cyan-400 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                )}
                {lens.status === "soon" && (
                  <span className="inline-block mt-2 text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Safety */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-amber-800/50 bg-amber-950/30">
            <span className="text-amber-400">⚠</span>
            <span className="text-sm text-amber-300">Responsible AI language</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">We never over-claim. Ever.</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left mt-8">
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
              <p className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider">We never say</p>
              <ul className="space-y-2 text-sm text-red-300/80">
                <li>✗ "This is fake"</li>
                <li>✗ "Definitely counterfeit"</li>
                <li>✗ "This seller is a scammer"</li>
                <li>✗ "Guaranteed authentic"</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
              <p className="text-xs font-semibold text-emerald-400 mb-3 uppercase tracking-wider">We always say</p>
              <ul className="space-y-2 text-sm text-emerald-300/80">
                <li>✓ "High replica-risk indicators found"</li>
                <li>✓ "Authenticity cannot be confirmed"</li>
                <li>✓ "This listing is missing key evidence"</li>
                <li>✓ "AI-assisted risk screen, not formal authentication"</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Simple pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-cyan-700 bg-gradient-to-b from-cyan-950/50 to-zinc-900"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-semibold text-cyan-400 mb-3 uppercase tracking-wider">Most popular</div>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-zinc-400">{plan.period}</span>
                </div>
                <p className="text-zinc-500 text-sm mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-cyan-400 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className={`w-full ${plan.highlight ? "bg-gradient-to-r from-cyan-500 to-violet-600 border-0" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
            ListLens
          </span>
          <p className="text-zinc-500 text-sm">© 2025 ListLens. AI resale trust layer for eBay & Vinted.</p>
          <div className="flex gap-6">
            <Link href="/studio/new" className="text-sm text-zinc-400 hover:text-white transition-colors">Studio</Link>
            <Link href="/guard/new" className="text-sm text-zinc-400 hover:text-white transition-colors">Guard</Link>
            <Link href="/billing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
