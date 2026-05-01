import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { LENS_REGISTRY } from "@/constants/lenses";

const MARKETPLACES = [
  { id: "both", label: "eBay + Vinted" },
  { id: "ebay", label: "eBay only" },
  { id: "vinted", label: "Vinted only" },
] as const;

export default function NewListingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { lens: lensParam } = useLocalSearchParams<{ lens?: string }>();
  const liveLenses = LENS_REGISTRY.filter((l) => l.status === "live");
  const initialLens =
    lensParam && liveLenses.some((l) => l.id === lensParam)
      ? lensParam
      : (liveLenses[0]?.id ?? "ShoeLens");
  const [lens, setLens] = useState(initialLens);
  const [marketplace, setMarketplace] = useState<string>("both");

  return (
    <ScreenContainer>
      <View style={styles.intro}>
        <Text
          style={{
            color: colors.cyan300,
            fontFamily: "Inter_600SemiBold",
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Studio · New listing
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          New Listing
        </Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Choose your lens and marketplace, then capture photos.
        </Text>
        <View
          style={{
            marginTop: 10,
            width: 80,
            height: 1,
            backgroundColor: colors.brandStrokeStrong,
          }}
        />
      </View>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Choose Lens
        </Text>
        <View style={styles.lensGrid}>
          {liveLenses.map((l) => {
            const selected = lens === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => setLens(l.id)}
                style={({ pressed }) => [
                  styles.lensTile,
                  {
                    borderColor: selected ? colors.brandCyan : colors.zinc700,
                    backgroundColor: selected
                      ? "rgba(8,51,68,0.55)"
                      : "rgba(24,24,27,0.6)",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={styles.lensTileIcon}>{l.icon}</Text>
                <Text
                  style={[styles.lensTileName, { color: colors.foreground }]}
                >
                  {l.name}
                </Text>
                <Text
                  style={[styles.lensTileDesc, { color: colors.zinc400 }]}
                  numberOfLines={2}
                >
                  {l.category}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Marketplace
        </Text>
        <View style={styles.chipRow}>
          {MARKETPLACES.map((mp) => {
            const selected = marketplace === mp.id;
            return (
              <Pressable
                key={mp.id}
                onPress={() => setMarketplace(mp.id)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: selected ? colors.brandViolet : colors.zinc700,
                    backgroundColor: selected
                      ? "rgba(76,29,149,0.4)"
                      : "rgba(24,24,27,0.55)",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selected ? "#c4b5fd" : colors.zinc300 },
                  ]}
                >
                  {mp.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <BrandButton
        label={`Continue with ${lens}`}
        size="lg"
        iconLeft={<Feather name="arrow-right" size={18} color="#040a14" />}
        onPress={() => {
          router.push({
            pathname: "/studio/capture",
            params: { lens, marketplace },
          });
        }}
      />

      <Text style={[styles.note, { color: colors.zinc500 }]}>
        Photos are sent securely to AI for analysis. Drafts are reviewed before
        any export.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    paddingHorizontal: 4,
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 12,
  },
  lensGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  lensTile: {
    flexBasis: "48%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  lensTileIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  lensTileName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  lensTileDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  note: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
});
