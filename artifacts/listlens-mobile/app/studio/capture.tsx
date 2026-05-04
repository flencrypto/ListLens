import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { uploadPhoto } from "@/lib/api";
import type { StudioAnalysis } from "@/lib/api";
import { analysisToBody } from "@/lib/draftUtils";
import { saveDraft, type StudioDraft } from "@/lib/historyStore";
import { useCreateStudioItem, useAnalyseStudioItem } from "@workspace/api-client-react";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 8;
const UPLOAD_CONCURRENCY = 3;

const LENS_PHOTO_INSTRUCTIONS: Record<string, string> = {
  ShoeLens:
    "Lateral (outer) side, medial (inner) side, toe box, heel, sole/outsole, size tag on tongue, and any scuffs or sole wear.",
  RecordLens:
    "Front sleeve, back sleeve, label Side A, label Side B, matrix/runout etching Side A, matrix/runout etching Side B, and any sleeve damage or vinyl marks.",
  ClothingLens:
    "Front, back, brand tag, care/wash label, close-up of any pilling, fading, or staining, collar, cuffs, and zip or buttons.",
  CardLens:
    "Card face, card reverse, all four corners (close-up), edges, surface under raking light, and hologram or stamp if present.",
  ToyLens:
    "Front, back, all loose accessories or parts, any play wear or paint loss, batch/serial number stamp, and packaging or box if present.",
  WatchLens:
    "Dial face (straight on), case side at 3 o'clock, crown, caseback (engravings visible), bracelet or strap, clasp, running proof video or seconds-hand movement, and any scratches or blemishes.",
  MeasureLens:
    "Item alongside your chosen reference object from front, side, and top. Keep the full reference object visible in every shot.",
  MotorLens:
    "Part number or casting stamp, front face, rear face, mounting points, connector or port (if applicable), and any corrosion, cracks, or damage.",
};

function getLensCaptureInstructions(lens: string): string {
  return (
    LENS_PHOTO_INSTRUCTIONS[lens] ??
    "Front, back, and close-ups of any identifying marks, labels, or wear."
  );
}

const MEASURE_REFERENCE_OBJECTS = [
  { id: "credit_card", label: "Credit card", hint: "credit card (85.6×54mm)" },
  { id: "a4_paper", label: "A4 paper", hint: "A4 paper sheet (297×210mm)" },
  { id: "ruler", label: "30cm ruler", hint: "30cm ruler" },
  { id: "coin_50p", label: "50p coin", hint: "UK 50p coin (27.3mm)" },
  { id: "a5_notebook", label: "A5 notebook", hint: "A5 notebook (210×148mm)" },
] as const;

interface PhotoEntry {
  uri: string;
  mimeType?: string;
}

