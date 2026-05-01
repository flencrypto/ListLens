import { useState, useEffect, useCallback } from "react";
import { Link, useSearch } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandGlyph } from "@/components/brand/brand-glyph";
import { PLANS as STRIPE_PLANS } from "@/lib/stripe";

interface PlanDisplay {
  key: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  credits: string;
  cta: string;
  highlight: boolean;
  priceId?: string;
}

const PLANS: PlanDisplay[] = [
  {
    key: "free",
    name: "Free Trial",
    price: "£0",
    period: "",
    desc: "Get started",
    features: ["3 Studio listings", "ShoeLens", "Vinted export"],
    credits: "3 listings",
    cta: "Current plan",
    highlight: false,
  },
  {
    key: "studio_starter",
    name: STRIPE_PLANS.studio_starter.name,
    price: `£${(STRIPE_PLANS.studio_starter.price / 100).toFixed(2)}`,
    period: "/month",
    desc: "For casual sellers",
    features: [
      "Unlimited listings",
      "eBay + Vinted export",
      "ShoeLens + LPLens",
      "Listing history",
      "Priority AI analysis",
    ],
    credits: "Unlimited",
    cta: "Subscribe",
    highlight: true,
    priceId: STRIPE_PLANS.studio_starter.priceId,
  },
  {
    key: "studio_reseller",
    name: STRIPE_PLANS.studio_reseller.name,
    price: `£${(STRIPE_PLANS.studio_reseller.price / 100).toFixed(2)}`,
    period: "/month",
    desc: "For power sellers",
    features: [
      "Everything in Starter",
      "All Lenses (as released)",
      "Bulk listing tools",
      "API access",
      "Priority support",
    ],
    credits: "Unlimited",
    cta: "Subscribe",
    highlight: false,
    priceId: STRIPE_PLANS.studio_reseller.priceId,
  },
];

const GUARD_SINGLE_PRICE_ID = STRIPE_PLANS.guard_single.priceId;
const GUARD_MONTHLY_PRICE_ID = STRIPE_PLANS.guard_monthly.priceId;

const PLAN_TIER_LABELS: Record<string, string> = {
  free: "Free Trial",
  studio_starter: "Studio Starter",
  studio_reseller: "Studio Reseller",
  guard_monthly: "Guard Monthly",
};

const RETURN_PERIOD_OPTIONS = [
  { value: "Days_14", label: "14 days" },
  { value: "Days_30", label: "30 days" },
  { value: "Days_60", label: "60 days" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "PayPal", label: "PayPal" },
  { value: "CashOnPickup", label: "Cash on collection" },
  { value: "VisaMC", label: "Credit / Debit card" },
];

interface EbayStatus {
  connected: boolean;
  credentialsMissing: boolean;
  sandbox: boolean;
  expiresAt?: string | null;
}

interface EbaySettings {
  shippingCost: string;
  returnsAccepted: boolean;
  returnPeriod: string;
  paymentMethod: string;
}

interface BillingInfo {
  credits: number;
  planTier: string;
  stripeConfigured: boolean;
}

