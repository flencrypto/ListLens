import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandBackground } from "@/components/brand/BrandBackground";
import { BrandGlyph } from "@/components/brand/BrandGlyph";
import { BrandLens } from "@/components/brand/BrandLens";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { StudioButton } from "@/components/ui/StudioButton";
import { useColors } from "@/hooks/useColors";

const HAS_SEEN_SPLASH_KEY = "hasSeenSplash";

export default function SplashScreenRoute() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  // Cap the lens so it never crowds the rest of the screen on shorter devices.
  const lensSize = Math.min(width - 80, height * 0.32, 280);

  // Cinematic "spin-up" entrance for the lens — scale + subtle rotation,
  // honours reduced-motion.
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(reducedMotion ? 1 : 0.78);
  const rotate = useSharedValue(reducedMotion ? 0 : -8);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(HAS_SEEN_SPLASH_KEY)
      .then((value) => {
        if (mounted) {
          setHasSeenSplash(value === "true");
        }
      })
      .catch(() => {
        if (mounted) {
          setHasSeenSplash(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    scale.value = withTiming(1, {
      duration: 1100,
      easing: Easing.bezier(0.18, 0.71, 0.21, 1),
    });

    rotate.value = withTiming(0, {
      duration: 1100,
      easing: Easing.bezier(0.18, 0.71, 0.21, 1),
    });
  }, [reducedMotion, rotate, scale]);

  const lensSpinUp = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const getEntrance = (delay: number, duration = 700) => {
    if (reducedMotion) return undefined;
    return FadeInDown.delay(delay).duration(duration);
  };

  const getLensEntrance = () => {
    if (reducedMotion) return undefined;
    return FadeInUp.duration(600);
  };

  const handleEnter = async () => {
    try {
      await AsyncStorage.setItem(HAS_SEEN_SPLASH_KEY, "true");
    } catch {
      // Non-blocking: navigation should still happen if persistence fails.
    }

    router.replace("/(tabs)");
  };

  const buttonDelay = hasSeenSplash ? 420 : 700;

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
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={getLensEntrance()} style={lensSpinUp}>
          <BrandLens size={lensSize} />
        </Animated.View>

        <Animated.View
          entering={getEntrance(200)}
          style={styles.wordmark}
        >
          <BrandWordmark layout="stacked" size="lg" />
        </Animated.View>

        <Animated.Text
          entering={getEntrance(380)}
          style={[styles.tagline, { color: colors.cyan100 }]}
        >
          AI resale intelligence. Specialist Lenses, evidence-led listings,
          buyer risk checks.
        </Animated.Text>

        <Animated.Text
          entering={getEntrance(520)}
          style={[styles.lead, { color: colors.cyan200 }]}
        >
          List smarter. Buy safer.
        </Animated.Text>

        <Animated.View
          entering={getEntrance(buttonDelay)}
          style={styles.actions}
        >
          <StudioButton label="Enter List-LENS" onPress={handleEnter} />
        </Animated.View>

        <Animated.View
          entering={getEntrance(buttonDelay + 180)}
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
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
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
    marginTop: 26,
    width: "100%",
    maxWidth: 360,
  },
  glyphRow: {
    marginTop: 24,
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