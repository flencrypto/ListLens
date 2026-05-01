/* ─────────────────────────────────────────────────────────
   HomeV1 — "Split Gate"
   Design axis: ACTION PRIMACY
   The home screen IS the choice. Two massive tappable zones
   eliminate the dashboard entirely. Stats collapse to a seam.
   ───────────────────────────────────────────────────────── */
import { useState } from "react";

const C = {
  bg: "#040a14",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  green: "#4ade80",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  white: "#fafafa",
};

function TabBar({ active }: { active: string }) {
  const tabs = [
    { id: "home", label: "HOME", icon: GridIcon },
    { id: "lenses", label: "LENSES", icon: ApertureIcon },
    { id: "studio", label: "STUDIO", icon: CameraIcon },
    { id: "guard", label: "GUARD", icon: ShieldIcon },
    { id: "more", label: "MORE", icon: MoreIcon },
  ];
  return (
    <div style={{
      height: 80,
      background: "rgba(4,10,20,0.95)",
      borderTop: `1px solid rgba(34,211,238,0.35)`,
      boxShadow: "0 -1px 12px rgba(34,211,238,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      flexShrink: 0,
      backdropFilter: "blur(16px)",
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        const Icon = t.icon;
        return (
          <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, cursor: "pointer" }}>
            <Icon color={isActive ? C.cyan : C.zinc500} size={22} />
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: "0.05em", color: isActive ? C.cyan : C.zinc500, fontFamily: "system-ui" }}>
              {t.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 0 28px", flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.white, fontFamily: "system-ui" }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{
      height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", borderBottom: `1px solid rgba(34,211,238,0.12)`, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: C.cyan, fontFamily: "system-ui" }}>MR.FLENS</span>
        <span style={{ fontSize: 10, color: C.zinc400, letterSpacing: "0.18em", fontFamily: "system-ui" }}>LIST-LENS</span>
      </div>
      <div style={{ background: `${C.cyan}22`, border: `1px solid ${C.cyan}44`, borderRadius: 100, padding: "3px 10px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.cyan, letterSpacing: "0.08em", fontFamily: "system-ui" }}>FREE TRIAL</span>
      </div>
    </div>
  );
}

export function HomeV1() {
  const [pressed, setPressed] = useState<"studio" | "guard" | null>(null);

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui" }}>
      <StatusBar />
      <Header />

      {/* Main content — full split */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

        {/* Studio — top half */}
        <div
          onMouseDown={() => setPressed("studio")}
          onMouseUp={() => setPressed(null)}
          onMouseLeave={() => setPressed(null)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            opacity: pressed === "guard" ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {/* Cyan gradient fill */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 100% at 50% 80%, rgba(34,211,238,0.15) 0%, transparent 70%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 50% 60% at 50% 60%, rgba(34,211,238,0.08) 0%, transparent 70%)` }} />

          {/* Border hint on bottom edge */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, rgba(34,211,238,0.25), transparent)` }} />

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 24, background: `linear-gradient(135deg, rgba(34,211,238,0.35), rgba(62,168,255,0.2))`,
            border: `1.5px solid ${C.cyan}55`, display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 18, boxShadow: `0 0 40px -8px rgba(34,211,238,0.6)`,
            transform: pressed === "studio" ? "scale(0.96)" : "scale(1)", transition: "transform 0.15s",
          }}>
            <CameraIconLg color={C.cyan} />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: C.white, margin: 0, letterSpacing: "-0.02em" }}>Studio</h2>
          <p style={{ fontSize: 14, color: "rgba(34,211,238,0.7)", margin: "6px 0 0", letterSpacing: "0.08em" }}>PHOTOS → AI LISTING</p>

          <div style={{ marginTop: 20, border: `1px solid ${C.cyan}44`, borderRadius: 100, padding: "5px 16px", background: `${C.cyan}12` }}>
            <span style={{ fontSize: 11, color: C.cyan, fontWeight: 600 }}>3 listings created</span>
          </div>

          {/* Tap affordance */}
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", opacity: 0.35 }}>
            <span style={{ fontSize: 10, color: C.zinc400, letterSpacing: "0.2em", textTransform: "uppercase" }}>tap to enter</span>
          </div>
        </div>

        {/* Stats seam */}
        <div style={{
          height: 44, background: C.zinc900, display: "flex", alignItems: "center", justifyContent: "space-around",
          borderTop: `1px solid rgba(34,211,238,0.15)`, borderBottom: `1px solid rgba(139,92,246,0.15)`,
          flexShrink: 0, zIndex: 2,
        }}>
          {[
            { v: "3", l: "Listings", c: C.cyan },
            { v: "0", l: "Checks", c: C.violet },
            { v: "3", l: "Credits", c: "#a78bfa" },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</span>
              <span style={{ fontSize: 10, color: C.zinc500, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Guard — bottom half */}
        <div
          onMouseDown={() => setPressed("guard")}
          onMouseUp={() => setPressed(null)}
          onMouseLeave={() => setPressed(null)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            opacity: pressed === "studio" ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 100% at 50% 20%, rgba(139,92,246,0.15) 0%, transparent 70%)` }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent)` }} />

          {/* Tap affordance */}
          <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", opacity: 0.35 }}>
            <span style={{ fontSize: 10, color: C.zinc400, letterSpacing: "0.2em", textTransform: "uppercase" }}>tap to enter</span>
          </div>

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 24, background: `linear-gradient(135deg, rgba(139,92,246,0.35), rgba(124,58,237,0.2))`,
            border: `1.5px solid ${C.violet}55`, display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 18, boxShadow: `0 0 40px -8px rgba(139,92,246,0.6)`,
            transform: pressed === "guard" ? "scale(0.96)" : "scale(1)", transition: "transform 0.15s",
          }}>
            <ShieldIconLg color={C.violet} />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: C.white, margin: 0, letterSpacing: "-0.02em" }}>Guard</h2>
          <p style={{ fontSize: 14, color: "rgba(139,92,246,0.7)", margin: "6px 0 0", letterSpacing: "0.08em" }}>URL → RISK REPORT</p>

          <div style={{ marginTop: 20, border: `1px solid ${C.violet}44`, borderRadius: 100, padding: "5px 16px", background: `${C.violet}12` }}>
            <span style={{ fontSize: 11, color: C.violet, fontWeight: 600 }}>0 checks run</span>
          </div>
        </div>
      </div>

      <TabBar active="home" />
    </div>
  );
}

