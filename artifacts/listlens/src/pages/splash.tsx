

import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { BrandBackground } from "@/components/brand/brand-background";
import { BrandGlyph } from "@/components/brand/brand-glyph";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

/**
 * /splash — the Mr.FLENS · List-LENS animated splash page.
 *
 * Mirrors the rebrand artwork: deep navy backdrop, the composed BrandLens
 * (HUD aperture with the wordmark + readouts inside the ring), the BrandGlyph
 * brain-in-cart mark, and primary CTAs into Studio and Guard. Honours
 * `prefers-reduced-motion`.
 */
export default function SplashPage() {
  const prefersReducedMotion = useReducedMotion();

  const fade = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: "easeOut" as const },
        };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[color:var(--brand-text)]">
      <BrandBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <BrandWordmark layout="inline" size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="brand-page-eyebrow text-[10px] text-[color:var(--brand-text-muted)] transition-colors hover:text-[color:var(--brand-text-strong)]"
            >
              Skip →
            </Link>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
          <motion.div
            {...fade(0.05)}
            className="w-full max-w-[min(92vw,720px)]"
          >
            <div
              className={[
                "brand-card brand-card-glow mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] px-8 py-10 sm:px-14 sm:py-14",
                prefersReducedMotion ? "" : "brand-spin-up",
              ].join(" ")}
            >
              <span className="brand-page-eyebrow text-[11px] text-[#0082ff]">
                Primary logo
              </span>
              <BrandGlyph size={180} className="mt-6 sm:[&_svg]:drop-shadow-[0_20px_42px_rgba(0,130,255,0.28)]" />
              <BrandWordmark layout="stacked" size="lg" className="mt-6" />
              <span className="brand-page-eyebrow mt-4 text-[10px] text-[color:var(--brand-text-muted)]">
                AI-powered marketplace intelligence
              </span>
            </div>
          </motion.div>

          <motion.p
            {...fade(0.55)}
            className="mt-8 max-w-2xl text-base text-[color:var(--brand-text)] sm:text-lg"
          >
            AI resale intelligence. Layered specialist Lenses, evidence-led
            listings, buyer risk checks. <br className="hidden sm:block" />
            <span className="font-semibold text-[color:var(--brand-text-strong)]">
              List smarter. Buy safer.
            </span>
          </motion.p>

          <motion.div
            {...fade(0.8)}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="border-0 bg-gradient-to-r from-[#0082ff] via-[#19d8ff] to-[#00f0ff] px-8 text-white hover:brightness-110"
            >
              <Link href="/studio/new">Enter Studio</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#7a00ff]/30 bg-[#7a00ff]/8 px-8 text-[color:var(--brand-text-strong)] hover:bg-[#7a00ff]/14"
            >
              <Link href="/guard/new">Run a Guard check</Link>
            </Button>
          </motion.div>

          <motion.div {...fade(1.0)} className="mt-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-[color:var(--brand-outline)] bg-[color:var(--brand-nav-bg)] px-4 py-2 shadow-[var(--brand-nav-shadow)] backdrop-blur-xl">
              <BrandGlyph size={34} className="opacity-95" />
              <span className="brand-page-eyebrow text-[10px] text-[color:var(--brand-text-muted)]">
                Brandpack dark + light ready
              </span>
            </div>
          </motion.div>

          <motion.p
            {...fade(1.15)}
            className="brand-page-eyebrow mt-3 text-[10px] text-[color:var(--brand-text-muted)]"
          >
            Powered by RecordLens · ShoeLens · ClothingLens · MeasureLens
          </motion.p>
        </section>

        <footer className="relative z-10 flex items-center justify-between border-t border-[color:var(--brand-outline)] px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-[color:var(--brand-text-muted)] sm:px-10">
          <span>© 2026 Mr.FLENS · List-LENS</span>
          <span>AI · Evidence · Confidence</span>
        </footer>
      </div>
    </main>
  );
}
