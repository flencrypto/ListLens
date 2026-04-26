import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/stripe";

export default async function BillingPage() {
  await auth();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Billing</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold text-white">
                  £{(plan.price / 100).toFixed(0)}
                  <span className="text-base font-normal text-zinc-400">/mo</span>
                </p>
                <p className="text-zinc-400">{plan.credits} credits/month</p>
                <form action="/api/billing/checkout" method="POST">
                  <input type="hidden" name="priceId" value={plan.priceId} />
                  <Button type="submit" className="w-full">
                    Subscribe
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
