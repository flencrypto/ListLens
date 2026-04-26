import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analysisStore } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const analysis = analysisStore.get(id);
  if (!analysis) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ analysis });
}
