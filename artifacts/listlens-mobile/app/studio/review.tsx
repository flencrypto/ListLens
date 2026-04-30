import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";

interface DemoDraft {
  title: string;
  brand: string;
  size: string;
  description: string;
  bullets: string[];
  pricing: { quick: number; recommended: number; high: number };
  flags: { severity: "high" | "medium" | "low"; text: string }[];
}

const DEFAULT_DRAFT: DemoDraft = {
  title: "Nike Air Max 90 — UK 10 — Worn",
  brand: "Nike",
  size: "UK 10 / EU 45 / US 11",
  description:
    "Worn but clean Nike Air Max 90 in white/grey. Original laces. Light creasing on the toe box, sole intact with even wear. Photos taken in natural light. Smoke-free home, ships next day.",
  bullets: [
    "Style code visible on the inside size label",
    "Outsole shows even wear, no separation",
    "Original laces and sock liner",
    "Stored in a smoke-free home",
  ],
  pricing: { quick: 38, recommended: 52, high: 68 },
  flags: [
    {
      severity: "low",
      text: "Add a clean side-on photo for size confidence",
    },
  ],
};

export default function ReviewScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{
    lens?: string;
    marketplace?: string;
    photos?: string;
  }>();
  const photos = useMemo(
    () => (params.photos ? String(params.photos).split("|").filter(Boolean) : []),
    [params.photos],
  );
  const [draft, setDraft] = useState<DemoDraft>(DEFAULT_DRAFT);
  const [exported, setExported] = useState<"none" | "ebay" | "vinted">("none");

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Review draft
          </Text>
          <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
            {params.lens ?? "ShoeLens"} · {photos.length} photo
            {photos.length === 1 ? "" : "s"}
          </Text>
        </View>
        <Badge label="AI draft" tone="cyan" />
      </View>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
        >
          {photos.map((uri, i) => (
            <Image
              key={`${uri}-${i}`}
              source={{ uri }}
              style={styles.heroPhoto}
              contentFit="cover"
              transition={120}
            />
          ))}
        </ScrollView>
      )}

      <Card>
        <Text style={[styles.label, { color: colors.zinc400 }]}>Title</Text>
        <TextInput
          value={draft.title}
          onChangeText={(t) => setDraft((d) => ({ ...d, title: t }))}
          style={[styles.input, { color: colors.foreground, borderColor: colors.zinc700 }]}
          multiline
        />
        <View style={styles.specsRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.zinc400 }]}>Brand</Text>
            <TextInput
              value={draft.brand}
              onChangeText={(t) => setDraft((d) => ({ ...d, brand: t }))}
              style={[
                styles.input,
                { color: colors.foreground, borderColor: colors.zinc700 },
              ]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.zinc400 }]}>Size</Text>
            <TextInput
              value={draft.size}
              onChangeText={(t) => setDraft((d) => ({ ...d, size: t }))}
              style={[
                styles.input,
                { color: colors.foreground, borderColor: colors.zinc700 },
              ]}
            />
          </View>
        </View>
        <Text style={[styles.label, { color: colors.zinc400 }]}>Description</Text>
        <TextInput
          value={draft.description}
          onChangeText={(t) => setDraft((d) => ({ ...d, description: t }))}
          style={[
            styles.input,
            {
              color: colors.foreground,
              borderColor: colors.zinc700,
              minHeight: 96,
            },
          ]}
          multiline
        />
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Item highlights
        </Text>
        {draft.bullets.map((b, i) => (
          <View key={i} style={styles.bulletRow}>
            <Feather name="check-circle" size={14} color={colors.brandCyan} />
            <Text style={[styles.bulletText, { color: colors.zinc300 }]}>{b}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Suggested pricing
        </Text>
        <View style={styles.pricingRow}>
          <PriceTile label="Quick sale" value={draft.pricing.quick} tone={colors.zinc400} />
          <PriceTile
            label="Recommended"
            value={draft.pricing.recommended}
            tone={colors.brandCyan}
            highlight
          />
          <PriceTile label="High" value={draft.pricing.high} tone={colors.brandGreen} />
        </View>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Evidence check
        </Text>
        {draft.flags.map((flag, i) => (
          <View key={i} style={styles.flagRow}>
            <Feather
              name="info"
              size={14}
              color={
                flag.severity === "high"
                  ? colors.red400
                  : flag.severity === "medium"
                  ? colors.amber400
                  : colors.cyan300
              }
            />
            <Text style={[styles.flagText, { color: colors.zinc300 }]}>
              {flag.text}
            </Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Export
        </Text>
        <View style={{ gap: 10 }}>
          <BrandButton
            label={
              exported === "vinted"
                ? "✓ Vinted draft saved"
                : "Export to Vinted"
            }
            onPress={() => setExported("vinted")}
          />
          <BrandButton
            label={
              exported === "ebay" ? "✓ eBay payload saved" : "Save eBay draft"
            }
            variant="outline"
            onPress={() => setExported("ebay")}
          />
        </View>
      </Card>

      <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={12}>
        <Text style={[styles.linkText, { color: colors.cyan300 }]}>
          ← Back to dashboard
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

function PriceTile({
  label,
  value,
  tone,
  highlight = false,
}: {
  label: string;
  value: number;
  tone: string;
  highlight?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.priceTile,
        {
          borderColor: highlight ? colors.cyan700 : colors.zinc800,
          backgroundColor: highlight
            ? "rgba(8,51,68,0.45)"
            : "rgba(24,24,27,0.45)",
        },
      ]}
    >
      <Text style={[styles.priceLabel, { color: tone }]}>{label}</Text>
      <Text style={[styles.priceValue, { color: colors.foreground }]}>
        £{value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  heroPhoto: {
    width: 132,
    height: 132,
    borderRadius: 14,
    backgroundColor: "#111",
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 10,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  specsRow: {
    flexDirection: "row",
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  bulletText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  pricingRow: {
    flexDirection: "row",
    gap: 10,
  },
  priceTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  priceLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  priceValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 6,
  },
  flagRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  flagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  linkText: {
    textAlign: "center",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    paddingVertical: 8,
  },
});
