import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandGlyph } from "@/components/brand/BrandGlyph";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";

interface MoreLink {
  href: "/more/history" | "/more/billing" | "/more/legal" | "/splash";
  label: string;
  desc: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  badge?: string;
}

export default function MoreScreen() {
  const colors = useColors();
  const { isSubscribed } = useSubscription();
  const LINKS: MoreLink[] = [
    {
      href: "/more/history",
      label: "History",
      desc: "Your saved listings and Guard checks",
      icon: "clock",
    },
    {
      href: "/more/billing",
      label: "Billing & Plans",
      desc: "Manage subscription and credits",
      icon: "credit-card",
      badge: isSubscribed ? "Pro" : "Free trial",
    },
    {
      href: "/more/legal",
      label: "Legal",
      desc: "Privacy, terms, AI disclaimer",
      icon: "file-text",
    },
    {
      href: "/splash",
      label: "Replay splash",
      desc: "See the brand intro again",
      icon: "play-circle",
    },
  ];
  return (
    <ScreenContainer withTabPadding>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>More</Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Account, history and the rest of List-LENS.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.row,
                {
                  borderColor: colors.brandStroke,
                  backgroundColor: colors.cardSurfaceSoft,
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View
                style={[
                  styles.rowIcon,
                  {
                    backgroundColor: "rgba(8,51,68,0.55)",
                    borderColor: "rgba(34,211,238,0.25)",
                  },
                ]}
              >
                <Feather name={link.icon} size={16} color={colors.brandCyan} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTitleLine}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                    {link.label}
                  </Text>
                  {link.badge ? <Badge label={link.badge} tone="cyan" /> : null}
                </View>
                <Text style={[styles.rowDesc, { color: colors.zinc500 }]}>
                  {link.desc}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.zinc500} />
            </Pressable>
          </Link>
        ))}
      </View>

      <Card style={{ alignItems: "center", paddingVertical: 22 }}>
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
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    gap: 6,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  rowDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
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
