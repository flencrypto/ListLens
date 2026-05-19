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
  title = "ListLens",
  animated = false,
  showSparks = true,
}: BrandGlyphProps) {
  // Unique <defs> ids per instance — multiple BrandGlyph instances on the
  // same page would otherwise share the first defined gradient/filter.
  const uid = useId().replace(/:/g, "");
  const glowId = `bg-glow-${uid}`;
  const blurId = `bg-blur-${uid}`;
  const strokeId = `bg-stroke-${uid}`;
  return (
    <svg
      viewBox="0 0 96 96"
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
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#0082FF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0082FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={strokeId} x1="12" y1="16" x2="82" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0082FF" />
          <stop offset="70%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#7A00FF" />
        </linearGradient>
        <filter id={blurId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.25" />
        </filter>
      </defs>

      <circle cx="48" cy="48" r="40" fill={`url(#${glowId})`} />

      {showSparks && (
        <g
          stroke="url(#strokeId)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
          filter={`url(#${blurId})`}
        >
          <path d="M9 35 H18 L23 31" />
          <path d="M12 48 H24" />
          <path d="M14 61 H25 L29 58" />
          <path d="M87 35 H78 L73 31" />
          <path d="M84 48 H72" />
          <path d="M82 61 H71 L67 58" />
        </g>
      )}

      <path
        d="M16 18 H28"
        fill="none"
        stroke="url(#strokeId)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 18 L36 58 H74"
        fill="none"
        stroke="url(#strokeId)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 30 H78 L70 56 H40"
        fill="none"
        stroke="url(#strokeId)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 41 H66"
        fill="none"
        stroke="#A9D8FF"
        strokeOpacity="0.45"
        strokeWidth="1.4"
      />
      <path
        d="M45 47 H64"
        fill="none"
        stroke="#A9D8FF"
        strokeOpacity="0.35"
        strokeWidth="1.4"
      />
      <g
        transform="translate(40 18)"
        stroke="url(#strokeId)"
        strokeWidth="2.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 11 C8 5 12 1 18 1 C20 1 22 2 23 3 C25 2 27 1 30 1 C36 1 40 5 40 11 C44 12 46 15 46 19 C46 23 44 26 41 28 C42 33 39 37 34 37 C32 37 30 36 29 35 C27 37 24 38 21 38 C17 38 14 36 12 33 C6 34 2 31 2 24 C2 21 3 18 6 16 C6 14 7 12 8 11 Z" />
        <path d="M24 6 V31" />
        <path d="M16 10 L24 14 L32 10" />
        <path d="M11 19 H19" />
        <path d="M29 18 H37" />
        <path d="M15 27 L20 23" />
        <path d="M29 23 L34 27" />
        <circle cx="16" cy="10" r="1.5" fill="#A9D8FF" stroke="none" />
        <circle cx="32" cy="10" r="1.5" fill="#A9D8FF" stroke="none" />
        <circle cx="11" cy="19" r="1.5" fill="#A9D8FF" stroke="none" />
        <circle cx="37" cy="18" r="1.5" fill="#A9D8FF" stroke="none" />
        <circle cx="20" cy="23" r="1.5" fill="#A9D8FF" stroke="none" />
        <circle cx="29" cy="23" r="1.5" fill="#A9D8FF" stroke="none" />
      </g>
      <circle cx="46" cy="69" r="5.5" fill="var(--background)" stroke="url(#strokeId)" strokeWidth="4" />
      <circle cx="67" cy="69" r="5.5" fill="var(--background)" stroke="url(#strokeId)" strokeWidth="4" />
      <circle cx="46" cy="69" r="1.6" fill="#0082FF" />
      <circle cx="67" cy="69" r="1.6" fill="#0082FF" />
    </svg>
  );
}

export default BrandGlyph;
