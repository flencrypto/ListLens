import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyseForGuard } from "@/lib/ai/guard";
import { guardStore, guardOwner, guardCheckMeta, userOwnsGuardCheck } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!userOwnsGuardCheck(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Use stored metadata (from when the check was created) or override from body
  const body = await req.json().catch(() => ({}));
  const meta = guardCheckMeta.get(id);
  const url = body.url ?? meta?.url;
  const screenshotUrls = body.screenshotUrls ?? meta?.screenshotUrls;
  const lens = body.lens ?? meta?.lens ?? "ShoeLens";

  const report = await analyseForGuard(url, screenshotUrls, lens);
  guardStore.set(id, report);
  guardOwner.set(id, userId);
  return NextResponse.json({ report });
}
