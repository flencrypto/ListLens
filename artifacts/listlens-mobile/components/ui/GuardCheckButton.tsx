import * as Haptics from "expo-haptics";
import { ScanLine, ShieldCheck } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
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
  isRunning?: boolean;
}

export function GuardCheckButton({
  label = "Run a Guard check",
  onPress,
  disabled = false,
  isRunning = false,
}: Props) {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const scanLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRunning) {
      scanAnim.setValue(0);
      scanLoop.current = Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      );
      scanLoop.current.start();
    } else {
      scanLoop.current?.stop();
      scanAnim.setValue(0);
    }
    return () => {
      scanLoop.current?.stop();
    };
  }, [isRunning, scanAnim]);

  function handlePress() {
    if (disabled || isRunning) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    }
    onPress?.();
  }

  const scanTranslate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-28, 28],
  });

  const glowOpacity = scanAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isRunning}
      style={({ pressed }) => [
        styles.wrapper,
        {
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
      ]}
    >
      {({ pressed }) => (
        <>
          {/* Glow border */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glowBorder,
              {
                opacity: isRunning ? glowOpacity : pressed ? 0.9 : 0.5,
              },
            ]}
          />

          <View style={styles.inner}>
            {/* Scanning line — only visible when running */}
            {isRunning && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanTranslate }] },
                ]}
              />
            )}

            <View style={styles.row}>
              {isRunning ? (
                <ScanLine size={20} color="#22d3ee" strokeWidth={2} />
              ) : (
                <ShieldCheck size={20} color="#22d3ee" strokeWidth={2} />
              )}
              <Text style={styles.label}>{isRunning ? "Running scan…" : label}</Text>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#22d3ee",
    ...Platform.select({
      web: {
        boxShadow: "0 0 12px rgba(34,211,238,0.6), inset 0 0 12px rgba(34,211,238,0.08)",
      },
      default: {
        shadowColor: "#22d3ee",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  inner: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(4,10,20,0.9)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(34,211,238,0.55)",
    ...Platform.select({
      web: {
        boxShadow: "0 0 8px rgba(34,211,238,0.8)",
      },
      default: {
        shadowColor: "#22d3ee",
        shadowOpacity: 0.8,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#e2e8f0",
    letterSpacing: 0.2,
  },
});

export default GuardCheckButton;
