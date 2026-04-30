import { cn } from "@/lib/utils";

/**
 * BrandGlyph — the small "AI brain in shopping cart" mark that appears at the
 * bottom of the rebrand artwork. Used as a footer/CTA glyph and as a subtle
 * brand cue. Pure SVG, SSR-safe, no animation.
 */
export interface BrandGlyphProps {
  size?: number;
  className?: string;
  title?: string;
}

export function BrandGlyph({
  size = 36,
  className,
  title = "Mr.FLENS",
}: BrandGlyphProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("inline-block", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
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
      <g transform="translate(20 18)" stroke="#22d3ee" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
