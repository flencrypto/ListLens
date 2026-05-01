/**
 * Single source of truth for the ListLens specialist Lens registry as used by
 * the Next.js web app (the `/lenses` page and the `GET /api/lenses` route).
 *
 * Mirrors `LENS_REGISTRY` in `packages/lenses` but lives in-app so the web
 * bundle has no runtime workspace build dependency. When adding a new Lens,
 * update this file and `packages/lenses/src/registry.ts` together.
 */

export type LensStatus = "live" | "planned" | "deprecated";

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

export const LENS_REGISTRY: readonly LensEntry[] = [
  {
    id: "RecordLens",
    name: "RecordLens",
    category: "Music Media",
    description:
      "Vinyl, CDs and cassettes. Identifies release from a label photo, with a matrix runout clarification flow.",
    icon: "💿",
    status: "live",
    href: "/lenses/record",
  },
  {
    id: "ShoeLens",
    name: "ShoeLens",
    category: "Footwear",
    description: "Trainers, sneakers and shoes. Style code, size label and sole checks.",
    icon: "👟",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "LPLens",
    name: "LPLens",
    category: "Music Media",
    description:
      "LP vinyl albums. Sleeve and media grading, matrix runout, pressing country and edition details.",
    icon: "🎵",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "ClothingLens",
    name: "ClothingLens",
    category: "Apparel",
    description: "Clothing, vintage garments and apparel. Size label, fit and measurements.",
    icon: "👕",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "CardLens",
    name: "CardLens",
    category: "Trading Cards",
    description: "Pokémon, Yu-Gi-Oh!, Magic and sports cards. Set, rarity and grading checks.",
    icon: "🎴",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "ToyLens",
    name: "ToyLens",
    category: "Toys & Collectibles",
    description: "Toys, figures and LEGO. Completeness, packaging and reproduction checks.",
    icon: "🧸",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "WatchLens",
    name: "WatchLens",
    category: "Watches",
    description: "Watches and timepieces. Reference, dial and provenance evidence checks.",
    icon: "⌚",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "MeasureLens",
    name: "MeasureLens",
    category: "Measurement",
    description:
      "Physical reference object for accurate dimension estimation. Ideal for garments and parts.",
    icon: "📐",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "MotorLens",
    name: "MotorLens",
    category: "Vehicles & Parts",
    description:
      "Vehicles, parts and campers. Image + dimension-based fitment checks.",
    icon: "🚗",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "TechLens",
    name: "TechLens",
    category: "Electronics",
    description: "Phones, laptops, cameras and audio gear. Model, condition and accessories.",
    icon: "📱",
    status: "live",
    href: "/lenses/tech",
  },
  {
    id: "BookLens",
    name: "BookLens",
    category: "Books",
    description: "Books, first editions and collectable print. ISBN, edition and condition.",
    icon: "📚",
    status: "live",
    href: "/lenses/book",
  },
  {
    id: "AntiquesLens",
    name: "AntiquesLens",
    category: "Antiques & Vintage",
    description: "Antiques and decorative objects. Maker marks, era and reproduction risk.",
    icon: "🏺",
    status: "live",
    href: "/lenses/antiques",
  },
  {
    id: "AutographLens",
    name: "AutographLens",
    category: "Autographs",
    description: "Signed items and provenance. Evidence-led — never authenticates signatures.",
    icon: "✍️",
    status: "live",
    href: "/lenses/autograph",
  },
];
