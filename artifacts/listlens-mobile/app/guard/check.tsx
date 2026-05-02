import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/ui/Card";
import { GuardCheckButton } from "@/components/ui/GuardCheckButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { LENS_REGISTRY } from "@/constants/lenses";
import { uploadPhoto } from "@/lib/api";
import { useCreateGuardCheck, useAnalyseGuardCheck } from "@workspace/api-client-react";
import { generateId, saveReport, type GuardReport } from "@/lib/historyStore";

type Tab = "url" | "photos";

const MAX_PHOTOS = 6;

export default function GuardCheckScreen() {
  const colors = useColors();
  const router = useRouter();
  const { mutateAsync: createGuardCheckAsync } = useCreateGuardCheck();
  const { mutateAsync: analyseGuardCheckAsync } = useAnalyseGuardCheck();
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const liveLenses = LENS_REGISTRY.filter((l) => l.status === "live");
  const [lens, setLens] = useState(liveLenses[0]?.id ?? "ShoeLens");
  const [busy, setBusy] = useState(false);

  const violet300 = "rgba(196,181,253,0.95)";
  const violetStroke = "rgba(167,139,250,0.32)";
  const [progressValue, setProgressValue] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startProgressPhase(label: string, fromPct: number, toPct: number, durationMs: number) {
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

  async function pickPhotos() {
    if (photos.length >= MAX_PHOTOS) {
      notify(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }

    const remaining = MAX_PHOTOS - photos.length;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.85,
        exif: false,
      });

      if (!result.canceled) {
        const uris = result.assets.map((a) => a.uri);
        setPhotos((prev) => {
          const combined = [...prev, ...uris];
          return combined.slice(0, MAX_PHOTOS);
        });
      }
    } catch {
      notify("Could not open photo library. Please try again.");
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function notify(message: string) {
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      window.alert(message);
    } else {
      Alert.alert("Heads up", message);
    }
  }

  async function handleStart() {
    if (tab === "url" && !url.trim()) {
      notify("Paste an eBay or Vinted listing URL to continue.");
      return;
    }
    if (tab === "photos" && photos.length === 0) {
      notify("Add at least one photo to analyse.");
      return;
    }

    setBusy(true);
    setProgressValue(0);
    setProgressLabel("Starting check…");

    try {
      let screenshotUrls: string[] | undefined;

      if (tab === "photos" && photos.length > 0) {
        // Phase 1: upload photos (0→40%)
        setProgressLabel(`Uploading ${photos.length} photo${photos.length > 1 ? "s" : ""}…`);
        const uploaded: string[] = [];
        for (let i = 0; i < photos.length; i++) {
          const photoUrl = await uploadPhoto(photos[i], "image/jpeg");
          uploaded.push(photoUrl);
          setProgressValue(Math.round(((i + 1) / photos.length) * 40));
        }
        screenshotUrls = uploaded;
      }

      // Phase 2: create check record (40→50%)
      setProgressValue(40);
      setProgressLabel("Creating check…");
      const { id: checkId } = await createGuardCheckAsync({
        data: {
          url: tab === "url" ? url.trim() : undefined,
          screenshotUrls,
          lens,
        },
      });
      setProgressValue(50);

      // Phase 3: AI analysis (50→95%, animated)
      startProgressPhase("Analysing with AI…", 50, 95, 30_000);
      const { report: apiReport } = await analyseGuardCheckAsync({ id: checkId });

      // Done — snap to 100%
      stopProgress();
      setProgressValue(100);
      setProgressLabel("Complete!");

      // Build the full GuardReport to save locally and pass to the report screen
      const localId = generateId();
      const now = Date.now();
      const guardReport: GuardReport = {
        id: localId,
        createdAt: now,
        lens,
        source: tab === "photos" ? "screenshots" : "url",
        url: tab === "url" ? url.trim() : "",
        shots: tab === "photos" ? (screenshotUrls ?? photos) : [],
        saved: false,
        risk: apiReport.risk,
        risk_dimensions: apiReport.risk_dimensions,
        red_flags: apiReport.red_flags,
        green_signals: apiReport.green_signals,
        price_analysis: {
          asking_price: apiReport.price_analysis.asking_price ?? null,
          market_estimate: apiReport.price_analysis.market_estimate ?? null,
          price_verdict: apiReport.price_analysis.price_verdict,
          price_note: apiReport.price_analysis.price_note,
        },
        authenticity_signals: apiReport.authenticity_signals,
        missing_photos: apiReport.missing_photos,
        seller_questions: apiReport.seller_questions,
        buy_recommendation: apiReport.buy_recommendation,
      };

      // Save to local history so it appears in the History tab
      await saveReport(guardReport).catch(() => undefined);

      // Brief pause so user sees 100%
      await new Promise((r) => setTimeout(r, 350));

      router.replace({
        pathname: "/guard/report",
        params: {
          reportId: localId,
        },
      });
    } catch {
      stopProgress();
      notify("Guard check failed. Please check your connection and try again.");
      setBusy(false);
      setProgressValue(0);
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
            <Text style={[styles.overlayEyebrow, { color: violet300 }]}>
              Guard · AI Check
            </Text>
            <Text style={[styles.overlayTitle, { color: colors.foreground }]}>
              {progressLabel || "Processing…"}
            </Text>
            <View style={{ marginTop: 20 }}>
              <ProgressBar value={progressValue} label={progressLabel} />
            </View>
            <Text style={[styles.overlayHint, { color: colors.zinc500 }]}>
              {progressValue < 50
                ? "Uploading photos securely…"
                : "AI analysis usually takes 10–30 seconds. Keep the app open."}
            </Text>
          </View>
        </View>
      </Modal>

      <View style={styles.intro}>
        <Text
          style={{
            color: violet300,
            fontFamily: "Inter_600SemiBold",
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Guard · New check
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Check a listing
        </Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          AI risk report before you buy. Paste a URL or upload photos from your
          device.
        </Text>
        <View
          style={{
            marginTop: 10,
            width: 80,
            height: 1,
            backgroundColor: violetStroke,
          }}
        />
      </View>

      <Card>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab("url")}
            style={[
              styles.tab,
              {
                backgroundColor:
                  tab === "url" ? colors.brandViolet600 : "transparent",
              },
            ]}
          >
            <Feather
              name="link"
              size={14}
              color={tab === "url" ? "#fff" : colors.zinc400}
            />
            <Text
              style={[
                styles.tabText,
                { color: tab === "url" ? "#fff" : colors.zinc400 },
              ]}
            >
              Listing URL
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("photos")}
            style={[
              styles.tab,
              {
                backgroundColor:
                  tab === "photos" ? colors.brandViolet600 : "transparent",
              },
            ]}
          >
            <Feather
              name="image"
              size={14}
              color={tab === "photos" ? "#fff" : colors.zinc400}
            />
            <Text
              style={[
                styles.tabText,
                { color: tab === "photos" ? "#fff" : colors.zinc400 },
              ]}
            >
              Photos
            </Text>
          </Pressable>
        </View>

        {tab === "url" ? (
          <View style={{ gap: 8, marginTop: 12 }}>
            <Text style={[styles.helperText, { color: colors.zinc500 }]}>
              Paste an eBay or Vinted listing URL
            </Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://www.ebay.co.uk/itm/..."
              placeholderTextColor={colors.zinc600}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={[
                styles.input,
                { color: colors.foreground, borderColor: colors.zinc700 },
              ]}
            />
          </View>
        ) : (
          <View style={{ gap: 12, marginTop: 12 }}>
            <View style={styles.photosHeader}>
              <Text style={[styles.helperText, { color: colors.zinc500 }]}>
                Upload listing photos from your device
              </Text>
              <Text
                style={[styles.countBadge, { color: colors.zinc500 }]}
              >
                {photos.length}/{MAX_PHOTOS}
              </Text>
            </View>

            {photos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoStrip}
              >
                {photos.map((uri, i) => (
                  <View key={`${uri}-${i}`} style={styles.thumbWrapper}>
                    <Image
                      source={{ uri }}
                      style={[
                        styles.thumb,
                        { borderColor: colors.zinc700 },
                      ]}
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => removePhoto(i)}
                      hitSlop={4}
                      style={[
                        styles.removeBtn,
                        { backgroundColor: colors.zinc900 },
                      ]}
                    >
                      <Feather name="x" size={10} color={colors.zinc300} />
                    </Pressable>
                    <View
                      style={[
                        styles.thumbIndex,
                        { backgroundColor: "rgba(4,10,20,0.75)" },
                      ]}
                    >
                      <Text
                        style={{ color: colors.zinc400, fontSize: 10, fontFamily: "Inter_500Medium" }}
                      >
                        {i + 1}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {photos.length < MAX_PHOTOS && (
              <Pressable
                onPress={pickPhotos}
                style={({ pressed }) => [
                  styles.addPhotoBtn,
                  {
                    borderColor: pressed
                      ? colors.brandViolet
                      : colors.zinc700,
                    backgroundColor: pressed
                      ? "rgba(76,29,149,0.15)"
                      : "rgba(24,24,27,0.4)",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather name="plus" size={18} color={colors.zinc400} />
                <Text
                  style={[styles.addPhotoLabel, { color: colors.zinc400 }]}
                >
                  {photos.length === 0 ? "Add photos" : "Add more"}
                </Text>
              </Pressable>
            )}

            {photos.length === 0 && (
              <Text
                style={[styles.tipText, { color: colors.zinc600 }]}
              >
                Up to {MAX_PHOTOS} photos · Screenshots, product images or
                seller photos all work
              </Text>
            )}
          </View>
        )}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          Choose Lens
        </Text>
        <View style={styles.lensRow}>
          {liveLenses.map((l) => {
            const selected = lens === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => setLens(l.id)}
                style={[
                  styles.lensChip,
                  {
                    borderColor: selected ? colors.brandViolet : colors.zinc700,
                    backgroundColor: selected
                      ? "rgba(76,29,149,0.4)"
                      : "rgba(24,24,27,0.55)",
                  },
                ]}
              >
                <Text style={styles.lensChipIcon}>{l.icon}</Text>
                <Text
                  style={[
                    styles.lensChipName,
                    { color: selected ? "#c4b5fd" : colors.zinc300 },
                  ]}
                >
                  {l.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <GuardCheckButton
        label="Run Guard Check"
        isRunning={busy}
        onPress={handleStart}
      />

      <Text style={[styles.disclaimer, { color: colors.zinc500 }]}>
        AI-assisted risk screen, not formal authentication.
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
  tabs: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(63,63,70,0.6)",
    alignSelf: "flex-start",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  helperText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  photosHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
  },
  photoStrip: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  thumbWrapper: {
    position: "relative",
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbIndex: {
    position: "absolute",
    bottom: 4,
    left: 4,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 18,
  },
  addPhotoLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  tipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 12,
  },
  lensRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lensChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  lensChipIcon: { fontSize: 14 },
  lensChipName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  disclaimer: {
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
  overlayHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 16,
    lineHeight: 17,
  },
});
