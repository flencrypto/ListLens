import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  Archive,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  LogIn,
  LogOut,
  PlayCircle,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react-native";

import { useColors } from "@/hooks/useColors";

export type MoreActionButtonVariant =
  | "default"
  | "premium"
  | "account"
  | "danger"
  | "vault";

export type MoreActionButtonHref =
  | "/more/history"
  | "/more/billing"
  | "/more/legal"
  | "/more/vault"
  | "/splash";

export type MoreActionButtonIcon =
  | "clock"
  | "credit-card"
  | "file-text"
  | "play-circle"
  | "refresh-ccw"
  | "log-in"
  | "log-out"
  | "archive"
  | "alert-triangle";

type MoreActionButtonProps = {
  label: string;
  description: string;
  icon: MoreActionButtonIcon;
  variant?: MoreActionButtonVariant;
  badge?: string;
  href?: MoreActionButtonHref;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const ICONS: Record<MoreActionButtonIcon, LucideIcon> = {
  clock: Clock,
  "credit-card": CreditCard,
  "file-text": FileText,
  "play-circle": PlayCircle,
  "refresh-ccw": RefreshCcw,
  "log-in": LogIn,
  "log-out": LogOut,
  archive: Archive,
  "alert-triangle": AlertTriangle,
};

export function MoreActionButton({
  label,
  description,
  icon,
  variant = "default",
  badge,
  href,
  onPress,
  disabled = false,
  loading = false,
}: MoreActionButtonProps) {
  const colors = useColors();
  const router = useRouter();
  const Icon = ICONS[icon];

  const handlePress = () => {
    if (disabled || loading) return;

    if (onPress) {
      onPress();
      return;
    }

    if (href) {
      router.push(href);
    }
  };

  const isVault = variant === "vault";

  const variantStyle = getVariantStyle(variant, colors);

  const cardContent = (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: disabled ? 0.55 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        variantStyle.shadow,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.cornerGlow,
          {
            backgroundColor: variantStyle.glowColor,
          },
        ]}
      />

      <View style={styles.contentRow}>
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: variantStyle.iconBackground,
              borderColor: variantStyle.iconBorder,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={variantStyle.iconColor} />
          ) : (
            <Icon size={22} strokeWidth={2.35} color={variantStyle.iconColor} />
          )}
        </View>

        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: colors.foreground,
                },
              ]}
            >
              {label}
            </Text>

            {badge ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: variantStyle.badgeBackground,
                    borderColor: variantStyle.badgeBorder,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.badgeText,
                    {
                      color: variantStyle.badgeText,
                    },
                  ]}
                >
                  {badge}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.description,
              {
                color: colors.zinc400,
              },
            ]}
          >
            {description}
          </Text>
        </View>

        <ChevronRight
          size={19}
          strokeWidth={2.4}
          color={variantStyle.chevronColor}
        />
      </View>
    </Pressable>
  );

  if (!isVault) {
    return cardContent;
  }

  return (
    <LinearGradient
      colors={[
        "rgba(34, 211, 238, 0.58)",
        "rgba(59, 130, 246, 0.34)",
        "rgba(139, 92, 246, 0.48)",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientBorder, variantStyle.shadow]}
    >
      <View style={styles.gradientInner}>{cardContent}</View>
    </LinearGradient>
  );
}

