import { useEffect, useRef } from "react";

const C = {
  bg: "#040a14",
  bgMid: "#060e1c",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  green: "#4ade80",
  amber: "#fb923c",
  blue: "#3ea8ff",
  zinc400: "#a1a1aa",
  zinc500: "#71717a",
  zinc600: "#52525b",
  zinc700: "#3f3f46",
  zinc800: "#27272a",
  zinc900: "#18181b",
};

function HUDLens({ size = 340 }: { size?: number }) {
  const arcRef = useRef<SVGCircleElement>(null);
  const arc2Ref = useRef<SVGCircleElement>(null);
  const pRef = useRef<SVGCircleElement>(null);
  useEffect(() => {
    let frame: number;
    let t = 0;
    const tick = () => {
      t += 0.005;
      if (arcRef.current) arcRef.current.style.strokeDashoffset = String(-(t * 200));
      if (arc2Ref.current) arc2Ref.current.style.strokeDashoffset = String(t * 140);
      if (pRef.current) {
        const r = size * 0.38;
        const cx = size / 2, cy = size / 2;
        const a = t * 1.3;
        pRef.current.setAttribute("cx", String(cx + r * 0.55 * Math.cos(a)));
        pRef.current.setAttribute("cy", String(cy + r * 0.55 * Math.sin(a)));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [size]);

  const cx = size / 2, cy = size / 2, r = size * 0.38, r2 = size * 0.46;
  const circ = 2 * Math.PI * r;
  const circ2 = 2 * Math.PI * r2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 0 32px rgba(34,211,238,0.3))" }}>
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.cyan} />
          <stop offset="50%" stopColor={C.green} />
          <stop offset="100%" stopColor={C.amber} />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.cyan} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
        </radialGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      {/* Outer ring faint */}
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke={C.cyan} strokeWidth="0.7" strokeOpacity="0.12" />
      {/* Outer rotating arc */}
      <circle ref={arc2Ref} cx={cx} cy={cy} r={r2} fill="none" stroke={C.cyan} strokeWidth="1.5"
        strokeDasharray={`${circ2 * 0.08} ${circ2 * 0.92}`} strokeLinecap="round" strokeOpacity="0.5"
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {/* Dashed detail ring */}
      <circle cx={cx} cy={cy} r={r * 0.84} fill="none" stroke={C.cyan} strokeWidth="0.6"
        strokeOpacity="0.12" strokeDasharray="3 12" />
      {/* Main ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.cyan} strokeWidth="1.5" strokeOpacity="0.2" />
      {/* Gradient arc */}
      <circle ref={arcRef} cx={cx} cy={cy} r={r} fill="none" stroke="url(#g1)" strokeWidth="3"
        strokeDasharray={`${circ * 0.7} ${circ * 0.3}`} strokeLinecap="round"
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {/* Inner disc */}
      <circle cx={cx} cy={cy} r={r * 0.68} fill={C.bg} />
      <circle cx={cx} cy={cy} r={r * 0.68} fill="url(#glow)" />
      {/* Crosshair */}
      {[[cx, cy - r * 0.68 + 6, cx, cy - r * 0.2], [cx, cy + r * 0.2, cx, cy + r * 0.68 - 6], [cx - r * 0.68 + 6, cy, cx - r * 0.2, cy], [cx + r * 0.2, cy, cx + r * 0.68 - 6, cy]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.cyan} strokeWidth="0.8" strokeOpacity="0.4" />
      ))}
      {/* Orbiting dot */}
      <circle ref={pRef} cx={cx} cy={cy} r="4" fill={C.amber} fillOpacity="0.85" filter="url(#blur)" />
      <circle cx={cx} cy={cy} r="3.5" fill={C.cyan} fillOpacity="0.9" />
      <circle cx={cx} cy={cy} r="6" fill="none" stroke={C.cyan} strokeWidth="1" strokeOpacity="0.25" />
      {/* Corner bracket marks */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => {
        const bx = cx + sx * r * 0.62, by = cy + sy * r * 0.62;
        const dl = 10;
        return (
          <g key={i}>
            <line x1={bx} y1={by} x2={bx + sx * dl} y2={by} stroke={C.cyan} strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1={bx} y1={by} x2={bx} y2={by + sy * dl} stroke={C.cyan} strokeWidth="1.2" strokeOpacity="0.5" />
          </g>
        );
      })}
    </svg>
  );
}

