import React from "react";
import "./_group.css";

const fontSystem = {
  display: "[font-family:'Space_Grotesk','Inter',ui-sans-serif,system-ui,sans-serif]",
  mono: "[font-family:'JetBrains_Mono','SFMono-Regular',Consolas,monospace]",
};

const demoSneakers = [
  { id: "s1", name: "Dunk Low Retro", colourway: "Panda", size: "UK 9", condition: "Excellent", maxValue: "£119", quickSell: "£80", confidence: 98, demand: "High" },
  { id: "s2", name: "Handball Spezial", colourway: "Navy / Gum", size: "UK 8.5", condition: "Good", maxValue: "£76", quickSell: "£45", confidence: 94, demand: "Rising" },
  { id: "s3", name: "New Balance 2002R", colourway: "Rain Cloud", size: "UK 10", condition: "Very Good", maxValue: "£154", quickSell: "£90", confidence: 91, demand: "Collector" },
];

const comps = [
  { title: "Nike Dunk Low Panda UK 9", platform: "eBay Sold", price: "£102", match: 94 },
  { title: "Dunk Low Panda 2022 UK9", platform: "StockX Ref", price: "£116", match: 91 },
  { title: "Nike Dunk Panda UK9 Boxed", platform: "eBay Sold", price: "£124", match: 86 },
];

const captureSteps = ["Toe", "Side", "Sole", "Label"];

const qualityChecks = [
  { label: "Logo shape", status: "Matched", ok: true },
  { label: "Stitch pattern", status: "Clean", ok: true },
  { label: "Size label", status: "Needed", ok: false },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function GlowBlob({ className = "" }: { className?: string }) {
  return <div className={cx("pointer-events-none absolute rounded-full blur-3xl", className)} />;
}

function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    neutral: "border-white/10 bg-white/5 text-white/65",
    warn: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  };
  return (
    <span className={cx(fontSystem.mono, "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]", tones[tone])}>
      {children}
    </span>
  );
}

function SneakerSilhouette({ scale = 1 }: { scale?: number }) {
  const s = scale;
  return (
    <div className="relative" style={{ width: `${200 * s}px`, height: `${80 * s}px` }}>
      <div className="absolute inset-0 rounded-[55%_45%_45%_55%] bg-white/10 shadow-2xl shadow-cyan-400/10" />
      <div className="absolute rounded-[60%_45%_45%_55%] bg-white/10" style={{ left: `-${8 * s}px`, bottom: `${8 * s}px`, width: `${52 * s}px`, height: `${40 * s}px` }} />
      <div className="absolute rounded-full bg-white/15" style={{ bottom: `${10 * s}px`, left: `${28 * s}px`, right: `${16 * s}px`, height: `${28 * s}px` }} />
      <div className="absolute rounded-full bg-cyan-200/20" style={{ left: `${36 * s}px`, top: `${18 * s}px`, width: `${88 * s}px`, height: `${22 * s}px` }} />
      <div className="absolute rounded-full bg-cyan-300/50" style={{ bottom: 0, left: `${44 * s}px`, right: `${20 * s}px`, height: `${12 * s}px` }} />
    </div>
  );
}

// Panel A: Copy + headline
function CopyPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 flex flex-col justify-between h-full">
      <GlowBlob className="right-0 top-0 h-48 w-48 bg-cyan-500/12" />
      <div className="relative z-10">
        <Badge tone="cyan">✦ AI resale operating system · vertical prototype</Badge>
        <h1 className={cx(fontSystem.display, "mt-5 text-4xl font-black leading-[0.92] tracking-[-0.065em]")}>
          Turn a trainer photo into a sell-ready listing.
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/50 max-w-xs">
          SOLE-LENS™ identifies sneakers, checks risk, prices against live comps and generates platform-ready listings.
        </p>
      </div>
      <div className="relative z-10 mt-6 flex gap-2.5">
        <button className="flex items-center gap-2 rounded-2xl bg-cyan-300 px-4 py-2.5 font-black text-black text-sm shadow-lg shadow-cyan-300/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h8l-1 8 11-13h-8l1-7z" /></svg>
          Try SOLE-LENS
        </button>
        <button className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 font-bold text-white text-sm">
          See all Lenses
        </button>
      </div>
    </div>
  );
}

