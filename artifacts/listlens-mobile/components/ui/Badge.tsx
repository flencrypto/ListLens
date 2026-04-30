import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Tone = "cyan" | "violet" | "emerald" | "amber" | "neutral" | "red";

interface Props {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = "neutral" }: Props) {
  const colors = useColors();
  const map: Record<Tone, { bg: string; fg: string; border: string }> = {
    cyan: { bg: "rgba(8,51,68,0.6)", fg: colors.cyan300, border: "rgba(14,116,144,0.6)" },
    violet: { bg: "rgba(76,29,149,0.4)", fg: "#c4b5fd", border: "rgba(124,58,237,0.6)" },
    emerald: { bg: "rgba(6,78,59,0.5)", fg: colors.emerald300, border: "rgba(5,150,105,0.5)" },
    amber: { bg: "rgba(120,53,15,0.4)", fg: colors.amber300, border: "rgba(180,83,9,0.5)" },
    neutral: { bg: "rgba(39,39,42,0.7)", fg: colors.zinc300, border: colors.zinc700 },
    red: { bg: "rgba(127,29,29,0.45)", fg: colors.red400, border: "rgba(220,38,38,0.5)" },
  };
  const { bg, fg, border } = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});

export default Badge;