function EbaySettingsForm({ onSaved }: { onSaved?: () => void }) {
  const [settings, setSettings] = useState<EbaySettings>({
    shippingCost: "3.99",
    returnsAccepted: true,
    returnPeriod: "Days_30",
    paymentMethod: "PayPal",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/ebay/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setSettings(d as EbaySettings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/ebay/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        onSaved?.();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-3 bg-zinc-800 rounded w-32" />
        <div className="h-8 bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 pt-1">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Listing defaults
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">
            Shipping cost (£)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
            value={settings.shippingCost}
            onChange={(e) =>
              setSettings((s) => ({ ...s, shippingCost: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">
            Payment method
          </label>
          <select
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
            value={settings.paymentMethod}
            onChange={(e) =>
              setSettings((s) => ({ ...s, paymentMethod: e.target.value }))
            }
          >
            {PAYMENT_METHOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm text-zinc-300">Accept returns</label>
        <button
          type="button"
          onClick={() =>
            setSettings((s) => ({ ...s, returnsAccepted: !s.returnsAccepted }))
          }
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            settings.returnsAccepted ? "bg-cyan-600" : "bg-zinc-700"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
              settings.returnsAccepted ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {settings.returnsAccepted && (
        <div>
          <label className="block text-xs text-zinc-400 mb-1">
            Return period
          </label>
          <select
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
            value={settings.returnPeriod}
            onChange={(e) =>
              setSettings((s) => ({ ...s, returnPeriod: e.target.value }))
            }
          >
            {RETURN_PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          size="sm"
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-500 text-white border-0"
        >
          {saving ? "Saving…" : "Save settings"}
        </Button>
        {saved && (
          <span className="text-xs text-emerald-400">Settings saved</span>
        )}
      </div>
    </form>
  );
}

function EbayConnectSection() {
  const [status, setStatus] = useState<EbayStatus | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/ebay/status")
      .then((r) => r.json())
      .then((d) => setStatus(d as EbayStatus))
      .catch(() => {});
  }, []);

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/ebay/disconnect", { method: "POST" });
      setStatus((s) =>
        s ? { ...s, connected: false, expiresAt: null } : s,
      );
    } finally {
      setDisconnecting(false);
    }
  }

  if (!status) {
    return (
      <div className="brand-card p-6 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-40 mb-2" />
        <div className="h-3 bg-zinc-800 rounded w-64" />
      </div>
    );
  }

  return (
    <div className="brand-card p-6 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            eBay Account
            {status.sandbox && (
              <Badge variant="secondary" className="text-xs">
                Sandbox
              </Badge>
            )}
          </h2>
          <p className="text-zinc-400 text-sm">
            Connect your eBay account to publish listings directly from the
            Studio editor.
          </p>
        </div>
        {status.connected ? (
          <Badge variant="success" className="shrink-0">
            Connected
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0">
            Not connected
          </Badge>
        )}
      </div>

      {status.credentialsMissing ? (
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-300">
          eBay API credentials are not configured. Contact support to enable
          eBay publishing.
        </div>
      ) : status.connected ? (
        <div className="space-y-4">
          {status.expiresAt && (
            <p className="text-zinc-500 text-xs">
              Token valid until {new Date(status.expiresAt).toLocaleString()}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="flex-1 border-orange-800 text-orange-300 hover:bg-orange-950/30"
            >
              <a href="/api/ebay/connect">Re-authorise</a>
            </Button>
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
              disabled={disconnecting}
              onClick={handleDisconnect}
            >
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </Button>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <EbaySettingsForm />
          </div>
        </div>
      ) : (
        <Button
          asChild
          className="bg-orange-600 hover:bg-orange-500 text-white border-0"
        >
          <a href="/api/ebay/connect">Connect eBay Account</a>
        </Button>
      )}
    </div>
  );
}

export default function BillingPage() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [demoFeedback, setDemoFeedback] = useState<string | null>(null);

  const search = useSearch();
  const params = new URLSearchParams(search);
  const checkoutStatus = params.get("checkout");
  const demoParam = params.get("demo");

  const fetchBillingInfo = useCallback(() => {
    fetch("/api/billing/info")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setBillingInfo(d as BillingInfo);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchBillingInfo();
  }, [fetchBillingInfo]);

  async function handleDemoUpgrade(plan: string, label: string) {
    setDemoLoading(plan);
    setDemoFeedback(null);
    try {
      const res = await fetch("/api/billing/demo-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        setDemoFeedback(plan === "free" ? "Reverted to Free Trial" : `${label} demo activated`);
        fetchBillingInfo();
        setTimeout(() => setDemoFeedback(null), 4000);
      } else {
        const err = (await res.json()) as { error?: string };
        setDemoFeedback(err.error ?? "Demo upgrade failed");
      }
    } catch {
      setDemoFeedback("Network error — try again");
    } finally {
      setDemoLoading(null);
    }
  }

  const planLabel =
    billingInfo
      ? (PLAN_TIER_LABELS[billingInfo.planTier] ?? billingInfo.planTier)
      : "Free Trial";

  const isFree = !billingInfo || billingInfo.planTier === "free";
  const currentPlanKey = billingInfo?.planTier ?? "free";
  const stripeConfigured = billingInfo?.stripeConfigured ?? false;
  const demoMode = !stripeConfigured;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Account · Billing
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">
            Billing &amp; Plans
          </h1>
          <p className="text-zinc-400 text-sm">
            Choose the plan that works for you. Cancel anytime.
          </p>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        {/* Demo mode banner */}
        {demoMode && (
          <div className="rounded-lg border border-amber-800/50 bg-amber-950/25 px-5 py-4 space-y-1">
            <p className="text-sm font-semibold text-amber-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Demo Mode — Stripe not yet connected
            </p>
            <p className="text-xs text-amber-400/80">
              Subscription buttons simulate the plan experience without charging anything.
              Connect Stripe to enable real payments.
            </p>
          </div>
        )}

        {/* Demo feedback toast */}
        {demoFeedback && (
          <div className="rounded-lg border border-cyan-800/50 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-300 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
            {demoFeedback}
          </div>
        )}

        {/* Demo checkout redirect feedback */}
        {demoParam === "checkout" && !checkoutStatus && (
          <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
            Checkout would open here — use the demo buttons above to simulate plan selection.
          </div>
        )}
        {demoParam === "portal" && (
          <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
            Billing portal will be available once Stripe is connected.
          </div>
        )}

        {checkoutStatus === "success" && (
          <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
            Payment successful — your plan has been updated.
          </div>
        )}
        {checkoutStatus === "cancelled" && (
          <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
            Checkout cancelled — no charge was made.
          </div>
        )}

        {/* Current plan */}
        <div className="brand-card brand-card-glow p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-zinc-400 text-sm mb-1">Current plan</p>
            <p className="text-white font-bold text-lg">
              {planLabel}
              {demoMode && !isFree && (
                <span className="ml-2 text-xs font-normal text-amber-400 border border-amber-700/60 rounded px-1.5 py-0.5">
                  demo
                </span>
              )}
            </p>
            {isFree ? (
              <p className="text-zinc-400 text-sm mt-0.5">3 listings remaining</p>
            ) : (
              <p className="text-zinc-400 text-sm mt-0.5">
                {demoMode ? "Simulated active subscription" : "Active subscription"}
              </p>
            )}
            {billingInfo && billingInfo.credits > 0 && (
              <p className="text-violet-300 text-sm mt-1 font-medium">
                {billingInfo.credits} Guard credit{billingInfo.credits !== 1 ? "s" : ""} remaining
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={isFree ? "secondary" : "success"}>
              {isFree ? "Free" : demoMode ? "Demo Active" : "Active"}
            </Badge>
            {demoMode && !isFree && (
              <button
                onClick={() => handleDemoUpgrade("free", "Free Trial")}
                disabled={demoLoading === "free"}
                className="text-xs text-zinc-500 hover:text-red-400 underline underline-offset-2 transition-colors"
              >
                {demoLoading === "free" ? "Reverting…" : "Reset to free"}
              </button>
            )}
          </div>
        </div>

        {/* Studio plans */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Studio Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const isCurrentPlan = plan.key === currentPlanKey;
              const isLoading = demoLoading === plan.key;

              return (
                <div
                  key={plan.key}
                  className={`p-6 flex flex-col ${
                    plan.highlight ? "brand-card brand-card-glow" : "brand-card"
                  }`}
                >
                  {plan.highlight && (
                    <span className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  <div className="mt-1 mb-1">
                    <span className="text-3xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-zinc-400 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-zinc-500 text-xs mb-4">{plan.desc}</p>
                  <ul className="space-y-2 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="text-sm text-zinc-300 flex items-start gap-2"
                      >
                        <span className="text-cyan-400 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button disabled variant="secondary" className="w-full">
                      Current plan
                    </Button>
                  ) : plan.key === "free" ? (
                    <Button disabled variant="secondary" className="w-full opacity-40">
                      Free tier
                    </Button>
                  ) : demoMode ? (
                    <Button
                      onClick={() => handleDemoUpgrade(plan.key, plan.name)}
                      disabled={isLoading}
                      className={`w-full ${
                        plan.highlight
                          ? "bg-gradient-to-r from-cyan-500 to-violet-600 border-0"
                          : ""
                      }`}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {isLoading ? "Activating…" : `Try ${plan.name} (demo)`}
                    </Button>
                  ) : plan.priceId ? (
                    <form action="/api/billing/checkout" method="POST">
                      <input type="hidden" name="priceId" value={plan.priceId} />
                      <Button
                        type="submit"
                        onClick={() => {}}
                        className={`w-full ${
                          plan.highlight
                            ? "bg-gradient-to-r from-cyan-500 to-violet-600 border-0"
                            : ""
                        }`}
                        variant={plan.highlight ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </form>
                  ) : (
                    <Button disabled variant="secondary" className="w-full">
                      Coming soon
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="hud-divider opacity-40" />

        {/* Guard plans */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Guard Plans
          </h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
            {/* Single Check */}
            <div className="brand-card brand-card-violet p-6 flex flex-col">
              <h3 className="font-bold text-white">Single Check</h3>
              <div className="mt-1 mb-1">
                <span className="text-3xl font-extrabold text-white">£1.99</span>
              </div>
              <p className="text-zinc-500 text-xs mb-4">Pay per check</p>
              <ul className="space-y-2 flex-1 mb-5">
                {["Full risk report", "Red flags", "Seller questions"].map((f) => (
                  <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-violet-400 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {demoMode ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-violet-800 text-violet-300 hover:bg-violet-950/40"
                >
                  <Link href="/guard/new">Try a check (free)</Link>
                </Button>
              ) : stripeConfigured && GUARD_SINGLE_PRICE_ID ? (
                <form action="/api/billing/checkout" method="POST">
                  <input type="hidden" name="priceId" value={GUARD_SINGLE_PRICE_ID} />
                  <input type="hidden" name="mode" value="payment" />
                  <Button
                    type="submit"
                    onClick={() => {}}
                    variant="outline"
                    className="w-full border-violet-800 text-violet-300 hover:bg-violet-950/40"
                  >
                    Buy check
                  </Button>
                </form>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-violet-800 text-violet-300 hover:bg-violet-950/40"
                >
                  <Link href="/guard/new">Try a check</Link>
                </Button>
              )}
            </div>

            {/* Guard Monthly */}
            <div
              className={`brand-card brand-card-violet p-6 flex flex-col ${
                currentPlanKey === "guard_monthly" ? "ring-1 ring-violet-500/50" : ""
              }`}
            >
              <h3 className="font-bold text-white flex items-center gap-2">
                Guard Monthly
                {currentPlanKey === "guard_monthly" && demoMode && (
                  <span className="text-xs font-normal text-amber-400 border border-amber-700/60 rounded px-1.5 py-0.5">
                    demo
                  </span>
                )}
              </h3>
              <div className="mt-1 mb-1">
                <span className="text-3xl font-extrabold text-white">£6.99</span>
                <span className="text-zinc-400 text-sm">/month</span>
              </div>
              <p className="text-zinc-500 text-xs mb-4">10 checks/month</p>
              <ul className="space-y-2 flex-1 mb-5">
                {["10 checks per month", "All Lenses", "Report history", "PDF export"].map((f) => (
                  <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-violet-400 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {currentPlanKey === "guard_monthly" ? (
                <div className="space-y-2">
                  <Button disabled variant="secondary" className="w-full">
                    Current plan
                  </Button>
                  {demoMode && (
                    <button
                      onClick={() => handleDemoUpgrade("free", "Free Trial")}
                      disabled={demoLoading === "free"}
                      className="w-full text-xs text-zinc-500 hover:text-red-400 underline underline-offset-2 transition-colors text-center"
                    >
                      {demoLoading === "free" ? "Reverting…" : "Reset to free"}
                    </button>
                  )}
                </div>
              ) : demoMode ? (
                <Button
                  onClick={() => handleDemoUpgrade("guard_monthly", "Guard Monthly")}
                  disabled={demoLoading === "guard_monthly"}
                  variant="outline"
                  className="w-full border-violet-800 text-violet-300 hover:bg-violet-950/40"
                >
                  {demoLoading === "guard_monthly" ? "Activating…" : "Try Guard Monthly (demo)"}
                </Button>
              ) : stripeConfigured && GUARD_MONTHLY_PRICE_ID ? (
                <form action="/api/billing/checkout" method="POST">
                  <input type="hidden" name="priceId" value={GUARD_MONTHLY_PRICE_ID} />
                  <Button
                    type="submit"
                    onClick={() => {}}
                    variant="outline"
                    className="w-full border-violet-800 text-violet-300 hover:bg-violet-950/40"
                  >
                    Subscribe
                  </Button>
                </form>
              ) : (
                <Button
                  disabled
                  variant="outline"
                  className="w-full border-violet-800 text-violet-300 opacity-50"
                >
                  Subscribe
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center py-2">
          <BrandGlyph size={24} showSparks={false} />
        </div>

        {/* eBay Connect */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Connected Accounts
          </h2>
          <EbayConnectSection />
        </div>

        <div className="hud-divider opacity-40" />

        {/* Manage billing — only shown when Stripe is configured */}
        {stripeConfigured && (
          <div className="brand-card p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-semibold text-white mb-1">
                Manage Billing
              </h2>
              <p className="text-zinc-400 text-sm">
                Access your invoices, update payment method, or cancel your
                subscription.
              </p>
            </div>
            <form action="/api/billing/portal" method="POST">
              <Button type="submit" variant="outline">
                Billing portal
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
