

import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLens } from "@/components/brand/brand-lens";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { BrandBackground } from "@/components/brand/brand-background";
import { BrandGlyph } from "@/components/brand/brand-glyph";
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
    <main className="relative min-h-screen overflow-hidden bg-[#040a14] text-zinc-50">
      <BrandBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top chrome — minimal, mirrors the artwork's quiet header */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <BrandWordmark layout="inline" size="sm" />
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.3em] text-cyan-200/70 transition-colors hover:text-cyan-100"
          >
            Skip →
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
          {/* Composed brand lens — wordmark + readouts live inside the ring,
              exactly like the rebrand artwork. The lens is fully responsive
              via container queries inside BrandLens. */}
          <motion.div
            {...fade(0.05)}
            className="w-full max-w-[min(92vw,560px)] aspect-square"
          >
            <div className={prefersReducedMotion ? "" : "brand-spin-up"}>
              <BrandLens variant="composed" className="!w-full !h-full" />
            </div>
          </motion.div>

          <motion.p
            {...fade(0.55)}
            className="mt-2 max-w-xl text-base text-cyan-100/70 sm:text-lg"
          >
            AI resale intelligence. Layered specialist Lenses, evidence-led
            listings, buyer risk checks. <br className="hidden sm:block" />
            <span className="font-medium text-cyan-200/90">
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
              className="border-0 bg-gradient-to-r from-[#22d3ee] via-[#4ade80] to-[#fb923c] px-8 text-[#040a14] hover:brightness-110"
            >
              <Link href="/studio/new">Enter Studio</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cyan-400/40 px-8 text-cyan-100 hover:bg-cyan-400/10"
            >
              <Link href="/guard/new">Run a Guard check</Link>
            </Button>
          </motion.div>

          {/* Brand glyph (brain-in-cart) — matches the icon at the bottom of
              the rebrand artwork. */}
          <motion.div {...fade(1.0)} className="mt-10">
            <BrandGlyph size={44} className="opacity-90" />
          </motion.div>

          <motion.p
            {...fade(1.15)}
            className="mt-3 text-[10px] uppercase tracking-[0.4em] text-cyan-200/45"
          >
            Powered by RecordLens · ShoeLens · ClothingLens · MeasureLens
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
