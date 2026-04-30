import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

/**
 * BrandBackground — the deep navy backdrop with cyan/green/amber atmospheric
 * glows, mirroring the web `brand-background.tsx`. Pure visuals, no animation
 * (the BrandLens supplies motion on top).
 */
export function BrandBackground() {
  const colors = useColors();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.navy }]} />
      {/* Directional cyan top-light to lift content above the fold */}
      <LinearGradient
        colors={["rgba(62,168,255,0.18)", "transparent"]}
        style={[StyleSheet.absoluteFill, { height: "55%" }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Cyan top glow */}
      <View
        style={[
          styles.glow,
          {
            top: -180,
            left: "50%",
            marginLeft: -260,
            width: 520,
            height: 520,
            backgroundColor: colors.brandCyan,
            opacity: 0.18,
          },
        ]}
      />
      {/* Green left glow */}
      <View
        style={[
          styles.glow,
          {
            top: 240,
            left: -140,
            width: 360,
            height: 360,
            backgroundColor: colors.brandGreen,
            opacity: 0.12,
          },
        ]}
      />
      {/* Amber right glow */}
      <View
        style={[
          styles.glow,
          {
            bottom: -120,
            right: -140,
            width: 360,
            height: 360,
            backgroundColor: colors.brandAmber,
            opacity: 0.12,
          },
        ]}
      />
      {/* Vignette */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    borderRadius: 400,
  },
});

export default BrandBackground;
