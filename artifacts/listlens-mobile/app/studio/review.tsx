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
  type PressingMatch,
  type StudioDraft,
} from "@/lib/historyStore";
import type { StudioAnalysis, ItemSpecific } from "@/lib/api";
import { confirmPressing, getItem, reanalyseItem, getItemSpecifics, publishItemToEbay, type AnalysisCorrections } from "@/lib/api";

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

  const [draftId, setDraftId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<number>(() => Date.now());
  const [body, setBody] = useState<DraftBody>(DEFAULT_BODY);
  const [hydrated, setHydrated] = useState(false);

  const isRecordLens = body.lens === "RecordLens" || (params.lens ? String(params.lens) : "") === "RecordLens";
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Correction panel state
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [corrections, setCorrections] = useState<AnalysisCorrections>(EMPTY_CORRECTIONS);
  const [reanalysing, setReanalysing] = useState(false);
  const [reanalyseError, setReanalyseError] = useState<string | null>(null);
  const [reanalysedAt, setReanalysedAt] = useState<number | null>(null);

  // eBay item specifics state
  const [ebaySpecifics, setEbaySpecifics] = useState<ItemSpecific[]>([]);
  const [editedSpecifics, setEditedSpecifics] = useState<Record<string, string>>({});
  const [specificsLoaded, setSpecificsLoaded] = useState(false);
  const [specificsOpen, setSpecificsOpen] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ listingId: string; viewItemURL: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Confirm pressing (matrix/runout) state
  const [needsMatrixConfirm, setNeedsMatrixConfirm] = useState(false);
  const [matrixSideA, setMatrixSideA] = useState("");
  const [matrixSideB, setMatrixSideB] = useState("");
  const [matrixSideCD, setMatrixSideCD] = useState("");
  const [matrixSubmitting, setMatrixSubmitting] = useState(false);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [matrixLikelihoods, setMatrixLikelihoods] = useState<PressingMatch[] | null>(null);
  const [pressingConfirmedAt, setPressingConfirmedAt] = useState<number | null>(null);

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
      const incomingItemId = params.itemId ? String(params.itemId) : null;
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
          if (existing.lens === "RecordLens" && (existing.matrixSideA || existing.matrixSideB || existing.matrixSideCD || existing.pressingMatches)) {
            setNeedsMatrixConfirm(true);
            setMatrixSideA(existing.matrixSideA ?? "");
            setMatrixSideB(existing.matrixSideB ?? "");
            setMatrixSideCD(existing.matrixSideCD ?? "");
            if (existing.pressingMatches && existing.pressingMatches.length > 0) {
              setMatrixLikelihoods(existing.pressingMatches);
            }
          }
          setHydrated(true);
          return;
        }

        // Draft not in local storage — try loading from API if we have an item id
        const apiItemId = incomingItemId ?? incomingId;
        try {
          const { listing } = await getItem(apiItemId);
          if (cancelled) return;
          const apiAnalysis = listing.analysis as (StudioAnalysis & Record<string, unknown>) | null;
          const apiBody: DraftBody = apiAnalysis
            ? analysisToBody(
                apiAnalysis,
                listing.lens,
                listing.marketplace ?? DEFAULT_BODY.marketplace,
                listing.photoUrls,
              )
            : {
                ...DEFAULT_BODY,
                lens: listing.lens,
                marketplace: listing.marketplace ?? DEFAULT_BODY.marketplace,
                photos: listing.photoUrls,
                title: listing.title ?? DEFAULT_BODY.title,
                description: listing.description ?? DEFAULT_BODY.description,
              };
          const createdTs = listing.createdAt ? new Date(listing.createdAt).getTime() : Date.now();
          setDraftId(apiItemId);
          setCreatedAt(createdTs);
          setBody(apiBody);
          setHydrated(true);
          return;
        } catch {
          // API fetch failed — fall through to blank draft
          if (cancelled) return;
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
          const parsed = JSON.parse(rawAnalysis) as StudioAnalysis & {
            needs_matrix_for_clarification?: boolean;
            record_analysis?: {
              needs_matrix_for_clarification?: boolean;
            };
          };
          setBody(
            analysisToBody(
              parsed,
              params.lens ? String(params.lens) : DEFAULT_BODY.lens,
              params.marketplace ? String(params.marketplace) : DEFAULT_BODY.marketplace,
              paramPhotos,
            ),
          );
          // Show the Confirm pressing card when RecordLens confidence is below 80%
          // or the analysis says matrix clarification is needed.
          // The flag lives at record_analysis.needs_matrix_for_clarification in the
          // full RecordLens pipeline output; also check top-level for compatibility.
          const lensName = params.lens ? String(params.lens) : DEFAULT_BODY.lens;
          if (lensName === "RecordLens") {
            const confidence = parsed.identity?.confidence ?? 1;
            const needsMatrix =
              (parsed.record_analysis?.needs_matrix_for_clarification ?? false) ||
              (parsed.needs_matrix_for_clarification ?? false);
            if (confidence < 0.8 || needsMatrix) {
              setNeedsMatrixConfirm(true);
            }
          }
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
        matrixSideA: matrixSideA || undefined,
        matrixSideB: matrixSideB || undefined,
        matrixSideCD: matrixSideCD || undefined,
        pressingMatches: matrixLikelihoods ?? undefined,
      };
      saveDraft(draft).catch(() => undefined);
    }, 250);
    return () => clearTimeout(handle);
  }, [hydrated, draftId, createdAt, body, matrixSideA, matrixSideB, matrixSideCD, matrixLikelihoods]);

  // Fetch eBay item specifics from the server once we have an itemId.
  useEffect(() => {
    if (!itemId) return;
    let cancelled = false;
    getItemSpecifics(itemId)
      .then(({ specifics }) => {
        if (cancelled) return;
        setEbaySpecifics(specifics);
        setSpecificsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setSpecificsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  async function handlePublishToEbay() {
    if (!itemId) return;
    setPublishing(true);
    setPublishError(null);
    setPublishResult(null);
    try {
      // Only send specificsOverrides when the specifics were successfully
      // loaded. If the fetch failed, omit the field entirely so the server
      // falls back to its own computed specifics rather than receiving an
      // empty array that would clear all item specifics.
      const specificsOverrides = specificsLoaded && ebaySpecifics.length > 0
        ? ebaySpecifics.map((s) => ({
            name: s.name,
            value: editedSpecifics[s.name] ?? s.value,
          }))
        : undefined;
      const result = await publishItemToEbay(itemId, {
        title: body.title,
        description: body.description,
        price: body.pricing.recommended || body.pricing.quick || 0,
        lens: body.lens,
        specificsOverrides,
      });
      setPublishResult({ listingId: result.listingId, viewItemURL: result.viewItemURL });
      setBody((d) => ({ ...d, exported: "ebay" }));
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Failed to publish to eBay.");
    } finally {
      setPublishing(false);
    }
  }

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

  async function handleConfirmPressing() {
    if (!itemId) return;
    const hasAny = matrixSideA.trim() || matrixSideB.trim() || matrixSideCD.trim();
    if (!hasAny) {
      setMatrixError("Enter at least one matrix etching before confirming.");
      return;
    }
    setMatrixSubmitting(true);
    setMatrixError(null);
    try {
      const result = await confirmPressing({
        itemId,
        matrixSideA: matrixSideA.trim() || undefined,
        matrixSideB: matrixSideB.trim() || undefined,
        matrixSideCD: matrixSideCD.trim() || undefined,
      });
      const ident = result.identification;
      const matches: PressingMatch[] = [
        {
          likely_release: ident.top_match.likely_release,
          likelihood_percent: ident.top_match.likelihood_percent,
          artist: ident.top_match.artist,
          title: ident.top_match.title,
          label: ident.top_match.label,
        },
        ...(ident.alternate_matches ?? []).map((m) => ({
          likely_release: (m["likely_release"] as string | undefined) ?? "",
          likelihood_percent: (m["likelihood_percent"] as number | undefined) ?? 0,
          artist: (m["artist"] as string | null | undefined) ?? null,
          title: (m["title"] as string | null | undefined) ?? null,
          label: (m["label"] as string | null | undefined) ?? null,
        })),
      ];
      setMatrixLikelihoods(matches);
      const topMatch = ident.top_match;
      const highConfidence = topMatch.likelihood_percent > 70;
      setBody((prev) => {
        const base = result.analysis
          ? analysisToBody(result.analysis!, prev.lens, prev.marketplace, prev.photos)
          : { ...prev };
        if (!highConfidence) return base;
        const artistTitle = [topMatch.artist, topMatch.title].filter(Boolean).join(" – ");
        const releaseLabel = topMatch.likely_release?.trim() || "pressing identified";
        const meta = [topMatch.label, releaseLabel].filter(Boolean).join(", ");
        const pressingTitle = artistTitle
          ? meta ? `${artistTitle} (${meta})` : artistTitle
          : base.title;
        const confirmedLine = `✓ Pressing confirmed: ${releaseLabel}`;
        const existingDesc = base.description ?? "";
        const alreadyPrepended = existingDesc.startsWith("✓ Pressing confirmed:");
        const newDescription = alreadyPrepended
          ? existingDesc.replace(/^✓ Pressing confirmed:[^\n]*/, confirmedLine)
          : existingDesc
          ? `${confirmedLine}\n\n${existingDesc}`
          : confirmedLine;
        return { ...base, title: pressingTitle, description: newDescription };
      });
      const now = Date.now();
      setReanalysedAt(now);
      if (highConfidence) setPressingConfirmedAt(now);
    } catch (err) {
      setMatrixError(
        err instanceof Error ? err.message : "Pressing confirmation failed. Please try again.",
      );
    } finally {
      setMatrixSubmitting(false);
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
            {(reanalysedAt || pressingConfirmedAt)
              ? "  ·  " +
                [reanalysedAt ? "Re-analysed" : null, pressingConfirmedAt ? "Pressing confirmed" : null]
                  .filter(Boolean)
                  .join(" · ")
              : ""}
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

      {/* Confirm pressing — shown for RecordLens when confidence < 80% or needs_matrix_for_clarification */}
      {isRecordLens && itemId && needsMatrixConfirm && (
        <Card>
          {matrixLikelihoods ? (
            /* Results view — ranked pressing likelihoods */
            <View>
              <View style={styles.confirmHeader}>
                <Feather name="disc" size={16} color={colors.brandCyan} />
                <Text style={[styles.cardTitle, { color: colors.foreground, flex: 1 }]}>
                  Pressing confirmed
                </Text>
              </View>
              <Text style={[styles.correctionSubtitle, { color: colors.zinc500, marginBottom: 12 }]}>
                Ranked by likelihood based on your matrix etchings
              </Text>
              {matrixLikelihoods.map((match, i) => (
                <View
                  key={i}
                  style={[
                    styles.likelihoodRow,
                    {
                      borderColor: i === 0 ? colors.cyan700 : colors.zinc800,
                      backgroundColor: i === 0 ? "rgba(8,51,68,0.35)" : "rgba(24,24,27,0.35)",
                    },
                  ]}
                >
                  <View style={styles.likelihoodPct}>
                    <Text style={[styles.likelihoodPctText, { color: i === 0 ? colors.brandCyan : colors.zinc400 }]}>
                      {match.likelihood_percent}%
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.likelihoodTitle, { color: colors.foreground }]}>
                      {[match.artist, match.title].filter(Boolean).join(" – ") || "Unknown release"}
                    </Text>
                    <Text style={[styles.likelihoodMeta, { color: colors.zinc500 }]}>
                      {[match.label, match.likely_release].filter(Boolean).join(" · ")}
                    </Text>
                  </View>
                </View>
              ))}
              <Pressable
                onPress={() => {
                  setMatrixLikelihoods(null);
                  setMatrixSideA("");
                  setMatrixSideB("");
                  setMatrixSideCD("");
                }}
                hitSlop={10}
                style={{ marginTop: 10 }}
              >
                <Text style={[styles.clearLink, { color: colors.zinc500 }]}>Re-enter matrix etchings</Text>
              </Pressable>
            </View>
          ) : (
            /* Input form */
            <View>
              <View style={styles.confirmHeader}>
                <Feather name="disc" size={16} color={colors.brandCyan} />
                <Text style={[styles.cardTitle, { color: colors.foreground, flex: 1 }]}>
                  Confirm pressing
                </Text>
              </View>
              <View style={[styles.matrixHint, { backgroundColor: "rgba(8,51,68,0.35)", borderColor: colors.cyan700, marginBottom: 12 }]}>
                <Feather name="info" size={12} color={colors.cyan300} />
                <Text style={[styles.matrixHintText, { color: colors.cyan300 }]}>
                  The matrix/runout is the text hand-etched into the dead wax (the blank area between the last groove and the label). It identifies the exact pressing plant, country, and generation. Enter what you see on each side to pinpoint the pressing.
                </Text>
              </View>
              <View style={{ gap: 10 }}>
                <CorrectionField
                  label="Matrix — Side A"
                  placeholder="e.g. POLYDOR 2383 230 A-1 △"
                  value={matrixSideA}
                  onChange={setMatrixSideA}
                  colors={colors}
                  mono
                />
                <CorrectionField
                  label="Matrix — Side B"
                  placeholder="e.g. POLYDOR 2383 230 B-1 △"
                  value={matrixSideB}
                  onChange={setMatrixSideB}
                  colors={colors}
                  mono
                />
                <CorrectionField
                  label="Matrix — Side C / D (optional, for doubles)"
                  placeholder="e.g. POLYDOR 2383 230 C-1"
                  value={matrixSideCD}
                  onChange={setMatrixSideCD}
                  colors={colors}
                  mono
                />
              </View>
              {matrixError && (
                <View style={[styles.errorBanner, { backgroundColor: "rgba(220,38,38,0.12)", borderColor: colors.red400, marginTop: 10 }]}>
                  <Feather name="alert-circle" size={13} color={colors.red400} />
                  <Text style={[styles.errorText, { color: colors.red400 }]}>{matrixError}</Text>
                </View>
              )}
              <View style={{ marginTop: 12 }}>
                <BrandButton
                  label={matrixSubmitting ? "Confirming pressing…" : "Confirm pressing"}
                  onPress={handleConfirmPressing}
                  disabled={matrixSubmitting}
                  loading={matrixSubmitting}
                />
              </View>
              <Pressable
                onPress={() => setNeedsMatrixConfirm(false)}
                hitSlop={10}
                style={{ marginTop: 10 }}
              >
                <Text style={[styles.clearLink, { color: colors.zinc500 }]}>Skip for now</Text>
              </Pressable>
            </View>
          )}
        </Card>
      )}

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

      {/* eBay item specifics — shown when we have a server item and eBay is the marketplace */}
      {itemId && (body.marketplace === "ebay" || body.marketplace === "both") && specificsLoaded && (
        <Card>
          <Pressable
            onPress={() => setSpecificsOpen((o) => !o)}
            style={styles.correctionHeader}
            hitSlop={8}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground, marginBottom: 2 }]}>
                eBay item specifics
              </Text>
              <Text style={[styles.correctionSubtitle, { color: colors.zinc500 }]}>
                {specificsOpen
                  ? "AI auto-filled · Edit any field before publishing"
                  : `${ebaySpecifics.length} field${ebaySpecifics.length === 1 ? "" : "s"} auto-filled by AI`}
              </Text>
            </View>
            <Feather
              name={specificsOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.zinc500}
            />
          </Pressable>

          {specificsOpen && (
            <View style={{ marginTop: 12, gap: 8 }}>
              {ebaySpecifics.length === 0 ? (
                <Text style={[styles.correctionSubtitle, { color: colors.zinc500 }]}>
                  No item specifics could be extracted for this lens.
                </Text>
              ) : (
                ebaySpecifics.map((spec) => {
                  const edited = editedSpecifics[spec.name];
                  const isEdited = edited !== undefined && edited !== spec.value;
                  return (
                    <View key={spec.name}>
                      <View style={styles.fieldHeader}>
                        <Text style={[styles.label, { color: colors.zinc400 }]}>{spec.name}</Text>
                        {isEdited ? (
                          <View style={styles.editedBadge}>
                            <Feather name="edit-2" size={10} color={colors.brandCyan} />
                            <Text style={[styles.editedBadgeText, { color: colors.brandCyan }]}>Edited</Text>
                          </View>
                        ) : spec.autoFilled ? (
                          <View style={[styles.aiBadge, { backgroundColor: "rgba(8,51,68,0.5)", borderColor: colors.cyan700 }]}>
                            <Feather name="cpu" size={10} color={colors.cyan300} />
                            <Text style={[styles.aiBadgeText, { color: colors.cyan300 }]}>AI</Text>
                          </View>
                        ) : null}
                      </View>
                      <TextInput
                        value={edited ?? spec.value}
                        onChangeText={(t) =>
                          setEditedSpecifics((prev) => ({ ...prev, [spec.name]: t }))
                        }
                        style={[
                          styles.input,
                          {
                            color: colors.foreground,
                            borderColor: isEdited ? colors.cyan700 : colors.zinc700,
                          },
                        ]}
                        placeholderTextColor={colors.zinc600}
                      />
                    </View>
                  );
                })
              )}

              {publishResult ? (
                <View style={[styles.matrixHint, { backgroundColor: "rgba(16,85,16,0.2)", borderColor: colors.brandGreen, marginTop: 4 }]}>
                  <Feather name="check-circle" size={13} color={colors.brandGreen} />
                  <Text style={[styles.matrixHintText, { color: colors.brandGreen }]}>
                    Listed on eBay · ID {publishResult.listingId}
                  </Text>
                </View>
              ) : (
                <>
                  {publishError && (
                    <View style={[styles.errorBanner, { backgroundColor: "rgba(220,38,38,0.12)", borderColor: colors.red400 }]}>
                      <Feather name="alert-circle" size={13} color={colors.red400} />
                      <Text style={[styles.errorText, { color: colors.red400 }]}>{publishError}</Text>
                    </View>
                  )}
                  <BrandButton
                    label={publishing ? "Publishing to eBay…" : "Publish to eBay"}
                    onPress={handlePublishToEbay}
                    disabled={publishing}
                    loading={publishing}
                  />
                </>
              )}
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
          {itemId && (body.marketplace === "ebay" || body.marketplace === "both")
            ? "Use \"Publish to eBay\" above to post directly, or copy to paste into the eBay app."
            : "Copy the listing details to paste directly into the eBay app."}
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
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aiBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.4,
  },
  editedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  editedBadgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.4,
  },
  confirmHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  likelihoodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  likelihoodPct: {
    width: 46,
    alignItems: "center",
  },
  likelihoodPctText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  likelihoodTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 2,
  },
  likelihoodMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
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
