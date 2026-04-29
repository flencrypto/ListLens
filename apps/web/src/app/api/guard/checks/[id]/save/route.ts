import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { guardStore, userOwnsGuardCheck } from "@/lib/store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!userOwnsGuardCheck(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // The check exists in the in-memory store; persisting beyond that is a follow-up.
  if (!guardStore.has(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, id });
}
