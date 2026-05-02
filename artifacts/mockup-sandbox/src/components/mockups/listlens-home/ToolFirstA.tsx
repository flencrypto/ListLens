import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Sparkles, ShieldCheck, CheckCircle2, Zap, Music, Watch, Book,
  Gamepad2, Tag, AlertTriangle, Search, RotateCcw, ChevronRight
} from "lucide-react";
import "./_group.css";

const STEPS = [0, 1, 2, 3];
const TIMINGS = [1200, 2000, 2800];

export default function ToolFirstA() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep((s) => s + 1), TIMINGS[step]);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="min-h-[100dvh] bg-[#040a14] text-white font-sans flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#040a14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#22d3ee] to-[#8b5cf6] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight whitespace-nowrap">Mr.FLENS · List-LENS</span>
          </div>
          <Button size="sm" className="bg-white text-[#040a14] hover:bg-gray-100 rounded-full px-5 font-semibold text-sm">
            Sign up free
          </Button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col">

        {/* Hero */}
        <section className="relative pt-16 pb-10 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(34,211,238,0.08),transparent)] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">

            <div className="text-center mb-10 animate-slide-up">
              <div className="inline-flex items-center gap-2 border border-[#22d3ee]/30 text-[#22d3ee] bg-[#22d3ee]/8 rounded-full px-4 py-1 text-sm mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Try Studio — no sign-up needed
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-[1.08]">
                Watch the AI build<br />your listing.
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                Select a Lens, drop in photos — and get a market-priced, platform-ready listing in under 30 seconds.
              </p>
            </div>

            {/* Fake browser */}
            <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(34,211,238,0.08)] animate-slide-up" style={{ animationDelay: "150ms" }}>

              {/* Browser chrome */}
              <div className="h-10 bg-[#0f1928] border-b border-white/8 flex items-center px-4 gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-[#040a14]/60 border border-white/8 rounded-md h-6 flex items-center px-3 gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-[#22d3ee]/60 shrink-0" />
                  <span className="text-xs text-slate-500 truncate">app.listlens.co · Studio</span>
                </div>
                <Badge className="bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/25 text-xs py-0 px-2 font-medium hover:bg-[#22d3ee]/15 shrink-0">
                  ShoeLens
                </Badge>
              </div>

              <div className="grid md:grid-cols-[1fr_1.2fr] min-h-[480px] divide-x divide-white/8 bg-[#0a1222]">

                {/* Left: steps */}
                <div className="p-7 flex flex-col gap-7">

                  {/* Step 1 */}
                  <div className={`transition-all duration-500 ${step >= 0 ? "opacity-100" : "opacity-25"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">1 · Select Lens</span>
                      {step >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22d3ee]/12 border border-[#22d3ee]/30 text-[#22d3ee] text-sm font-medium">
                        <Sparkles className="w-3.5 h-3.5" /> ShoeLens
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-slate-500 text-sm opacity-50 cursor-default">
                        <Music className="w-3.5 h-3.5" /> RecordLens
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-slate-500 text-sm opacity-50 cursor-default">
                        <Watch className="w-3.5 h-3.5" /> WatchLens
                      </button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`transition-all duration-500 ${step >= 1 ? "opacity-100" : "opacity-20 blur-[1px]"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">2 · Add Photos</span>
                      {step >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {["/__mockup/images/shoe-mockup-1.png", "/__mockup/images/shoe-mockup-2.png"].map((src, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden relative bg-white/4 border border-white/8">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          {step >= 2 && (
                            <div className="absolute inset-0 bg-[#22d3ee]/8 flex items-center justify-center">
                              <div className="bg-[#040a14]/85 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#22d3ee] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Processed
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Generate */}
                  <div className={`mt-auto transition-all duration-500 ${step >= 2 ? "opacity-100" : "opacity-20 blur-[1px]"}`}>
                    <Button
                      disabled={step < 2}
                      className="w-full py-5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] text-white border-0 hover:opacity-90 shadow-[0_4px_24px_rgba(34,211,238,0.2)]"
                    >
                      {step === 2 ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 animate-pulse" /> Generating listing…
                        </span>
                      ) : step === 3 ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Listing ready
                        </span>
                      ) : (
                        "Generate listing"
                      )}
                    </Button>
                  </div>

                </div>

                {/* Right: output */}
                <div className="bg-[#060e1c] relative flex flex-col overflow-hidden">
                  {step < 3 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
                      {step === 2 ? (
                        <>
                          <div className="w-12 h-12 rounded-full border-[3px] border-white/8 border-t-[#22d3ee] animate-spin" />
                          <p className="text-sm text-[#22d3ee] font-medium">Analysing photos & market data…</p>
                          <p className="text-xs text-slate-600">Checking 24 recent sales · Reading condition signals</p>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-10 h-10 text-white/8" />
                          <p className="text-sm text-slate-600">Output will appear here</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-7 space-y-5 overflow-y-auto max-h-[480px] fake-ui-scroll">

                      {/* Price */}
                      <div className="flex items-start justify-between bg-[#22d3ee]/8 border border-[#22d3ee]/20 rounded-xl p-4 animate-fade-in" style={{ animationDelay: "0ms" }}>
                        <div>
                          <p className="text-[#22d3ee] text-xs font-bold mb-1.5 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" /> Market Value Estimate
                          </p>
                          <div className="text-2xl font-extrabold text-white">£145 – £165</div>
                          <p className="text-[11px] text-slate-500 mt-1">Based on 24 recent sales · High demand</p>
                        </div>
                        <span className="text-xs font-bold bg-[#22d3ee] text-[#040a14] rounded-full px-2.5 py-1 mt-0.5 shrink-0">↑ Hot</span>
                      </div>

                      {/* Title */}
                      <div className="animate-fade-in" style={{ animationDelay: "120ms" }}>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 block">Optimised title · 79 chars</label>
                        <div className="p-3.5 bg-white/4 border border-white/8 rounded-xl text-white font-semibold text-sm leading-snug">
                          Nike Air Jordan 1 Retro High OG 'Chicago' 2015 · UK 9 / US 10 · Excellent
                        </div>
                      </div>

                      {/* Item specifics */}
                      <div className="animate-fade-in" style={{ animationDelay: "220ms" }}>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 block">Item specifics</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ["Brand", "Nike"],
                            ["Model", "Air Jordan 1"],
                            ["Colourway", "Chicago"],
                            ["Size (UK)", "9"],
                            ["Condition", "Excellent"],
                            ["Year", "2015"],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-white/4 border border-white/6 rounded-lg px-3 py-2">
                              <div className="text-[10px] text-slate-600 font-medium">{k}</div>
                              <div className="text-xs text-white font-semibold mt-0.5">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="animate-fade-in" style={{ animationDelay: "320ms" }}>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 block">Generated description</label>
                        <div className="p-3.5 bg-white/4 border border-white/8 rounded-xl text-slate-300 text-xs leading-relaxed space-y-2">
                          <p><strong className="text-white">Condition:</strong> Excellent pre-owned. Uppers show minimal creasing; soles retain 95% tread with slight heel drag.</p>
                          <p><strong className="text-white">Included:</strong> Original box and spare laces.</p>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/8 border border-amber-500/20 rounded-xl animate-fade-in" style={{ animationDelay: "420ms" }}>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-400 text-xs font-bold">Missing evidence</p>
                          <p className="text-[11px] text-amber-400/70 mt-0.5">Add a size-tag photo to improve buyer trust score.</p>
                        </div>
                      </div>

                      <Button className="w-full bg-white text-[#040a14] hover:bg-gray-100 rounded-xl font-bold text-sm py-5 animate-fade-in" style={{ animationDelay: "500ms" }}>
                        Export to eBay <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>

                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Replay */}
            <button
              onClick={() => setStep(0)}
              className="mt-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay demo
            </button>

          </div>
        </section>

        {/* What just happened */}
        <section className="py-20 border-t border-white/5 bg-gradient-to-b from-[#040a14] to-[#0a1222]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">What just happened?</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                That was Studio. It's one half of List-LENS — built for both sides of resale.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Sparkles,
                  color: "text-[#22d3ee]",
                  bg: "bg-[#22d3ee]/10",
                  accent: "border-[#22d3ee]/20",
                  title: "Studio",
                  sub: "For sellers",
                  desc: "Turn 3 photos into a high-converting listing in under 30 seconds.",
                  points: [
                    "AI detects brand, model, and condition",
                    "SEO-optimised titles and rich descriptions",
                    "Instant market valuation and pricing",
                  ],
                },
                {
                  icon: ShieldCheck,
                  color: "text-[#8b5cf6]",
                  bg: "bg-[#8b5cf6]/10",
                  accent: "border-[#8b5cf6]/20",
                  title: "Guard",
                  sub: "For buyers",
                  desc: "Paste a URL or upload photos to verify authenticity instantly.",
                  points: [
                    "Deep AI analysis of stitching, tags, materials",
                    "Flags missing evidence and high-risk sellers",
                    "Probabilistic risk report — never just pass/fail",
                  ],
                },
              ].map(({ icon: Icon, color, bg, accent, title, sub, desc, points }) => (
                <div key={title} className={`bg-[#0a1222] border border-white/8 rounded-2xl p-8 hover:border-white/15 transition-colors`}>
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-5`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="mb-1">
                    <span className="font-extrabold text-xl text-white">{title}</span>
                    <span className="text-slate-500 text-sm ml-2 font-normal">{sub}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-5">{desc}</p>
                  <ul className="space-y-2.5">
                    {points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lenses */}
        <section className="py-20 bg-[#040a14]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">10 specialist Lenses</h2>
                <p className="text-slate-400 text-sm max-w-md">Generic AI doesn't know a 1985 Chicago from a 2015 Retro. Our Lenses do.</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/15 text-slate-300 hover:bg-white/8 shrink-0">
                View all Lenses
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: "ShoeLens", icon: Sparkles, color: "text-[#22d3ee]", bg: "bg-[#22d3ee]/10", live: true },
                { name: "RecordLens", icon: Music, color: "text-orange-400", bg: "bg-orange-400/10", live: true },
                { name: "TechLens", icon: Gamepad2, color: "text-green-400", bg: "bg-green-400/10", live: true },
                { name: "BookLens", icon: Book, color: "text-yellow-400", bg: "bg-yellow-400/10", live: true },
                { name: "WatchLens", icon: Watch, color: "text-blue-400", bg: "bg-blue-400/10", live: true },
                { name: "AntiquesLens", icon: Search, color: "text-stone-400", bg: "bg-stone-400/10", live: true },
                { name: "CardLens", icon: Search, color: "text-slate-500", bg: "bg-white/4", live: false },
                { name: "ClothingLens", icon: Search, color: "text-slate-500", bg: "bg-white/4", live: false },
                { name: "AutoLens", icon: Search, color: "text-slate-500", bg: "bg-white/4", live: false },
                { name: "ToyLens", icon: Search, color: "text-slate-500", bg: "bg-white/4", live: false },
              ].map((lens) => (
                <div
                  key={lens.name}
                  className={`bg-[#0a1222] border rounded-xl p-4 flex flex-col items-center text-center gap-3 transition-colors ${lens.live ? "border-white/8 hover:border-white/18 cursor-pointer" : "border-white/4 opacity-50"}`}
                >
                  <div className={`w-10 h-10 rounded-full ${lens.bg} flex items-center justify-center`}>
                    <lens.icon className={`w-5 h-5 ${lens.color}`} />
                  </div>
                  <div className="text-sm font-semibold text-white leading-tight">{lens.name}</div>
                  {!lens.live && <span className="text-[10px] text-slate-600 font-medium">Coming soon</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 bg-gradient-to-b from-[#0a1222] to-[#040a14] border-t border-white/5">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Ready to build your first listing?</h2>
            <p className="text-slate-400 mb-8">No credit card required. First 3 listings are free.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button className="bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] text-white font-bold px-8 py-6 rounded-full shadow-[0_4px_24px_rgba(34,211,238,0.2)] hover:opacity-90">
                Start listing free <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline" className="border-white/15 text-slate-300 hover:bg-white/8 rounded-full px-8 py-6">
                Check a listing
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
