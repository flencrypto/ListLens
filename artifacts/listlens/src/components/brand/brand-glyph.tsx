import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * BrandGlyph — the "AI brain in shopping cart" brand mark from the rebrand
 * artwork, rendered as a pure SVG. Bright cyan electric lightning sparks
 * emanate outward from the brain (matching the brain-in-cart hero image).
 * Used as a footer/CTA glyph and subtle brand cue.
 *
 * Pure SVG, SSR-safe, no animation by default — set `animated` to enable
 * a soft pulsing glow (CSS-only, respects prefers-reduced-motion).
 */
export interface BrandGlyphProps {
  size?: number;
  className?: string;
  title?: string;
  /** When true, the glyph softly pulses (CSS-only, respects reduced-motion). */
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
  // Unique <defs> ids per instance to avoid gradient collisions on multi-glyph pages.
  const uid = useId().replace(/:/g, "");
  const glowId = `bg-glow-${uid}`;
  const innerGlowId = `bg-inner-${uid}`;
  const blurId = `bg-blur-${uid}`;

  return (
    <svg
      viewBox="0 0 80 80"
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
        {/* Outer halo — large, soft cyan radial */}
        <radialGradient id={glowId} cx="50%" cy="48%" r="50%">
          <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.55" />
          <stop offset="50%"  stopColor="#22d3ee" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        {/* Inner glow around the brain core */}
        <radialGradient id={innerGlowId} cx="50%" cy="45%" r="40%">
          <stop offset="0%"   stopColor="#67e8f9" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        {/* Blur filter for spark glow layer */}
        <filter id={blurId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Outer halo */}
      <circle cx="40" cy="40" r="38" fill={`url(#${glowId})`} />

      {/* Lightning sparks — prominent, multi-branch, matching the artwork */}
      {showSparks && (
        <>
          {/* Glow layer (blurred duplicate) */}
          <g
            stroke="#67e8f9"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
            filter={`url(#${blurId})`}
          >
            {/* Top */}
            <path d="M40 3 L37 11 L41 12 L38 20" />
            {/* Top-right */}
            <path d="M62 9 L57 17 L61 19 L57 27" />
            {/* Top-left */}
            <path d="M18 9 L23 17 L19 19 L23 27" />
            {/* Right */}
            <path d="M76 30 L67 33 L70 37 L62 39" />
            {/* Left */}
            <path d="M4 30 L13 33 L10 37 L18 39" />
            {/* Bottom-right */}
            <path d="M70 58 L62 54 L64 50 L57 48" />
            {/* Bottom-left */}
            <path d="M10 58 L18 54 L16 50 L23 48" />
          </g>
          {/* Sharp layer */}
          <g
            stroke="#a5f3fc"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
            opacity="0.92"
          >
            <path d="M40 3 L37 11 L41 12 L38 20" />
            <path d="M62 9 L57 17 L61 19 L57 27" />
            <path d="M18 9 L23 17 L19 19 L23 27" />
            <path d="M76 30 L67 33 L70 37 L62 39" />
            <path d="M4 30 L13 33 L10 37 L18 39" />
            <path d="M70 58 L62 54 L64 50 L57 48" />
            <path d="M10 58 L18 54 L16 50 L23 48" />
          </g>
        </>
      )}

      {/* Inner core glow */}
      <circle cx="40" cy="36" r="18" fill={`url(#${innerGlowId})`} />

      {/* Cart handle */}
      <path
        d="M6 14 L16 14 L23 50 L64 50"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cart basket */}
      <path
        d="M19 24 L66 24 L62 44 L23 44 Z"
        fill="rgba(34,211,238,0.07)"
        stroke="#22d3ee"
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.7"
      />

      {/* Brain inside the basket — bi-lobed with more interior detail */}
      <g
        transform="translate(24 20)"
        stroke="#22d3ee"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left lobe */}
        <path d="M16 3 C10 3 7 5 7 9 C4 9 2 12 2 16 C2 19 3.5 20.5 5 21.5 C4 23 4 25.5 5.5 26.5 C7 27.5 9.5 27.5 11 26.5 L11 21 C11 18.5 12.5 17.5 14.5 17.5 L14.5 5 C14.5 3.5 16 3 16 3 Z" />
        {/* Right lobe */}
        <path d="M16 3 C22 3 25 5 25 9 C28 9 30 12 30 16 C30 19 28.5 20.5 27 21.5 C28 23 28 25.5 26.5 26.5 C25 27.5 22.5 27.5 21 26.5 L21 21 C21 18.5 19.5 17.5 17.5 17.5 L17.5 5 C17.5 3.5 16 3 16 3 Z" />
        {/* Corpus callosum lines */}
        <line x1="11" y1="11" x2="14.5" y2="11" />
        <line x1="17.5" y1="11" x2="21" y2="11" />
        <line x1="11" y1="15" x2="14.5" y2="15" />
        <line x1="17.5" y1="15" x2="21" y2="15" />
        {/* Stem */}
        <line x1="16" y1="26.5" x2="16" y2="30" />
      </g>

      {/* Wheels — filled cyan circles with inner highlight */}
      <circle cx="31" cy="62" r="4.5" fill="#22d3ee" />
      <circle cx="31" cy="62" r="2" fill="#cffafe" opacity="0.6" />
      <circle cx="56" cy="62" r="4.5" fill="#22d3ee" />
      <circle cx="56" cy="62" r="2" fill="#cffafe" opacity="0.6" />
    </svg>
  );
}

export default BrandGlyph;
