import { NextResponse } from "next/server";
import { LENS_REGISTRY } from "@/lib/lenses-registry";

/**
 * Public registry of ListLens specialist Lenses (live, planned and
 * deprecated aliases). Sourced from `lib/lenses-registry` so the web app has
 * a single in-bundle source of truth. Returns the full entry shape
 * (id, name, category, description, icon, status and href when present).
 */
export async function GET() {
  return NextResponse.json({
    lenses: LENS_REGISTRY.map((l) => ({
      id: l.id,
      name: l.name,
      category: l.category,
      description: l.description,
      icon: l.icon,
      status: l.status,
      ...(l.href ? { href: l.href } : {}),
    })),
  });
}
