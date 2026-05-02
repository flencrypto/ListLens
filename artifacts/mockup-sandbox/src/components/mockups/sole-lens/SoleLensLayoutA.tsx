import React, { useState } from "react";
import "./_group.css";

const fontSystem = {
  display: "[font-family:'Space_Grotesk','Inter',ui-sans-serif,system-ui,sans-serif]",
  mono: "[font-family:'JetBrains_Mono','SFMono-Regular',Consolas,monospace]",
};

const demoSneakers = [
  { id: "s1", name: "Dunk Low Retro", size: "UK 9", condition: "Excellent", maxValue: "£119", confidence: 98 },
  { id: "s2", name: "Handball Spezial", size: "UK 8.5", condition: "Good", maxValue: "£76", confidence: 94 },
  { id: "s3", name: "New Balance 2002R", size: "UK 10", condition: "Very Good", maxValue: "£154", confidence: 91 },
];

const captureSteps = ["Toe", "Side", "Sole", "Label"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    neutral: "border-white/10 bg-white/5 text-white/65",
  };
  return (
    <span className={cx(fontSystem.mono, "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]", tones[tone])}>
      {children}
    </span>
  );
}

function SneakerSilhouette() {
  return (
    <div className="relative h-20 w-44 rounded-[55%_45%_45%_55%] bg-white/10 shadow-2xl shadow-cyan-400/10">
      <div className="absolute -left-2 bottom-1 h-9 w-12 rounded-[60%_45%_45%_55%] bg-white/10" />
      <div className="absolute bottom-2 left-6 right-4 h-7 rounded-full bg-white/15" />
      <div className="absolute left-8 top-4 h-5 w-20 rounded-full bg-cyan-200/20" />
      <div className="absolute bottom-0 left-10 right-5 h-3 rounded-full bg-cyan-300/50" />
      <div className="absolute left-18 top-8 flex gap-1">
        {[0, 1, 2].map((l) => <span key={l} className="h-1 w-4 rotate-[-18deg] rounded-full bg-white/25" />)}
      </div>
    </div>
  );
}

function ScanViewMini() {
  return (
    <div className="relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,.08) 0 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="absolute inset-x-6 top-8 h-24 rounded-xl border border-dashed border-cyan-300/40" />
      <div className="absolute inset-0 grid place-items-center"><SneakerSilhouette /></div>
      <div className="absolute inset-x-6 top-8 h-[1px] bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.8)]" style={{ animation: "scan 2.5s ease-in-out infinite" }} />
      <div className="absolute left-3 top-3 flex gap-1.5">
        <Badge tone="green">Lens ready</Badge>
        <Badge tone="neutral">Auto crop</Badge>
      </div>
      <style>{`@keyframes scan { 0%,100% { top: 2rem } 50% { top: 7.5rem } }`}</style>
    </div>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[340px] rounded-[2.2rem] border border-white/15 bg-black/70 p-2.5 shadow-2xl shadow-cyan-500/10">
      <div className="absolute left-1/2 top-2.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="absolute inset-0 rounded-[2.2rem] bg-gradient-to-br from-white/10 via-transparent to-cyan-300/8" />
      <div className="relative min-h-[560px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#05070c]">
        {children}
      </div>
    </div>
  );
}