// Panel B: Scan viewport (flat, no phone chrome)
function ScanPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black h-full min-h-[220px]">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 50% 40%, rgba(34,211,238,.35), transparent 30%), linear-gradient(135deg, rgba(255,255,255,.07) 0 1px, transparent 1px)", backgroundSize: "100% 100%, 20px 20px" }} />
      <div className="absolute inset-x-10 top-14 h-[120px] rounded-2xl border-2 border-dashed border-cyan-300/40" />
      <div className="absolute inset-x-10 top-14 h-[1.5px] bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.9)]" style={{ animation: "scanC 2.6s ease-in-out infinite" }} />
      <div className="absolute inset-0 grid place-items-center pt-4">
        <SneakerSilhouette scale={0.85} />
      </div>
      <div className="absolute left-4 top-4 flex gap-2">
        <Badge tone="green">Lens ready</Badge>
        <Badge tone="neutral">Auto crop</Badge>
      </div>
      {/* Guided capture overlay */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className={cx(fontSystem.display, "text-xs font-bold")}>Guided capture</div>
            <div className="text-[10px] text-white/40">Complete all angles for stronger ID.</div>
          </div>
          <div className="rounded-xl bg-cyan-300/10 px-2 py-1 ring-1 ring-cyan-300/15 text-right">
            <div className={cx(fontSystem.display, "text-xs font-black text-cyan-200")}>1/4</div>
            <div className={cx(fontSystem.mono, "text-[8px] uppercase text-white/30")}>shots</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {captureSteps.map((step, i) => (
            <div key={step}>
              <div className={cx("mb-1 h-1 rounded-full", i === 0 ? "bg-cyan-300" : "bg-white/15")} />
              <div className={cx(fontSystem.mono, "text-[8px] uppercase tracking-wider", i === 0 ? "text-cyan-100" : "text-white/30")}>{step}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes scanC { 0%,100% { top: 3.5rem } 50% { top: 8rem } }`}</style>
    </div>
  );
}

// Panel C: Result / AI match card (no phone)
function ResultPanel() {
  const sneaker = demoSneakers[0];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 h-full">
      <GlowBlob className="-right-8 -top-8 h-28 w-28 bg-cyan-400/15" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge tone="cyan">✦ AI match found</Badge>
            <h3 className={cx(fontSystem.display, "mt-2.5 text-lg font-black tracking-[-0.04em] leading-tight")}>{sneaker.name}</h3>
            <p className="text-xs text-white/50 mt-0.5">{sneaker.colourway} · {sneaker.size}</p>
          </div>
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cyan-300/10 ring-1 ring-cyan-300/20">
            <div className="absolute inset-1 rounded-full border-[3px] border-cyan-300 border-b-white/10 border-r-white/10" />
            <div className="text-center">
              <div className={cx(fontSystem.display, "text-sm font-black text-cyan-100 leading-none")}>{sneaker.confidence}%</div>
              <div className={cx(fontSystem.mono, "text-[7px] uppercase tracking-wider text-cyan-100/50")}>Match</div>
            </div>
          </div>
        </div>

        {/* Sneaker silhouette inline */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 via-slate-500/5 to-cyan-400/8 p-4 mb-4 flex items-center justify-center">
          <SneakerSilhouette scale={0.7} />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-xl bg-black/50 p-2 backdrop-blur">
            <div>
              <div className={cx(fontSystem.display, "text-xs font-black")}>{sneaker.condition}</div>
              <div className="text-[10px] text-white/40">3 strong, 1 needed</div>
            </div>
            <Badge tone="green">Low risk</Badge>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Price range", value: "£85–£115" },
            { label: "Quick sell", value: sneaker.quickSell },
            { label: "Max value", value: sneaker.maxValue },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-white/10 bg-black/25 p-2.5">
              <div className={cx(fontSystem.display, "text-sm font-black text-white")}>{m.value}</div>
              <div className={cx(fontSystem.mono, "text-[9px] uppercase tracking-wider text-white/40 mt-0.5")}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Quality checks */}
        <div className="grid grid-cols-3 gap-1.5">
          {qualityChecks.map((c) => (
            <div key={c.label} className="rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c.ok ? "text-emerald-300" : "text-amber-300"}>
                {c.ok ? <><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></> : <><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>}
              </svg>
              <div className={cx(fontSystem.display, "mt-1.5 text-[10px] font-black text-white/75")}>{c.label}</div>
              <div className="text-[9px] text-white/40">{c.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Panel D: Live comps list
function CompsPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className={cx(fontSystem.mono, "text-[9px] uppercase tracking-widest text-white/35 mb-1")}>Pricing evidence</div>
          <h3 className={cx(fontSystem.display, "text-sm font-black tracking-[-0.03em]")}>Live comps</h3>
        </div>
        <Badge tone="cyan">4 matches</Badge>
      </div>
      <div className="space-y-2">
        {comps.map((comp) => (
          <div key={comp.title} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5 hover:border-cyan-300/20 hover:bg-cyan-300/5 transition-colors">
            <div className="min-w-0 pr-3">
              <div className="truncate text-xs font-semibold text-white/85">{comp.title}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40">
                <span>{comp.platform}</span>
                <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                <span>{comp.match}% fit</span>
              </div>
            </div>
            <div className={cx(fontSystem.display, "shrink-0 font-black text-cyan-200")}>{comp.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Panel E: Listing score + marketplace drafts
function ListingPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.04] p-5 h-full">
      <GlowBlob className="-left-8 -top-8 h-24 w-24 bg-cyan-400/15" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-black shadow-lg shadow-cyan-300/25">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 4l5 5" /><path d="M14 5l5 5-9 9-5-5 9-9z" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className={cx(fontSystem.display, "text-sm font-black tracking-[-0.03em]")}>Listing generated</div>
            <div className="text-[11px] text-white/50">SEO + item specifics ready.</div>
          </div>
          <div className="text-right">
            <div className={cx(fontSystem.display, "text-xl font-black text-cyan-200")}>92</div>
            <div className={cx(fontSystem.mono, "text-[8px] uppercase text-white/30 tracking-wider")}>Score</div>
          </div>
        </div>
        <div className="mb-4 h-1.5 rounded-full bg-white/10">
          <div className="h-full w-[92%] rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.4)]" />
        </div>

        <div className={cx(fontSystem.mono, "text-[9px] uppercase tracking-wider text-white/35 mb-2")}>Marketplace drafts</div>
        <div className="space-y-2">
          {[
            { platform: "eBay", price: "£109 BIN", fee: "12.8%", reach: "High", selected: true },
            { platform: "Vinted", price: "£89", fee: "Buyer-paid", reach: "Fast", selected: false },
            { platform: "Depop", price: "£99", fee: "10%", reach: "Style-led", selected: false },
          ].map((d) => (
            <div key={d.platform} className={cx("flex items-center justify-between rounded-2xl border p-3 transition", d.selected ? "border-cyan-300/30 bg-cyan-300/8" : "border-white/8 bg-white/[0.02]")}>
              <div>
                <div className={cx(fontSystem.display, "text-xs font-black")}>{d.platform}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{d.fee} fee · {d.reach}</div>
              </div>
              <div className="text-right">
                <div className={cx(fontSystem.display, "text-sm font-black text-cyan-200")}>{d.price}</div>
                {d.selected && <Badge tone="cyan">Selected</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SoleLensLayoutC() {
  return (
    <div className={cx(fontSystem.display, "relative min-h-screen overflow-hidden bg-[#03050a] text-white")}>
      <GlowBlob className="left-1/3 -top-40 h-[450px] w-[450px] bg-cyan-500/12" />
      <GlowBlob className="bottom-0 right-0 h-80 w-80 bg-blue-600/8" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">

        <a href="#" className="inline-flex items-center gap-1 mb-8 text-xs text-zinc-500 hover:text-cyan-300 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Home
        </a>

        {/* C: BENTO GRID — no phone, app screens as flat panels */}
        <div className="grid grid-cols-12 grid-rows-[auto_auto] gap-4">

          {/* Row 1 */}
          {/* Hero copy — spans 5 cols */}
          <div className="col-span-5 row-span-1">
            <CopyPanel />
          </div>

          {/* Scan panel — spans 7 cols */}
          <div className="col-span-7 row-span-1 min-h-[280px]">
            <ScanPanel />
          </div>

          {/* Row 2 */}
          {/* Result panel — spans 5 cols */}
          <div className="col-span-5 row-span-1">
            <ResultPanel />
          </div>

          {/* Comps panel — spans 4 cols */}
          <div className="col-span-4 row-span-1">
            <CompsPanel />
          </div>

          {/* Listing panel — spans 3 cols */}
          <div className="col-span-3 row-span-1">
            <ListingPanel />
          </div>

        </div>
      </div>
    </div>
  );
}
