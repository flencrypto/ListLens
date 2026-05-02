import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, ShieldCheck, CheckCircle2, Music, Watch, Book,
  Gamepad2, Tag, AlertTriangle, Search, RotateCcw, ChevronRight,
  Timer
} from "lucide-react";
import "./_group.css";

const TIMINGS = [1400, 2200, 3000];

function useElapsed(running: boolean) {
  const [ms, setMs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setMs((m) => m + 100), 100);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);
  return ms;
}

export default function ToolFirstB() {
  const [step, setStep] = useState(0);
  const elapsed = useElapsed(step >= 2 && step < 3);

  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep((s) => s + 1), TIMINGS[step]);
    return () => clearTimeout(t);
  }, [step]);

  const handleReplay = () => {
    setStep(0);
  };

  const displayTime = step === 3 ? "00:28" : `00:${String(Math.floor(elapsed / 1000)).padStart(2, "0")}`;

  return (
    <div className="min-h-[100dvh] bg-[#030912] text-white font-sans flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#030912]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#22d3ee] to-[#8b5cf6] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight whitespace-nowrap">Mr.FLENS · List-LENS</span>
          </div>
          <Button size="sm" className="bg-white text-[#030912] hover:bg-gray-100 rounded-full px-5 font-semibold text-sm">
            Sign up free
          </Button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col">

        {/* Hero — copy above, full-width simulator below */}
        <section className="pt-14 pb-0 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center mb-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 border border-[#22d3ee]/25 text-[#22d3ee] rounded-full px-3.5 py-1 text-xs font-semibold mb-5 bg-[#22d3ee]/6">
              <Timer className="w-3 h-3" /> Your listing in under 30 seconds
            </div>
            <h1 className="text-5xl md:text-[4rem] font-extrabold tracking-tight mb-3 leading-[1.05]">
              Drop photos.<br />Get a listing.
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Specialist AI reads your item, prices it against live market data, and writes the listing for you.
            </p>
          </div>

          {/* Wide simulator — bleeds to edge */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-t-2xl overflow-hidden border border-white/10 border-b-0 shadow-[0_-16px_64px_rgba(34,211,238,0.07)] animate-slide-up" style={{ animationDelay: "120ms" }}>

              {/* Simulator header bar */}
              <div className="h-11 bg-[#0c1828] border-b border-white/8 flex items-center px-5 gap-4">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-[#030912]/60 border border-white/6 rounded px-3 h-6 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]/50 shrink-0" />
                  <span className="text-[11px] text-slate-600 truncate">app.listlens.co · Studio · New listing</span>
                </div>
                {/* Timer */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Timer className={`w-3.5 h-3.5 ${step >= 2 && step < 3 ? "text-[#22d3ee] animate-pulse" : step === 3 ? "text-emerald-400" : "text-slate-600"}`} />
                  <span className={`text-xs font-mono font-bold tabular-nums ${step >= 2 && step < 3 ? "text-[#22d3ee]" : step === 3 ? "text-emerald-400" : "text-slate-600"}`}>
                    {step < 2 ? "00:00" : displayTime}
                  </span>
                </div>
                <Badge className="bg-[#22d3ee]/12 text-[#22d3ee] border border-[#22d3ee]/20 text-[11px] py-0 px-2.5 hover:bg-[#22d3ee]/12 shrink-0">
                  ShoeLens active
                </Badge>
              </div>

              <div className="grid md:grid-cols-[1fr_1.35fr] min-h-[500px] divide-x divide-white/8 bg-[#09111e]">

                {/* Left */}
                <div className="p-8 flex flex-col gap-8">

                  <div className={`transition-all duration-500 ${step >= 0 ? "opacity-100" : "opacity-20"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step 1 · Choose your Lens</span>
                      {step >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] text-sm font-semibold">
                        <Sparkles className="w-3.5 h-3.5" /> ShoeLens
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/3 border border-white/6 text-slate-500 text-sm opacity-50 cursor-default">
                        <Music className="w-3.5 h-3.5" /> RecordLens
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/3 border border-white/6 text-slate-500 text-sm opacity-50 cursor-default">
                        <Watch className="w-3.5 h-3.5" /> WatchLens
                      </button>
                    </div>
                  </div>

                  <div className={`transition-all duration-500 ${step >= 1 ? "opacity-100" : "opacity-15 blur-[1px]"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step 2 · Add photos</span>
                      {step >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {["/__mockup/images/shoe-mockup-1.png", "/__mockup/images/shoe-mockup-2.png"].map((src, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden relative bg-white/3 border border-white/6">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          {step >= 2 && (
                            <div className="absolute inset-0 bg-[#22d3ee]/6 flex items-center justify-center">
                              <div className="bg-[#030912]/85 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold text-[#22d3ee] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Processed
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`mt-auto transition-all duration-500 ${step >= 2 ? "opacity-100" : "opacity-15 blur-[1px]"}`}>
                    <Button
                      disabled={step < 2}
                      className="w-full py-5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] text-white border-0 hover:opacity-90 shadow-[0_4px_28px_rgba(34,211,238,0.18)]"
                    >
                      {step === 2 ? (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 animate-pulse" /> Generating…
                        </span>
                      ) : step === 3 ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Listing ready · 00:28
                        </span>
                      ) : (
                        "Generate listing"
                      )}
                    </Button>
                  </div>

                </div>

                {/* Right: output */}
                <div className="bg-[#050d1a] relative flex flex-col overflow-hidden">
                  {step < 3 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
                      {step === 2 ? (
                        <>
                          <div className="w-12 h-12 rounded-full border-[3px] border-white/6 border-t-[#22d3ee] animate-spin" />
                          <p className="text-sm text-[#22d3ee] font-semibold">Analysing photos & live market…</p>
                          <div className="flex gap-3 text-[11px] text-slate-600">
                            <span>✓ ShoeLens loaded</span>
                            <span>✓ Pricing data fetched</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-10 h-10 text-white/6" />
                          <p className="text-sm text-slate-600">Output appears here</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 space-y-5 overflow-y-auto max-h-[500px] fake-ui-scroll">

                      {/* Price */}
                      <div className="flex items-start justify-between bg-[#22d3ee]/8 border border-[#22d3ee]/18 rounded-xl p-4 animate-fade-in" style={{ animationDelay: "0ms" }}>
                        <div>
                          <p className="text-[#22d3ee] text-xs font-bold mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                            <Tag className="w-3.5 h-3.5" /> Market value
                          </p>
                          <div className="text-2xl font-extrabold">£145 – £165</div>
                          <p className="text-[11px] text-slate-500 mt-1">24 recent sales · high demand window</p>
                        </div>
                        <span className="text-xs font-bold bg-emerald-500 text-white rounded-full px-2.5 py-1 mt-0.5 shrink-0">↑ Hot</span>
                      </div>

                      {/* Listing strength */}
                      <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Listing strength</label>
                          <span className="text-xs font-bold text-emerald-400">82 / 100</span>
                        </div>
                        <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#22d3ee] to-emerald-400 rounded-full transition-all duration-1000"
                            style={{ width: "82%" }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600 mt-1.5">
                          <span>Title · Condition · Pricing · Photos</span>
                          <span className="text-amber-400">+size tag needed</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 block">Optimised title · 79 chars</label>
                        <div className="p-3.5 bg-white/4 border border-white/7 rounded-xl text-white font-semibold text-sm leading-snug">
                          Nike Air Jordan 1 Retro High OG 'Chicago' 2015 · UK 9 / US 10 · Excellent
                        </div>
                      </div>

                      {/* Description */}
                      <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 block">Generated description</label>
                        <div className="p-3.5 bg-white/4 border border-white/7 rounded-xl text-slate-300 text-xs leading-relaxed space-y-2">
                          <p><strong className="text-white">Condition:</strong> Excellent pre-owned. Minimal creasing to uppers; soles retain ~95% tread.</p>
                          <p><strong className="text-white">Authentication:</strong> 100% authentic 2015 'Chicago' colourway. Original box and spare laces included.</p>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/6 border border-amber-500/18 rounded-xl animate-fade-in" style={{ animationDelay: "400ms" }}>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-400 text-xs font-bold">Missing evidence</p>
                          <p className="text-[11px] text-amber-400/65 mt-0.5">A size-tag photo would push your listing strength to 95+.</p>
                        </div>
                      </div>

                      <Button className="w-full bg-white text-[#030912] hover:bg-gray-100 rounded-xl font-bold text-sm py-5 animate-fade-in" style={{ animationDelay: "500ms" }}>
                        Export to eBay <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>

                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Replay — flush under simulator */}
          <div className="max-w-5xl mx-auto border border-t-0 border-white/10 bg-[#040c17] rounded-b-2xl px-8 py-4 flex items-center justify-between animate-slide-up" style={{ animationDelay: "200ms" }}>
            <span className="text-xs text-slate-600">No sign-up required · First 3 listings free</span>
            <button
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Replay
            </button>
          </div>

        </section>

        {/* Platform split */}
        <section className="py-20 mt-8 border-t border-white/5 bg-gradient-to-b from-[#030912] to-[#09111e]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Studio is half the picture.</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm">List-LENS serves both sides of resale — sellers building great listings, and buyers checking them.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {[
                {
                  icon: Sparkles,
                  color: "text-[#22d3ee]",
                  bg: "bg-[#22d3ee]/10",
                  border: "border-[#22d3ee]/15 hover:border-[#22d3ee]/30",
                  title: "Studio",
                  role: "For sellers",
                  points: ["AI identifies brand, model, condition from photos", "Market-priced titles and full descriptions", "Exports directly to eBay, Depop, Vinted"],
                  cta: "Start listing",
                  ctaStyle: "bg-[#22d3ee] text-[#030912] hover:bg-[#22d3ee]/90 font-bold",
                },
                {
                  icon: ShieldCheck,
                  color: "text-[#8b5cf6]",
                  bg: "bg-[#8b5cf6]/10",
                  border: "border-[#8b5cf6]/15 hover:border-[#8b5cf6]/30",
                  title: "Guard",
                  role: "For buyers",
                  points: ["Paste a URL or upload photos to check any listing", "AI reads stitching, tags, and seller history", "Probabilistic risk score — never just pass/fail"],
                  cta: "Check a listing",
                  ctaStyle: "bg-[#8b5cf6] text-white hover:bg-[#8b5cf6]/90 font-bold",
                },
              ].map(({ icon: Icon, color, bg, border, title, role, points, cta, ctaStyle }) => (
                <div key={title} className={`bg-[#09111e] border ${border} rounded-2xl p-8 flex flex-col gap-5 transition-colors`}>
                  <div>
                    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="mb-3">
                      <span className="font-extrabold text-xl text-white">{title}</span>
                      <span className="text-slate-500 text-sm ml-2">{role}</span>
                    </div>
                    <ul className="space-y-2">
                      {points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className={`mt-auto rounded-xl py-5 text-sm ${ctaStyle}`}>
                    {cta} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lenses strip */}
        <section className="py-16 bg-[#030912] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">10 specialist Lenses</h2>
                <p className="text-slate-500 text-sm mt-1">Domain-specific AI for every category of resale.</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/12 text-slate-400 hover:bg-white/6 shrink-0">
                Browse all Lenses
              </Button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { name: "ShoeLens", icon: Sparkles, color: "text-[#22d3ee] border-[#22d3ee]/25 bg-[#22d3ee]/8", live: true },
                { name: "RecordLens", icon: Music, color: "text-orange-400 border-orange-400/25 bg-orange-400/8", live: true },
                { name: "TechLens", icon: Gamepad2, color: "text-green-400 border-green-400/25 bg-green-400/8", live: true },
                { name: "BookLens", icon: Book, color: "text-yellow-400 border-yellow-400/25 bg-yellow-400/8", live: true },
                { name: "WatchLens", icon: Watch, color: "text-blue-400 border-blue-400/25 bg-blue-400/8", live: true },
                { name: "AntiquesLens", icon: Search, color: "text-stone-400 border-stone-400/25 bg-stone-400/8", live: true },
                { name: "CardLens", icon: Search, color: "text-slate-600 border-white/8 bg-white/3", live: false },
                { name: "ClothingLens", icon: Search, color: "text-slate-600 border-white/8 bg-white/3", live: false },
                { name: "AutoLens", icon: Search, color: "text-slate-600 border-white/8 bg-white/3", live: false },
                { name: "ToyLens", icon: Search, color: "text-slate-600 border-white/8 bg-white/3", live: false },
              ].map((l) => (
                <div key={l.name} className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-semibold ${l.color} ${!l.live ? "opacity-45" : "cursor-pointer hover:opacity-80 transition-opacity"}`}>
                  <l.icon className="w-3.5 h-3.5" />
                  {l.name}
                  {!l.live && <span className="text-[10px] font-normal opacity-70">soon</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 bg-gradient-to-b from-[#09111e] to-[#030912]">
          <div className="max-w-xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">First 3 listings, on us.</h2>
            <p className="text-slate-400 mb-8">No credit card required. Start listing in under a minute.</p>
            <Button className="bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] text-white font-bold px-10 py-6 rounded-full shadow-[0_4px_28px_rgba(34,211,238,0.2)] hover:opacity-90 text-base">
              Get started free <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
}
