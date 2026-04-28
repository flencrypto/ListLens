import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    lenses: [
      { id: "ShoeLens", name: "ShoeLens", category: "Footwear" },
      { id: "LPLens", name: "LPLens", category: "Music Media" },
    ],
  });
}
