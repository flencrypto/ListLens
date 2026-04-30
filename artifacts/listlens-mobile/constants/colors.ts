/**
 * Mr.FLENS · List-LENS — mobile design tokens.
 *
 * Mirrors the web app palette: deep navy backdrop, cyan/green/amber tri-tone
 * accents and the cyan→violet primary gradient. The mobile app is dark-first
 * to match the web brand, so both `light` and `dark` resolve to the same
 * dark palette (avoids a jarring switch on devices set to "light").
 */

const palette = {
  text: "#fafafa",
  tint: "#22d3ee",

  background: "#040a14",
  foreground: "#fafafa",

  card: "rgba(24, 24, 27, 0.55)",
  cardForeground: "#fafafa",

  primary: "#22d3ee",
  primaryForeground: "#040a14",

  secondary: "rgba(39, 39, 42, 0.7)",
  secondaryForeground: "#fafafa",

  muted: "rgba(39, 39, 42, 0.6)",
  mutedForeground: "#a1a1aa",

  accent: "#22d3ee",
  accentForeground: "#040a14",

  destructive: "#f87171",
  destructiveForeground: "#fafafa",

  border: "rgba(63, 63, 70, 0.6)",
  input: "rgba(24, 24, 27, 0.85)",

  brandCyan: "#22d3ee",
  brandBlue: "#3ea8ff",
  brandBlueBright: "#2979ff",
  brandGreen: "#4ade80",
  brandAmber: "#fb923c",
  brandViolet: "#8b5cf6",
  brandViolet600: "#7c3aed",

  navy: "#040a14",
  navyDeep: "#020610",
  navy2: "#081325",
  cardSurface: "#0a1628",
  cardSurfaceSoft: "rgba(10, 22, 40, 0.65)",
  cardSurfaceHi: "rgba(10, 22, 40, 0.85)",
  zincDeep: "#09090b",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",
  zinc600: "#52525b",
  zinc500: "#71717a",
  zinc400: "#a1a1aa",
  zinc300: "#d4d4d8",
  zinc200: "#e4e4e7",

  cyan100: "#cffafe",
  cyan200: "#a5f3fc",
  cyan300: "#67e8f9",
  cyan400: "#22d3ee",
  cyan500: "#06b6d4",
  cyan600: "#0891b2",
  cyan700: "#0e7490",
  cyan800: "#155e75",
  cyan900: "#164e63",
  cyan950: "#083344",

  emerald300: "#6ee7b7",
  emerald400: "#34d399",
  amber300: "#fcd34d",
  amber400: "#fbbf24",
  red400: "#f87171",
  red500: "#ef4444",

  // HUD inner-stroke / glow recipe (used by Card & Spinner).
  brandStroke: "rgba(34, 211, 238, 0.18)",
  brandStrokeStrong: "rgba(34, 211, 238, 0.32)",
  brandGlow: "rgba(34, 211, 238, 0.35)",
};

const colors = {
  light: palette,
  dark: palette,
  radius: 16,
  // Reusable HUD tri-tone gauge stops (cyan → green → amber).
  hudGauge: ["#22d3ee", "#4ade80", "#facc15", "#fb923c"] as const,
};

export default colors;
