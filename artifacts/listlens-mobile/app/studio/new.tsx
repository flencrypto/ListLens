import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { LENS_REGISTRY } from "@/constants/lenses";
import { getApiUrl } from "@/lib/api";

const MARKETPLACES = [
  { id: "both", label: "eBay + Vinted" },
  { id: "ebay", label: "eBay only" },
  { id: "vinted", label: "Vinted only" },
] as const;

interface WatchLookupResult {
  found: boolean;
  ref: string;
  brand?: string | null;
  model?: string | null;
  reference_number?: string | null;
  case_material?: string | null;
  price_min_gbp?: number | null;
  price_median_gbp?: number | null;
  price_max_gbp?: number | null;
  total_count?: number;
}

function buildWatchHint(r: WatchLookupResult): string {
  const parts: string[] = [];
  if (r.brand) parts.push(`Brand: ${r.brand}`);
  if (r.model) parts.push(`Model: ${r.model}`);
  if (r.reference_number) parts.push(`Reference: ${r.reference_number}`);
  if (r.case_material) parts.push(`Case material: ${r.case_material}`);
  if (r.price_median_gbp != null) {
    parts.push(
      `Chrono24 market price: £${r.price_min_gbp ?? "?"}–£${r.price_max_gbp ?? "?"} (median £${r.price_median_gbp})`
    );
  }
  return parts.join(". ");
}

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

  const isWatchLens = lens === "WatchLens";
  const [refInput, setRefInput] = useState("");
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [refResult, setRefResult] = useState<WatchLookupResult | null>(null);
  const [watchHint, setWatchHint] = useState<string>("");

  async function handleRefLookup() {
    const trimmed = refInput.trim();
    if (trimmed.length < 3) {
      setRefError("Enter at least 3 characters.");
      return;
    }
    setRefError(null);
    setRefResult(null);
    setRefLoading(true);
    try {
      const url = `${getApiUrl()}/lenses/watch/lookup?ref=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url);
      const data = (await res.json()) as WatchLookupResult;
      if (!res.ok) {
        setRefError((data as { error?: string }).error ?? "Lookup failed.");
        return;
      }
      setRefResult(data);
      if (data.found) {
        setWatchHint(buildWatchHint(data));
      }
    } catch {
      setRefError("Could not reach Chrono24 — please try again.");
    } finally {
      setRefLoading(false);
    }
  }

  function handleLensChange(newLens: string) {
    setLens(newLens);
    if (newLens !== "WatchLens") {
      setRefInput("");
      setRefResult(null);
      setRefError(null);
      setWatchHint("");
    }
  }

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
                onPress={() => handleLensChange(l.id)}
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

      {isWatchLens && (
        <Card>
          <Text
            style={{
              color: colors.cyan300,
              fontFamily: "Inter_600SemiBold",
              fontSize: 10,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            WatchLens · Reference lookup
          </Text>
          <Text style={[styles.refSubtitle, { color: colors.zinc400 }]}>
            Know the reference number? Search Chrono24 to auto-fill watch details and live pricing.
          </Text>

          <View style={styles.refRow}>
            <TextInput
              style={[
                styles.refInput,
                {
                  borderColor: colors.zinc700,
                  backgroundColor: "rgba(24,24,27,0.8)",
                  color: colors.foreground,
                },
              ]}
              placeholder="e.g. 116610LN, 5711/1A…"
              placeholderTextColor={colors.zinc500}
              value={refInput}
              onChangeText={setRefInput}
              onSubmitEditing={handleRefLookup}
              returnKeyType="search"
              editable={!refLoading}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Pressable
              onPress={handleRefLookup}
              disabled={refLoading || refInput.trim().length < 3}
              style={({ pressed }) => [
                styles.refButton,
                {
                  backgroundColor:
                    refLoading || refInput.trim().length < 3
                      ? "rgba(8,51,68,0.3)"
                      : pressed
                      ? "rgba(8,182,212,0.7)"
                      : "rgba(8,182,212,0.85)",
                },
              ]}
            >
              {refLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="search" size={16} color="#fff" />
              )}
            </Pressable>
          </View>

          {refError != null && (
            <Text style={[styles.refError, { color: "#f87171" }]}>
              {refError}
            </Text>
          )}

          {refResult && !refResult.found && (
            <Text style={[styles.refNote, { color: colors.zinc500 }]}>
              No listings found for "{refResult.ref}". Check the number or continue without it.
            </Text>
          )}

          {refResult?.found && (
            <View
              style={[
                styles.refCard,
                { borderColor: "rgba(8,182,212,0.3)", backgroundColor: "rgba(8,51,68,0.3)" },
              ]}
            >
              <View style={styles.refCardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.refCardTitle, { color: colors.foreground }]}>
                    {refResult.brand ?? "Unknown"}{refResult.model ? ` · ${refResult.model}` : ""}
                  </Text>
                  {refResult.reference_number != null && (
                    <Text style={[styles.refCardSub, { color: colors.zinc400 }]}>
                      Ref {refResult.reference_number}
                    </Text>
                  )}
                  {refResult.case_material != null && (
                    <Text style={[styles.refCardSub, { color: colors.zinc500 }]}>
                      Case: {refResult.case_material}
                    </Text>
                  )}
                </View>
                {refResult.price_median_gbp != null && (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.refCardPrice, { color: colors.cyan300 }]}>
                      £{refResult.price_median_gbp.toLocaleString()}
                    </Text>
                    {refResult.price_min_gbp != null && refResult.price_max_gbp != null && (
                      <Text style={[styles.refCardRange, { color: colors.zinc500 }]}>
                        £{refResult.price_min_gbp.toLocaleString()}–£{refResult.price_max_gbp.toLocaleString()}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              <Text style={[styles.refCardNote, { color: "#4ade80" }]}>
                Details auto-filled — AI will use this for accurate pricing.
              </Text>
            </View>
          )}
        </Card>
      )}

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
            params: {
              lens,
              marketplace,
              ...(watchHint ? { hint: watchHint } : {}),
            },
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
  refSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  refRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  refInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  refButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  refError: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 8,
  },
  refNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 8,
  },
  refCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  refCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  refCardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  refCardSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  refCardPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: -0.5,
  },
  refCardRange: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  refCardNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
