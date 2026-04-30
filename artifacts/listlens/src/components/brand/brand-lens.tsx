

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * BrandLens — the animated "Mr.FLENS · List-LENS" HUD aperture mark.
 *
 * A circular camera-lens / scanner-inspired graphic with a tri-tone segmented
 * gradient ring (cyan → green → amber), a rotating tick scale, a reverse
 * scanner sweep, pulsing centre, and optional HUD data readouts and chrome
 * labels matching the rebrand artwork.
 *
 * Variants:
 *  - `mark`     — mark only, optional outer chrome labels (used as a logo).
 *  - `composed` — mark + the MR.FLENS / LIST-LENS wordmark inside the ring,
 *                 plus mock data readouts and chrome labels (the splash hero).
 *
 * Respects `prefers-reduced-motion`: rotation/pulse are disabled and the mark
 * is rendered statically when the user prefers reduced motion.
 */
export interface BrandLensProps {
  /**
   * Pixel size of the square mark. When omitted, the component fills its
   * container — useful when you want to control sizing from CSS (e.g. via
   * `aspect-square w-full`).
   */
  size?: number;
  /** When true, all animations are disabled (static logo). */
  static?: boolean;
  /** When true, hides the chrome data labels around the ring. */
  hideLabels?: boolean;
  /** When true, hides the inner mock readouts (MKT 24.5, +12.4% etc). */
  hideReadouts?: boolean;
  /**
   * `mark`     → just the lens.
   * `composed` → lens with the MR.FLENS / LIST-LENS wordmark inside (splash).
   */
  variant?: "mark" | "composed";
  className?: string;
}

