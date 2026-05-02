/* ─────────────────────────────────────────────────────────
   HomeV4 — "Category Gate"
   Design axis: OBJECT TYPE AS ENTRY POINT
   The home screen is not a dashboard and not a choice between
   Studio vs Guard — it's a lens picker. You open the app and
   immediately select WHAT you're listing (Records, Clothing,
   Cards, etc.) and jump directly into Studio with that lens
   pre-selected. Guard is a persistent floating trigger.
   Stats, history, and plan info live in More.
   ───────────────────────────────────────────────────────── */
import { useState } from "react";

const C = {
  bg: "#0c0a09",
  bgCard: "#1c1917",
  bgCardHover: "#292524",
  amber: "#f59e0b",
  amberDim: "#d97706",
  amberGlow: "#fcd34d",
  orange: "#f97316",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  green: "#4ade80",
  red: "#f87171",
  stone900: "#1c1917",
  stone800: "#292524",
  stone700: "#44403c",
  stone600: "#57534e",
  stone500: "#78716c",
  stone400: "#a8a29e",
  stone300: "#d6d3d1",
  white: "#fafaf9",
};

const LENSES = [
  { id: "record",   label: "Records",   sub: "Vinyl · CDs · Tapes",      icon: "💿", accent: C.amber,  bg: "#1a1400" },
  { id: "clothing", label: "Clothing",  sub: "Tops · Shoes · Accessories", icon: "👕", accent: "#60a5fa", bg: "#00101a" },
  { id: "cards",    label: "Cards",     sub: "Trading · Sports · TCG",    icon: "🃏", accent: "#4ade80", bg: "#001a0a" },
  { id: "tech",     label: "Tech",      sub: "Phones · Consoles · Gear",  icon: "📱", accent: "#c084fc", bg: "#12001a" },
  { id: "watches",  label: "Watches",   sub: "Luxury · Vintage · Dress",  icon: "⌚", accent: "#fb923c", bg: "#1a0800" },
  { id: "toys",     label: "Toys",      sub: "Figures · LEGO · Vintage",  icon: "🧸", accent: "#f472b6", bg: "#1a0010" },
  { id: "antiques", label: "Antiques",  sub: "Art · Ceramics · Objects",  icon: "🏺", accent: "#a78bfa", bg: "#0d0018" },
  { id: "motors",   label: "Motors",    sub: "Parts · Bikes · Tools",     icon: "🔧", accent: "#34d399", bg: "#001a10" },
];

const RECENT = [
  { icon: "💿", title: "Radiohead — OK Computer", lens: "Records",  status: "draft",    accent: C.amber },
  { icon: "👕", title: "Nike Air Max 90 — size 10", lens: "Clothing", status: "exported", accent: "#60a5fa" },
];

function StatusBar() {
  return (
    <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 0 28px", flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.white, fontFamily: "system-ui" }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={C.white}><rect x="0" y="8" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="7" rx="0.5" /><rect x="9" y="2" width="3" height="10" rx="0.5" /><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" /></svg>
        <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke={C.white} strokeWidth="2.5" strokeLinecap="round"><path d="M1 7c3-3 7-5 11-5s8 2 11 5" /><path d="M5 11c2-2 4.5-3.5 7-3.5s5 1.5 7 3.5" /><circle cx="12" cy="16" r="1.5" fill={C.white} stroke="none" /></svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke={C.white} strokeWidth="1" /><rect x="2" y="2" width="14" height="8" rx="1.5" fill={C.white} /><path d="M21.5 4v4c.83-.37 1.5-1.1 1.5-2s-.67-1.63-1.5-2z" fill={C.white} opacity="0.5" /></svg>
      </div>
    </div>
  );
}

