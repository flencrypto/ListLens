import { useEffect, useRef } from "react";

const C = {
  bg: "#040a14",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  green: "#4ade80",
  amber: "#fb923c",
  blue: "#3ea8ff",
  zinc400: "#a1a1aa",
  zinc500: "#71717a",
  zinc700: "#3f3f46",
  zinc800: "#27272a",
  zinc900: "#18181b",
};

function HUDLens({ size = 280 }: { size?: number }) {
  const spinRef = useRef<SVGCircleElement>(null);
  const spin2Ref = useRef<SVGCircleElement>(null);
  useEffect(() => {
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.006;
      const el = spinRef.current;
      const el2 = spin2Ref.current;
      if (el) el.style.strokeDashoffset = String(-(t * 180));
      if (el2) el2.style.strokeDashoffset = String(t * 120);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const cx = size / 2, cy = size / 2, r = size * 0.38, r2 = size * 0.44;
  const circ = 2 * Math.PI * r;
  const circ2 = 2 * Math.PI * r2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 0 24px rgba(34,211,238,0.35))" }}>
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.cyan} />
          <stop offset="60%" stopColor={C.green} />
          <stop offset="100%" stopColor={C.amber} />
        </linearGradient>
        <radialGradient id="centreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.cyan} stopOpacity="0.15" />
          <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke={C.cyan} strokeWidth="0.8" strokeOpacity="0.18" />
      {/* Animated arc outer */}
      <circle ref={spin2Ref} cx={cx} cy={cy} r={r2} fill="none" stroke={C.cyan} strokeWidth="1"
        strokeDasharray={`${circ2 * 0.12} ${circ2 * 0.88}`} strokeLinecap="round" strokeOpacity="0.6"
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {/* Main ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.cyan} strokeWidth="1.2" strokeOpacity="0.25" />
      {/* Gradient spinning arc */}
      <circle ref={spinRef} cx={cx} cy={cy} r={r} fill="none" stroke="url(#arcGrad)" strokeWidth="2.5"
        strokeDasharray={`${circ * 0.65} ${circ * 0.35}`} strokeLinecap="round"
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {/* Inner disc */}
      <circle cx={cx} cy={cy} r={r * 0.72} fill={`rgba(4,10,20,0.85)`} />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="url(#centreGlow)" />
      {/* Crosshair */}
      <line x1={cx} y1={cy - r * 0.72 + 4} x2={cx} y2={cy - r * 0.16} stroke={C.cyan} strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1={cx} y1={cy + r * 0.16} x2={cx} y2={cy + r * 0.72 - 4} stroke={C.cyan} strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1={cx - r * 0.72 + 4} y1={cy} x2={cx - r * 0.16} y2={cy} stroke={C.cyan} strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1={cx + r * 0.16} y1={cy} x2={cx + r * 0.72 - 4} y2={cy} stroke={C.cyan} strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Tick marks */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={deg}
            x1={cx + (r - 8) * Math.cos(rad)} y1={cy + (r - 8) * Math.sin(rad)}
            x2={cx + r * Math.cos(rad)} y2={cy + r * Math.sin(rad)}
            stroke={C.cyan} strokeWidth="1.5" strokeOpacity="0.7" />
        );
      })}
      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={3} fill={C.cyan} fillOpacity="0.9" />
      <circle cx={cx} cy={cy} r={5} fill="none" stroke={C.cyan} strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  );
}

const STATS = [
  { v: "10", l: "Specialist Lenses" },
  { v: "6", l: "Live now" },
  { v: "£1.99", l: "Per Guard check" },
  { v: "< 30s", l: "Listing time" },
];

const STEPS = [
  { n: "01", icon: "📸", title: "Upload photos", body: "3–8 shots. We read condition, labels, tags, and packaging — whatever's visible.", color: C.cyan },
  { n: "02", icon: "🤖", title: "AI analyses", body: "Specialist Lens runs: title, bullets, item specifics, 3-point price range, evidence gaps.", color: C.violet },
  { n: "03", icon: "📋", title: "List or export", body: "Copy to Vinted, send the eBay payload, or save to history. Done in seconds.", color: C.green },
];

