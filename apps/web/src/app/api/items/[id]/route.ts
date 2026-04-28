import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userOwnsItem } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!userOwnsItem(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ id, status: "draft" });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!userOwnsItem(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  return NextResponse.json({ id, ...body });
}
