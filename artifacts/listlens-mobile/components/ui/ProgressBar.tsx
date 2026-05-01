import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  /** 0–100 */
  value: number;
  label?: string;
}

export function ProgressBar({ value, label }: Props) {
  const colors = useColors();
  const clamped = Math.max(0, Math.min(100, value));
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [clamped, widthAnim]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.wrapper}>
      {label !== undefined && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.zinc400 }]}>
            {label}
          </Text>
          <Text style={[styles.pct, { color: colors.brandCyan }]}>
            {clamped}%
          </Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: colors.zinc800 }]}>
        <Animated.View
          style={[
            styles.fill,
            { width: widthInterpolated, backgroundColor: colors.brandCyan },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  pct: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
