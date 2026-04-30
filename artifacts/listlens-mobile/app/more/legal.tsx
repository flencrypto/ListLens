import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";

interface Section {
  id: string;
  title: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    id: "ai",
    title: "AI disclaimer",
    body: "List-LENS uses AI to assist with listing drafts and risk screening. Outputs are evidence-led suggestions, not formal authentication. We never claim that an item is fake or that a seller is fraudulent — we surface risk indicators, missing evidence and suggested questions so you can decide for yourself.",
  },
  {
    id: "privacy",
    title: "Privacy",
    body: "Photos you capture in Studio are processed for the purpose of creating a listing and stay on-device in this demo build. The production app stores drafts in your account and processes images via our trust layer with anonymised metadata only.",
  },
  {
    id: "terms",
    title: "Terms of service",
    body: "By using Mr.FLENS · List-LENS you agree not to use the app to mislead buyers, list counterfeit or stolen goods, or circumvent marketplace policies. The Guard risk screen is informational only and does not provide legal advice or warranty against fraud.",
  },
];

export default function LegalScreen() {
  const colors = useColors();
  const [open, setOpen] = useState<string | null>(SECTIONS[0]?.id ?? null);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Legal</Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          The short version of how the app handles your data and AI outputs.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {SECTIONS.map((section) => {
          const isOpen = open === section.id;
          return (
            <Card key={section.id} padded={false} style={{ padding: 0 }}>
              <Pressable
                onPress={() => setOpen(isOpen ? null : section.id)}
                style={styles.row}
                hitSlop={4}
              >
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                  {section.title}
                </Text>
                <Feather
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.zinc400}
                />
              </Pressable>
              {isOpen ? (
                <View style={styles.body}>
                  <Text style={[styles.bodyText, { color: colors.zinc300 }]}>
                    {section.body}
                  </Text>
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 4, gap: 6 },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
});
