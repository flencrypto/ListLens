/* ─────────────────────────────────────────────────────────
   HomeV3 — "One Question"
   Design axis: ACTION PRIMACY (mediated)
   Home opens with a decision surface: one question, two
   physical choices. Stats and history collapse to strips.
   ───────────────────────────────────────────────────────── */
import { useState } from "react";

const C = {
  bg: "#040a14",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  green: "#4ade80",
  amber: "#fb923c",
  blue: "#3ea8ff",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  white: "#fafafa",
};

function GridIcon({ color, size }: { color: string; size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} opacity="0.9" /><rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} opacity="0.9" /><rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} opacity="0.9" /><rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} opacity="0.9" /></svg>;
}
function ApertureIcon({ color, size }: { color: string; size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="8" /><line x1="12" y1="4" x2="8" y2="20" /><line x1="12" y1="4" x2="16" y2="20" /><line x1="4.5" y1="9" x2="19.5" y2="9" /><line x1="4.5" y1="15" x2="19.5" y2="15" /></svg>;
}
function CameraIcon({ color, size }: { color: string; size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
}
function ShieldIcon({ color, size }: { color: string; size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function MoreIcon({ color, size }: { color: string; size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>;
}

function StatusBar() {
  return (
    <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 0 28px", flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.white, fontFamily: "system-ui" }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="#fafafa"><rect x="0" y="8" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="7" rx="0.5" /><rect x="9" y="2" width="3" height="10" rx="0.5" /><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" /></svg>
        <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round"><path d="M1 7c3-3 7-5 11-5s8 2 11 5" /><path d="M5 11c2-2 4.5-3.5 7-3.5s5 1.5 7 3.5" /><circle cx="12" cy="16" r="1.5" fill="#fafafa" stroke="none" /></svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="#fafafa" strokeWidth="1" /><rect x="2" y="2" width="14" height="8" rx="1.5" fill="#fafafa" /><path d="M21.5 4v4c.83-.37 1.5-1.1 1.5-2s-.67-1.63-1.5-2z" fill="#fafafa" opacity="0.5" /></svg>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: `1px solid rgba(34,211,238,0.1)`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: C.cyan, fontFamily: "system-ui" }}>MR.FLENS</span>
        <span style={{ fontSize: 10, color: C.zinc400, letterSpacing: "0.18em", fontFamily: "system-ui" }}>LIST-LENS</span>
      </div>
      {/* Compact stats — tight, inline */}
      <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
        {[
          { v: "3", l: "listings", c: C.cyan },
          { v: "0", l: "checks", c: C.violet },
          { v: "3", l: "credits", c: "#a78bfa" },
        ].map((s, i) => (
          <div key={s.l} style={{ display: "flex", alignItems: "baseline", gap: 3, paddingLeft: i > 0 ? 8 : 0, marginLeft: i > 0 ? 8 : 0, borderLeft: i > 0 ? `1px solid ${C.zinc800}` : "none" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: s.c, fontFamily: "system-ui" }}>{s.v}</span>
            <span style={{ fontSize: 9, color: C.zinc600, fontFamily: "system-ui" }}>{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabBar({ active }: { active: string }) {
  const tabs = [
    { id: "home", label: "HOME", Icon: GridIcon },
    { id: "lenses", label: "LENSES", Icon: ApertureIcon },
    { id: "studio", label: "STUDIO", Icon: CameraIcon },
    { id: "guard", label: "GUARD", Icon: ShieldIcon },
    { id: "more", label: "MORE", Icon: MoreIcon },
  ];
  return (
    <div style={{ height: 80, background: "rgba(4,10,20,0.95)", borderTop: `1px solid rgba(34,211,238,0.35)`, boxShadow: "0 -1px 12px rgba(34,211,238,0.18)", display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0, backdropFilter: "blur(16px)" }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, cursor: "pointer" }}>
            <t.Icon color={isActive ? C.cyan : C.zinc500} size={22} />
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: "0.05em", color: isActive ? C.cyan : C.zinc500, fontFamily: "system-ui" }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ChoiceCard({
  icon,
  gradient,
  glowColor,
  title,
  subtitle,
  tags,
  cta,
  borderColor,
}: {
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  title: string;
  subtitle: string;
  tags: string[];
  cta: string;
  borderColor: string;
}) {
  const [active, setActive] = useState(false);
  return (
    <div
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
      style={{
        borderRadius: 22,
        border: `1.5px solid ${borderColor}`,
        overflow: "hidden",
        cursor: "pointer",
        transform: active ? "scale(0.98)" : "scale(1)",
        transition: "transform 0.12s",
        background: C.zinc900,
        boxShadow: `0 8px 40px -12px ${glowColor}55`,
      }}
    >
      {/* Gradient top band */}
      <div style={{ height: 4, background: gradient }} />

      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Icon bubble */}
            <div style={{ width: 52, height: 52, borderRadius: 18, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px -4px ${glowColor}88`, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: C.white, margin: 0, letterSpacing: "-0.02em", fontFamily: "system-ui" }}>{title}</p>
              <p style={{ fontSize: 12, color: "rgba(250,250,250,0.55)", margin: "3px 0 0", fontFamily: "system-ui" }}>{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Feature tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {tags.map(tag => (
            <div key={tag} style={{ background: `${glowColor}12`, border: `1px solid ${glowColor}25`, borderRadius: 8, padding: "3px 10px" }}>
              <span style={{ fontSize: 10, color: glowColor, fontFamily: "system-ui", letterSpacing: "0.04em" }}>{tag}</span>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, height: 42, background: gradient, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px -4px ${glowColor}66` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#040a14", fontFamily: "system-ui", letterSpacing: "0.01em" }}>{cta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const RECENT = [
  { icon: "📸", title: "Nike Air Max 90", time: "Yesterday", color: C.cyan },
  { icon: "🛡️", title: "Rolex Submariner check", time: "3 days ago", color: C.violet },
];

export function HomeV3() {
  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui" }}>
      <StatusBar />
      <Header />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 8px" }}>

        {/* The question */}
        <div style={{ marginBottom: 20, paddingLeft: 2 }}>
          <p style={{ fontSize: 10, color: C.zinc500, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 8px", fontWeight: 600 }}>
            Welcome back
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.white, margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            What would you<br />like to do?
          </h1>
        </div>

        {/* Studio choice card */}
        <div style={{ marginBottom: 12 }}>
          <ChoiceCard
            icon={<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#040a14" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>}
            gradient={`linear-gradient(135deg, #22d3ee, #3ea8ff)`}
            glowColor={C.cyan}
            borderColor="rgba(34,211,238,0.2)"
            title="Studio"
            subtitle="Create a listing with AI"
            tags={["Photos → AI draft", "eBay · Vinted export", "3 credits left"]}
            cta="Start a listing →"
          />
        </div>

        {/* Guard choice card */}
        <div style={{ marginBottom: 18 }}>
          <ChoiceCard
            icon={<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#040a14" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
            gradient={`linear-gradient(135deg, #8b5cf6, #7c3aed)`}
            glowColor={C.violet}
            borderColor="rgba(139,92,246,0.2)"
            title="Guard"
            subtitle="Check a listing before you buy"
            tags={["URL → risk report", "5-dim scorecard", "£1.99/check"]}
            cta="Check a listing →"
          />
        </div>

        {/* Recent activity — compact ticker */}
        {RECENT.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.zinc500, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 10px" }}>Recent</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {RECENT.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < RECENT.length - 1 ? `1px solid ${C.zinc800}` : "none" }}>
                  <span style={{ fontSize: 16 }}>{r.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: C.white, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                  </div>
                  <p style={{ fontSize: 10, color: C.zinc600, margin: 0, flexShrink: 0 }}>{r.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <TabBar active="home" />
    </div>
  );
}
