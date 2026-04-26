import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await stripe.billingPortal.sessions.create({
    customer: "placeholder",
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/billing`,
  });

  return NextResponse.redirect(session.url, 303);
}
