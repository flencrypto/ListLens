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
 * BrandGlyph — the "AI brain in shopping cart" brand mark from the rebrand
 * artwork, with bright cyan electric lightning sparks emanating outward
 * (matching the brain-in-cart hero image). Used as a quiet brand cue at the
 * bottom of the splash and as a footer glyph. Pure SVG, no animation.
 */
export function BrandGlyph({ size = 36, showSparks = true }: Props) {
  const colors = useColors();
  const stroke = colors.brandCyan;
  const sparkColour = colors.cyan300;
  // Unique gradient IDs per instance — multiple BrandGlyph instances on the
  // same screen (or on Expo web in the same document) would otherwise share
  // the first defined gradient and produce incorrect fills.
  const uid = useId().replace(/:/g, "");
  const glowId = `brand-glyph-glow-${uid}`;
  const innerGlowId = `brand-glyph-inner-${uid}`;

  return (
    <Svg viewBox="0 0 80 80" width={size} height={size}>
      <Defs>
        {/* Outer halo */}
        <RadialGradient id={glowId} cx="50%" cy="48%" r="50%">
          <Stop offset="0%"   stopColor={stroke} stopOpacity="0.55" />
          <Stop offset="50%"  stopColor={stroke} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </RadialGradient>
        {/* Inner glow around brain core */}
        <RadialGradient id={innerGlowId} cx="50%" cy="45%" r="40%">
          <Stop offset="0%"   stopColor={colors.cyan300} stopOpacity="0.7" />
          <Stop offset="100%" stopColor={stroke}         stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Outer halo */}
      <Circle cx={40} cy={40} r={38} fill={`url(#${glowId})`} />

      {/* Lightning sparks — prominent, multi-branch */}
      {showSparks ? (
        <G
          stroke={sparkColour}
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
          opacity={0.92}
        >
          <Path d="M40 3 L37 11 L41 12 L38 20" />
          <Path d="M62 9 L57 17 L61 19 L57 27" />
          <Path d="M18 9 L23 17 L19 19 L23 27" />
          <Path d="M76 30 L67 33 L70 37 L62 39" />
          <Path d="M4 30 L13 33 L10 37 L18 39" />
          <Path d="M70 58 L62 54 L64 50 L57 48" />
          <Path d="M10 58 L18 54 L16 50 L23 48" />
        </G>
      ) : null}

      {/* Inner core glow */}
      <Circle cx={40} cy={36} r={18} fill={`url(#${innerGlowId})`} />

      {/* Cart handle */}
      <Path
        d="M6 14 L16 14 L23 50 L64 50"
        fill="none"
        stroke={stroke}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cart basket */}
      <Path
        d="M19 24 L66 24 L62 44 L23 44 Z"
        fill="rgba(34,211,238,0.07)"
        stroke={stroke}
        strokeWidth={3}
        strokeLinejoin="round"
        opacity={0.7}
      />

      {/* Brain inside the basket */}
      <G
        transform="translate(24 20)"
        stroke={stroke}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left lobe */}
        <Path d="M16 3 C10 3 7 5 7 9 C4 9 2 12 2 16 C2 19 3.5 20.5 5 21.5 C4 23 4 25.5 5.5 26.5 C7 27.5 9.5 27.5 11 26.5 L11 21 C11 18.5 12.5 17.5 14.5 17.5 L14.5 5 C14.5 3.5 16 3 16 3 Z" />
        {/* Right lobe */}
        <Path d="M16 3 C22 3 25 5 25 9 C28 9 30 12 30 16 C30 19 28.5 20.5 27 21.5 C28 23 28 25.5 26.5 26.5 C25 27.5 22.5 27.5 21 26.5 L21 21 C21 18.5 19.5 17.5 17.5 17.5 L17.5 5 C17.5 3.5 16 3 16 3 Z" />
        {/* Corpus callosum lines */}
        <Line x1="11" y1="11" x2="14.5" y2="11" />
        <Line x1="17.5" y1="11" x2="21" y2="11" />
        <Line x1="11" y1="15" x2="14.5" y2="15" />
        <Line x1="17.5" y1="15" x2="21" y2="15" />
        {/* Stem */}
        <Line x1="16" y1="26.5" x2="16" y2="30" />
      </G>

      {/* Wheels — filled with inner highlight */}
      <Circle cx={31} cy={62} r={4.5} fill={stroke} />
      <Circle cx={31} cy={62} r={2}   fill="#cffafe" opacity={0.6} />
      <Circle cx={56} cy={62} r={4.5} fill={stroke} />
      <Circle cx={56} cy={62} r={2}   fill="#cffafe" opacity={0.6} />
    </Svg>
  );
}

export default BrandGlyph;
