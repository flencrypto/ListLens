import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireStripe, PLANS } from "@/lib/stripe";
import { enforceRateLimit, rateLimitIdentifier } from "@/lib/rate-limit";

/** Allow-list of price IDs derived from configured PLANS — protects against arbitrary subscriptions. */
function getAllowedPriceIds(): Set<string> {
  return new Set(
    Object.values(PLANS)
      .map((p) => p.priceId)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
  );
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limited = await enforceRateLimit(rateLimitIdentifier(userId, req), {
    key: "billing:checkout",
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const body = await req.formData().catch(() => null);
  const priceId = body?.get("priceId") as string | null;
  if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

  const allowed = getAllowedPriceIds();
  if (!allowed.has(priceId)) {
    return NextResponse.json({ error: "Unknown priceId" }, { status: 400 });
  }

  const stripeClient = requireStripe();
  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing?canceled=1`,
    metadata: { userId },
  });

  return NextResponse.redirect(session.url ?? "/billing", 303);
}
