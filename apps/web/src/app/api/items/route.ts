import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { itemOwner, itemMeta } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = `item_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const lens = body.lens ?? "ShoeLens";
  itemOwner.set(id, userId);
  itemMeta.set(id, { lens, marketplace: body.marketplace });
  return NextResponse.json({ id, lens, marketplace: body.marketplace, status: "draft" });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: [] });
}