function LensTile({ lens, onPick }: { lens: typeof LENSES[0]; onPick: (id: string) => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onPick(lens.id); }}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: pressed ? lens.bg : C.bgCard,
        border: `1.5px solid ${pressed ? lens.accent + "55" : C.stone800}`,
        borderRadius: 18,
        padding: "14px 12px",
        cursor: "pointer",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        transition: "all 0.12s",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
        boxShadow: pressed ? `0 0 24px -6px ${lens.accent}55` : "none",
      }}
    >
      {/* Subtle glow spot */}
      {pressed && (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 70% at 30% 30%, ${lens.accent}15, transparent 70%)`, pointerEvents: "none" }} />
      )}
      <span style={{ fontSize: 26, lineHeight: 1 }}>{lens.icon}</span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: pressed ? lens.accent : C.white, margin: 0, fontFamily: "system-ui", letterSpacing: "-0.01em" }}>{lens.label}</p>
        <p style={{ fontSize: 9, color: C.stone500, margin: "2px 0 0", fontFamily: "system-ui", lineHeight: 1.3 }}>{lens.sub}</p>
      </div>
      {/* Arrow on hover */}
      <div style={{ position: "absolute", top: 10, right: 10, opacity: pressed ? 0.7 : 0.2, transition: "opacity 0.12s" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={lens.accent} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </div>
    </div>
  );
}

export function HomeV4() {
  const [picked, setPicked] = useState<string | null>(null);

  if (picked) {
    const lens = LENSES.find(l => l.id === picked)!;
    return (
      <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", padding: 32 }}>
        <span style={{ fontSize: 56, marginBottom: 16 }}>{lens.icon}</span>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: C.white, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{lens.label} lens</h2>
        <p style={{ fontSize: 13, color: C.stone400, margin: "0 0 28px", textAlign: "center" }}>Opening Studio with {lens.label} selected…</p>
        <button
          onClick={() => setPicked(null)}
          style={{ background: "none", border: `1px solid ${C.stone700}`, color: C.stone400, borderRadius: 10, padding: "8px 18px", fontSize: 12, cursor: "pointer", fontFamily: "system-ui" }}
        >← Back to home</button>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui" }}>
      <StatusBar />

      {/* Header */}
      <div style={{ padding: "10px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 10, color: C.stone500, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 3px", fontWeight: 600 }}>Mr.FLENS · List-LENS</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.white, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            What are you<br />
            <span style={{ color: C.amber }}>listing today?</span>
          </h1>
        </div>
        {/* Guard pill */}
        <div
          style={{
            background: `${C.violet}22`,
            border: `1.5px solid ${C.violet}55`,
            borderRadius: 14,
            padding: "8px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            cursor: "pointer",
            boxShadow: `0 0 18px -4px ${C.violet}44`,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.violet} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <span style={{ fontSize: 8, fontWeight: 700, color: C.violet, letterSpacing: "0.1em", textTransform: "uppercase" }}>Guard</span>
        </div>
      </div>

      {/* Recent — compact strip */}
      {RECENT.length > 0 && (
        <div style={{ padding: "10px 18px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {RECENT.map((r, i) => (
              <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.stone800}`, borderRadius: 12, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, cursor: "pointer" }}>
                <span style={{ fontSize: 14 }}>{r.icon}</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.stone300, margin: 0, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                  <p style={{ fontSize: 9, color: C.stone500, margin: "1px 0 0" }}>{r.status}</p>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.accent, boxShadow: `0 0 6px ${r.accent}`, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lens grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {LENSES.map(lens => (
            <LensTile key={lens.id} lens={lens} onPick={setPicked} />
          ))}
        </div>

        {/* More lenses hint */}
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <p style={{ fontSize: 10, color: C.stone600, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
            8 lenses available · Measure, Books & more
          </p>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div style={{ height: 76, background: "rgba(12,10,9,0.95)", borderTop: `1px solid ${C.stone800}`, display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0, backdropFilter: "blur(16px)" }}>
        {[
          { id: "home",    label: "HOME",    active: true,  color: C.amber },
          { id: "history", label: "HISTORY", active: false, color: C.stone500 },
          { id: "billing", label: "PLANS",   active: false, color: C.stone500 },
          { id: "more",    label: "MORE",    active: false, color: C.stone500 },
        ].map(t => (
          <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, cursor: "pointer" }}>
            {t.id === "home" ? (
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber, boxShadow: `0 0 8px ${C.amber}` }} />
            ) : t.id === "history" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            ) : t.id === "billing" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill={t.color}><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
            )}
            <span style={{ fontSize: 8, fontWeight: t.active ? 800 : 500, letterSpacing: "0.08em", color: t.color, fontFamily: "system-ui" }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
