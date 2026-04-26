import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const photos = (body.urls as string[]).map((url: string, i: number) => ({
    id: `photo_${i}`,
    url,
    itemId: id,
  }));
  return NextResponse.json({ photos });
}
