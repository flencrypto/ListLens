import React, { useId } from "react";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface Props {
  size?: number;
  /** When false, hides the lightning sparks for very small contexts. */
  showSparks?: boolean;
}

/**
 * BrandGlyph — the small "AI brain in shopping cart" mark from the rebrand
 * artwork, with bright cyan lightning sparks emanating outward (matching the
 * brain-in-cart hero image). Used as a quiet brand cue at the bottom of the
 * splash and as a footer glyph. Pure SVG, SSR-safe.
 */
export function BrandGlyph({ size = 36, showSparks = true }: Props) {
  const colors = useColors();
  const stroke = colors.brandCyan;
  const sparkColour = colors.cyan300;
  // Unique gradient id per instance — multiple BrandGlyph instances on the
  // same screen would otherwise collide on `id="brand-glyph-glow"`.
  const glowId = `brand-glyph-glow-${useId().replace(/:/g, "")}`;
  return (
    <Svg viewBox="0 0 64 64" width={size} height={size}>
      <Defs>
        <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
          <Stop offset="60%" stopColor={stroke} stopOpacity="0.08" />
          <Stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {/* Soft cyan halo */}
      <Circle cx={32} cy={32} r={28} fill={`url(#${glowId})`} />

      {/* Lightning sparks emanating from the brain (matches artwork) */}
      {showSparks ? (
        <G
          stroke={sparkColour}
          strokeWidth={1.1}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        >
          <Path d="M32 4 L30 10 L33 11 L31 16" />
          <Path d="M50 8 L46 14 L49 16 L46 21" />
          <Path d="M14 8 L18 14 L15 16 L18 21" />
          <Path d="M58 24 L52 26 L54 29 L49 30" />
          <Path d="M6 24 L12 26 L10 29 L15 30" />
        </G>
      ) : null}

      <Path
        d="M6 12 L14 12 L20 40 L52 40"
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 20 L54 20 L50 36 L20 36 Z"
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinejoin="round"
        opacity={0.55}
      />
      <G
        transform="translate(20 18)"
        stroke={stroke}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M12 2 C8 2 6 4 6 7 C4 7 2 9 2 12 C2 14 3 15 4 16 C3 17 3 19 4 20 C5 21 7 21 8 20 L8 16 C8 14 9 13 11 13 L11 4 C11 3 12 2 12 2 Z" />
        <Path d="M12 2 C16 2 18 4 18 7 C20 7 22 9 22 12 C22 14 21 15 20 16 C21 17 21 19 20 20 C19 21 17 21 16 20 L16 16 C16 14 15 13 13 13 L13 4 C13 3 12 2 12 2 Z" />
        <Line x1="8" y1="9" x2="11" y2="9" />
        <Line x1="13" y1="9" x2="16" y2="9" />
      </G>
      <Circle cx={26} cy={50} r={3} fill={stroke} />
      <Circle cx={46} cy={50} r={3} fill={stroke} />
    </Svg>
  );
}

export default BrandGlyph;
