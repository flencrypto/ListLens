import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  layout?: "stacked" | "inline";
  size?: "sm" | "md" | "lg";
}

/**
 * BrandWordmark — "MR.FLENS · LIST-LENS" lockup.
 *
 * The web app uses bg-clip-text + a cyan→green gradient for the primary word;
 * React Native doesn't support gradient text natively without a masked-view
 * dependency, so we fall back to the strongest brand colour (cyan-blue) which
 * reads identically against the dark navy backdrop.
 */
export function BrandWordmark({ layout = "inline", size = "md" }: Props) {
  const colors = useColors();
  const top = size === "lg" ? 44 : size === "md" ? 22 : 16;
  const sub = size === "lg" ? 14 : size === "md" ? 10 : 9;
  const tracking = size === "lg" ? 5 : size === "md" ? 2.6 : 1.8;

  const wordmark = (
    <Text
      style={{
        fontFamily: "Inter_700Bold",
        fontSize: top,
        letterSpacing: -0.5,
        color: colors.brandCyan,
      }}
    >
      MR.FLENS
    </Text>
  );

  const subline = (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: sub,
        letterSpacing: tracking,
        color: colors.cyan200,
        textTransform: "uppercase",
      }}
    >
      List-LENS
    </Text>
  );

  if (layout === "stacked") {
    return (
      <View style={styles.stacked}>
        {wordmark}
        <View style={{ height: 6 }} />
        {subline}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      {wordmark}
      <View style={{ width: 8 }} />
      {subline}
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: {
    alignItems: "center",
  },
  inline: {
    flexDirection: "row",
    alignItems: "baseline",
  },
});

export default BrandWordmark;
