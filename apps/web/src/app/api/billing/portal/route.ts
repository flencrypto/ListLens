import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { requireStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripeClient = requireStripe();

  // Look up the Stripe customer ID from the database
  const payment = await prisma.payment.findFirst({
    where: { workspace: { members: { some: { user: { clerkId: userId } } } } },
    select: { stripeCustomerId: true },
  });

  if (!payment?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const session = await stripeClient.billingPortal.sessions.create({
    customer: payment.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing`,
  });

  return NextResponse.redirect(session.url, 303);
}
