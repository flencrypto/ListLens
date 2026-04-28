import { NextResponse } from "next/server";
import { LENS_REGISTRY } from "@/lib/lenses-registry";

/**
 * Public registry of ListLens specialist Lenses (live, planned and
 * deprecated aliases). Sourced from `lib/lenses-registry` so the web app has
 * a single in-bundle source of truth.
 */
export async function GET() {
  return NextResponse.json({
    lenses: LENS_REGISTRY.map((l) => ({
      id: l.id,
      name: l.name,
      category: l.category,
      status: l.status,
    })),
  });
}
