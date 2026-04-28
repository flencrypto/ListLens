import { NextResponse } from "next/server";

/**
 * Public registry of ListLens specialist Lenses (live + planned).
 *
 * Mirrors `LENS_REGISTRY` in `packages/lenses` but kept in the web app to
 * avoid a runtime workspace dependency. Update both when adding a new Lens.
 */
const LENSES = [
  { id: "RecordLens", name: "RecordLens", category: "Music Media", status: "live" },
  { id: "ShoeLens", name: "ShoeLens", category: "Footwear", status: "live" },
  { id: "ClothingLens", name: "ClothingLens", category: "Apparel", status: "planned" },
  { id: "MeasureLens", name: "MeasureLens", category: "Measurement", status: "planned" },
  { id: "TechLens", name: "TechLens", category: "Electronics", status: "planned" },
  { id: "BookLens", name: "BookLens", category: "Books", status: "planned" },
  { id: "CardLens", name: "CardLens", category: "Trading Cards", status: "planned" },
  { id: "ToyLens", name: "ToyLens", category: "Toys & Collectibles", status: "planned" },
  { id: "WatchLens", name: "WatchLens", category: "Watches", status: "planned" },
  { id: "AntiquesLens", name: "AntiquesLens", category: "Antiques & Vintage", status: "planned" },
  { id: "AutographLens", name: "AutographLens", category: "Autographs", status: "planned" },
  { id: "MotorLens", name: "MotorLens", category: "Vehicles & Parts", status: "planned" },
  // Back-compat alias for the original name of RecordLens.
  { id: "LPLens", name: "LPLens", category: "Music Media", status: "deprecated" },
] as const;

export async function GET() {
  return NextResponse.json({ lenses: LENSES });
}
