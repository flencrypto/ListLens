import React from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props extends ViewProps {
  padded?: boolean;
  highlight?: boolean;
  /** When true, adds a soft cyan glow + brighter inner stroke (HUD recipe). */
  glow?: boolean;
  /** Use the violet (Guard) tone instead of the default cyan tone. */
  tone?: "cyan" | "violet";
}

/**
 * Card — the standard surface for content blocks. Uses the layered HUD
 * recipe: deep navy fill, faint cyan inner stroke and an optional glow.
 *
 * Pair `highlight` with `tone="violet"` for Guard-themed surfaces.
 */
export function Card({
  children,
  padded = true,
  highlight = false,
  glow = false,
  tone = "cyan",
  style,
  ...rest
}: Props) {
  const colors = useColors();

  const violet = tone === "violet";
  const fill = highlight
    ? violet
      ? "rgba(20, 14, 36, 0.7)"
      : colors.cardSurfaceHi
    : colors.cardSurfaceSoft;
  const border = highlight
    ? violet
      ? "rgba(139, 92, 246, 0.35)"
      : colors.brandStrokeStrong
    : violet
      ? "rgba(139, 92, 246, 0.2)"
      : colors.brandStroke;
  const glowColor = violet ? "rgba(139,92,246,0.35)" : colors.brandGlow;

  return (
    <View
      {...rest}
      style={[
        styles.card,
        {
          backgroundColor: fill,
          borderColor: border,
          borderRadius: colors.radius,
          padding: padded ? 18 : 0,
        },
        glow
          ? Platform.select({
              web: {
                // RN-web deprecates shadow* props — use boxShadow directly so
                // the preview console stays quiet. Visual is equivalent.
                boxShadow: `0 8px 18px ${glowColor}`,
              },
              default: {
                shadowColor: glowColor,
                shadowOpacity: 0.7,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                // Android elevation for a faint lift
                elevation: 6,
              },
            })
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});

export default Card;