const LENSES = [
  { icon: "👟", name: "ShoeLens", status: "live" },
  { icon: "🎵", name: "LPLens", status: "live" },
  { icon: "💻", name: "TechLens", status: "live" },
  { icon: "📚", name: "BookLens", status: "live" },
  { icon: "🏺", name: "AntiquesLens", status: "live" },
  { icon: "✍️", name: "AutographLens", status: "live" },
  { icon: "⌚", name: "WatchLens", status: "soon" },
  { icon: "🃏", name: "CardLens", status: "soon" },
  { icon: "🧸", name: "ToyLens", status: "soon" },
  { icon: "🚗", name: "MotorLens", status: "later" },
];

const PLANS = [
  { name: "Free trial", price: "£0", per: "", desc: "3 listings included", features: ["3 Studio listings", "ShoeLens", "Vinted export", "Listing history"], cta: "Start free", hi: false },
  { name: "Studio Starter", price: "£9.99", per: "/mo", desc: "For regular sellers", features: ["Unlimited listings", "eBay + Vinted export", "All 6 live Lenses", "Priority AI queue"], cta: "Get Starter", hi: true },
  { name: "Guard", price: "£1.99", per: "/check", desc: "Or £6.99/mo for 10", features: ["Full 5-dim risk report", "Red flags + evidence", "Seller questions", "Price analysis"], cta: "Check a listing", hi: false },
];

