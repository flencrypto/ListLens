import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { useColors } from "@/hooks/useColors";

type Variant = "default" | "premium" | "account" | "danger";

interface Props {
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  badge?: string;
  variant?: Variant;
  href?: "/more/history" | "/more/billing" | "/more/legal" | "/splash";
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const VARIANT_STYLES: Record<
  Variant,
  { bg: string; border: string; iconBg: string; iconBorder: string; iconColor: string }
> = {
  default: {
    bg: "rgba(10, 22, 40, 0.72)",
    border: "rgba(34, 211, 238, 0.18)",
    iconBg: "rgba(8, 51, 68, 0.55)",
    iconBorder: "rgba(34, 211, 238, 0.25)",
    iconColor: "#22d3ee",
  },
  premium: {
    bg: "rgba(8, 51, 68, 0.45)",
    border: "rgba(34, 211, 238, 0.38)",
    iconBg: "rgba(8, 51, 68, 0.75)",
    iconBorder: "rgba(34, 211, 238, 0.45)",
    iconColor: "#22d3ee",
  },
  account: {
    bg: "rgba(6, 20, 50, 0.55)",
    border: "rgba(62, 168, 255, 0.30)",
    iconBg: "rgba(10, 30, 70, 0.65)",
    iconBorder: "rgba(62, 168, 255, 0.35)",
    iconColor: "#3ea8ff",
  },
  danger: {
    bg: "rgba(40, 10, 10, 0.55)",
    border: "rgba(239, 68, 68, 0.32)",
    iconBg: "rgba(80, 10, 10, 0.55)",
    iconBorder: "rgba(239, 68, 68, 0.35)",
    iconColor: "#f87171",
  },
};

function MoreActionButtonInner({
  label,
  description,
  icon,
  badge,
  variant = "default",
  disabled = false,
  loading = false,
  onPressIn,
  onPressOut,
  onPress,
  scale,
}: Omit<Props, "href"> & {
  onPressIn?: () => void;
  onPressOut?: () => void;
  scale: Animated.Value;
}) {
  const colors = useColors();
  const vs = VARIANT_STYLES[variant];
  const badgeTone = variant === "premium" ? "cyan" : variant === "account" ? "cyan" : "neutral";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: pressed || disabled ? 0.75 : 1,
      })}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: vs.bg,
            borderColor: vs.border,
            borderRadius: colors.radius,
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: vs.iconBg,
              borderColor: vs.iconBorder,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={vs.iconColor} />
          ) : (
            <Feather name={icon} size={20} color={vs.iconColor} />
          )}
        </View>

        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
            {badge ? <Badge label={badge} tone={badgeTone} /> : null}
          </View>
          <Text style={[styles.description, { color: colors.zinc500 }]} numberOfLines={2}>
            {description}
          </Text>
        </View>

        <Feather name="chevron-right" size={18} color={colors.zinc600} />
      </Animated.View>
    </Pressable>
  );
}

export function MoreActionButton({ href, ...props }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  if (href) {
    return (
      <Link href={href} asChild>
        <MoreActionButtonInner
          {...props}
          scale={scale}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        />
      </Link>
    );
  }

  return (
    <MoreActionButtonInner
      {...props}
      scale={scale}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: -0.1,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
});
