import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 8;

export default function CaptureScreen() {
  const colors = useColors();
  const router = useRouter();
  const { lens = "ShoeLens", marketplace = "both" } = useLocalSearchParams<{
    lens?: string;
    marketplace?: string;
  }>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function takePhoto() {
    if (photos.length >= MAX_PHOTOS) {
      notify(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    if (Platform.OS === "web") {
      // expo-camera/launchCameraAsync is not supported on web; fall back to
      // the library picker so the flow still works in the browser preview.
      return pickFromLibrary();
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      notify(
        "Camera permission was declined. You can enable it in Settings.",
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
        () => undefined,
      );
      setPhotos((prev) => [...prev, res.assets[0]!.uri]);
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
      quality: 0.85,
    });
    if (!res.canceled) {
      const next = res.assets.map((a) => a.uri).slice(0, remaining);
      setPhotos((prev) => [...prev, ...next]);
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function startAnalysis() {
    if (photos.length < MIN_PHOTOS) {
      notify(`Add at least ${MIN_PHOTOS} photos to analyse.`);
      return;
    }
    setBusy(true);
    // Simulate the analysis hop. In a real build this would POST to the API.
    setTimeout(() => {
      router.replace({
        pathname: "/studio/review",
        params: {
          lens: String(lens),
          marketplace: String(marketplace),
          photos: photos.join("|"),
        },
      });
    }, 1100);
  }

  function notify(message: string) {
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      window.alert(message);
    } else {
      Alert.alert("Heads up", message);
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
          Studio · Capture
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Capture Photos
        </Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          {lens} · Add {MIN_PHOTOS}–{MAX_PHOTOS} angles. Front, back, label,
          sole and any wear.
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
          {photos.map((uri, idx) => (
            <View key={`${uri}-${idx}`} style={styles.thumbWrap}>
              <Image
                source={{ uri }}
                style={styles.thumb}
                contentFit="cover"
                transition={150}
              />
              <Pressable
                onPress={() => removePhoto(idx)}
                style={styles.thumbClose}
                hitSlop={8}
              >
                <Feather name="x" size={12} color="#fff" />
              </Pressable>
            </View>
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

      <BrandButton
        label={
          photos.length < MIN_PHOTOS
            ? `Add ${MIN_PHOTOS - photos.length} more photo${
                MIN_PHOTOS - photos.length === 1 ? "" : "s"
              }`
            : "Analyse with AI →"
        }
        size="lg"
        loading={busy}
        disabled={photos.length < MIN_PHOTOS}
        onPress={startAnalysis}
      />

      <Text style={[styles.note, { color: colors.zinc500 }]}>
        We never publish without your review. Drafts go to the review screen
        first.
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
  note: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
  },
});
