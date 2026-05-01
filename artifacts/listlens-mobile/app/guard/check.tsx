import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
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

type Tab = "url" | "photos";

const MAX_PHOTOS = 6;

export default function GuardCheckScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const liveLenses = LENS_REGISTRY.filter((l) => l.status === "live");
  const [lens, setLens] = useState(liveLenses[0]?.id ?? "ShoeLens");
  const [busy, setBusy] = useState(false);

  const violet300 = "rgba(196,181,253,0.95)";
  const violetStroke = "rgba(167,139,250,0.32)";

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

  function handleStart() {
    if (tab === "url" && !url.trim()) {
      notify("Paste an eBay or Vinted listing URL to continue.");
      return;
    }
    if (tab === "photos" && photos.length === 0) {
      notify("Add at least one photo to analyse.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      router.replace({
        pathname: "/guard/report",
        params: {
          lens,
          source: tab === "photos" ? "screenshots" : "url",
          url: tab === "url" ? url.trim() : "",
          shots: photos.join("|"),
        },
      });
    }, 1100);
  }

  return (
    <ScreenContainer>
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

      <BrandButton
        label="Run Guard Check"
        size="lg"
        variant="guard"
        loading={busy}
        onPress={handleStart}
        iconLeft={<Feather name="search" size={18} color="#040a14" />}
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
});
