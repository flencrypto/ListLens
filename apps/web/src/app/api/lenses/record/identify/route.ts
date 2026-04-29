import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { z } from "zod";
import { analyseRecordLabel } from "@/lib/ai/recordlens";

const BodySchema = z.object({
  labelPhotoUrls: z.array(z.string().url()).min(1).max(6),
  hint: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const analysis = await analyseRecordLabel(parsed.data.labelPhotoUrls, parsed.data.hint);
    return NextResponse.json({ analysis });
  } catch (e) {
    console.error("RecordLens identify failed:", e);
    return NextResponse.json({ error: "Identification failed" }, { status: 500 });
  }
}