const LENSES = [
  { icon: "👟", name: "ShoeLens", live: true },
  { icon: "🎵", name: "LPLens", live: true },
  { icon: "💻", name: "TechLens", live: true },
  { icon: "📚", name: "BookLens", live: true },
  { icon: "🏺", name: "AntiquesLens", live: true },
  { icon: "✍️", name: "AutographLens", live: true },
  { icon: "⌚", name: "WatchLens", live: false },
  { icon: "🃏", name: "CardLens", live: false },
  { icon: "🧸", name: "ToyLens", live: false },
  { icon: "🚗", name: "MotorLens", live: false },
];

const PLANS = [
  { name: "Free trial", price: "£0", per: "", desc: "3 listings, no card", features: ["3 Studio listings", "ShoeLens", "Vinted export", "Listing history"], cta: "Start free", hi: false },
  { name: "Studio Starter", price: "£9.99", per: "/mo", desc: "For regular sellers", features: ["Unlimited listings", "eBay + Vinted export", "All 6 live Lenses", "Priority AI queue"], cta: "Get Starter", hi: true },
  { name: "Guard", price: "£1.99", per: "/check", desc: "Or £6.99/mo · 10 checks", features: ["Full risk report", "Red flags + evidence", "Seller questions", "Price analysis"], cta: "Check a listing", hi: false },
];

function FlowStep({ n, icon, title, body, color }: { n: string; icon: string; title: string; body: string; color: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "28px 24px", borderRadius: 20, border: `1px solid ${color}22`, background: `${color}06`, position: "relative" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: `${color}99`, marginBottom: 14 }}>{n}</div>
      <div style={{ fontSize: 30, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.zinc400, lineHeight: 1.65 }}>{body}</div>
    </div>
  );
}

