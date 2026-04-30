import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandBackground } from "@/components/brand/BrandBackground";
import { BrandGlyph } from "@/components/brand/BrandGlyph";
import { BrandLens } from "@/components/brand/BrandLens";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { BrandButton } from "@/components/ui/Button";
import { useColors } from "@/hooks/useColors";

export default function SplashScreenRoute() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  // Cap the lens so it never crowds the rest of the screen on shorter devices.
  const lensSize = Math.min(width - 80, height * 0.32, 280);

  return (
    <View style={[styles.flex, { backgroundColor: colors.navy }]}>
      <BrandBackground />

      <View
        style={[
          styles.headerRow,
          { paddingTop: insets.top + 12, paddingBottom: 8 },
        ]}
      >
        <BrandWordmark layout="inline" size="sm" />
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          accessibilityRole="button"
          hitSlop={12}
        >
          <Text
            style={{
              color: colors.cyan200,
              fontFamily: "Inter_600SemiBold",
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Skip →
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600)}>
          <BrandLens size={lensSize} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(700)}
          style={styles.wordmark}
        >
          <BrandWordmark layout="stacked" size="lg" />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(380).duration(700)}
          style={[styles.tagline, { color: colors.cyan100 }]}
        >
          AI resale intelligence. Specialist Lenses, evidence-led listings,
          buyer risk checks.
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(520).duration(700)}
          style={[styles.lead, { color: colors.cyan200 }]}
        >
          List smarter. Buy safer.
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(680).duration(700)}
          style={styles.actions}
        >
          <BrandButton
            label="Enter Studio"
            size="lg"
            onPress={() => router.replace("/(tabs)/studio")}
            iconLeft={<Feather name="camera" size={18} color="#040a14" />}
          />
          <View style={{ height: 12 }} />
          <BrandButton
            label="Run a Guard check"
            variant="outline"
            size="lg"
            onPress={() => router.replace("/(tabs)/guard")}
            iconLeft={<Feather name="shield" size={18} color={colors.cyan100} />}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(900).duration(700)}
          style={styles.glyphRow}
        >
          <BrandGlyph size={42} />
          <Text style={[styles.poweredBy, { color: colors.cyan300 }]}>
            RecordLens · ShoeLens · ClothingLens · MeasureLens
          </Text>
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            borderTopColor: "rgba(34,211,238,0.1)",
            backgroundColor: "rgba(4,10,20,0.85)",
          },
        ]}
      >
        <Text style={[styles.footerText, { color: colors.cyan300 }]}>
          © 2026 Mr.FLENS · List-LENS
        </Text>
        <Text style={[styles.footerText, { color: colors.cyan300 }]}>
          AI · Evidence · Confidence
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  body: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 12,
    gap: 4,
  },
  wordmark: {
    marginTop: 8,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
    marginTop: 6,
  },
  lead: {
    marginTop: 10,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.4,
  },
  actions: {
    marginTop: 22,
    width: "100%",
    maxWidth: 360,
  },
  glyphRow: {
    marginTop: 22,
    alignItems: "center",
    gap: 10,
  },
  poweredBy: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    letterSpacing: 3,
    textTransform: "uppercase",
    opacity: 0.7,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    opacity: 0.6,
  },
});
