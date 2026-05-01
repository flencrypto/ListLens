/**
 * Mirrors the web app's `lenses-registry.ts`. Kept separate so the mobile
 * package has zero workspace runtime imports.
 */

export type LensStatus = "live" | "planned" | "deprecated";

export interface LensEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: LensStatus;
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
  },
  {
    id: "ShoeLens",
    name: "ShoeLens",
    category: "Footwear",
    description:
      "Trainers, sneakers and shoes. Style code, size label and sole checks.",
    icon: "👟",
    status: "live",
  },
  {
    id: "LPLens",
    name: "LPLens",
    category: "Music Media",
    description:
      "LP vinyl albums. Sleeve and media grading, matrix runout, pressing country and edition details.",
    icon: "🎵",
    status: "live",
  },
  {
    id: "ClothingLens",
    name: "ClothingLens",
    category: "Apparel",
    description:
      "Clothing, vintage garments and apparel. Size label, fit and measurements.",
    icon: "👕",
    status: "live",
  },
  {
    id: "CardLens",
    name: "CardLens",
    category: "Trading Cards",
    description:
      "Pokémon, Yu-Gi-Oh!, Magic and sports cards. Set, rarity and grading checks.",
    icon: "🎴",
    status: "live",
  },
  {
    id: "ToyLens",
    name: "ToyLens",
    category: "Toys & Collectibles",
    description:
      "Toys, figures and LEGO. Completeness, packaging and reproduction checks.",
    icon: "🧸",
    status: "live",
  },
  {
    id: "WatchLens",
    name: "WatchLens",
    category: "Watches",
    description:
      "Watches and timepieces. Reference, dial and provenance evidence checks.",
    icon: "⌚",
    status: "live",
  },
  {
    id: "MeasureLens",
    name: "MeasureLens",
    category: "Measurement",
    description:
      "Physical reference object for accurate dimension estimation. Ideal for garments and parts.",
    icon: "📐",
    status: "live",
  },
  {
    id: "MotorLens",
    name: "MotorLens",
    category: "Vehicles & Parts",
    description:
      "Vehicles, parts and campers. Image + dimension-based fitment checks.",
    icon: "🚗",
    status: "live",
  },
  {
    id: "TechLens",
    name: "TechLens",
    category: "Electronics",
    description:
      "Phones, laptops, cameras and audio gear. Model, condition and accessories.",
    icon: "📱",
    status: "live",
  },
  {
    id: "BookLens",
    name: "BookLens",
    category: "Books",
    description:
      "Books, first editions and collectable print. ISBN, edition and condition.",
    icon: "📚",
    status: "live",
  },
  {
    id: "AntiquesLens",
    name: "AntiquesLens",
    category: "Antiques & Vintage",
    description:
      "Antiques and decorative objects. Maker marks, era and reproduction risk.",
    icon: "🏺",
    status: "live",
  },
  {
    id: "AutographLens",
    name: "AutographLens",
    category: "Autographs",
    description:
      "Signed items and provenance. Evidence-led — never authenticates signatures.",
    icon: "✍️",
    status: "live",
  },
];
