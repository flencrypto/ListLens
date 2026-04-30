import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PurchasesPackage } from "react-native-purchases";

import { Badge } from "@/components/ui/Badge";
import { BrandButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { HUDSpinner } from "@/components/ui/Spinner";
import { useColors } from "@/hooks/useColors";
import {
  REVENUECAT_ENTITLEMENT_IDENTIFIER,
  formatRemainingCredits,
  useSubscription,
} from "@/lib/revenuecat";

interface PlanCopy {
  packageLookupKey: "$rc_monthly" | "$rc_annual" | "$rc_lifetime";
  desc: string;
  features: string[];
  highlight?: boolean;
  accent: "cyan" | "violet";
}

const STUDIO_PLANS: PlanCopy[] = [
  {
    packageLookupKey: "$rc_monthly",
    desc: "For casual sellers",
    features: [
      "Unlimited listings",
      "eBay + Vinted export",
      "ShoeLens + RecordLens",
      "Listing history",
    ],
    highlight: true,
    accent: "cyan",
  },
  {
    packageLookupKey: "$rc_annual",
    desc: "For power sellers",
    features: [
      "Everything in Starter",
      "All Lenses as released",
      "Bulk listing tools",
      "Priority support",
    ],
    accent: "cyan",
  },
];

const GUARD_PLANS: PlanCopy[] = [
  {
    packageLookupKey: "$rc_lifetime",
    desc: "10 checks/month",
    features: [
      "10 checks per month",
      "All Lenses",
      "Report history",
      "PDF export",
    ],
    accent: "violet",
  },
];

export default function BillingScreen() {
  const colors = useColors();
  const {
    customerInfo,
    currentOffering,
    isLoading,
    purchase,
    restore,
    isPurchasing,
    isRestoring,
    activeProductIds,
    refetchCustomerInfo,
  } = useSubscription();

  const [pendingPackage, setPendingPackage] = useState<PurchasesPackage | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const packagesByLookup = useMemo(() => {
    const map = new Map<string, PurchasesPackage>();
    if (currentOffering) {
      for (const pkg of currentOffering.availablePackages) {
        if (pkg.identifier) map.set(pkg.identifier, pkg);
      }
    }
    return map;
  }, [currentOffering]);

  const handleConfirmPurchase = async () => {
    if (!pendingPackage) return;
    const pkg = pendingPackage;
    setPendingPackage(null);
    setActionError(null);
    try {
      await purchase(pkg);
    } catch (e) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err?.userCancelled) {
        setActionError(err?.message ?? "Purchase failed.");
      }
    }
  };

  const handleRestore = async () => {
    setActionError(null);
    setRestoreMessage(null);
    try {
      const info = await restore();
      const hasEntitlement =
        info.entitlements.active?.[REVENUECAT_ENTITLEMENT_IDENTIFIER] !== undefined;
      setRestoreMessage(
        hasEntitlement ? "Purchases restored." : "No active purchases found.",
      );
      await refetchCustomerInfo();
    } catch (e) {
      const err = e as { message?: string };
      setActionError(err?.message ?? "Restore failed.");
    }
  };

  const currentPlanLabel = formatRemainingCredits(customerInfo);
  const currentPlanIsFree = !customerInfo?.entitlements.active?.[REVENUECAT_ENTITLEMENT_IDENTIFIER];

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
              {currentPlanIsFree ? "Free Trial" : "Pro"}
            </Text>
            <Text style={[styles.currentBody, { color: colors.zinc400 }]}>
              {currentPlanLabel}
            </Text>
          </View>
          <Badge label={currentPlanIsFree ? "Free" : "Active"} tone="cyan" />
        </View>
      </Card>

      {isLoading ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <HUDSpinner color={colors.brandCyan} size={26} />
          <Text style={[styles.loadingText, { color: colors.zinc500 }]}>
            Loading plans…
          </Text>
        </View>
      ) : null}

      {actionError ? (
        <Card>
          <Text style={[styles.errorText, { color: "#fca5a5" }]}>{actionError}</Text>
        </Card>
      ) : null}

      {restoreMessage ? (
        <Card>
          <Text style={[styles.infoText, { color: colors.cyan300 }]}>
            {restoreMessage}
          </Text>
        </Card>
      ) : null}

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Studio plans
      </Text>
      <View style={{ gap: 12 }}>
        <FreeTrialCard isCurrent={currentPlanIsFree} />
        {STUDIO_PLANS.map((plan) => {
          const pkg = packagesByLookup.get(plan.packageLookupKey);
          return (
            <PlanCard
              key={plan.packageLookupKey}
              plan={plan}
              pkg={pkg}
              accent={colors.brandCyan}
              isCurrent={
                pkg ? activeProductIds.includes(pkg.product.identifier) : false
              }
              onPress={() => pkg && setPendingPackage(pkg)}
              disabled={isPurchasing}
            />
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 4 }]}>
        Guard plans
      </Text>
      <View style={{ gap: 12 }}>
        {GUARD_PLANS.map((plan) => {
          const pkg = packagesByLookup.get(plan.packageLookupKey);
          return (
            <PlanCard
              key={plan.packageLookupKey}
              plan={plan}
              pkg={pkg}
              accent={colors.brandViolet}
              isCurrent={
                pkg ? activeProductIds.includes(pkg.product.identifier) : false
              }
              onPress={() => pkg && setPendingPackage(pkg)}
              disabled={isPurchasing}
            />
          );
        })}
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <Feather name="credit-card" size={16} color={colors.brandCyan} />
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Manage billing
          </Text>
        </View>
        <Text style={[styles.cardBody, { color: colors.zinc400 }]}>
          Restore purchases on a new device or after reinstalling. Subscription
          management lives in the App Store / Play Store account settings.
        </Text>
        <View style={{ height: 12 }} />
        <BrandButton
          label={isRestoring ? "Restoring…" : "Restore purchases"}
          variant="outline"
          disabled={isRestoring || isPurchasing}
          onPress={handleRestore}
        />
        <Text style={[styles.note, { color: colors.zinc500 }]}>
          {Platform.OS === "web"
            ? "Web build uses the RevenueCat test store."
            : "Cancel or change plans in your device's subscription settings."}
        </Text>
      </Card>

      <Modal
        visible={pendingPackage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingPackage(null)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: "rgba(4,10,20,0.7)" }]}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: "rgba(15,23,42,0.96)",
                borderColor: colors.zinc800,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Confirm purchase
            </Text>
            {pendingPackage ? (
              <>
                <Text style={[styles.modalBody, { color: colors.zinc300 }]}>
                  {pendingPackage.product.title || pendingPackage.product.identifier}
                </Text>
                <Text style={[styles.modalPrice, { color: colors.foreground }]}>
                  {pendingPackage.product.priceString}
                </Text>
                <Text style={[styles.modalNote, { color: colors.zinc500 }]}>
                  Test store purchase — no real charge will be made.
                </Text>
              </>
            ) : null}
            <View style={{ height: 16 }} />
            <BrandButton
              label={isPurchasing ? "Processing…" : "Confirm"}
              onPress={handleConfirmPurchase}
              disabled={isPurchasing}
            />
            <View style={{ height: 8 }} />
            <BrandButton
              label="Cancel"
              variant="outline"
              onPress={() => setPendingPackage(null)}
              disabled={isPurchasing}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function formatPeriod(iso: string | null | undefined): string {
  if (!iso) return "/mo";
  const match = iso.match(/^P(\d+)([DWMY])$/);
  if (!match) return "/mo";
  const [, n, unit] = match;
  const count = parseInt(n, 10);
  if (unit === "Y") return count === 1 ? "/yr" : `/${count}yr`;
  if (unit === "M") return count === 1 ? "/mo" : `/${count}mo`;
  if (unit === "W") return count === 1 ? "/wk" : `/${count}wk`;
  return count === 1 ? "/day" : `/${count}d`;
}

