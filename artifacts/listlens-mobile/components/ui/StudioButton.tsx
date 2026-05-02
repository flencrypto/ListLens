import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ArrowRight, Sparkles } from "lucide-react-native";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Props {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function StudioButton({
  label = "Enter Studio",
  onPress,
  disabled = false,
}: Props) {
  const shine = useRef(new Animated.Value(-1)).current;
  const shineRunning = useRef(false);

  function runShine() {
    if (shineRunning.current) return;
    shineRunning.current = true;
    shine.setValue(-1);
    Animated.timing(shine, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      shineRunning.current = false;
    });
  }

  function handlePress() {
    if (disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }
    runShine();
    onPress?.();
  }

  const shineTranslate = shine.interpolate({
    inputRange: [-1, 1],
    outputRange: [-220, 220],
  });

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={runShine}
      // Trigger shine on web hover for parity with the design spec
      onHoverIn={Platform.OS === "web" ? runShine : undefined}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        {
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          shadowColor: "#22d3ee",
          shadowOpacity: pressed ? 0.55 : 0.3,
          shadowRadius: pressed ? 18 : 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: pressed ? 12 : 6,
        },
      ]}
    >
      <LinearGradient
        colors={["#06b6d4", "#2563eb", "#7c3aed"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Shine sweep overlay — skewX + animated translateX merged in one transform */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shine,
            { transform: [{ skewX: "-20deg" }, { translateX: shineTranslate }] },
          ]}
        />

        <View style={styles.row}>
          <Sparkles size={18} color="#040a14" strokeWidth={2.2} />
          <Text style={styles.label}>{label}</Text>
          <ArrowRight size={16} color="#040a14" strokeWidth={2.5} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 20px rgba(34,211,238,0.35)",
      },
    }),
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  shine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  label: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#040a14",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});

export default StudioButton;
