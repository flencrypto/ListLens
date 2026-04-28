import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { analyseRecordWithMatrix } from "@/lib/ai/recordlens";

const BodySchema = z.object({
  labelPhotoUrls: z.array(z.string().url()).min(1).max(6),
  hint: z.string().max(500).optional(),
  matrix: z.object({
    side_a: z.string().max(300).optional(),
    side_b: z.string().max(300).optional(),
    side_c: z.string().max(300).optional(),
    side_d: z.string().max(300).optional(),
    etched_notes: z.string().max(500).optional(),
    extra_symbols: z.string().max(300).optional(),
  }),
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
    const analysis = await analyseRecordWithMatrix(
      parsed.data.labelPhotoUrls,
      parsed.data.matrix,
      parsed.data.hint
    );
    return NextResponse.json({ analysis });
  } catch (e) {
    console.error("RecordLens identify-with-matrix failed:", e);
    return NextResponse.json({ error: "Identification failed" }, { status: 500 });
  }
}
