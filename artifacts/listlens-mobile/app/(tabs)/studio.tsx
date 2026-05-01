import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";

const FEATURES = [
  "Capture or upload 3–8 photos with the camera",
  "Title, description, bullet points, item specifics",
  "Quick sale / recommended / high price ranges",
  "Missing evidence warnings before you list",
  "One-click Vinted export or eBay draft payload",
];

export default function StudioScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer withTabPadding>
      <View style={styles.header}>
        <View style={styles.iconBubble}>
          <Feather name="camera" size={20} color={colors.brandCyan} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Studio</Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Snap a few photos, get an AI-drafted listing in seconds. Built for
          eBay and Vinted.
        </Text>
      </View>

      <Card glow>
        <Text style={[styles.cardLead, { color: colors.cyan300 }]}>
          What you get
        </Text>
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Feather name="check" size={14} color={colors.brandCyan} />
              <Text style={[styles.featureText, { color: colors.zinc300 }]}>
                {f}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <BrandButton
        label="Start a new listing"
        size="lg"
        onPress={() => router.push("/studio/new")}
        iconLeft={<Feather name="plus" size={18} color="#040a14" />}
      />

      <Card>
        <Text style={[styles.cardLead, { color: colors.foreground }]}>
          How it works
        </Text>
        <Text style={[styles.cardBody, { color: colors.zinc400 }]}>
          Photos are sent securely to GPT-4o vision for analysis. The AI reads
          your item and drafts a full listing. You review and edit before
          exporting to eBay or Vinted.
        </Text>
      </Card>
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
    backgroundColor: "rgba(8,51,68,0.55)",
    borderColor: "rgba(34,211,238,0.3)",
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
  cardBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
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
});
