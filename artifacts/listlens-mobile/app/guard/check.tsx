import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
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
import { captureEvent } from "@/lib/posthog";

type Tab = "url" | "screenshots";

export default function GuardCheckScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [shotInput, setShotInput] = useState("");
  const [shots, setShots] = useState<string[]>([]);
  const liveLenses = LENS_REGISTRY.filter((l) => l.status === "live");
  const [lens, setLens] = useState(liveLenses[0]?.id ?? "ShoeLens");
  const [busy, setBusy] = useState(false);
  const violet300 = "rgba(196,181,253,0.95)";
  const violetStroke = "rgba(167,139,250,0.32)";

  function addShot() {
    const trimmed = shotInput.trim();
    if (!trimmed || shots.includes(trimmed)) {
      setShotInput("");
      return;
    }
    if (shots.length >= 6) {
      notify("Max 6 screenshots.");
      return;
    }
    setShots((prev) => [...prev, trimmed]);
    setShotInput("");
  }

  function removeShot(i: number) {
    setShots((prev) => prev.filter((_, idx) => idx !== i));
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
    if (tab === "screenshots" && shots.length === 0) {
      notify("Add at least one screenshot URL.");
      return;
    }
    captureEvent("lens_selected", { lens, source: "mobile_guard" });
    captureEvent("guard_check_started", { lens, source: tab, platform: "mobile" });
    setBusy(true);
    setTimeout(() => {
      router.replace({
        pathname: "/guard/report",
        params: {
          lens,
          source: tab,
          url: tab === "url" ? url.trim() : "",
          shots: shots.join("|"),
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
          AI risk report before you buy. Paste a URL or upload screenshots.
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
            onPress={() => setTab("screenshots")}
            style={[
              styles.tab,
              {
                backgroundColor:
                  tab === "screenshots" ? colors.brandViolet600 : "transparent",
              },
            ]}
          >
            <Feather
              name="image"
              size={14}
              color={tab === "screenshots" ? "#fff" : colors.zinc400}
            />
            <Text
              style={[
                styles.tabText,
                { color: tab === "screenshots" ? "#fff" : colors.zinc400 },
              ]}
            >
              Screenshots
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
          <View style={{ gap: 10, marginTop: 12 }}>
            <Text style={[styles.helperText, { color: colors.zinc500 }]}>
              Paste screenshot image URLs (up to 6)
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={shotInput}
                onChangeText={setShotInput}
                placeholder="https://example.com/shot.jpg"
                placeholderTextColor={colors.zinc600}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={addShot}
                style={[
                  styles.input,
                  {
                    flex: 1,
                    color: colors.foreground,
                    borderColor: colors.zinc700,
                  },
                ]}
              />
              <Pressable
                onPress={addShot}
                style={[
                  styles.smallButton,
                  { backgroundColor: colors.zinc800 },
                ]}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                  Add
                </Text>
              </Pressable>
            </View>
            {shots.map((shot, i) => (
              <View
                key={`${shot}-${i}`}
                style={[
                  styles.shotRow,
                  { borderColor: colors.zinc800, backgroundColor: "rgba(24,24,27,0.5)" },
                ]}
              >
                <Text style={[styles.shotIndex, { color: colors.zinc500 }]}>
                  {i + 1}
                </Text>
                <Text
                  style={[styles.shotUrl, { color: colors.zinc300 }]}
                  numberOfLines={1}
                >
                  {shot}
                </Text>
                <Pressable onPress={() => removeShot(i)} hitSlop={8}>
                  <Feather name="x" size={14} color={colors.zinc500} />
                </Pressable>
              </View>
            ))}
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
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  smallButton: {
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  shotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  shotIndex: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    width: 16,
  },
  shotUrl: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
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
