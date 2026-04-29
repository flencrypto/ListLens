"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLens } from "@/components/brand/brand-lens";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { BrandBackground } from "@/components/brand/brand-background";
import { Button } from "@/components/ui/button";

/**
 * /splash — the Mr.FLENS · List-LENS animated splash page.
 *
 * Mirrors the rebrand artwork: deep navy backdrop, BrandLens HUD aperture
 * front-and-centre, staggered MR.FLENS / List-LENS wordmark reveal, and
 * primary CTAs into Studio and Guard. Honours `prefers-reduced-motion`.
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
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <BrandWordmark layout="inline" size="sm" />
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.3em] text-cyan-200/70 transition-colors hover:text-cyan-100"
          >
            Skip →
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <motion.div {...fade(0.05)} className="mb-8">
            <BrandLens size={340} />
          </motion.div>

          <motion.div {...fade(0.35)}>
            <BrandWordmark layout="stacked" size="lg" />
          </motion.div>

          <motion.p
            {...fade(0.6)}
            className="mt-6 max-w-xl text-base text-cyan-100/70 sm:text-lg"
          >
            AI resale intelligence. Layered specialist Lenses, evidence-led
            listings, buyer risk checks. <br className="hidden sm:block" />
            <span className="font-medium text-cyan-200/90">
              List smarter. Buy safer.
            </span>
          </motion.p>

          <motion.div
            {...fade(0.85)}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link href="/studio/new">
              <Button
                size="lg"
                className="border-0 bg-gradient-to-r from-[#22d3ee] via-[#4ade80] to-[#fb923c] px-8 text-[#040a14] hover:brightness-110"
              >
                Enter Studio
              </Button>
            </Link>
            <Link href="/guard/new">
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-400/40 px-8 text-cyan-100 hover:bg-cyan-400/10"
              >
                Run a Guard check
              </Button>
            </Link>
          </motion.div>

          <motion.p
            {...fade(1.05)}
            className="mt-6 text-xs uppercase tracking-[0.3em] text-cyan-200/50"
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
