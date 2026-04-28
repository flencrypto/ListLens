import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { analyseForStudio } from "@/lib/ai/studio";
import { analysisStore, itemOwner, itemMeta, userOwnsItem } from "@/lib/store";
import { enforceRateLimit, rateLimitIdentifier } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // AI calls are expensive — keep tight quotas per user.
  const limited = await enforceRateLimit(rateLimitIdentifier(userId, req), {
    key: "items:analyse",
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;
  const { id } = await params;
  if (!userOwnsItem(id, userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const photoUrls: string[] = body.photoUrls ?? [];
  // Prefer explicit body.lens; fall back to lens chosen at item creation; default ShoeLens.
  const lens = body.lens ?? itemMeta.get(id)?.lens ?? "ShoeLens";
  const analysis = await analyseForStudio(photoUrls, body.hint, lens);
  analysisStore.set(id, analysis);
  itemOwner.set(id, userId);
  return NextResponse.json({ analysis });
}
