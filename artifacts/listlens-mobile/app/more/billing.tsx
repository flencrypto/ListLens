import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useColors } from "@/hooks/useColors";

interface Plan {
  key: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlight?: boolean;
  current?: boolean;
}

const STUDIO_PLANS: Plan[] = [
  {
    key: "free",
    name: "Free Trial",
    price: "£0",
    period: "",
    desc: "Get started",
    features: ["3 Studio listings", "ShoeLens", "Vinted export"],
    current: true,
  },
  {
    key: "starter",
    name: "Studio Starter",
    price: "£9.99",
    period: "/mo",
    desc: "For casual sellers",
    features: [
      "Unlimited listings",
      "eBay + Vinted export",
      "ShoeLens + RecordLens",
      "Listing history",
    ],
    highlight: true,
  },
  {
    key: "reseller",
    name: "Studio Reseller",
    price: "£24.99",
    period: "/mo",
    desc: "For power sellers",
    features: [
      "Everything in Starter",
      "All Lenses as released",
      "Bulk listing tools",
      "Priority support",
    ],
  },
];

const GUARD_PLANS: Plan[] = [
  {
    key: "single",
    name: "Single Check",
    price: "£1.99",
    period: "/check",
    desc: "Pay per check",
    features: ["Full risk report", "Red flags", "Seller questions"],
  },
  {
    key: "monthly",
    name: "Guard Monthly",
    price: "£6.99",
    period: "/mo",
    desc: "10 checks/month",
    features: [
      "10 checks per month",
      "All Lenses",
      "Report history",
      "PDF export",
    ],
  },
];

export default function BillingScreen() {
  const colors = useColors();
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Billing & Plans
        </Text>
        <Text style={[styles.subtitle, { color: colors.zinc400 }]}>
          Choose the plan that works for you. Cancel anytime.
        </Text>
      </View>

      <Card highlight>
        <View style={styles.currentRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.currentLabel, { color: colors.zinc400 }]}>
              Current plan
            </Text>
            <Text style={[styles.currentName, { color: colors.foreground }]}>
              Free Trial
            </Text>
            <Text style={[styles.currentBody, { color: colors.zinc400 }]}>
              3 listings remaining
            </Text>
          </View>
          <Badge label="Free" tone="cyan" />
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Studio plans
      </Text>
      <View style={{ gap: 12 }}>
        {STUDIO_PLANS.map((plan) => (
          <PlanCard key={plan.key} plan={plan} accent={colors.brandCyan} />
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 4 }]}>
        Guard plans
      </Text>
      <View style={{ gap: 12 }}>
        {GUARD_PLANS.map((plan) => (
          <PlanCard key={plan.key} plan={plan} accent={colors.brandViolet} />
        ))}
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <Feather name="credit-card" size={16} color={colors.brandCyan} />
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Manage billing
          </Text>
        </View>
        <Text style={[styles.cardBody, { color: colors.zinc400 }]}>
          Access invoices, update payment method or cancel your subscription
          from the billing portal.
        </Text>
        <View style={{ height: 12 }} />
        <BrandButton
          label="Open billing portal"
          variant="outline"
          onPress={() => undefined}
        />
        <Text style={[styles.note, { color: colors.zinc500 }]}>
          {Platform.OS === "web"
            ? "Demo build — billing actions are stubbed."
            : "Demo build — opens in Safari/Chrome on production."}
        </Text>
      </Card>
    </ScreenContainer>
  );
}

function PlanCard({ plan, accent }: { plan: Plan; accent: string }) {
  const colors = useColors();
  return (
    <Card highlight={plan.highlight}>
      {plan.highlight ? (
        <Text style={[styles.popular, { color: accent }]}>Most popular</Text>
      ) : null}
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: colors.foreground }]}>
          {plan.name}
        </Text>
        {plan.current ? <Badge label="Current" tone="cyan" /> : null}
      </View>
      <View style={styles.priceRow}>
        <Text style={[styles.priceValue, { color: colors.foreground }]}>
          {plan.price}
        </Text>
        <Text style={[styles.pricePeriod, { color: colors.zinc400 }]}>
          {plan.period}
        </Text>
      </View>
      <Text style={[styles.planDesc, { color: colors.zinc500 }]}>
        {plan.desc}
      </Text>
      <View style={styles.featureList}>
        {plan.features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Feather name="check" size={14} color={accent} />
            <Text style={[styles.featureText, { color: colors.zinc300 }]}>
              {f}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ height: 14 }} />
      {plan.current ? (
        <BrandButton label="Current plan" variant="secondary" disabled onPress={() => undefined} />
      ) : (
        <BrandButton
          label="Choose plan"
          variant={plan.highlight ? "primary" : "outline"}
          onPress={() => undefined}
        />
      )}
    </Card>
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
  currentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  currentName: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 4,
  },
  currentBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    paddingHorizontal: 4,
  },
  popular: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planName: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  priceValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  pricePeriod: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  planDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  featureList: { gap: 8 },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  featureText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  cardBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  note: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
});