export default function CaptureScreen() {
  const colors = useColors();
  const router = useRouter();
  const { lens = "ShoeLens", marketplace = "both", hint: hintParam } = useLocalSearchParams<{
    lens?: string;
    marketplace?: string;
    hint?: string;
  }>();
  const isMeasureLens = lens === "MeasureLens";
  const { mutateAsync: createStudioItemAsync } = useCreateStudioItem();
  const { mutateAsync: analyseStudioItemAsync } = useAnalyseStudioItem();
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [uploadCount, setUploadCount] = useState<{ done: number; total: number } | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [referenceObjectId, setReferenceObjectId] = useState<string>(
    MEASURE_REFERENCE_OBJECTS[0].id,
  );
  const [photoStates, setPhotoStates] = useState<Record<number, "uploading" | "uploaded">>({});

  async function takePhoto() {
    if (photos.length >= MAX_PHOTOS) {
      notify(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    if (Platform.OS === "web") {
      return pickFromLibrary();
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      notify("Camera permission was declined. You can enable it in Settings.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
        () => undefined,
      );
      // Auto-save to device so photos are available in Guard and the system library
      const libPerm = await MediaLibrary.requestPermissionsAsync();
      if (libPerm.granted) {
        await MediaLibrary.saveToLibraryAsync(asset.uri).catch(() => undefined);
      }
      setPhotos((prev) => [
        ...prev,
        {
          uri: asset.uri,
          mimeType: asset.mimeType ?? "image/jpeg",
        },
      ]);
    }
  }

  async function pickFromLibrary() {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      notify(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    if (Platform.OS !== "web") {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        notify(
          "Photo library permission was declined. You can enable it in Settings.",
        );
        return;
      }
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!res.canceled) {
      const next: PhotoEntry[] = res.assets
        .map((a) => ({
          uri: a.uri,
          mimeType: a.mimeType ?? "image/jpeg",
        }))
        .slice(0, remaining);
      setPhotos((prev) => [...prev, ...next]);
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function startProgressPhase(
    label: string,
    fromPct: number,
    toPct: number,
    durationMs: number,
  ) {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgressLabel(label);
    setProgressValue(fromPct);
    const tickMs = 300;
    const totalTicks = durationMs / tickMs;
    let tick = 0;
    progressIntervalRef.current = setInterval(() => {
      tick++;
      const easedFraction = 1 - Math.exp((-4 * tick) / totalTicks);
      const next = fromPct + (toPct - fromPct) * Math.min(easedFraction, 0.97);
      setProgressValue(Math.round(next));
      if (tick >= totalTicks * 1.5) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, tickMs);
  }

  function stopProgress() {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = null;
  }

  async function startAnalysis() {
    if (photos.length < MIN_PHOTOS) {
      notify(`Add at least ${MIN_PHOTOS} photos to analyse.`);
      return;
    }
    setBusy(true);
    setProgressValue(0);
    setProgressLabel("Uploading photos…");
    setUploadCount({ done: 0, total: photos.length });
    // Mark all photos as uploading immediately
    setPhotoStates(
      photos.reduce<Record<number, "uploading" | "uploaded">>((acc, _, idx) => {
        acc[idx] = "uploading";
        return acc;
      }, {}),
    );

    try {
      // Phase 1: upload photos in parallel batches so we can show live count (0→45%)
      const photoUrls: string[] = new Array(photos.length);
      let uploadsDone = 0;
      for (let i = 0; i < photos.length; i += UPLOAD_CONCURRENCY) {
        const batch = photos.slice(i, i + UPLOAD_CONCURRENCY);
        await Promise.all(
          batch.map(async (p, batchIdx) => {
            const globalIdx = i + batchIdx;
            const url = await uploadPhoto(p.uri, p.mimeType ?? "image/jpeg");
            photoUrls[globalIdx] = url;
            uploadsDone += 1;
            setUploadCount({ done: uploadsDone, total: photos.length });
            setProgressValue(Math.round((uploadsDone / photos.length) * 45));
            // Mark this specific photo as uploaded
            setPhotoStates((prev) => ({ ...prev, [globalIdx]: "uploaded" }));
          }),
        );
      }

      // Uploads complete — clear counter, clear per-photo states, move to AI phase (45→95%)
      setUploadCount(null);
      setPhotoStates({});
      setProgressLabel("Analysing with AI…");

      const measureHint = isMeasureLens
        ? `Reference object in photos: ${
            MEASURE_REFERENCE_OBJECTS.find((r) => r.id === referenceObjectId)
              ?.hint ?? "unknown reference"
          }. Use this to estimate item dimensions accurately.`
        : undefined;

      const combinedHint = [hintParam, measureHint].filter(Boolean).join(" | ") || undefined;

      // Animate fake progress for the AI call (typically 5–30 s)
      startProgressPhase("Analysing with AI…", 45, 95, 30_000);

      const { id } = await createStudioItemAsync({
        data: {
          lens: String(lens),
          marketplace: String(marketplace),
          photoUrls,
        },
      });

      const { analysis } = await analyseStudioItemAsync({
        id,
        data: {
          lens: String(lens),
          photoUrls,
          ...(combinedHint ? { hint: combinedHint } : {}),
        },
      });

      // Done — snap to 100%
      stopProgress();
      setProgressLabel("Complete!");
      setProgressValue(100);

      // Build a draft from the analysis and save it to on-device storage before
      // navigating. Using the API item id as the draft id means history entries
      // from both local storage and the API route to the same review screen.
      const safeAnalysis = analysis as unknown as StudioAnalysis;
      const draftBody = analysisToBody(safeAnalysis, String(lens), String(marketplace), photoUrls);

      // Detect whether RecordLens needs matrix/runout clarification.
      const ext = analysis as unknown as {
        needs_matrix_for_clarification?: boolean;
        record_analysis?: { needs_matrix_for_clarification?: boolean };
      };
      const needsMatrixConfirm =
        String(lens) === "RecordLens" &&
        ((ext.record_analysis?.needs_matrix_for_clarification ?? false) ||
          (ext.needs_matrix_for_clarification ?? false) ||
          analysis.identity.confidence < 0.8);

      const now = Date.now();
      const draft: StudioDraft = {
        id,
        createdAt: now,
        updatedAt: now,
        ...draftBody,
        needsMatrixConfirm: needsMatrixConfirm || undefined,
      };
      await saveDraft(draft).catch(() => undefined);

      // Brief pause so user sees 100%, then navigate
      await new Promise((r) => setTimeout(r, 400));

      router.replace({
        pathname: "/studio/review",
        params: {
          draftId: id,
          itemId: id,
          fresh: "1",
        },
      });
    } catch {
      stopProgress();
      setUploadCount(null);
      setPhotoStates({});
      notify("AI analysis failed. Please check your connection and try again.");
      setBusy(false);
      setProgressValue(0);
    }
  }

  function notify(message: string) {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("Heads up", message);
    }
  }

  return (
    <ScreenContainer>
      {/* Progress overlay */}
      <Modal
        visible={busy}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.overlayBackdrop}>
          <View style={[styles.overlayCard, { backgroundColor: colors.zinc900 }]}>
            <Text
              style={[styles.overlayEyebrow, { color: colors.cyan300 }]}
            >
              Studio · AI Analysis
            </Text>
            <Text style={[styles.overlayTitle, { color: colors.foreground }]}>
              {progressLabel || "Processing…"}
            </Text>
            {uploadCount !== null && (
              <Text style={[styles.overlayCounter, { color: colors.cyan300 }]}>
                {uploadCount.done} / {uploadCount.total} uploaded
              </Text>
            )}
            <View style={{ marginTop: uploadCount !== null ? 12 : 20 }}>
              <ProgressBar value={progressValue} label={progressLabel} />
            </View>
            <Text style={[styles.overlayHint, { color: colors.zinc500 }]}>
              {uploadCount !== null
                ? "Uploading over Wi-Fi is fastest. Keep the app open."
                : "This usually takes 5–30 seconds. Keep the app open."}
            </Text>
          </View>
        </View>
      </Modal>

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
          Studio · Capture
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Capture Photos
        </Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          {lens} · Add {MIN_PHOTOS}–{MAX_PHOTOS} photos.{" "}
          {getLensCaptureInstructions(String(lens))}
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

      <Card padded={false} style={{ padding: 14 }}>
        <View style={styles.gridHeader}>
          <Text style={[styles.cardLabel, { color: colors.foreground }]}>
            Photos
          </Text>
          <Text style={[styles.counter, { color: colors.zinc400 }]}>
            {photos.length}/{MAX_PHOTOS}
          </Text>
        </View>

        <View style={styles.thumbGrid}>
          {photos.map((entry, idx) => (
            <CaptureThumb
              key={`${entry.uri}-${idx}`}
              uri={entry.uri}
              onRemove={() => removePhoto(idx)}
              uploading={photoStates[idx] === "uploading"}
              uploaded={photoStates[idx] === "uploaded"}
            />
          ))}
          {photos.length < MAX_PHOTOS && (
            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [
                styles.thumbAdd,
                {
                  borderColor: colors.brandCyan,
                  backgroundColor: pressed
                    ? "rgba(8,51,68,0.6)"
                    : "rgba(8,51,68,0.3)",
                },
              ]}
            >
              <Feather name="camera" size={22} color={colors.brandCyan} />
              <Text style={[styles.addLabel, { color: colors.brandCyan }]}>
                Take photo
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{ height: 12 }} />
        <BrandButton
          label="Pick from library"
          variant="outline"
          size="md"
          onPress={pickFromLibrary}
          iconLeft={<Feather name="image" size={16} color={colors.cyan100} />}
        />
      </Card>

      {isMeasureLens && (
        <Card>
          <Text style={[styles.cardLabel, { color: colors.foreground, marginBottom: 6 }]}>
            Reference object
          </Text>
          <Text style={[styles.measureTip, { color: colors.zinc400 }]}>
            Place a known object next to the item so the AI can estimate its real-world dimensions.
          </Text>
          <View style={styles.chipRow}>
            {MEASURE_REFERENCE_OBJECTS.map((ref) => {
              const selected = referenceObjectId === ref.id;
              return (
                <Pressable
                  key={ref.id}
                  onPress={() => setReferenceObjectId(ref.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      borderColor: selected ? colors.brandCyan : colors.zinc700,
                      backgroundColor: selected
                        ? "rgba(8,51,68,0.55)"
                        : "rgba(24,24,27,0.55)",
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selected ? colors.cyan300 : colors.zinc300 },
                    ]}
                  >
                    {ref.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      )}

      <BrandButton
        label={
          busy
            ? uploadCount !== null
              ? `Uploading… ${uploadCount.done} / ${uploadCount.total}`
              : "Analysing with AI…"
            : photos.length < MIN_PHOTOS
              ? `Add ${MIN_PHOTOS - photos.length} more photo${
                  MIN_PHOTOS - photos.length === 1 ? "" : "s"
                }`
              : "Analyse with AI →"
        }
        size="lg"
        loading={busy}
        disabled={photos.length < MIN_PHOTOS || busy}
        onPress={startAnalysis}
      />

      <Text style={[styles.note, { color: colors.zinc500 }]}>
        Photos are sent securely for AI analysis and not stored. Drafts go to
        the review screen first.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { paddingHorizontal: 4, gap: 6 },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  gridHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  counter: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  thumbGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  thumbWrap: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  thumb: { width: "100%", height: "100%" },
  thumbClose: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbAdd: {
    width: 88,
    height: 88,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.4,
  },
  measureTip: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  note: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  overlayCard: {
    width: "100%",
    borderRadius: 20,
    padding: 28,
    gap: 0,
  },
  overlayEyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  overlayTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    letterSpacing: -0.3,
  },
  overlayCounter: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    letterSpacing: -1,
    marginTop: 10,
  },
  overlayHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 16,
    lineHeight: 17,
  },
  thumbUploadOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbUploadCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(6,182,212,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
});

function CaptureThumb({
  uri,
  onRemove,
  uploading = false,
  uploaded = false,
}: {
  uri: string;
  onRemove: () => void;
  uploading?: boolean;
  uploaded?: boolean;
}) {
  const [error, setError] = useState(false);
  const isActive = uploading || uploaded;
  return (
    <View style={styles.thumbWrap}>
      {error ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(8,16,28,0.85)",
          }}
        >
          <Feather name="image" size={24} color="rgba(113,113,122,0.6)" />
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={styles.thumb}
          contentFit="cover"
          transition={150}
          onError={() => setError(true)}
        />
      )}

      {/* Per-photo upload state overlay */}
      {isActive && (
        <View style={styles.thumbUploadOverlay}>
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.thumbUploadCheck}>
              <Feather name="check" size={14} color="#fff" />
            </View>
          )}
        </View>
      )}

      {/* Remove button — hidden while uploading/uploaded so it doesn't interfere */}
      {!isActive && (
        <Pressable onPress={onRemove} style={styles.thumbClose} hitSlop={8}>
          <Feather name="x" size={12} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}
