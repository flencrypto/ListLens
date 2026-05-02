import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { BrandGlyph } from "@/components/brand/BrandGlyph";
import { MoreActionButton } from "@/components/more/MoreActionButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/lib/revenuecat";

export default function MoreScreen() {
  const colors = useColors();
  const { isSubscribed } = useSubscription();
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    login,
    logout,
    loginError,
    dbDegraded,
  } = useAuth();

  const authDescription = loginError
    ? loginError
    : dbDegraded
      ? "Account data temporarily unavailable — some limits may not be accurate"
      : isAuthenticated && user
        ? user.email ?? user.firstName ?? "Signed in"
        : "Sign in to sync your data";

  return (
    <ScreenContainer withTabPadding>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.brandCyan }]}>List-LENS System</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>More</Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Account, settings and everything else.
        </Text>
      </View>

      {/* Action buttons */}
      <View style={{ gap: 10 }}>
        <MoreActionButton
          label="History"
          description="Your saved listings and Guard checks"
          icon="clock"
          variant="default"
          href="/more/history"
        />

        <MoreActionButton
          label="Billing & Plans"
          description="Manage subscription and credits"
          icon="credit-card"
          variant="premium"
          badge={isSubscribed ? "Pro" : "Free Trial"}
          href="/more/billing"
        />

        <MoreActionButton
          label="Legal"
          description="Privacy, terms and AI disclaimer"
          icon="file-text"
          variant="default"
          href="/more/legal"
        />

        <MoreActionButton
          label="Replay Splash"
          description="See the brand intro again"
          icon="play-circle"
          variant="default"
          href="/splash"
        />

        <MoreActionButton
          label={isAuthenticated ? "Log out" : "Log in"}
          description={authDescription}
          icon={isAuthenticated ? "log-out" : "log-in"}
          variant={loginError ? "danger" : "account"}
          onPress={isAuthenticated ? logout : login}
          disabled={authLoading}
          loading={authLoading}
        />
      </View>

      {/* Brand footer card — dark-glass treatment */}
      <View
        style={[
          styles.brandCard,
          {
            backgroundColor: "rgba(10, 22, 40, 0.72)",
            borderColor: colors.brandStroke,
            borderRadius: colors.radius,
          },
          Platform.select({
            web: {
              boxShadow: `0 8px 20px ${colors.brandGlow}`,
            } as object,
            default: {
              shadowColor: colors.brandGlow,
              shadowOpacity: 0.55,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 5,
            },
          }),
        ]}
      >
        <BrandGlyph size={48} />
        <Text style={[styles.brandTitle, { color: colors.foreground }]}>
          MR.FLENS · LIST-LENS
        </Text>
        <Text style={[styles.brandTag, { color: colors.cyan300 }]}>
          AI · Evidence · Confidence
        </Text>
        <Text style={[styles.brandFooter, { color: colors.zinc500 }]}>
          © 2026 Mr.FLENS · v1.0.0
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    gap: 4,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  brandCard: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  brandTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1.4,
    marginTop: 10,
  },
  brandTag: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 2.8,
    textTransform: "uppercase",
    marginTop: 4,
  },
  brandFooter: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 12,
  },
});