function AppPreview() {
  const [tab, setTab] = useState("scan");
  return (
    <PhoneShell>
      <div className="relative min-h-[560px] pb-20 text-white">
        <GlowBlob className="-top-16 right-0 h-40 w-40 bg-cyan-500/20" />

        {/* App header */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-8 pb-3">
          <div>
            <div className={cx(fontSystem.mono, "text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80")}>Mr.FLEN</div>
            <div className={cx(fontSystem.display, "mt-0.5 text-xl font-black tracking-[-0.04em]")}>SOLE-LENS™</div>
          </div>
          <div className="flex gap-1.5">
            {["bell", "menu"].map((b) => (
              <button key={b} className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {b === "bell" ? <><path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 px-4 space-y-3">
          {/* Hero notice */}
          <GlassPanel className="p-3" glow>
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-300 text-black">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h8l-1 8 11-13h-8l1-7z" /></svg>
              </div>
              <div>
                <div className={cx(fontSystem.display, "text-xs font-bold tracking-[-0.02em]")}>Scan trainers. Price them. List them.</div>
                <div className="text-[11px] text-white/50">Camera-first resale intelligence.</div>
              </div>
            </div>
          </GlassPanel>

          {/* Demo scan strip */}
          <div className="grid grid-cols-3 gap-1.5">
            {demoSneakers.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <div className={cx(fontSystem.display, "truncate text-[11px] font-black text-white/85")}>{item.name.split(" ").slice(0, 2).join(" ")}</div>
                <div className="mt-0.5 text-[9px] text-white/40">{item.size}</div>
                <div className={cx(fontSystem.display, "mt-1.5 text-xs font-black text-cyan-200")}>{item.maxValue}</div>
                <div className="text-[9px] text-white/35">{item.confidence}%</div>
              </div>
            ))}
          </div>

          {/* Scan viewport mini */}
          <ScanViewMini />

          {/* Capture progress */}
          <GlassPanel className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className={cx(fontSystem.display, "text-xs font-bold")}>Guided capture</div>
                <div className="text-[10px] text-white/40">Complete all angles.</div>
              </div>
              <div className="rounded-xl bg-cyan-300/10 px-2 py-1 text-right ring-1 ring-cyan-300/15">
                <div className={cx(fontSystem.display, "text-xs font-black text-cyan-200")}>1/4</div>
                <div className={cx(fontSystem.mono, "text-[8px] text-white/35 uppercase tracking-wider")}>Shots</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {captureSteps.map((step, i) => (
                <div key={step}>
                  <div className={cx("mb-1 h-1.5 rounded-full", i === 0 ? "bg-cyan-300" : "bg-white/15")} />
                  <div className={cx(fontSystem.mono, "text-[8px] uppercase tracking-wider", i === 0 ? "text-cyan-100" : "text-white/35")}>{step}</div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-2">
            <button className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-cyan-300 font-bold text-black text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5a1 1 0 011-1h2" /><path d="M17 4h2a1 1 0 011 1v2" /><path d="M20 17v2a1 1 0 01-1 1h-2" /><path d="M7 20H5a1 1 0 01-1-1v-2" /><path d="M7 12h10" /></svg>
              Scan now
            </button>
            <button className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 font-bold text-white text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
              Upload
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 px-3 py-2.5 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "scan", label: "Scan", path: "M14.5 4l1.4 2H20a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4.1l1.4-2h5z M12 13m-4 0a4 4 0 108 0 4 4 0 00-8 0" },
              { id: "result", label: "Result", path: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" },
              { id: "listing", label: "Listing", path: "M6 7h12l1 14H5L6 7z M9 7a3 3 0 016 0" },
              { id: "dash", label: "Dashboard", path: "M4 19V5 M4 19h16 M7 11h3v5H7z M12 7h3v9h-3z M17 9h3v7h-3z" },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={cx(fontSystem.display, "rounded-xl px-1 py-2 text-[10px] font-bold transition", tab === t.id ? "bg-cyan-400 text-black" : "bg-white/5 text-white/50")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-0.5"><path d={t.path} /></svg>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

export default function SoleLensLayoutA() {
  return (
    <div className={cx(fontSystem.display, "relative min-h-screen overflow-hidden bg-[#03050a] text-white")}>
      <GlowBlob className="left-1/2 -top-32 h-[500px] w-[500px] -translate-x-1/2 bg-cyan-500/15" />
      <GlowBlob className="bottom-0 right-0 h-80 w-80 bg-blue-600/10" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">

        {/* Back */}
        <a href="#" className="inline-flex items-center gap-1 mb-10 text-xs text-zinc-500 hover:text-cyan-300 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Home
        </a>

        {/* A: STACKED VERTICAL — hero copy centered above, phone centered, cards below */}

        {/* Top: centered copy */}
        <div className="text-center mb-12">
          <Badge tone="cyan">✦ AI resale operating system · vertical prototype</Badge>
          <h1 className={cx(fontSystem.display, "mt-5 text-5xl md:text-6xl font-black leading-[0.94] tracking-[-0.065em] max-w-3xl mx-auto")}>
            Turn a trainer photo into a sell-ready listing.
          </h1>
          <p className={cx(fontSystem.display, "mt-5 text-base leading-7 text-white/55 max-w-xl mx-auto")}>
            SOLE-LENS™ identifies sneakers, checks risk, prices against live comps and generates platform-ready listings with a camera-first UX.
          </p>
        </div>

        {/* Middle: phone centered */}
        <div className="flex justify-center mb-10">
          <AppPreview />
        </div>

        {/* Bottom: 3 hero cards */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { icon: "M14.5 4l1.4 2H20a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4.1l1.4-2h5z M12 13m-4 0a4 4 0 108 0 4 4 0 00-8 0", title: "Scan", text: "3 demo records" },
            { icon: "M12 2l9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 17l9 5 9-5", title: "Analyse", text: "4 live-style comps" },
            { icon: "M6 7h12l1 14H5L6 7z M9 7a3 3 0 016 0", title: "List", text: "3 marketplace drafts" },
          ].map((card) => (
            <GlassPanel key={card.title} className="p-5 hover:-translate-y-0.5 transition-transform hover:border-cyan-300/25 hover:bg-cyan-300/10 cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-cyan-300"><path d={card.icon} /></svg>
              <div className="font-black tracking-[-0.03em] text-sm">{card.title}</div>
              <div className="mt-0.5 text-xs text-white/45">{card.text}</div>
            </GlassPanel>
          ))}
        </div>

      </div>
    </div>
  );
}
