import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";

const FEATURES = [
  "Paste a listing URL or upload screenshots",
  "AI risk report: low / medium / high / inconclusive",
  "Red flags with severity — missing photos, price anomalies",
  "Suggested questions to ask the seller",
  "Safe trust language — never over-claims authenticity",
];

const NEVER = [
  "✗ \"This is fake\"",
  "✗ \"Definitely counterfeit\"",
  "✗ \"This seller is a scammer\"",
];

const ALWAYS = [
  "✓ \"High replica-risk indicators found\"",
  "✓ \"Authenticity cannot be confirmed\"",
  "✓ \"AI-assisted risk screen\"",
];

export default function GuardScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer withTabPadding>
      <View style={styles.header}>
        <View style={[styles.iconBubble, { borderColor: "rgba(139,92,246,0.4)" }]}>
          <Feather name="shield" size={20} color={colors.brandViolet} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Guard</Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Check a listing before you buy. AI risk screen with red flags and
          questions to ask the seller.
        </Text>
      </View>

      <Card tone="violet" glow>
        <Text style={[styles.cardLead, { color: "#c4b5fd" }]}>
          What you get
        </Text>
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Feather name="check" size={14} color={colors.brandViolet} />
              <Text style={[styles.featureText, { color: colors.zinc300 }]}>
                {f}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <BrandButton
        label="Run a Guard check"
        size="lg"
        variant="guard"
        onPress={() => router.push("/guard/check")}
        iconLeft={<Feather name="search" size={18} color="#040a14" />}
      />

      {/* Trust language — mirrors the home page block */}
      <View style={styles.trustRow}>
        <Card style={{ flex: 1, borderColor: "rgba(127,29,29,0.4)" }}>
          <Text style={[styles.trustHeader, { color: colors.red400 }]}>
            We never say
          </Text>
          {NEVER.map((line) => (
            <Text key={line} style={[styles.trustLine, { color: "#fca5a5" }]}>
              {line}
            </Text>
          ))}
        </Card>
        <Card style={{ flex: 1, borderColor: "rgba(6,78,59,0.4)" }}>
          <Text style={[styles.trustHeader, { color: colors.emerald400 }]}>
            We always say
          </Text>
          {ALWAYS.map((line) => (
            <Text key={line} style={[styles.trustLine, { color: colors.emerald300 }]}>
              {line}
            </Text>
          ))}
        </Card>
      </View>

      <Text style={[styles.disclaimer, { color: colors.zinc500 }]}>
        AI-assisted risk screen, not formal authentication.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    gap: 8,
    alignItems: "flex-start",
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(76,29,149,0.35)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  cardLead: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  featureList: { gap: 10 },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  featureText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  trustRow: {
    flexDirection: "row",
    gap: 10,
  },
  trustHeader: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  trustLine: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 17,
  },
  disclaimer: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
