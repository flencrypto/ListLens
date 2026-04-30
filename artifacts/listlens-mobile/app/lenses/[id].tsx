import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { LENS_REGISTRY } from "@/constants/lenses";

const LENS_DETAILS: Record<string, { focus: string[]; tips: string[] }> = {
  RecordLens: {
    focus: [
      "Catalogue number on the spine and back cover",
      "Matrix runout etchings inside the dead-wax",
      "Sleeve condition and obi/insert presence",
    ],
    tips: [
      "Shoot the matrix close-up at an angle so the etching catches the light.",
      "Include a photo of the centre label for the pressing variant.",
    ],
  },
  ShoeLens: {
    focus: [
      "Inside size label with style code",
      "Sole tread, toe box and heel wear",
      "Original laces, box and accessories",
    ],
    tips: [
      "Use natural daylight for true colour.",
      "One photo per side, plus the size label and the sole.",
    ],
  },
  LPLens: {
    focus: [
      "Centre label — artist, title, catalogue number, label name",
      "Sleeve front and back, including any OBI strip or inserts",
      "Dead-wax matrix etchings for pressing identification",
      "Any damage: ring wear, seam splits, writing on sleeve",
    ],
    tips: [
      "Photograph both sides of the label — Side A and Side B.",
      "Angle your camera to catch light across the groove surface to reveal marks.",
    ],
  },
  ClothingLens: {
    focus: [
      "Care/size label showing brand, size and material composition",
      "Front and back of the garment laid flat",
      "Any wear: pilling, fading, staining or missing buttons",
      "Measurements if no size label (chest, waist, length)",
    ],
    tips: [
      "Lay the item flat on a white or neutral background.",
      "Zoom in on any defects — buyers appreciate honesty.",
    ],
  },
  CardLens: {
    focus: [
      "Card front — full frame with no glare",
      "Card back — condition of reverse print",
      "Close-up of each corner for wear",
      "Set symbol, number and edition (1st edition stamp if applicable)",
    ],
    tips: [
      "Use a lightbox or diffused light to eliminate glare on holofoil.",
      "Include a corner macro shot — this is what graders look for first.",
    ],
  },
  ToyLens: {
    focus: [
      "Item from multiple angles including base/feet/back",
      "Any manufacturer marks, copyright dates or country of origin",
      "All accessories, parts and original packaging present",
      "Any play wear, paint loss or reproduction indicators",
    ],
    tips: [
      "Count all pieces before shooting — note anything missing in your listing.",
      "Show the box insert flat if still present — it adds real value.",
    ],
  },
  WatchLens: {
    focus: [
      "Dial — brand, model name, colour, lume condition",
      "Case back — engraving, serial number, reference number",
      "Crown and pushers — condition and original parts",
      "Bracelet or strap — clasp, length and wear",
    ],
    tips: [
      "Shoot the caseback with a macro lens or macro mode for serial clarity.",
      "Include a wrist shot to show size context.",
    ],
  },
  MeasureLens: {
    focus: [
      "Item alongside a reference object (credit card, A4 paper, ruler)",
      "Multiple angles showing the full item with the reference visible",
      "Any relevant labels: size tag, dimension stickers",
    ],
    tips: [
      "Keep the reference object in the same plane as the item being measured.",
      "Choose your reference object in the picker before capturing — it tells the AI the scale.",
    ],
  },
  MotorLens: {
    focus: [
      "Part number, OEM markings and manufacturer stamps",
      "Condition of mounting points, connectors and surfaces",
      "Any damage: corrosion, cracks, stripped threads",
      "VIN plate or odometer if listing a full vehicle",
    ],
    tips: [
      "Include a ruler or known object if listing a part — size matters for fitment.",
      "Photograph any engraved or stamped numbers clearly — avoid shadows.",
    ],
  },
};

export default function LensDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const lens = LENS_REGISTRY.find((l) => l.id === id);

  if (!lens) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: "Lens" }} />
        <Card>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Lens not found
          </Text>
          <Text style={[styles.body, { color: colors.zinc400 }]}>
            The lens "{id}" isn't registered. Head back to the catalogue.
          </Text>
          <View style={{ height: 12 }} />
          <BrandButton
            label="Back to lenses"
            onPress={() => router.replace("/(tabs)/lenses")}
          />
        </Card>
      </ScreenContainer>
    );
  }

  const detail = LENS_DETAILS[lens.id];
  const isLive = lens.status === "live";

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: lens.name }} />
      <View style={styles.header}>
        <Text style={styles.icon}>{lens.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {lens.name}
          </Text>
          <Text style={[styles.category, { color: colors.zinc400 }]}>
            {lens.category}
          </Text>
        </View>
        <Badge
          label={isLive ? "Live" : "Coming soon"}
          tone={isLive ? "emerald" : "neutral"}
        />
      </View>

      <Card glow={isLive}>
        <Text style={[styles.body, { color: colors.zinc300 }]}>
          {lens.description}
        </Text>
      </Card>

      {detail ? (
        <>
          <Card glow={isLive}>
            <Text style={[styles.section, { color: colors.foreground }]}>
              What this lens looks for
            </Text>
            {detail.focus.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Feather name="aperture" size={14} color={colors.brandCyan} />
                <Text style={[styles.bulletText, { color: colors.zinc300 }]}>
                  {item}
                </Text>
              </View>
            ))}
          </Card>
          <Card>
            <Text style={[styles.section, { color: colors.foreground }]}>
              Photo tips
            </Text>
            {detail.tips.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Feather name="camera" size={14} color={colors.brandGreen} />
                <Text style={[styles.bulletText, { color: colors.zinc300 }]}>
                  {item}
                </Text>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Card>
          <Text style={[styles.section, { color: colors.foreground }]}>
            Coming soon
          </Text>
          <Text style={[styles.body, { color: colors.zinc400 }]}>
            {lens.name} is on the roadmap. We&apos;ll notify you when it goes
            live.
          </Text>
        </Card>
      )}

      {isLive ? (
        <BrandButton
          label={`Use ${lens.name} in Studio`}
          size="lg"
          onPress={() => router.push("/studio/new")}
          iconLeft={<Feather name="camera" size={18} color="#040a14" />}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 4,
  },
  icon: { fontSize: 36 },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  category: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  section: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
