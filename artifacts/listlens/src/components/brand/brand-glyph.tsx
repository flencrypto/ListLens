import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * BrandGlyph — the small "AI brain in shopping cart" mark from the rebrand
 * artwork, with bright cyan lightning sparks emanating outward (matching the
 * brain-in-cart hero image). Used as a footer/CTA glyph and as a subtle brand
 * cue. Pure SVG, SSR-safe, no animation by default — set `animated` to enable
 * a soft pulsing glow.
 */
export interface BrandGlyphProps {
  size?: number;
  className?: string;
  title?: string;
  /** When true, the cart/glow softly pulses (CSS-only, respects reduced-motion). */
  animated?: boolean;
  /** When false, hides the lightning sparks for very small contexts. */
  showSparks?: boolean;
}

export function BrandGlyph({
  size = 36,
  className,
  title = "Mr.FLENS",
  animated = false,
  showSparks = true,
}: BrandGlyphProps) {
  // Unique <defs> ids per instance — multiple BrandGlyph instances on the
  // same page would otherwise share the first defined gradient/filter.
  const uid = useId().replace(/:/g, "");
  const glowId = `bg-glow-${uid}`;
  const blurId = `bg-blur-${uid}`;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn(
        "inline-block",
        animated &&
          "[animation:brand-glyph-pulse_3.2s_ease-in-out_infinite] motion-reduce:[animation:none]",
        className,
      )}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <filter id={blurId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>

      {/* Soft cyan halo */}
      <circle cx="32" cy="32" r="28" fill={`url(#${glowId})`} />

      {/* Lightning sparks emanating from the brain (matches artwork) */}
      {showSparks && (
        <g
          stroke="#67e8f9"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
          filter={`url(#${blurId})`}
        >
          <path d="M32 4 L30 10 L33 11 L31 16" />
          <path d="M50 8 L46 14 L49 16 L46 21" />
          <path d="M14 8 L18 14 L15 16 L18 21" />
          <path d="M58 24 L52 26 L54 29 L49 30" />
          <path d="M6 24 L12 26 L10 29 L15 30" />
        </g>
      )}

      {/* Cart handle */}
      <path
        d="M6 12 L14 12 L20 40 L52 40"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cart basket */}
      <path
        d="M16 20 L54 20 L50 36 L20 36 Z"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* Brain inside the basket */}
      <g
        transform="translate(20 18)"
        stroke="#22d3ee"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2 C8 2 6 4 6 7 C4 7 2 9 2 12 C2 14 3 15 4 16 C3 17 3 19 4 20 C5 21 7 21 8 20 L8 16 C8 14 9 13 11 13 L11 4 C11 3 12 2 12 2 Z" />
        <path d="M12 2 C16 2 18 4 18 7 C20 7 22 9 22 12 C22 14 21 15 20 16 C21 17 21 19 20 20 C19 21 17 21 16 20 L16 16 C16 14 15 13 13 13 L13 4 C13 3 12 2 12 2 Z" />
        <line x1="8" y1="9" x2="11" y2="9" />
        <line x1="13" y1="9" x2="16" y2="9" />
      </g>
      {/* Wheels */}
      <circle cx="26" cy="50" r="3" fill="#22d3ee" />
      <circle cx="46" cy="50" r="3" fill="#22d3ee" />
    </svg>
  );
}

export default BrandGlyph;
