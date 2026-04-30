import React, { useEffect, useId } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface Props {
  size?: number;
  /** Override the cyan stroke colour (e.g. for inverse / on-cyan surfaces). */
  color?: string;
}

/**
 * HUDSpinner — dual cyan ring with a soft glow, rotating in opposite
 * directions. Mirrors the web `hud-spinner` recipe so loading states across
 * web + mobile feel identical.
 *
 * Honours `prefers-reduced-motion` (slows the rings down to a near-still pace).
 */
export function HUDSpinner({ size = 22, color }: Props) {
  const colors = useColors();
  const stroke = color ?? colors.brandCyan;
  const reducedMotion = useReducedMotion();
  // Unique gradient id per instance — avoids cross-instance colour collisions
  // when multiple spinners with different `color` props render simultaneously.
  const gradId = `hud-ring-${useId().replace(/:/g, "")}`;

  const outer = useSharedValue(0);
  const inner = useSharedValue(0);

  useEffect(() => {
    const fast = reducedMotion ? 4000 : 900;
    const slow = reducedMotion ? 6000 : 1600;
    outer.value = withRepeat(
      withTiming(360, { duration: fast, easing: Easing.linear }),
      -1,
      false,
    );
    inner.value = withRepeat(
      withTiming(-360, { duration: slow, easing: Easing.linear }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(outer);
      cancelAnimation(inner);
    };
  }, [outer, inner, reducedMotion]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${outer.value}deg` }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${inner.value}deg` }],
  }));

  const innerSize = Math.round(size * 0.56);
  const innerOffset = Math.round((size - innerSize) / 2);

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <Animated.View style={[StyleSheet.absoluteFill, outerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Defs>
            <SvgLinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={stroke} stopOpacity="1" />
              <Stop offset="60%" stopColor={stroke} stopOpacity="0.55" />
              <Stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          <Circle
            cx={12}
            cy={12}
            r={9.5}
            stroke={`url(#${gradId})`}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="40 60"
          />
        </Svg>
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: innerOffset,
            top: innerOffset,
            width: innerSize,
            height: innerSize,
          },
          innerStyle,
        ]}
      >
        <Svg width={innerSize} height={innerSize} viewBox="0 0 24 24">
          <Circle
            cx={12}
            cy={12}
            r={9}
            stroke={stroke}
            strokeOpacity={0.55}
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="22 70"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

export default HUDSpinner;
