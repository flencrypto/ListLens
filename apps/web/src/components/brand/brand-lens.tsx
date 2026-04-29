"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * BrandLens — the animated "Mr.FLENS · List-LENS" HUD aperture mark.
 *
 * A circular camera-lens / scanner-inspired graphic with a tri-tone gradient
 * ring (cyan → green → amber), an inner tick scale, a slow rotating outer
 * scanner sweep, and a soft pulse on the centre lens. Used across the splash
 * page, navbar mark and any branded loading states.
 *
 * Respects `prefers-reduced-motion`.
 */
export interface BrandLensProps {
  /** Pixel size of the square mark. Defaults to 240. */
  size?: number;
  /** When true, all animations are disabled (static logo). */
  static?: boolean;
  /** When true, hides the small data labels around the ring. */
  hideLabels?: boolean;
  className?: string;
}

export function BrandLens({
  size = 240,
  static: isStatic = false,
  hideLabels = false,
  className,
}: BrandLensProps) {
  const prefersReducedMotion = useReducedMotion();
  const animate = !isStatic && !prefersReducedMotion;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="brand-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3ea8ff" />
            <stop offset="35%" stopColor="#22d3ee" />
            <stop offset="65%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <radialGradient id="brand-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0b1a2c" />
            <stop offset="60%" stopColor="#081325" />
            <stop offset="100%" stopColor="#040a14" />
          </radialGradient>
          <radialGradient id="brand-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <filter id="brand-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <circle cx="200" cy="200" r="180" fill="url(#brand-glow)" />

        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="1"
          opacity="0.5"
        />

        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={animate ? { rotate: 360 } : undefined}
          transition={
            animate
              ? { duration: 28, ease: "linear", repeat: Infinity }
              : undefined
          }
        >
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i * 360) / 72;
            const isMajor = i % 6 === 0;
            return (
              <line
                key={i}
                x1="200"
                y1="48"
                x2="200"
                y2={isMajor ? 64 : 56}
                stroke="url(#brand-ring)"
                strokeWidth={isMajor ? 2 : 1}
                opacity={isMajor ? 0.95 : 0.55}
                transform={`rotate(${angle} 200 200)`}
              />
            );
          })}
        </motion.g>

        <circle
          cx="200"
          cy="200"
          r="148"
          fill="none"
          stroke="url(#brand-ring)"
          strokeWidth="3"
          opacity="0.9"
        />

        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={animate ? { rotate: -360 } : undefined}
          transition={
            animate
              ? { duration: 9, ease: "linear", repeat: Infinity }
              : undefined
          }
        >
          <path
            d="M 200 52 A 148 148 0 0 1 348 200"
            fill="none"
            stroke="url(#brand-ring)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#brand-blur)"
            opacity="0.85"
          />
          <path
            d="M 200 52 A 148 148 0 0 1 348 200"
            fill="none"
            stroke="#e0f7ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </motion.g>

        <circle cx="200" cy="200" r="92" fill="url(#brand-core)" />
        <circle
          cx="200"
          cy="200"
          r="92"
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.35"
          strokeWidth="1"
        />

        <motion.circle
          cx="200"
          cy="200"
          r="6"
          fill="#22d3ee"
          animate={animate ? { opacity: [0.4, 1, 0.4] } : undefined}
          transition={
            animate
              ? { duration: 2.4, ease: "easeInOut", repeat: Infinity }
              : undefined
          }
        />

        <line x1="200" y1="64" x2="200" y2="100" stroke="#22d3ee" strokeWidth="2" opacity="0.85" />
        <line x1="200" y1="300" x2="200" y2="336" stroke="#fb923c" strokeWidth="2" opacity="0.7" />
        <line x1="64" y1="200" x2="100" y2="200" stroke="#22d3ee" strokeWidth="2" opacity="0.6" />
        <line x1="300" y1="200" x2="336" y2="200" stroke="#4ade80" strokeWidth="2" opacity="0.7" />
      </svg>

      {!hideLabels && (
        <>
          <span
            className="pointer-events-none absolute left-1/2 top-[14%] -translate-x-1/2 font-semibold tracking-[0.2em] text-cyan-200/90"
            style={{ fontSize: Math.max(8, size * 0.038) }}
          >
            CONSUMER SCORE
          </span>
          <span
            className="pointer-events-none absolute right-[10%] top-[22%] font-semibold tracking-[0.2em] text-emerald-200/80"
            style={{ fontSize: Math.max(8, size * 0.034) }}
          >
            AI VALUATION
          </span>
          <span
            className="pointer-events-none absolute left-[10%] top-[24%] font-semibold tracking-[0.2em] text-cyan-200/80"
            style={{ fontSize: Math.max(8, size * 0.034) }}
          >
            MKT CAP
          </span>
          <span
            className="pointer-events-none absolute left-[12%] bottom-[22%] font-semibold tracking-[0.2em] text-emerald-200/80"
            style={{ fontSize: Math.max(8, size * 0.034) }}
          >
            Q3 EARNINGS
          </span>
          <span
            className="pointer-events-none absolute right-[10%] bottom-[24%] font-semibold tracking-[0.2em] text-amber-300/80"
            style={{ fontSize: Math.max(8, size * 0.034) }}
          >
            AI VALUATION
          </span>
          <span
            className="pointer-events-none absolute left-1/2 bottom-[12%] -translate-x-1/2 font-semibold tracking-[0.2em] text-cyan-200/70"
            style={{ fontSize: Math.max(8, size * 0.032) }}
          >
            CONSUMER SENTIMENT · 87%
          </span>
        </>
      )}
    </div>
  );
}

export default BrandLens;
