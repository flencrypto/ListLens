/**
 * Single source of truth for the ListLens specialist Lens registry as used by
 * the web app (the `/lenses` page and the `GET /api/lenses` route).
 *
 * Mirrors `LENS_REGISTRY` in `packages/lenses` but lives in-app so the web
 * bundle has no runtime workspace build dependency. When adding a new Lens,
 * update this file and `packages/lenses/src/registry.ts` together.
 */

import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Box,
  Car,
  CircleDot,
  Footprints,
  Gauge,
  LucideIcon,
  PenTool,
  Ruler,
  Shirt,
  Smartphone,
  Sparkles,
  Trophy,
  Watch,
} from "lucide-react";

export type LensStatus = "live" | "fallback" | "next" | "planned" | "separate" | "deprecated";

export interface LensEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: LensStatus;
  /** Optional in-app destination when the Lens is `live`. */
  href?: string;
}

/** Maps each Lens id to its Lucide icon component. */
export const LENS_ICON_MAP: Record<string, LucideIcon> = {
  GeneralLens: Sparkles,
  RecordLens: CircleDot,
  ShoeLens: Footprints,
  ClothingLens: Shirt,
  CardLens: BadgeCheck,
  ToyLens: Trophy,
  WatchLens: Watch,
  MeasureLens: Ruler,
  MotorLens: Car,
  TechLens: Smartphone,
  BookLens: BookOpen,
  AntiquesLens: Box,
  AutographLens: PenTool,
  MarketLens: BarChart3,
  StockLens: Gauge,
};

export const LENS_REGISTRY: readonly LensEntry[] = [
  {
    id: "ShoeLens",
    name: "SoleLens / ShoeLens",
    category: "Footwear",
    description: "Rev 1.0 wedge: style code, size label, sole wear, box evidence and careful replica-risk indicators.",
    icon: "",
    status: "live",
    href: "/lenses/sole",
  },
  {
    id: "GeneralLens",
    name: "General Lens",
    category: "Fallback",
    description: "Rev 1.0 fallback checklist for items that do not yet have a specialist Lens.",
    icon: "",
    status: "fallback",
  },
  {
    id: "RecordLens",
    name: "RecordLens",
    category: "Music Media",
    description:
      "Rev 1.2 depth: pressing, matrix/runout, catalogue number, label and grading evidence.",
    icon: "",
    status: "next",
    href: "/lenses/record",
  },
  {
    id: "ClothingLens",
    name: "ClothingLens / ThreadLens",
    category: "Apparel",
    description: "Brand, size, material, condition, fit and measurements.",
    icon: "",
    status: "planned",
    href: "/lenses/clothing",
  },
  {
    id: "CardLens",
    name: "CardLens",
    category: "Trading Cards",
    description: "Card ID, set, rarity, slab/cert evidence, condition and fake-card risk indicators.",
    icon: "",
    status: "planned",
    href: "/lenses/card",
  },
  {
    id: "ToyLens",
    name: "ToyLens",
    category: "Toys & Collectibles",
    description: "Completeness, missing accessories, box/instruction evidence and reproduction packaging risk.",
    icon: "",
    status: "planned",
    href: "/lenses/toy",
  },
  {
    id: "WatchLens",
    name: "WatchLens",
    category: "Watches",
    description: "Reference, case-back, serial/reference evidence, movement, box/papers and condition risk.",
    icon: "",
    status: "planned",
    href: "/lenses/watch",
  },
  {
    id: "MeasureLens",
    name: "MeasureLens",
    category: "Measurement",
    description:
      "Physical reference object for accurate dimension estimation. Ideal for garments and parts.",
    icon: "",
    status: "planned",
    href: "/lenses/measure",
  },
  {
    id: "TechLens",
    name: "TechLens",
    category: "Electronics",
    description: "Phones, laptops, cameras and audio gear. Model, condition and accessories.",
    icon: "",
    status: "planned",
    href: "/lenses/tech",
  },
  {
    id: "BookLens",
    name: "BookLens",
    category: "Books",
    description: "Books, first editions and collectable print. ISBN, edition and condition.",
    icon: "",
    status: "planned",
    href: "/lenses/book",
  },
  {
    id: "AntiquesLens",
    name: "AntiquesLens",
    category: "Antiques & Vintage",
    description: "Antiques and decorative objects. Maker marks, era and reproduction risk.",
    icon: "",
    status: "planned",
    href: "/lenses/antiques",
  },
  {
    id: "AutographLens",
    name: "AutographLens",
    category: "Autographs",
    description: "Signed items and provenance. Evidence-led — never authenticates signatures.",
    icon: "",
    status: "planned",
    href: "/lenses/autograph",
  },
  {
    id: "MarketLens",
    name: "MarketLens",
    category: "Resale Intelligence",
    description: "Rev 1.4: demand, sell-through, pricing trends and best-marketplace recommendation.",
    icon: "",
    status: "planned",
  },
  {
    id: "StockLens",
    name: "StockLens",
    category: "Equities Intelligence",
    description: "Separate stock-market intelligence direction, not core resale MVP scope.",
    icon: "",
    status: "separate",
  },
  {
    id: "MotorLens",
    name: "MotorLens",
    category: "Vehicles & Parts",
    description:
      "Separate higher-risk product track; requires fitment, safety and legal scope controls.",
    icon: "",
    status: "separate",
    href: "/lenses/motor",
  },
];
