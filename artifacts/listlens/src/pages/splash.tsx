import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLens } from "@/components/brand/brand-lens";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { BrandBackground } from "@/components/brand/brand-background";

/**
 * /splash — route chooser for the three entrances to ListLens:
 *   · Customer  → / (product landing)
 *   · Developer → /dashboard (sign in + app)
 *   · Investor  → /invest (investor overview)
 *
 * Mirrors the rebrand artwork. Honours `prefers-reduced-motion`.
 */
export default function SplashPage() {
  const prefersReducedMotion = useReducedMotion();

  const fade = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay, ease: "easeOut" as const },
        };

  const ROUTES = [
    {
      href: "/",
      emoji: "🛍️",
      label: "I'm a seller / buyer",
      sub: "Explore Studio & Guard",
      accent: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/40 hover:border-cyan-400/70",
      glow: "shadow-[0_0_32px_-8px_rgba(34,211,238,0.5)]",
      labelColor: "text-cyan-200",
      subColor: "text-cyan-400/70",
      badge: "bg-cyan-500",
    },
    {
      href: "/dashboard",
      emoji: "⚙️",
      label: "I'm a developer",
      sub: "Sign in to the app",
      accent: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 hover:border-emerald-400/70",
      glow: "shadow-[0_0_32px_-8px_rgba(52,211,153,0.4)]",
      labelColor: "text-emerald-200",
      subColor: "text-emerald-400/70",
      badge: "bg-emerald-500",
    },
    {
      href: "/invest",
      emoji: "📊",
      label: "I'm an investor",
      sub: "Market, product & roadmap",
      accent: "from-violet-500/20 to-violet-600/10 border-violet-500/40 hover:border-violet-400/70",
      glow: "shadow-[0_0_32px_-8px_rgba(139,92,246,0.5)]",
      labelColor: "text-violet-200",
      subColor: "text-violet-400/70",
      badge: "bg-violet-500",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040a14] text-zinc-50">
      <BrandBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top chrome */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <BrandWordmark layout="inline" size="sm" />
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-cyan-200/70 transition-colors hover:text-cyan-100"
          >
            Skip →
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
          {/* Brand lens */}
          <motion.div
            {...fade(0.05)}
            className="w-full max-w-[min(88vw,440px)] aspect-square"
          >
            <div className={prefersReducedMotion ? "" : "brand-spin-up"}>
              <BrandLens variant="composed" className="!w-full !h-full" />
            </div>
          </motion.div>

          <motion.p
            {...fade(0.5)}
            className="mt-2 max-w-lg text-sm text-cyan-100/60 sm:text-base"
          >
            AI resale intelligence. Specialist Lenses, evidence-led listings, buyer risk checks.{" "}
            <span className="font-semibold text-cyan-200/90">List smarter. Buy safer.</span>
          </motion.p>

          {/* Route chooser */}
          <motion.div
            {...fade(0.75)}
            className="mt-10 w-full max-w-md grid gap-3"
          >
            {ROUTES.map((route) => (
              <Link key={route.href} href={route.href}>
                <div
                  className={`group relative flex items-center gap-4 rounded-2xl border bg-gradient-to-r ${route.accent} px-5 py-4 transition-all duration-200 ${route.glow} hover:-translate-y-0.5 cursor-pointer`}
                >
                  <span className="text-2xl shrink-0">{route.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold text-sm leading-tight ${route.labelColor}`}>{route.label}</p>
                    <p className={`text-xs mt-0.5 ${route.subColor}`}>{route.sub}</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors text-lg">→</span>
                </div>
              </Link>
            ))}
          </motion.div>

          <motion.p
            {...fade(1.1)}
            className="mt-8 text-[10px] uppercase tracking-[0.4em] text-cyan-200/35"
          >
            Powered by RecordLens · ShoeLens · ClothingLens · MeasureLens · +8 more
          </motion.p>
        </section>

        <footer className="relative z-10 flex items-center justify-between border-t border-cyan-400/10 px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-cyan-200/40 sm:px-10">
          <span>© 2026 Mr.FLENS · List-LENS</span>
          <span>AI · Evidence · Confidence</span>
        </footer>
      </div>
    </main>
  );
}