export function VariantB() {
  return (
    <div style={{ background: C.bg, color: "#fafafa", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>

      {/* Subtle dot grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `radial-gradient(circle, rgba(34,211,238,0.06) 1px, transparent 1px)`, backgroundSize: "48px 48px", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(20px)", background: "rgba(4,10,20,0.9)", borderBottom: `1px solid rgba(34,211,238,0.08)` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.04em", color: C.cyan }}>MR.FLENS</span>
            <span style={{ fontSize: 12, color: C.zinc500, letterSpacing: "0.18em" }}>LIST-LENS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {["How it works", "Lenses", "Pricing"].map(l => (
              <span key={l} style={{ fontSize: 13, color: C.zinc400, cursor: "pointer", letterSpacing: "0.01em" }}>{l}</span>
            ))}
            <div style={{ background: `linear-gradient(135deg, ${C.cyan}dd, ${C.violet}dd)`, borderRadius: 9, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 20px -6px ${C.cyan}88` }}>
              Get started
            </div>
          </div>
        </div>
      </nav>

      {/* Hero — two column */}
      <section style={{ position: "relative", padding: "60px 32px 56px", overflow: "hidden" }}>
        {/* Background gradient */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 70% at 60% 40%, rgba(34,211,238,0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,211,238,0.07)", border: `1px solid rgba(34,211,238,0.18)`, borderRadius: 8, padding: "6px 14px", marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }} />
              <span style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: `${C.cyan}cc` }}>UK-first AI resale platform</span>
            </div>

            <h1 style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
              List<br />
              <span style={{ background: `linear-gradient(100deg, ${C.blue}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>smarter.</span><br />
              Buy<br />
              <span style={{ background: `linear-gradient(100deg, ${C.green}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>safer.</span>
            </h1>

            <p style={{ fontSize: 17, color: "rgba(250,250,250,0.65)", lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
              AI-powered listing studio and buyer protection for eBay and Vinted. Photos → listing in under 30 seconds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
              <div style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content", boxShadow: `0 0 40px -6px rgba(34,211,238,0.55)` }}>
                Start listing free
                <span style={{ fontSize: 16 }}>→</span>
              </div>
              <div style={{ border: `1px solid rgba(34,211,238,0.25)`, borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content", color: "rgba(34,211,238,0.85)" }}>
                Check a listing
                <span style={{ fontSize: 16 }}>→</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: C.zinc600 }}>No credit card · First 3 listings free</p>

            {/* Mini stats */}
            <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
              {[["10", "Lenses"], ["6", "Live"], ["< 30s", "To list"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.cyan }}>{v}</div>
                  <div style={{ fontSize: 11, color: C.zinc500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: lens */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(${C.cyan}18, transparent 70%)` }} />
            <HUDLens size={320} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}30, transparent)` }} />
      </section>

      {/* How it works — card flow */}
      <section style={{ padding: "72px 32px", background: "rgba(6,14,28,0.6)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.cyan, marginBottom: 8 }}>Studio workflow</p>
              <h2 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>From photos to listing in 3 steps</h2>
            </div>
            <div style={{ fontSize: 13, color: C.zinc400, borderBottom: `1px solid ${C.cyan}44`, paddingBottom: 2, cursor: "pointer" }}>Try Studio free →</div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
            <FlowStep n="01" icon="📸" title="Upload photos" body="3–8 shots of your item. We read condition, labels, tags, box art and packaging." color={C.cyan} />
            <div style={{ display: "flex", alignItems: "center", color: `${C.cyan}40`, fontSize: 20, flexShrink: 0 }}>→</div>
            <FlowStep n="02" icon="🤖" title="AI analyses" body="Specialist Lens runs: title, bullets, item specifics, 3-point price range, evidence gaps." color={C.violet} />
            <div style={{ display: "flex", alignItems: "center", color: `${C.violet}40`, fontSize: 20, flexShrink: 0 }}>→</div>
            <FlowStep n="03" icon="📋" title="List or export" body="Copy to Vinted, send the eBay payload, or save to history. Done in seconds." color={C.green} />
          </div>
        </div>
      </section>

      {/* Features — wider layout */}
      <section style={{ padding: "72px 32px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Studio */}
            <div style={{ border: `1px solid ${C.cyan}22`, borderRadius: 24, padding: "36px 36px 28px", background: `linear-gradient(135deg, rgba(34,211,238,0.04), rgba(34,211,238,0.01))`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(${C.cyan}18, transparent)` }} />
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 28 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${C.cyan}cc, ${C.blue}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 8px 32px -8px ${C.cyan}88` }}>📸</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>Studio</div>
                  <div style={{ fontSize: 12, color: C.cyan, letterSpacing: "0.05em" }}>For sellers</div>
                </div>
              </div>

              {/* Feature list */}
              {["Upload 3–8 photos → AI-drafted listing", "Title, description, bullets, item specifics", "Quick sale / recommended / high pricing", "Missing-evidence warnings", "Vinted export · eBay listing payload", "6 live Lenses across multiple categories"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, marginBottom: 11, fontSize: 13, color: "rgba(250,250,250,0.8)" }}>
                  <span style={{ color: C.cyan, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}

              {/* Pipeline tag */}
              <div style={{ marginTop: 24, background: "rgba(34,211,238,0.05)", border: `1px solid ${C.cyan}18`, borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                {["Photos", "→", "Title", "·", "Bullets", "·", "Price", "·", "Flags"].map((t, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: t === "→" ? 400 : 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t === "→" ? C.zinc700 : C.cyan, opacity: t === "→" ? 0.5 : 0.8 }}>{t}</span>
                ))}
              </div>
              <div style={{ marginTop: 16, background: `${C.cyan}18`, border: `1px solid ${C.cyan}33`, borderRadius: 12, padding: "11px 0", textAlign: "center", fontSize: 14, fontWeight: 700, color: C.cyan, cursor: "pointer" }}>
                Create a listing →
              </div>
            </div>

            {/* Guard */}
            <div style={{ border: `1px solid ${C.violet}22`, borderRadius: 24, padding: "36px 36px 28px", background: `linear-gradient(135deg, rgba(139,92,246,0.04), rgba(139,92,246,0.01))`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(${C.violet}18, transparent)` }} />
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 28 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${C.violet}cc, #7c3aedcc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 8px 32px -8px ${C.violet}88` }}>🛡️</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>Guard</div>
                  <div style={{ fontSize: 12, color: C.violet, letterSpacing: "0.05em" }}>For buyers</div>
                </div>
              </div>

              {["Paste a listing URL or upload screenshots", "AI risk report: low / medium / high / inconclusive", "Red flags with specific observed evidence", "5-dimension risk scorecard with verdicts", "Numbered seller questions, action-ready", "Safe language — never over-claims"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, marginBottom: 11, fontSize: 13, color: "rgba(250,250,250,0.8)" }}>
                  <span style={{ color: C.violet, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}

              <div style={{ marginTop: 24, background: "rgba(139,92,246,0.05)", border: `1px solid ${C.violet}18`, borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                {["URL", "→", "Risk", "·", "Score", "·", "Flags", "·", "Questions"].map((t, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: t === "→" ? 400 : 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t === "→" ? C.zinc700 : C.violet, opacity: t === "→" ? 0.5 : 0.8 }}>{t}</span>
                ))}
              </div>
              <div style={{ marginTop: 16, background: `${C.violet}18`, border: `1px solid ${C.violet}33`, borderRadius: 12, padding: "11px 0", textAlign: "center", fontSize: 14, fontWeight: 700, color: C.violet, cursor: "pointer" }}>
                Check a listing →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lenses — wider grid */}
      <section style={{ padding: "72px 32px", background: "rgba(6,14,28,0.6)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 56, alignItems: "start" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.cyan, marginBottom: 12 }}>Specialist Lenses</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 16px" }}>Category-deep intelligence</h2>
            <p style={{ fontSize: 14, color: C.zinc400, lineHeight: 1.7, marginBottom: 20 }}>Every Lens knows the right photos, fields, and red flags for its niche. 6 live now, 4 shipping soon.</p>
            <p style={{ fontSize: 10, color: C.zinc700, letterSpacing: "0.25em", textTransform: "uppercase" }}>New Lenses shipping quarterly</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
            {LENSES.map(l => (
              <div key={l.name} style={{ border: `1px solid ${l.live ? `${C.cyan}25` : "rgba(255,255,255,0.05)"}`, borderRadius: 14, padding: "14px 10px", textAlign: "center", background: l.live ? `${C.cyan}05` : "rgba(255,255,255,0.015)", opacity: l.live ? 1 : 0.5 }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{l.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{l.name}</div>
                <div style={{ marginTop: 6 }}>
                  {l.live
                    ? <span style={{ fontSize: 9, color: C.cyan, background: `${C.cyan}18`, padding: "2px 6px", borderRadius: 100 }}>Live</span>
                    : <span style={{ fontSize: 9, color: C.zinc600, background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 100 }}>Soon</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "72px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 10px" }}>Simple pricing</h2>
            <p style={{ fontSize: 15, color: C.zinc400 }}>Start free. Scale when you're ready.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {PLANS.map(p => (
              <div key={p.name} style={{ borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", border: p.hi ? `1px solid ${C.cyan}35` : "1px solid rgba(255,255,255,0.06)", background: p.hi ? `linear-gradient(160deg, ${C.cyan}07, ${C.violet}05)` : "rgba(255,255,255,0.02)", boxShadow: p.hi ? `0 0 48px -12px rgba(34,211,238,0.25)` : "none" }}>
                {p.hi && (
                  <div style={{ marginBottom: 12, fontSize: 10, color: C.cyan, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>★</span> Most popular
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.02em" }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: C.zinc500 }}>{p.per}</span>
                </div>
                <div style={{ fontSize: 12, color: C.zinc500, marginBottom: 20 }}>{p.desc}</div>
                <div style={{ flex: 1 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 9, fontSize: 13, color: "rgba(250,250,250,0.8)" }}>
                      <span style={{ color: C.cyan, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, background: p.hi ? `linear-gradient(135deg, ${C.cyan}, ${C.violet})` : "transparent", border: p.hi ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 0", textAlign: "center", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: p.hi ? `0 0 32px -8px rgba(34,211,238,0.5)` : "none" }}>
                  {p.cta}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: C.zinc700, marginTop: 24 }}>All plans include listing history · No hidden fees · Cancel anytime</p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: "72px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 80% at 50% 50%, rgba(34,211,238,0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${C.cyan}55`, background: `${C.cyan}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 24px", boxShadow: `0 0 32px -8px ${C.cyan}66` }}>🔍</div>
          <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 14px" }}>Ready to list smarter?</h2>
          <p style={{ fontSize: 16, color: C.zinc400, lineHeight: 1.65, marginBottom: 32 }}>No credit card. No commitment. Your first three listings are completely free.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <div style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, borderRadius: 12, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 44px -8px ${C.cyan}66` }}>
              Start listing free
            </div>
            <div style={{ border: `1px solid ${C.cyan}33`, borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", color: `${C.cyan}cc` }}>
              Run a Guard check
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(34,211,238,0.07)", padding: "48px 32px 32px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 40, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${C.cyan}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.cyan, letterSpacing: "0.04em" }}>MR.FLENS</span>
                <span style={{ fontSize: 11, color: C.zinc500, letterSpacing: "0.15em" }}>LIST-LENS</span>
              </div>
              <p style={{ fontSize: 12, color: C.zinc500, lineHeight: 1.75, maxWidth: 280 }}>AI resale trust layer for eBay &amp; Vinted. UK-first · Evidence-led · Responsible AI.</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.zinc400, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Tools</p>
              {["Studio — list an item", "Guard — check a listing", "History", "Pricing"].map(l => <div key={l} style={{ fontSize: 13, color: C.zinc500, marginBottom: 10, cursor: "pointer" }}>{l}</div>)}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.zinc400, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Legal</p>
              {["Terms of use", "Privacy policy", "AI disclaimer"].map(l => <div key={l} style={{ fontSize: 13, color: C.zinc500, marginBottom: 10, cursor: "pointer" }}>{l}</div>)}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 20, display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, color: C.zinc700 }}>© 2026 Mr.FLENS · List-LENS. All rights reserved.</p>
            <p style={{ fontSize: 10, color: C.zinc700, letterSpacing: "0.3em", textTransform: "uppercase" }}>AI · Evidence · Confidence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