function FreeTrialCard({ isCurrent }: { isCurrent: boolean }) {
  const colors = useColors();
  return (
    <Card>
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: colors.foreground }]}>
          Free Trial
        </Text>
        {isCurrent ? <Badge label="Current" tone="cyan" /> : null}
      </View>
      <View style={styles.priceRow}>
        <Text style={[styles.priceValue, { color: colors.foreground }]}>£0</Text>
      </View>
      <Text style={[styles.planDesc, { color: colors.zinc500 }]}>Get started</Text>
      <View style={styles.featureList}>
        {["3 Studio listings", "ShoeLens", "Vinted export"].map((f) => (
          <View key={f} style={styles.featureRow}>
            <Feather name="check" size={14} color={colors.brandCyan} />
            <Text style={[styles.featureText, { color: colors.zinc300 }]}>{f}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 14 }} />
      <BrandButton
        label="Current plan"
        variant="secondary"
        disabled
        onPress={() => undefined}
      />
    </Card>
  );
}

function PlanCard({
  plan,
  pkg,
  accent,
  isCurrent,
  onPress,
  disabled,
}: {
  plan: PlanCopy;
  pkg: PurchasesPackage | undefined;
  accent: string;
  isCurrent: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const colors = useColors();
  const product = pkg?.product;
  const name = product?.title || (pkg ? pkg.identifier : "Plan");
  const price = product?.priceString;
  const period = formatPeriod(product?.subscriptionPeriod);

  return (
    <Card highlight={plan.highlight}>
      {plan.highlight ? (
        <Text style={[styles.popular, { color: accent }]}>Most popular</Text>
      ) : null}
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: colors.foreground }]}>{name}</Text>
        {isCurrent ? <Badge label="Current" tone="cyan" /> : null}
      </View>
      <View style={styles.priceRow}>
        <Text style={[styles.priceValue, { color: colors.foreground }]}>
          {price ?? "—"}
        </Text>
        {price ? (
          <Text style={[styles.pricePeriod, { color: colors.zinc400 }]}>{period}</Text>
        ) : null}
      </View>
      <Text style={[styles.planDesc, { color: colors.zinc500 }]}>{plan.desc}</Text>
      <View style={styles.featureList}>
        {plan.features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Feather name="check" size={14} color={accent} />
            <Text style={[styles.featureText, { color: colors.zinc300 }]}>{f}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 14 }} />
      {isCurrent ? (
        <BrandButton
          label="Current plan"
          variant="secondary"
          disabled
          onPress={() => undefined}
        />
      ) : (
        <Pressable
          onPress={pkg ? onPress : undefined}
          disabled={!pkg || disabled}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <View pointerEvents="none">
            <BrandButton
              label={pkg ? "Choose plan" : "Unavailable"}
              variant={plan.highlight ? "primary" : "outline"}
              disabled={!pkg || disabled}
              onPress={() => undefined}
            />
          </View>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 4, gap: 6 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.5 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13 },
  currentRow: { flexDirection: "row", alignItems: "center" },
  currentLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  currentName: { fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 4 },
  currentBody: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
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
  planName: { fontFamily: "Inter_700Bold", fontSize: 17 },
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
  pricePeriod: { fontFamily: "Inter_500Medium", fontSize: 13 },
  planDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  featureList: { gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
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
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
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
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 8 },
  errorText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  infoText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 8 },
  modalBody: { fontFamily: "Inter_500Medium", fontSize: 14 },
  modalPrice: { fontFamily: "Inter_700Bold", fontSize: 26, marginTop: 6 },
  modalNote: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 6 },
});
