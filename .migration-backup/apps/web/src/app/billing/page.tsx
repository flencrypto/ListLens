import { auth } from "@/lib/auth-shim";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  disabled: boolean;
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
    disabled: true,
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
    disabled: !STRIPE_PLANS.studio_starter.priceId,
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
    disabled: !STRIPE_PLANS.studio_reseller.priceId,
    priceId: STRIPE_PLANS.studio_reseller.priceId,
  },
];

const GUARD_PLANS = [
  {
    name: "Single Check",
    price: "£1.99",
    desc: "Pay per check",
    features: ["Full risk report", "Red flags", "Seller questions"],
    cta: "Buy check",
    href: "/guard/new",
  },
  {
    name: "Guard Monthly",
    price: "£6.99",
    desc: "10 checks/month",
    features: ["10 checks per month", "All Lenses", "Report history", "PDF export"],
    cta: "Subscribe",
    href: "/billing",
  },
];

export default async function BillingPage() {
  await auth();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Billing & Plans</h1>
          <p className="text-zinc-400 text-sm">Choose the plan that works for you. Cancel anytime.</p>
        </div>

        {/* Current plan */}
        <Card className="border-cyan-900/40 bg-gradient-to-r from-cyan-950/20 to-zinc-900">
          <CardContent className="flex items-center justify-between flex-wrap gap-4 pt-6">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Current plan</p>
              <p className="text-white font-bold text-lg">Free Trial</p>
              <p className="text-zinc-400 text-sm mt-0.5">3 listings remaining</p>
            </div>
            <Badge variant="secondary">Free</Badge>
          </CardContent>
        </Card>

        {/* Studio plans */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Studio Plans</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? "border-cyan-700 bg-gradient-to-b from-cyan-950/40 to-zinc-900"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                {plan.highlight && (
                  <span className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">Most popular</span>
                )}
                <h3 className="font-bold text-white">{plan.name}</h3>
                <div className="mt-1 mb-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-zinc-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-zinc-500 text-xs mb-4">{plan.desc}</p>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-cyan-400 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.disabled ? (
                  <Button disabled variant="secondary" className="w-full">{plan.cta}</Button>
                ) : (
                  <form action="/api/billing/checkout" method="POST">
                    <input type="hidden" name="priceId" value={plan.priceId ?? ""} />
                    <Button
                      type="submit"
                      className={`w-full ${plan.highlight ? "bg-gradient-to-r from-cyan-500 to-violet-600 border-0" : ""}`}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guard plans */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Guard Plans</h2>
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
            {GUARD_PLANS.map((plan) => (
              <div key={plan.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
                <h3 className="font-bold text-white">{plan.name}</h3>
                <div className="mt-1 mb-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                </div>
                <p className="text-zinc-500 text-xs mb-4">{plan.desc}</p>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-violet-400 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full border-violet-800 text-violet-300 hover:bg-violet-950/40">
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Manage billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage Billing</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-zinc-400 text-sm">Access your invoices, update payment method, or cancel your subscription.</p>
            <form action="/api/billing/portal" method="POST">
              <Button type="submit" variant="outline">Billing portal</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
