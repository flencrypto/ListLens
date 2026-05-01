import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import {
  generateId,
  getDraft,
  saveDraft,
  type StudioDraft,
} from "@/lib/historyStore";
import type { StudioAnalysis } from "@/lib/api";
import { reanalyseItem, type AnalysisCorrections } from "@/lib/api";

type DraftBody = Omit<StudioDraft, "id" | "createdAt" | "updatedAt">;

const DEFAULT_BODY: DraftBody = {
  lens: "ShoeLens",
  marketplace: "both",
  photos: [],
  title: "AI-drafted listing",
  brand: "",
  size: "",
  description: "Listing drafted from your photos.",
  bullets: [],
  pricing: { quick: 0, recommended: 0, high: 0 },
  flags: [],
  exported: "none",
};

function analysisToBody(
  analysis: StudioAnalysis,
  lens: string,
  marketplace: string,
  photos: string[],
): DraftBody {
  const ebay = analysis.marketplace_outputs?.ebay ?? {};
  const vinted = analysis.marketplace_outputs?.vinted ?? {};
  const identityStr =
    [analysis.identity?.brand, analysis.identity?.model]
      .filter(Boolean)
      .join(" ") || "AI-drafted listing";
  const title =
    (ebay["title"] as string | undefined) ??
    (vinted["title"] as string | undefined) ??
    identityStr;

  const attrs = analysis.attributes ?? {};

  const size =
    (attrs["size"] as string | undefined) ??
    (attrs["Size"] as string | undefined) ??
    (attrs["size_label"] as string | undefined) ??
    "";

  function flattenAttr(key: string, value: unknown): string {
    if (value === null || value === undefined) return `${key}: —`;
    if (typeof value !== "object") return `${key}: ${String(value)}`;
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${String(v)}`);
    return `${key} — ${entries.join(", ")}`;
  }

  const SKIP_KEYS = new Set(["size", "Size", "size_label"]);

  const bullets: string[] = Object.entries(attrs)
    .filter(([k]) => !SKIP_KEYS.has(k))
    .slice(0, 8)
    .map(([k, v]) => flattenAttr(k, v));

  const flags: DraftBody["flags"] = [
    ...(analysis.missing_photos ?? []).map((text) => ({
      severity: "medium" as const,
      text,
    })),
    ...(analysis.warnings ?? []).map((text) => ({
      severity: "low" as const,
      text,
    })),
  ];

  return {
    lens,
    marketplace,
    photos,
    title,
    brand: analysis.identity?.brand ?? "",
    size,
    description: analysis.listing_description ?? "",
    bullets,
    pricing: {
      quick: analysis.pricing?.quick_sale ?? 0,
      recommended: analysis.pricing?.recommended ?? 0,
      high: analysis.pricing?.high ?? 0,
    },
    flags,
    exported: "none",
  };
}

const EMPTY_CORRECTIONS: AnalysisCorrections = {
  matrix_a: "",
  matrix_b: "",
  country: "",
  year: "",
  catalogue_number: "",
  label: "",
};

export default function ReviewScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{
    lens?: string;
    marketplace?: string;
    photos?: string;
    draftId?: string;
    analysis?: string;
    itemId?: string;
  }>();

  const paramPhotos = useMemo(
    () => (params.photos ? String(params.photos).split("|").filter(Boolean) : []),
    [params.photos],
  );

  const itemId = params.itemId ? String(params.itemId) : null;
  const isRecordLens = (params.lens ? String(params.lens) : "") === "RecordLens";

  const [draftId, setDraftId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<number>(() => Date.now());
  const [body, setBody] = useState<DraftBody>(DEFAULT_BODY);
  const [hydrated, setHydrated] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Correction panel state
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [corrections, setCorrections] = useState<AnalysisCorrections>(EMPTY_CORRECTIONS);
  const [reanalysing, setReanalysing] = useState(false);
  const [reanalyseError, setReanalyseError] = useState<string | null>(null);
  const [reanalysedAt, setReanalysedAt] = useState<number | null>(null);

  const copyField = useCallback(async (key: string, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
  }, []);

  // Hydrate from storage (existing draft) or seed a new one from params.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const incomingId = params.draftId ? String(params.draftId) : null;
      if (incomingId) {
        const existing = await getDraft(incomingId);
        if (cancelled) return;
        if (existing) {
          setDraftId(existing.id);
          setCreatedAt(existing.createdAt);
          setBody({
            lens: existing.lens,
            marketplace: existing.marketplace,
            photos: existing.photos,
            title: existing.title,
            brand: existing.brand,
            size: existing.size,
            description: existing.description,
            bullets: existing.bullets,
            pricing: existing.pricing,
            flags: existing.flags,
            exported: existing.exported,
          });
          setHydrated(true);
          return;
        }
      }

      const id = generateId();
      const now = Date.now();
      if (cancelled) return;
      setDraftId(id);
      setCreatedAt(now);

      const rawAnalysis = params.analysis ? String(params.analysis) : null;
      if (rawAnalysis) {
        try {
          const parsed = JSON.parse(rawAnalysis) as StudioAnalysis;
          setBody(
            analysisToBody(
              parsed,
              params.lens ? String(params.lens) : DEFAULT_BODY.lens,
              params.marketplace ? String(params.marketplace) : DEFAULT_BODY.marketplace,
              paramPhotos,
            ),
          );
        } catch {
          setBody({
            ...DEFAULT_BODY,
            lens: params.lens ? String(params.lens) : DEFAULT_BODY.lens,
            marketplace: params.marketplace ? String(params.marketplace) : DEFAULT_BODY.marketplace,
            photos: paramPhotos,
          });
        }
      } else {
        setBody({
          ...DEFAULT_BODY,
          lens: params.lens ? String(params.lens) : DEFAULT_BODY.lens,
          marketplace: params.marketplace
            ? String(params.marketplace)
            : DEFAULT_BODY.marketplace,
          photos: paramPhotos,
        });
      }
      setHydrated(true);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.draftId]);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (!hydrated || !draftId) return;
    const handle = setTimeout(() => {
      const draft: StudioDraft = {
        id: draftId,
        createdAt,
        updatedAt: Date.now(),
        ...body,
      };
      saveDraft(draft).catch(() => undefined);
    }, 250);
    return () => clearTimeout(handle);
  }, [hydrated, draftId, createdAt, body]);

  async function handleReanalyse() {
    if (!itemId) return;
    const hasAnyCorrection = Object.values(corrections).some((v) => v?.trim());
    if (!hasAnyCorrection) {
      setReanalyseError("Enter at least one correction before re-analysing.");
      return;
    }
    setReanalysing(true);
    setReanalyseError(null);
    try {
      const { analysis } = await reanalyseItem(itemId, corrections);
      setBody((prev) =>
        analysisToBody(
          analysis,
          prev.lens,
          prev.marketplace,
          prev.photos,
        ),
      );
      setReanalysedAt(Date.now());
      setCorrectionOpen(false);
    } catch (err) {
      setReanalyseError(
        err instanceof Error ? err.message : "Re-analysis failed. Please try again.",
      );
    } finally {
      setReanalysing(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Review draft
          </Text>
          <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
            {body.lens} · {body.photos.length} photo
            {body.photos.length === 1 ? "" : "s"}
            {reanalysedAt ? "  ·  Re-analysed" : ""}
          </Text>
        </View>
        <Badge label="AI draft" tone="cyan" />
      </View>

      {body.photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
        >
          {body.photos.map((uri, i) => (
            <ReviewPhoto key={`${uri}-${i}`} uri={uri} />
          ))}
        </ScrollView>
      )}

      <Card>
        <View style={styles.fieldHeader}>
          <Text style={[styles.label, { color: colors.zinc400 }]}>Title</Text>
          <Pressable
            onPress={() => copyField("title", body.title)}
            hitSlop={10}
            style={styles.copyBtn}
          >
            <Feather
              name={copiedKey === "title" ? "check" : "copy"}
              size={13}
              color={copiedKey === "title" ? colors.brandCyan : colors.zinc500}
            />
            <Text style={[styles.copyLabel, { color: copiedKey === "title" ? colors.brandCyan : colors.zinc500 }]}>
              {copiedKey === "title" ? "Copied" : "Copy"}
            </Text>
          </Pressable>
        </View>
        <TextInput
          value={body.title}
          onChangeText={(t) => setBody((d) => ({ ...d, title: t }))}
          style={[styles.input, { color: colors.foreground, borderColor: colors.zinc700 }]}
          multiline
        />
        <View style={styles.specsRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.zinc400 }]}>Brand</Text>
            <TextInput
              value={body.brand}
              onChangeText={(t) => setBody((d) => ({ ...d, brand: t }))}
              style={[
                styles.input,
                { color: colors.foreground, borderColor: colors.zinc700 },
              ]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.zinc400 }]}>Size</Text>
            <TextInput
              value={body.size}
              onChangeText={(t) => setBody((d) => ({ ...d, size: t }))}
              style={[
                styles.input,
                { color: colors.foreground, borderColor: colors.zinc700 },
              ]}
            />
          </View>
        </View>
        <View style={styles.fieldHeader}>
          <Text style={[styles.label, { color: colors.zinc400 }]}>Description</Text>
          <Pressable
            onPress={() => copyField("desc", body.description)}
            hitSlop={10}
            style={styles.copyBtn}
          >
            <Feather
              name={copiedKey === "desc" ? "check" : "copy"}
              size={13}
              color={copiedKey === "desc" ? colors.brandCyan : colors.zinc500}
            />
            <Text style={[styles.copyLabel, { color: copiedKey === "desc" ? colors.brandCyan : colors.zinc500 }]}>
              {copiedKey === "desc" ? "Copied" : "Copy"}
            </Text>
          </Pressable>
        </View>
        <TextInput
          value={body.description}
          onChangeText={(t) => setBody((d) => ({ ...d, description: t }))}
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
        {body.bullets.map((b, i) => (
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
          <PriceTile label="Quick sale" value={body.pricing.quick} tone={colors.zinc400} />
          <PriceTile
            label="Recommended"
            value={body.pricing.recommended}
            tone={colors.brandCyan}
            highlight
          />
          <PriceTile label="High" value={body.pricing.high} tone={colors.brandGreen} />
        </View>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Evidence check
        </Text>
        {body.flags.map((flag, i) => (
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

      {/* Correct & Re-analyse — only shown for RecordLens when we have a server itemId */}
      {isRecordLens && itemId && (
        <Card>
          <Pressable
            onPress={() => setCorrectionOpen((o) => !o)}
            style={styles.correctionHeader}
            hitSlop={8}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground, marginBottom: 2 }]}>
                Correct identification
              </Text>
              <Text style={[styles.correctionSubtitle, { color: colors.zinc500 }]}>
                {correctionOpen
                  ? "Enter corrections and re-analyse"
                  : "Tap to fix country, matrix, catalogue number…"}
              </Text>
            </View>
            <Feather
              name={correctionOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.zinc500}
            />
          </Pressable>

          {correctionOpen && (
            <View style={{ marginTop: 12, gap: 10 }}>
              <CorrectionField
                label="Matrix — Side A"
                placeholder="e.g. POLYDOR 2383 230 A-1"
                value={corrections.matrix_a ?? ""}
                onChange={(v) => setCorrections((c) => ({ ...c, matrix_a: v }))}
                colors={colors}
                mono
              />
              <CorrectionField
                label="Matrix — Side B"
                placeholder="e.g. POLYDOR 2383 230 B-1"
                value={corrections.matrix_b ?? ""}
                onChange={(v) => setCorrections((c) => ({ ...c, matrix_b: v }))}
                colors={colors}
                mono
              />
              <View style={styles.specsRow}>
                <View style={{ flex: 1 }}>
                  <CorrectionField
                    label="Country"
                    placeholder="e.g. Canada"
                    value={corrections.country ?? ""}
                    onChange={(v) => setCorrections((c) => ({ ...c, country: v }))}
                    colors={colors}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <CorrectionField
                    label="Year"
                    placeholder="e.g. 1973"
                    value={corrections.year ?? ""}
                    onChange={(v) => setCorrections((c) => ({ ...c, year: v }))}
                    colors={colors}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <CorrectionField
                label="Catalogue number"
                placeholder="e.g. 2383 230"
                value={corrections.catalogue_number ?? ""}
                onChange={(v) => setCorrections((c) => ({ ...c, catalogue_number: v }))}
                colors={colors}
              />
              <CorrectionField
                label="Label"
                placeholder="e.g. Polydor"
                value={corrections.label ?? ""}
                onChange={(v) => setCorrections((c) => ({ ...c, label: v }))}
                colors={colors}
              />

              {reanalyseError && (
                <View style={[styles.errorBanner, { backgroundColor: "rgba(220,38,38,0.12)", borderColor: colors.red400 }]}>
                  <Feather name="alert-circle" size={13} color={colors.red400} />
                  <Text style={[styles.errorText, { color: colors.red400 }]}>{reanalyseError}</Text>
                </View>
              )}

              <View style={[styles.matrixHint, { backgroundColor: "rgba(8,51,68,0.35)", borderColor: colors.cyan700 }]}>
                <Feather name="info" size={12} color={colors.cyan300} />
                <Text style={[styles.matrixHintText, { color: colors.cyan300 }]}>
                  Matrix etchings are the strongest evidence. The AI will search Discogs using them first to pinpoint the exact pressing and adjust the valuation.
                </Text>
              </View>

              <BrandButton
                label={reanalysing ? "Re-analysing…" : "Re-analyse with corrections"}
                onPress={handleReanalyse}
                disabled={reanalysing}
                loading={reanalysing}
              />

              <Pressable
                onPress={() => {
                  setCorrections(EMPTY_CORRECTIONS);
                  setReanalyseError(null);
                }}
                hitSlop={10}
              >
                <Text style={[styles.clearLink, { color: colors.zinc500 }]}>Clear corrections</Text>
              </Pressable>
            </View>
          )}
        </Card>
      )}

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Export
        </Text>
        <View style={{ gap: 10 }}>
          <BrandButton
            label={
              body.exported === "vinted"
                ? "✓ Vinted draft saved"
                : "Export to Vinted"
            }
            onPress={() => {
              setBody((d) => ({ ...d, exported: "vinted" }));
            }}
          />
          <BrandButton
            label={copiedKey === "ebay-all" ? "✓ Copied to clipboard" : "Copy all for eBay"}
            variant="outline"
            onPress={() => {
              const recPrice = body.pricing.recommended ? `£${body.pricing.recommended}` : "";
              const allText = [
                `Title: ${body.title}`,
                body.brand ? `Brand: ${body.brand}` : "",
                body.size ? `Size: ${body.size}` : "",
                recPrice ? `Recommended price: ${recPrice}` : "",
                "",
                body.description,
              ]
                .filter((line) => line !== null && line !== undefined)
                .join("\n")
                .trim();
              copyField("ebay-all", allText);
              setBody((d) => ({ ...d, exported: "ebay" }));
            }}
          />
        </View>
        <Text style={[styles.exportHint, { color: colors.zinc600 }]}>
          Copy the listing details to paste directly into the eBay app while direct publishing is being set up.
        </Text>
      </Card>

      <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={12}>
        <Text style={[styles.linkText, { color: colors.cyan300 }]}>
          ← Back to dashboard
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CorrectionField({
  label,
  placeholder,
  value,
  onChange,
  colors,
  mono = false,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  colors: ReturnType<typeof useColors>;
  mono?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View>
      <Text style={[styles.label, { color: colors.zinc400 }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.zinc600}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="characters"
        style={[
          styles.input,
          {
            color: colors.foreground,
            borderColor: colors.zinc700,
            fontFamily: mono ? "Courier" : undefined,
          },
        ]}
      />
    </View>
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
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 4,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  copyLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  exportHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 10,
    lineHeight: 16,
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
  correctionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  correctionSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  matrixHint: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  matrixHintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  clearLink: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 4,
  },
});

function ReviewPhoto({ uri }: { uri: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <View style={[styles.heroPhoto, { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(8,16,28,0.85)" }]}>
        <Feather name="image" size={28} color="rgba(113,113,122,0.6)" />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={styles.heroPhoto}
      contentFit="cover"
      transition={120}
      onError={() => setError(true)}
    />
  );
}
