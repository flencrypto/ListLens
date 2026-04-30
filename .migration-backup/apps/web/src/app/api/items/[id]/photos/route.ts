import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { userOwnsItem } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!userOwnsItem(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const urls = Array.isArray(body?.urls) ? (body.urls as unknown[]).filter((u): u is string => typeof u === "string") : [];
  const photos = urls.map((url, i) => ({
    id: `photo_${i}`,
    url,
    itemId: id,
  }));
  return NextResponse.json({ photos });
}
