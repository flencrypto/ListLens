import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.formData().catch(() => null);
  const priceId = body?.get("priceId") as string | null;
  if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

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
