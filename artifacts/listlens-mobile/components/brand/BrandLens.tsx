import React, { useEffect } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface Props {
  size: number;
  /** Disable animations (used for static logo placement). */
  staticOnly?: boolean;
  /** When true, renders the wordmark inside the ring (splash variant). */
  composed?: boolean;
}

/**
 * BrandLens — the Mr.FLENS HUD aperture mark, ported to React Native SVG.
 *
 * Mirrors the web `brand-lens.tsx`: tri-tone segmented ring (cyan→green→amber),
 * a slow rotating tick scale, a faster reverse scanner sweep, crosshair guides
 * and a pulsing centre dot. Honours `prefers-reduced-motion` and is fully
 * scaled by the `size` prop so it can be used as a logo or a hero element.
 */
export function BrandLens({ size, staticOnly = false, composed = false }: Props) {
  const colors = useColors();
  const reducedMotion = useReducedMotion();
  const animate = !staticOnly && !reducedMotion;

  const tickRotation = useSharedValue(0);
  const sweepRotation = useSharedValue(0);
  const corePulse = useSharedValue(0.5);

  useEffect(() => {
    if (animate) {
      tickRotation.value = withRepeat(
        withTiming(360, { duration: 28000, easing: Easing.linear }),
        -1,
        false,
      );
      sweepRotation.value = withRepeat(
        withTiming(-360, { duration: 9000, easing: Easing.linear }),
        -1,
        false,
      );
      corePulse.value = withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }
    return () => {
      cancelAnimation(tickRotation);
      cancelAnimation(sweepRotation);
      cancelAnimation(corePulse);
    };
  }, [animate, tickRotation, sweepRotation, corePulse]);

  // Avoid noisy reduced-motion warnings on platforms without the API.
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled?.().catch(() => undefined);
  }, []);

  const tickStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tickRotation.value}deg` }],
  }));
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweepRotation.value}deg` }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    opacity: corePulse.value,
  }));

  const cx = 200;
  const cy = 200;

  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 400 400" width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="ring-tl" x1="1" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor={colors.brandCyan} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={colors.brandBlue} />
          </SvgLinearGradient>
          <SvgLinearGradient id="ring-tr" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0%" stopColor={colors.brandCyan} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={colors.brandGreen} />
          </SvgLinearGradient>
          <SvgLinearGradient id="ring-bl" x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.brandCyan} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={colors.brandGreen} />
          </SvgLinearGradient>
          <SvgLinearGradient id="ring-br" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.brandGreen} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={colors.brandAmber} />
          </SvgLinearGradient>
          <RadialGradient id="core" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#0b1a2c" />
            <Stop offset="60%" stopColor="#081325" />
            <Stop offset="100%" stopColor="#040a14" />
          </RadialGradient>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.brandCyan} stopOpacity="0.55" />
            <Stop offset="60%" stopColor={colors.brandCyan} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={colors.brandCyan} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Circle cx={cx} cy={cy} r={180} fill="url(#glow)" />
        <Circle
          cx={cx}
          cy={cy}
          r={170}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth={1}
          opacity={0.5}
        />

        {/* Static fallback ticks render under the animated layer for a11y */}
        <G>
          {Array.from({ length: 96 }).map((_, i) => {
            const angle = (i * 360) / 96;
            const isMajor = i % 8 === 0;
            const colour =
              angle < 90
                ? "url(#ring-tr)"
                : angle < 180
                ? "url(#ring-br)"
                : angle < 270
                ? "url(#ring-bl)"
                : "url(#ring-tl)";
            return (
              <Line
                key={`s-${i}`}
                x1="200"
                y1="50"
                x2="200"
                y2={isMajor ? 68 : 58}
                stroke={colour}
                strokeWidth={isMajor ? 2.4 : 1}
                opacity={isMajor ? 0.95 : 0.55}
                transform={`rotate(${angle} 200 200)`}
              />
            );
          })}
        </G>

        {/* Segmented gradient ring */}
        <Path
          d="M 200 50 A 150 150 0 0 1 350 200"
          fill="none"
          stroke="url(#ring-tr)"
          strokeWidth={3}
        />
        <Path
          d="M 350 200 A 150 150 0 0 1 200 350"
          fill="none"
          stroke="url(#ring-br)"
          strokeWidth={3}
        />
        <Path
          d="M 200 350 A 150 150 0 0 1 50 200"
          fill="none"
          stroke="url(#ring-bl)"
          strokeWidth={3}
        />
        <Path
          d="M 50 200 A 150 150 0 0 1 200 50"
          fill="none"
          stroke="url(#ring-tl)"
          strokeWidth={3}
        />

        <Circle cx={cx} cy={cy} r={118} fill="url(#core)" />
        <Circle
          cx={cx}
          cy={cy}
          r={118}
          fill="none"
          stroke={colors.brandCyan}
          strokeOpacity={0.35}
          strokeWidth={1}
        />

        {/* Cross-hair guides */}
        <Line x1="200" y1="56" x2="200" y2="92" stroke={colors.brandCyan} strokeWidth={2.5} opacity={0.95} />
        <Line x1="200" y1="308" x2="200" y2="344" stroke={colors.brandAmber} strokeWidth={2.5} opacity={0.85} />
        <Line x1="56" y1="200" x2="92" y2="200" stroke={colors.brandCyan} strokeWidth={2} opacity={0.7} />
        <Line x1="308" y1="200" x2="344" y2="200" stroke={colors.brandGreen} strokeWidth={2} opacity={0.8} />
      </Svg>

      {/* Animated overlays — sized absolutely on top of the static SVG. */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, tickStyle]}
      >
        <Svg viewBox="0 0 400 400" width={size} height={size}>
          {Array.from({ length: 96 }).map((_, i) => {
            const angle = (i * 360) / 96;
            const isMajor = i % 8 === 0;
            const stroke =
              angle < 90
                ? colors.brandGreen
                : angle < 180
                ? colors.brandAmber
                : angle < 270
                ? colors.brandGreen
                : colors.brandBlue;
            return (
              <Line
                key={`a-${i}`}
                x1="200"
                y1="42"
                x2="200"
                y2={isMajor ? 30 : 36}
                stroke={stroke}
                strokeWidth={isMajor ? 2 : 1}
                opacity={isMajor ? 0.7 : 0.35}
                transform={`rotate(${angle} 200 200)`}
              />
            );
          })}
        </Svg>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, sweepStyle]}
      >
        <Svg viewBox="0 0 400 400" width={size} height={size}>
          <Path
            d="M 200 50 A 150 150 0 0 1 350 200"
            fill="none"
            stroke={colors.brandCyan}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.55}
          />
          <Path
            d="M 200 50 A 150 150 0 0 1 350 200"
            fill="none"
            stroke="#e0f7ff"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.95}
          />
        </Svg>
      </Animated.View>

      {!composed && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, coreStyle]}
        >
          <Svg viewBox="0 0 400 400" width={size} height={size}>
            <Circle cx={cx} cy={cy} r={6} fill={colors.brandCyan} />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

export default BrandLens;
