import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HUDSpinner } from "@/components/ui/Spinner";
import { useColors } from "@/hooks/useColors";

type Variant =
  | "primary" // cyan→violet gradient
  | "guard" // violet→purple gradient (Guard accent)
  | "outline"
  | "ghost"
  | "secondary";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  testID?: string;
  /** Optional leading content (icon). */
  iconLeft?: React.ReactNode;
}

export function BrandButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  size = "md",
  testID,
  iconLeft,
}: Props) {
  const colors = useColors();

  const height = size === "lg" ? 56 : size === "md" ? 48 : 40;
  const fontSize = size === "lg" ? 16 : size === "md" ? 15 : 13;
  const radius = size === "sm" ? 12 : 14;
  const horizontalPadding = size === "lg" ? 20 : 16;

  const isGradient = variant === "primary" || variant === "guard";
  const gradientColours: [string, string, ...string[]] =
    variant === "guard"
      ? [colors.brandViolet, colors.brandViolet600]
      : [colors.brandCyan, colors.brandViolet];

  const handlePress = () => {
    if (loading || disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onPress?.();
  };

  const content = (
    <View style={[styles.row, { paddingHorizontal: horizontalPadding }]}>
      {loading ? (
        <HUDSpinner size={18} color={isGradient ? "#040a14" : colors.brandCyan} />
      ) : (
        <>
          {iconLeft ? <View style={{ marginRight: 8 }}>{iconLeft}</View> : null}
          <Text
            style={{
              color:
                variant === "primary" || variant === "guard"
                  ? "#040a14"
                  : variant === "outline"
                  ? colors.cyan100
                  : colors.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize,
              letterSpacing: 0.2,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  if (isGradient) {
    return (
      <Pressable
        testID={testID}
        onPress={handlePress}
        disabled={loading || disabled}
        android_ripple={{ color: "rgba(4,10,20,0.35)", borderless: false }}
        style={({ pressed }) => [
          {
            height,
            borderRadius: radius,
            overflow: "hidden",
            opacity: disabled ? 0.5 : (Platform.OS === "ios" && pressed) ? 0.9 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={gradientColours}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { borderRadius: radius }]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  const bg =
    variant === "outline"
      ? "transparent"
      : variant === "ghost"
      ? "transparent"
      : colors.zinc800;
  const border =
    variant === "outline"
      ? colors.cyan700
      : variant === "ghost"
      ? "transparent"
      : "transparent";

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={loading || disabled}
      android_ripple={{ color: "rgba(34,211,238,0.25)", borderless: false }}
      style={({ pressed }) => [
        {
          height,
          borderRadius: radius,
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === "outline" ? 1 : 0,
          opacity: disabled ? 0.5 : (Platform.OS === "ios" && pressed) ? 0.85 : 1,
          justifyContent: "center",
        },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  fill: {
    flex: 1,
  },
});

export default BrandButton;
