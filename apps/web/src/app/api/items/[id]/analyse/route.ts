import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyseForStudio } from "@/lib/ai/studio";
import { analysisStore, itemOwner, userOwnsItem } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!userOwnsItem(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const photoUrls: string[] = body.photoUrls ?? [];
  const analysis = await analyseForStudio(photoUrls, body.hint, body.lens);
  analysisStore.set(id, analysis);
  itemOwner.set(id, userId);
  return NextResponse.json({ analysis });
}
