import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-shim";
import { analyseForStudio } from "@/lib/ai/studio";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const analysis = await analyseForStudio(body.photoUrls ?? [], body.hint, "LPLens");
  return NextResponse.json({ analysis });
}