/* ── Icons ── */
function GridIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} opacity="0.9" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} opacity="0.9" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} opacity="0.9" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} opacity="0.9" />
    </svg>
  );
}
function ApertureIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="4" x2="8" y2="20" />
      <line x1="12" y1="4" x2="16" y2="20" />
      <line x1="4.5" y1="9" x2="19.5" y2="9" />
      <line x1="4.5" y1="15" x2="19.5" y2="15" />
    </svg>
  );
}
function CameraIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function ShieldIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function MoreIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  );
}
function CameraIconLg({ color }: { color: string }) {
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function ShieldIconLg({ color }: { color: string }) {
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function SignalIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="#fafafa">
      <rect x="0" y="8" width="3" height="4" rx="0.5" />
      <rect x="4.5" y="5" width="3" height="7" rx="0.5" />
      <rect x="9" y="2" width="3" height="10" rx="0.5" />
      <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" />
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round">
      <path d="M1 7c3-3 7-5 11-5s8 2 11 5" />
      <path d="M5 11c2-2 4.5-3.5 7-3.5s5 1.5 7 3.5" />
      <circle cx="12" cy="16" r="1.5" fill="#fafafa" stroke="none" />
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
      <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="#fafafa" strokeWidth="1" />
      <rect x="2" y="2" width="14" height="8" rx="1.5" fill="#fafafa" />
      <path d="M21.5 4v4c.83-.37 1.5-1.1 1.5-2s-.67-1.63-1.5-2z" fill="#fafafa" opacity="0.5" />
    </svg>
  );
}
