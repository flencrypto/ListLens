import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyseForGuard } from "@/lib/ai/guard";
import { guardStore } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const report = await analyseForGuard(body.url, body.screenshotUrls, body.lens);
  guardStore.set(id, report);
  return NextResponse.json({ report });
}
