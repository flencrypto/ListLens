import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { guardCheckMeta, guardOwner } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = `guard_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  guardCheckMeta.set(id, {
    url: body.url,
    screenshotUrls: body.screenshotUrls,
    lens: body.lens ?? "ShoeLens",
  });
  guardOwner.set(id, userId);
  return NextResponse.json({ id, url: body.url, lens: body.lens ?? "ShoeLens", status: "pending" });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ checks: [] });
}
