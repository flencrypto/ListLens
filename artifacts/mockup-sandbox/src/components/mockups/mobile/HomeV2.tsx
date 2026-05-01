/* ─────────────────────────────────────────────────────────
   HomeV2 — "Signal Console"
   Design axis: ACTION PRIMACY (inverse)
   Home is purely informational — a control panel.
   No action entry, no grid. Tabs own the verbs.
   ───────────────────────────────────────────────────────── */

const C = {
  bg: "#040a14",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  green: "#4ade80",
  amber: "#fb923c",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  white: "#fafafa",
};

/* ── Icons ── */
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
      <div style={{ background: `${C.cyan}22`, border: `1px solid ${C.cyan}44`, borderRadius: 100, padding: "3px 10px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.cyan, letterSpacing: "0.08em", fontFamily: "system-ui" }}>FREE TRIAL</span>
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

/* ── Credits arc gauge ── */
const CX = 110, CY = 96, R = 68;
const CIRC = 2 * Math.PI * R; // 427.26
const ARC_DEG = 270;
const ARC_LEN = CIRC * (ARC_DEG / 360); // 320.44
const GAP = CIRC - ARC_LEN; // 106.82
const ROT_ANGLE = 135; // degrees — places start at 7:30

function CreditsGauge({ credits, total }: { credits: number; total: number }) {
  const pct = total > 0 ? credits / total : 0;
  const filled = ARC_LEN * pct;
  const svgW = 220, svgH = 180;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={C.cyan} stopOpacity="0.5" />
            <stop offset="100%" stopColor={C.cyan} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={C.zinc800}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${ARC_LEN} ${GAP}`}
          transform={`rotate(${ROT_ANGLE} ${CX} ${CY})`}
        />
        {/* Progress arc */}
        {pct > 0 && (
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRC - filled}`}
            transform={`rotate(${ROT_ANGLE} ${CX} ${CY})`}
            style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.6))" }}
          />
        )}
        {/* Center text */}
        <text x={CX} y={CY - 6} textAnchor="middle" fill={C.white} fontSize="34" fontWeight="800" fontFamily="system-ui">
          {credits}
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fill={C.zinc400} fontSize="11" fontFamily="system-ui" letterSpacing="1">
          OF {total}
        </text>
        {/* Label below gauge */}
        <text x={CX} y={svgH - 16} textAnchor="middle" fill={C.zinc500} fontSize="10" fontFamily="system-ui" letterSpacing="2">
          CREDITS REMAINING
        </text>
        {/* Min/Max labels */}
        <text x={14} y={CY + R + 12} textAnchor="middle" fill={C.zinc600} fontSize="10" fontFamily="system-ui">0</text>
        <text x={CX * 2 - 14} y={CY + R + 12} textAnchor="middle" fill={C.zinc600} fontSize="10" fontFamily="system-ui">{total}</text>
      </svg>
    </div>
  );
}

const ACTIVITY = [
  { type: "studio", title: "Nike Air Max 90 — size 10", date: "30 Apr", status: "exported", color: C.cyan },
  { type: "guard",  title: "eBay listing: Rolex Submariner", date: "28 Apr", status: "medium risk", color: C.amber },
  { type: "studio", title: "Radiohead OK Computer LP", date: "27 Apr", status: "draft", color: C.cyan },
  { type: "guard",  title: "Signed Ronaldo shirt 2004", date: "25 Apr", status: "low risk", color: C.green },
];

export function HomeV2() {
  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui" }}>
      <StatusBar />
      <Header />

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 8px" }}>

        {/* Contextual nudge card */}
        <div style={{ border: `1px solid ${C.amber}44`, borderRadius: 14, padding: "10px 14px", background: `${C.amber}0a`, display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 18, flexShrink: 0 }}>⚡</div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.amber, margin: 0 }}>3 free listings remaining</p>
            <p style={{ fontSize: 11, color: C.zinc400, margin: "2px 0 0", lineHeight: 1.4 }}>Use Studio to list on eBay or Vinted — no plan needed.</p>
          </div>
        </div>

        {/* Credits gauge */}
        <div style={{ border: `1px solid rgba(34,211,238,0.12)`, borderRadius: 18, background: `rgba(34,211,238,0.03)`, padding: "8px 0 4px", marginBottom: 16, display: "flex", justifyContent: "center" }}>
          <CreditsGauge credits={3} total={3} />
        </div>

        {/* Plan row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Listings", v: "3", c: C.cyan },
            { label: "Guard checks", v: "4", c: C.violet },
            { label: "Plan", v: "Trial", c: C.zinc400 },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, border: `1px solid ${C.zinc800}`, borderRadius: 12, padding: "10px 8px", background: C.zinc900, textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: s.c, margin: 0 }}>{s.v}</p>
              <p style={{ fontSize: 9, color: C.zinc500, margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Activity timeline */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.zinc400, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>Recent activity</p>
            <p style={{ fontSize: 11, color: C.zinc600, margin: 0 }}>View all →</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {ACTIVITY.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  paddingTop: 10, paddingBottom: 10,
                  borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${C.zinc800}` : "none",
                }}
              >
                {/* Type dot + line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, boxShadow: `0 0 8px ${item.color}88`, flexShrink: 0 }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: C.white, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                  <p style={{ fontSize: 10, color: C.zinc500, margin: "2px 0 0" }}>{item.date} · {item.type === "studio" ? "Studio" : "Guard"}</p>
                </div>

                <div style={{ background: `${item.color}18`, border: `1px solid ${item.color}33`, borderRadius: 8, padding: "3px 8px", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: item.color, textTransform: "capitalize", letterSpacing: "0.04em" }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System note */}
        <p style={{ fontSize: 10, color: C.zinc700, textAlign: "center", margin: "8px 0 4px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Studio · Guard · Lenses live in their tabs
        </p>
      </div>

      <TabBar active="home" />
    </div>
  );
}