export function BrandLens({
  size,
  static: isStatic = false,
  hideLabels = false,
  hideReadouts = false,
  variant = "mark",
  className,
}: BrandLensProps) {
  const prefersReducedMotion = useReducedMotion();
  const animate = !isStatic && !prefersReducedMotion;

  const showWordmark = variant === "composed";
  // Readouts only appear when there is enough room (composed splash variant or
  // explicitly enabled). Disabling them avoids cramping smaller logo uses.
  const showReadouts = !hideReadouts && variant === "composed";

  // The wrapper uses container queries so all child labels (declared in `em`,
  // with a container font-size of 1cqw) scale with the container's actual
  // rendered width. This means callers can size the lens with any CSS
  // (fixed px, %, vw, aspect-ratio) and the labels stay proportionate.
  const sizeStyle =
    typeof size === "number" ? { width: size, height: size } : undefined;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center [container-type:inline-size]",
        className,
      )}
      style={sizeStyle}
      role="img"
      aria-label="Mr.FLENS List-LENS"
    >
      {/* Inner wrapper sets font-size in container query units. Must be a
          CHILD of the [container-type:inline-size] element above — cqw units
          set on the container element itself fall back to viewport units. */}
      <div className="absolute inset-0" style={{ fontSize: "1cqw" }}>
      <svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0"
        aria-hidden="true"
      >
        <defs>
          {/* Segmented tri-tone ring matching the source artwork: cyan top-left
              → green top-right → green bottom-left → amber bottom-right. */}
          <linearGradient id="brand-ring-tl" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3ea8ff" />
          </linearGradient>
          <linearGradient id="brand-ring-tr" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="brand-ring-bl" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="brand-ring-br" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="brand-sweep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3ea8ff" />
            <stop offset="50%" stopColor="#4ade80" />
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

        {/* Soft outer glow */}
        <circle cx="200" cy="200" r="180" fill="url(#brand-glow)" />

        {/* Static outer thin ring */}
        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Animated rotating tick scale */}
        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={animate ? { rotate: 360 } : undefined}
          transition={
            animate
              ? { duration: 28, ease: "linear", repeat: Infinity }
              : undefined
          }
        >
          {Array.from({ length: 96 }).map((_, i) => {
            const angle = (i * 360) / 96;
            const isMajor = i % 8 === 0;
            const colour =
              angle < 90
                ? "url(#brand-ring-tr)"
                : angle < 180
                ? "url(#brand-ring-br)"
                : angle < 270
                ? "url(#brand-ring-bl)"
                : "url(#brand-ring-tl)";
            return (
              <line
                key={i}
                x1="200"
                y1="50"
                x2="200"
                y2={isMajor ? 68 : 58}
                stroke={colour}
                strokeWidth={isMajor ? 2.4 : 1}
                opacity={isMajor ? 0.95 : 0.55}
                transform={`rotate(${angle} 200 200)`}
              />
            );
          })}
        </motion.g>

        {/* Segmented gradient ring (4 quadrants) */}
        {/* Top-right (cyan→green) */}
        <path
          d="M 200 50 A 150 150 0 0 1 350 200"
          fill="none"
          stroke="url(#brand-ring-tr)"
          strokeWidth="3"
        />
        {/* Bottom-right (green→amber) */}
        <path
          d="M 350 200 A 150 150 0 0 1 200 350"
          fill="none"
          stroke="url(#brand-ring-br)"
          strokeWidth="3"
        />
        {/* Bottom-left (cyan→green) */}
        <path
          d="M 200 350 A 150 150 0 0 1 50 200"
          fill="none"
          stroke="url(#brand-ring-bl)"
          strokeWidth="3"
        />
        {/* Top-left (cyan→blue) */}
        <path
          d="M 50 200 A 150 150 0 0 1 200 50"
          fill="none"
          stroke="url(#brand-ring-tl)"
          strokeWidth="3"
        />

        {/* Reverse-rotating scanner sweep arc */}
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
            d="M 200 50 A 150 150 0 0 1 350 200"
            fill="none"
            stroke="url(#brand-sweep)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#brand-blur)"
            opacity="0.85"
          />
          <path
            d="M 200 50 A 150 150 0 0 1 350 200"
            fill="none"
            stroke="#e0f7ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </motion.g>

        {/* Inner core */}
        <circle cx="200" cy="200" r="118" fill="url(#brand-core)" />
        <circle
          cx="200"
          cy="200"
          r="118"
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.35"
          strokeWidth="1"
        />

        {/* Cross-hair guides */}
        <line x1="200" y1="56" x2="200" y2="92" stroke="#22d3ee" strokeWidth="2.5" opacity="0.95" />
        <line x1="200" y1="308" x2="200" y2="344" stroke="#fb923c" strokeWidth="2.5" opacity="0.85" />
        <line x1="56" y1="200" x2="92" y2="200" stroke="#22d3ee" strokeWidth="2" opacity="0.7" />
        <line x1="308" y1="200" x2="344" y2="200" stroke="#4ade80" strokeWidth="2" opacity="0.8" />

        {/* Pulsing centre dot — only when no wordmark sits over it */}
        {!showWordmark && (
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
        )}
      </svg>

      {/* Inner data readouts (mock HUD numbers) */}
      {showReadouts && (
        <>
          <span
            className="pointer-events-none absolute left-1/2 top-[28%] -translate-x-1/2 font-mono tracking-wider text-cyan-200/90"
            style={{ fontSize: "4em" }}
          >
            MKT 24.5
          </span>
          <span
            className="pointer-events-none absolute right-[24%] top-[31%] font-mono tracking-wider text-emerald-300/95"
            style={{ fontSize: "4em" }}
          >
            +12.4%
          </span>
          <span
            className="pointer-events-none absolute left-[24%] bottom-[30%] font-mono tracking-wider text-emerald-300/95"
            style={{ fontSize: "4em" }}
          >
            +12.4%
          </span>
          <span
            className="pointer-events-none absolute right-[20%] bottom-[30%] font-mono tracking-wider text-amber-300/95"
            style={{ fontSize: "4em" }}
          >
            +12.99
          </span>
        </>
      )}

      {/* Outer chrome labels (decorative HUD) */}
      {!hideLabels && (
        <>
          <span
            className="pointer-events-none absolute left-1/2 top-[12%] -translate-x-1/2 font-semibold uppercase tracking-[0.25em] text-cyan-100/90"
            style={{ fontSize: "3.8em" }}
          >
            Consumer Score
          </span>
          <span
            className="pointer-events-none absolute right-[6%] top-[26%] font-semibold uppercase tracking-[0.25em] text-emerald-200/85"
            style={{ fontSize: "3.4em" }}
          >
            AI Valuation
          </span>
          <span
            className="pointer-events-none absolute left-[6%] top-[28%] font-semibold uppercase tracking-[0.25em] text-cyan-200/85"
            style={{ fontSize: "3.4em" }}
          >
            MKT Cap
          </span>
          <span
            className="pointer-events-none absolute left-[6%] bottom-[26%] font-semibold uppercase tracking-[0.25em] text-emerald-200/85"
            style={{ fontSize: "3.4em" }}
          >
            Q3 Earnings
          </span>
          <span
            className="pointer-events-none absolute right-[6%] bottom-[26%] font-semibold uppercase tracking-[0.25em] text-amber-300/90"
            style={{ fontSize: "3.4em" }}
          >
            Buyer Score
          </span>
          <span
            className="pointer-events-none absolute left-1/2 bottom-[10%] -translate-x-1/2 font-semibold uppercase tracking-[0.25em] text-cyan-100/80"
            style={{ fontSize: "3.4em" }}
          >
            Consumer Sentiment · 87%
          </span>
        </>
      )}

      {/* Centred wordmark (composed variant) */}
      {showWordmark && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className="font-extrabold tracking-tight text-[#3ea8ff] drop-shadow-[0_0_18px_rgba(34,211,238,0.55)]"
            style={{ fontSize: "13em", letterSpacing: "-0.01em" }}
          >
            MR.FLENS
          </span>
          <span className="flex items-center gap-2 text-cyan-200/80">
            <span
              className="block h-px w-6 bg-cyan-300/60"
              style={{ width: "6em" }}
            />
            <span
              className="font-semibold uppercase tracking-[0.32em]"
              style={{ fontSize: "5em" }}
            >
              List-LENS
            </span>
            <span
              className="block h-px w-6 bg-cyan-300/60"
              style={{ width: "6em" }}
            />
          </span>
        </div>
      )}
      </div>
    </div>
  );
}

export default BrandLens;