export function VariantA() {
  const domain = window.location.host;
  return (
    <div style={{ background: C.bg, color: "#fafafa", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>

      {/* Grid overlay */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid rgba(34,211,238,0.1)`, backdropFilter: "blur(16px)", background: "rgba(4,10,20,0.85)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", color: C.cyan }}>MR.FLENS</span>
            <span style={{ fontSize: 12, color: C.zinc400, letterSpacing: "0.15em" }}>LIST-LENS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {["How it works", "Lenses", "Pricing"].map(l => (
              <span key={l} style={{ fontSize: 13, color: C.zinc400, cursor: "pointer" }}>{l}</span>
            ))}
            <div style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Get started
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", padding: "72px 24px 60px", overflow: "hidden" }}>
        {/* Hero glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 500, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(34,211,238,0.12) 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <HUDLens size={260} />
          </div>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,211,238,0.06)", border: `1px solid rgba(34,211,238,0.2)`, borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 6px ${C.cyan}` }} />
            <span style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(34,211,238,0.85)" }}>
              Mr.FLENS · List-LENS — UK-first AI resale platform
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.025em", margin: "0 0 16px" }}>
            <span style={{ color: "#fafafa" }}>List smarter.</span>
            <br />
            <span style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.cyan}, ${C.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 24px rgba(34,211,238,0.3))" }}>
              Buy safer.
            </span>
          </h1>

          <p style={{ fontSize: 18, color: "rgba(250,250,250,0.7)", maxWidth: 540, margin: "0 auto 28px", lineHeight: 1.65 }}>
            AI-powered listing studio and buyer protection for eBay and Vinted.
            Photos → listing in under 30 seconds.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 12 }}>
            <div style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`, borderRadius: 10, padding: "13px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 40px -8px rgba(34,211,238,0.6)` }}>
              Start listing free
            </div>
            <div style={{ border: `1px solid rgba(34,211,238,0.35)`, borderRadius: 10, padding: "13px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", color: "rgba(34,211,238,0.9)", background: "rgba(34,211,238,0.04)" }}>
              Check a listing
            </div>
          </div>
          <p style={{ fontSize: 12, color: C.zinc500, marginBottom: 36 }}>No credit card needed · First 3 listings free</p>

          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 560, margin: "0 auto" }}>
            {STATS.map(s => (
              <div key={s.l} style={{ border: `1px solid rgba(34,211,238,0.12)`, borderRadius: 12, background: "rgba(34,211,238,0.04)", padding: "14px 12px", backdropFilter: "blur(8px)" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.cyan, lineHeight: 1.1 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: C.zinc500, marginTop: 4, lineHeight: 1.3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Lens ticker */}
          <div style={{ marginTop: 28, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(34,211,238,0.45)" }}>
            ShoeLens · LPLens · TechLens · BookLens · AntiquesLens · AutographLens
          </div>
        </div>

        {/* Bottom divider */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, rgba(34,211,238,0.2), transparent)` }} />
      </section>

      {/* How it works */}
      <section style={{ padding: "72px 24px", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.cyan, marginBottom: 10 }}>Studio workflow</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>From photos to listing in 3 steps</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, position: "relative" }}>
            <div style={{ position: "absolute", top: 44, left: "17%", right: "17%", height: 1, background: `linear-gradient(90deg, ${C.cyan}44, ${C.violet}44, ${C.green}44)` }} />
            {STEPS.map(s => (
              <div key={s.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ position: "relative", width: 88, height: 88, borderRadius: "50%", border: `2px solid ${s.color}55`, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 28, boxShadow: `0 0 28px -8px ${s.color}88` }}>
                  {s.icon}
                  <span style={{ position: "absolute", top: -8, right: -8, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: s.color, background: C.bg, padding: "1px 5px", borderRadius: 4, border: `1px solid ${s.color}44` }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: C.zinc400, lineHeight: 1.6, maxWidth: 220 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 10px" }}>Two tools. One trust layer.</h2>
            <p style={{ fontSize: 15, color: C.zinc400 }}>Studio for sellers. Guard for buyers.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Studio */}
            <div style={{ border: `1px solid rgba(34,211,238,0.18)`, borderRadius: 20, padding: 32, background: "rgba(34,211,238,0.03)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(${C.cyan}11, transparent)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 0 24px -4px ${C.cyan}88` }}>📸</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>ListLens Studio</div>
                  <div style={{ fontSize: 12, color: C.zinc400 }}>For sellers — list faster</div>
                </div>
              </div>
              {["Upload 3–8 photos → AI-drafted listing ready", "Title, description, bullet points, item specifics", "Quick sale / recommended / high price bands", "Missing-evidence warnings before you list", "One-click Vinted · eBay listing payload", "10 specialist Lenses across 6 categories"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 13, color: "rgba(250,250,250,0.8)" }}>
                  <span style={{ color: C.cyan, marginTop: 1, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
              <div style={{ marginTop: 20, border: `1px solid rgba(34,211,238,0.12)`, borderRadius: 8, padding: "8px 12px", background: "rgba(34,211,238,0.04)", fontSize: 10, color: `${C.cyan}99`, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Photos → Title · Desc · Bullets · Price · Flags
              </div>
              <div style={{ marginTop: 16, background: `${C.cyan}22`, border: `1px solid ${C.cyan}44`, borderRadius: 10, padding: "10px 0", textAlign: "center", fontSize: 13, fontWeight: 600, color: C.cyan, cursor: "pointer" }}>
                Create a listing →
              </div>
            </div>

            {/* Guard */}
            <div style={{ border: `1px solid rgba(139,92,246,0.22)`, borderRadius: 20, padding: 32, background: "rgba(139,92,246,0.03)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(${C.violet}11, transparent)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.violet}, #7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 0 24px -4px ${C.violet}88` }}>🛡️</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>ListLens Guard</div>
                  <div style={{ fontSize: 12, color: C.zinc400 }}>For buyers — know before you bid</div>
                </div>
              </div>
              {["Paste a listing URL or upload screenshots", "AI risk report: low / medium / high / inconclusive", "Red flags with specific observed evidence", "5-dimension risk scorecard with verdict text", "Numbered seller questions, action-ready", "Safe language — never over-claims authenticity"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 13, color: "rgba(250,250,250,0.8)" }}>
                  <span style={{ color: C.violet, marginTop: 1, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
              <div style={{ marginTop: 20, border: `1px solid rgba(139,92,246,0.15)`, borderRadius: 8, padding: "8px 12px", background: "rgba(139,92,246,0.04)", fontSize: 10, color: `${C.violet}99`, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                URL → Risk · Score · Flags · Questions · Price
              </div>
              <div style={{ marginTop: 16, background: `${C.violet}22`, border: `1px solid ${C.violet}44`, borderRadius: 10, padding: "10px 0", textAlign: "center", fontSize: 13, fontWeight: 600, color: C.violet, cursor: "pointer" }}>
                Check a listing →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lenses */}
      <section style={{ padding: "72px 24px", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.cyan, marginBottom: 10 }}>10 specialist lenses</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 12px" }}>Category-deep intelligence</h2>
            <p style={{ fontSize: 15, color: C.zinc400, maxWidth: 480, margin: "0 auto" }}>Every Lens knows the right photos, fields, and red flags for its niche.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
            {LENSES.map(l => (
              <div key={l.name} style={{ border: `1px solid ${l.status === "live" ? "rgba(34,211,238,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: "18px 14px", textAlign: "center", background: l.status === "live" ? "rgba(34,211,238,0.04)" : "rgba(255,255,255,0.02)", opacity: l.status === "live" ? 1 : 0.55 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{l.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{l.name}</div>
                <div style={{ marginTop: 8 }}>
                  {l.status === "live" && <span style={{ fontSize: 9, background: "rgba(34,211,238,0.15)", color: C.cyan, padding: "2px 8px", borderRadius: 100, border: `1px solid ${C.cyan}33` }}>Live</span>}
                  {l.status === "soon" && <span style={{ fontSize: 9, background: "rgba(255,255,255,0.05)", color: C.zinc500, padding: "2px 8px", borderRadius: 100 }}>Soon</span>}
                  {l.status === "later" && <span style={{ fontSize: 9, background: "rgba(255,255,255,0.03)", color: C.zinc700, padding: "2px 8px", borderRadius: 100 }}>Planned</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 10px" }}>Simple pricing</h2>
            <p style={{ fontSize: 15, color: C.zinc400 }}>Start free. Scale when you're ready.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {PLANS.map(p => (
              <div key={p.name} style={{ border: `1px solid ${p.hi ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 20, padding: 28, background: p.hi ? "rgba(34,211,238,0.04)" : "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", boxShadow: p.hi ? `0 0 40px -12px rgba(34,211,238,0.3)` : "none" }}>
                {p.hi && <div style={{ fontSize: 10, color: C.cyan, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>★ Most popular</div>}
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 900 }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: C.zinc400 }}>{p.per}</span>
                </div>
                <div style={{ fontSize: 12, color: C.zinc500, marginBottom: 20 }}>{p.desc}</div>
                <div style={{ flex: 1 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 9, fontSize: 13, color: "rgba(250,250,250,0.8)" }}>
                      <span style={{ color: C.cyan, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, background: p.hi ? `linear-gradient(135deg, ${C.cyan}, ${C.violet})` : "transparent", border: p.hi ? "none" : `1px solid rgba(255,255,255,0.12)`, borderRadius: 10, padding: "11px 0", textAlign: "center", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: p.hi ? `0 0 28px -6px rgba(34,211,238,0.5)` : "none" }}>
                  {p.cta}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: C.zinc700, marginTop: 24 }}>All plans include listing history · No hidden fees · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(34,211,238,0.08)", padding: "48px 24px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.cyan, letterSpacing: "0.05em" }}>MR.FLENS</span>
                <span style={{ fontSize: 11, color: C.zinc400, letterSpacing: "0.15em" }}>LIST-LENS</span>
              </div>
              <p style={{ fontSize: 12, color: C.zinc500, lineHeight: 1.7 }}>AI resale trust layer for eBay &amp; Vinted.<br />UK-first · Evidence-led · Responsible AI.</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.zinc400, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>Tools</p>
              {["Studio — list an item", "Guard — check a listing", "History", "Pricing"].map(l => <div key={l} style={{ fontSize: 13, color: C.zinc500, marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.zinc400, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>Legal</p>
              {["Terms of use", "Privacy policy", "AI disclaimer"].map(l => <div key={l} style={{ fontSize: 13, color: C.zinc500, marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 11, color: C.zinc700 }}>© 2026 Mr.FLENS · List-LENS. All rights reserved.</p>
            <p style={{ fontSize: 10, color: C.zinc700, letterSpacing: "0.3em", textTransform: "uppercase" }}>AI · Evidence · Confidence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
