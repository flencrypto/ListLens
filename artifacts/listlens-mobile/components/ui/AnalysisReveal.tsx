import React, { useEffect, useRef } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

interface AnalysisRevealProps {
  variant: "guard" | "studio";
  onDone: () => void;
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 48 48" width={64} height={64} fill="none">
      <Path
        d="M24 4L8 10v12c0 10.5 6.5 19.5 16 22 9.5-2.5 16-11.5 16-22V10L24 4z"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M17 24l5 5 9-9"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LensIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 48 48" width={64} height={64} fill="none">
      <Circle cx={24} cy={24} r={14} stroke={color} strokeWidth={2.5} />
      <Circle cx={24} cy={24} r={6} stroke={color} strokeWidth={2} opacity={0.6} />
      <Line x1={34} y1={34} x2={42} y2={42} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={24} y1={4} x2={24} y2={8} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      <Line x1={24} y1={40} x2={24} y2={44} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      <Line x1={4} y1={24} x2={8} y2={24} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
    </Svg>
  );
}

export function AnalysisReveal({ variant, onDone }: AnalysisRevealProps) {
  const isGuard = variant === "guard";
  const accentColor = isGuard ? "#a78bfa" : "#22d3ee";
  const glowColor = isGuard ? "rgba(139,92,246,0.30)" : "rgba(34,211,238,0.30)";

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const ring1Rotation = useRef(new Animated.Value(0)).current;
  const ring2Rotation = useRef(new Animated.Value(0)).current;

  const ring1Spin = ring1Rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const ring2Spin = ring2Rotation.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });

  useEffect(() => {
    // Spin the rings continuously
    Animated.loop(
      Animated.timing(ring1Rotation, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
    Animated.loop(
      Animated.timing(ring2Rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Phase "in" — 0 to 600ms: fade overlay in, pop icon
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Label fades in at 400ms
    const t1 = setTimeout(() => {
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Phase "out" — starts at 1100ms
    const t2 = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 1100);

    // onDone at 1700ms
    const t3 = setTimeout(() => {
      onDone();
    }, 1650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ring1Rotation.stopAnimation();
      ring2Rotation.stopAnimation();
    };
  }, [onDone, overlayOpacity, iconScale, iconOpacity, labelOpacity, ring1Rotation, ring2Rotation]);

  return (
    <Modal transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        {/* Radial glow */}
        <View
          style={[
            styles.glow,
            { backgroundColor: glowColor },
          ]}
          pointerEvents="none"
        />

        {/* Icon + rings */}
        <View style={styles.iconArea}>
          {/* Outer ring */}
          <Animated.View
            style={[
              styles.ring,
              styles.ringOuter,
              { transform: [{ rotate: ring1Spin }], borderColor: accentColor },
            ]}
          />
          {/* Inner ring (reverse spin) */}
          <Animated.View
            style={[
              styles.ring,
              styles.ringInner,
              { transform: [{ rotate: ring2Spin }], borderColor: accentColor },
            ]}
          />

          {/* Icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                opacity: iconOpacity,
                transform: [{ scale: iconScale }],
              },
            ]}
          >
            {isGuard ? (
              <ShieldIcon color={accentColor} />
            ) : (
              <LensIcon color={accentColor} />
            )}
          </Animated.View>
        </View>

        {/* Label */}
        <Animated.View style={[styles.labelArea, { opacity: labelOpacity }]}>
          <Text style={[styles.label, { color: accentColor }]}>
            {isGuard ? "GUARD · ANALYSIS COMPLETE" : "STUDIO · ANALYSIS COMPLETE"}
          </Text>
          <View style={[styles.divider, { backgroundColor: accentColor }]} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  glow: {
    position: "absolute",
    width: "120%",
    height: "60%",
    top: "20%",
    borderRadius: 9999,
    opacity: 0.7,
  },
  iconArea: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    borderRadius: 9999,
    borderStyle: "dashed",
  },
  ringOuter: {
    width: 130,
    height: 130,
    opacity: 0.45,
  },
  ringInner: {
    width: 108,
    height: 108,
    borderWidth: 1,
    opacity: 0.28,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelArea: {
    marginTop: 28,
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 3,
  },
  divider: {
    width: 80,
    height: 1,
    opacity: 0.4,
  },
});