function getVariantStyle(
  variant: MoreActionButtonVariant,
  colors: ReturnType<typeof useColors>
): {
  backgroundColor: string;
  borderColor: string;
  glowColor: string;
  iconBackground: string;
  iconBorder: string;
  iconColor: string;
  chevronColor: string;
  badgeBackground: string;
  badgeBorder: string;
  badgeText: string;
  shadow: ViewStyle;
} {
  const baseShadow = Platform.select({
    web: {
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.24)",
    } as ViewStyle,
    default: {
      shadowColor: "#000000",
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    } as ViewStyle,
  });

  const cyanShadow = Platform.select({
    web: {
      boxShadow: "0 12px 30px rgba(34, 211, 238, 0.15)",
    } as ViewStyle,
    default: {
      shadowColor: colors.brandCyan,
      shadowOpacity: 0.22,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 7 },
      elevation: 5,
    } as ViewStyle,
  });

  const violetShadow = Platform.select({
    web: {
      boxShadow: "0 14px 34px rgba(124, 58, 237, 0.22)",
    } as ViewStyle,
    default: {
      shadowColor: "#8B5CF6",
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    } as ViewStyle,
  });

  const stylesByVariant = {
    default: {
      backgroundColor: "rgba(255, 255, 255, 0.035)",
      borderColor: "rgba(255, 255, 255, 0.08)",
      glowColor: "rgba(34, 211, 238, 0.08)",
      iconBackground: "rgba(0, 0, 0, 0.28)",
      iconBorder: "rgba(255, 255, 255, 0.10)",
      iconColor: colors.zinc400,
      chevronColor: colors.zinc500,
      badgeBackground: "rgba(34, 211, 238, 0.10)",
      badgeBorder: "rgba(34, 211, 238, 0.24)",
      badgeText: colors.cyan300,
      shadow: baseShadow,
    },
    premium: {
      backgroundColor: "rgba(34, 211, 238, 0.075)",
      borderColor: "rgba(34, 211, 238, 0.24)",
      glowColor: "rgba(34, 211, 238, 0.14)",
      iconBackground: "rgba(34, 211, 238, 0.12)",
      iconBorder: "rgba(34, 211, 238, 0.28)",
      iconColor: colors.cyan300,
      chevronColor: colors.cyan300,
      badgeBackground: "rgba(34, 211, 238, 0.12)",
      badgeBorder: "rgba(34, 211, 238, 0.28)",
      badgeText: colors.cyan300,
      shadow: cyanShadow,
    },
    account: {
      backgroundColor: "rgba(59, 130, 246, 0.07)",
      borderColor: "rgba(147, 197, 253, 0.18)",
      glowColor: "rgba(59, 130, 246, 0.12)",
      iconBackground: "rgba(59, 130, 246, 0.11)",
      iconBorder: "rgba(147, 197, 253, 0.22)",
      iconColor: "#DBEAFE",
      chevronColor: "#93C5FD",
      badgeBackground: "rgba(147, 197, 253, 0.12)",
      badgeBorder: "rgba(147, 197, 253, 0.28)",
      badgeText: "#BFDBFE",
      shadow: baseShadow,
    },
    danger: {
      backgroundColor: "rgba(244, 63, 94, 0.07)",
      borderColor: "rgba(253, 164, 175, 0.20)",
      glowColor: "rgba(244, 63, 94, 0.10)",
      iconBackground: "rgba(244, 63, 94, 0.11)",
      iconBorder: "rgba(253, 164, 175, 0.24)",
      iconColor: "#FDA4AF",
      chevronColor: "#FDA4AF",
      badgeBackground: "rgba(244, 63, 94, 0.12)",
      badgeBorder: "rgba(253, 164, 175, 0.28)",
      badgeText: "#FDA4AF",
      shadow: baseShadow,
    },
    vault: {
      backgroundColor: "rgba(6, 18, 34, 0.92)",
      borderColor: "rgba(0, 0, 0, 0)",
      glowColor: "rgba(139, 92, 246, 0.16)",
      iconBackground: "rgba(34, 211, 238, 0.14)",
      iconBorder: "rgba(34, 211, 238, 0.34)",
      iconColor: colors.cyan300,
      chevronColor: "#C4B5FD",
      badgeBackground: "rgba(139, 92, 246, 0.14)",
      badgeBorder: "rgba(196, 181, 253, 0.28)",
      badgeText: "#DDD6FE",
      shadow: violetShadow,
    },
  };

  return stylesByVariant[variant];
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 23,
    padding: 1,
  },
  gradientInner: {
    borderRadius: 22,
    overflow: "hidden",
  },
  button: {
    minHeight: 74,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  cornerGlow: {
    position: "absolute",
    top: -44,
    right: -44,
    width: 118,
    height: 118,
    borderRadius: 999,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  iconShell: {
    width: 48,
    height: 48,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    flexShrink: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    letterSpacing: -0.15,
  },
  description: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 3,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});