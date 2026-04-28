/**
 * Central registry of all ListLens specialist Lenses.
 *
 * Each entry declares whether the Lens is currently `live` (wired up to the
 * Studio/Guard pipelines) or `planned` (scaffolded in the product surface but
 * not yet implemented). Pages such as `/lenses` and the Studio Lens picker
 * read from this registry so a single source of truth controls what users see.
 */
export type LensStatus = "live" | "planned";

export interface LensRegistryEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: LensStatus;
}

export const LENS_REGISTRY: readonly LensRegistryEntry[] = [
  {
    id: "RecordLens",
    name: "RecordLens",
    category: "Music Media",
    description:
      "Vinyl, CDs and cassettes. Identifies release/version from label and matrix runout.",
    icon: "💿",
    status: "live",
  },
  {
    id: "ShoeLens",
    name: "ShoeLens",
    category: "Footwear",
    description: "Trainers, sneakers and shoes. Style code, size label and sole checks.",
    icon: "👟",
    status: "live",
  },
  {
    id: "ClothingLens",
    name: "ClothingLens",
    category: "Apparel",
    description: "Clothing, fashion and vintage garments. Size labels, fit and measurements.",
    icon: "👕",
    status: "planned",
  },
  {
    id: "MeasureLens",
    name: "MeasureLens",
    category: "Measurement",
    description:
      "Physical reference object + computer vision for accurate garment measurements.",
    icon: "📐",
    status: "planned",
  },
  {
    id: "TechLens",
    name: "TechLens",
    category: "Electronics",
    description: "Phones, laptops, cameras and audio gear. Model, condition and accessory checks.",
    icon: "📱",
    status: "planned",
  },
  {
    id: "BookLens",
    name: "BookLens",
    category: "Books",
    description: "Books, first editions and collectable print. ISBN, edition and condition.",
    icon: "📚",
    status: "planned",
  },
  {
    id: "CardLens",
    name: "CardLens",
    category: "Trading Cards",
    description: "Pokémon, Yu-Gi-Oh!, Magic and sports cards. Set, rarity and grading checks.",
    icon: "🎴",
    status: "planned",
  },
  {
    id: "ToyLens",
    name: "ToyLens",
    category: "Toys & Collectibles",
    description: "Toys, figures and LEGO. Completeness, packaging and reproduction checks.",
    icon: "🧸",
    status: "planned",
  },
  {
    id: "WatchLens",
    name: "WatchLens",
    category: "Watches",
    description: "Watches and timepieces. Reference, dial and provenance evidence checks.",
    icon: "⌚",
    status: "planned",
  },
  {
    id: "AntiquesLens",
    name: "AntiquesLens",
    category: "Antiques & Vintage",
    description: "Antiques and decorative objects. Maker marks, era and reproduction risk.",
    icon: "🏺",
    status: "planned",
  },
  {
    id: "AutographLens",
    name: "AutographLens",
    category: "Autographs",
    description: "Signed items and provenance. Evidence-led — never authenticates signatures.",
    icon: "✍️",
    status: "planned",
  },
  {
    id: "MotorLens",
    name: "MotorLens",
    category: "Vehicles & Parts",
    description:
      "Vehicles, parts and campers. Image + dimension-based part fitment with MotorMeasureLens.",
    icon: "🚗",
    status: "planned",
  },
];

export function getLens(id: string): LensRegistryEntry | undefined {
  return LENS_REGISTRY.find((l) => l.id === id);
}
