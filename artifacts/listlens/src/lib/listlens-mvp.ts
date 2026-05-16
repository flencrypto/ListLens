export type LensStatus = "live" | "fallback" | "next" | "future" | "separate";

export interface LensOption {
  id: string;
  name: string;
  displayName: string;
  category: string;
  purpose: string;
  status: LensStatus;
  phase: string;
  accent: "cyan" | "blue" | "green" | "violet" | "amber" | "orange" | "red";
  href?: string;
  studioEnabled: boolean;
  guardEnabled: boolean;
}

export const MVP_LENSES: readonly LensOption[] = [
  {
    id: "ShoeLens",
    name: "SoleLens / ShoeLens",
    displayName: "SoleLens / ShoeLens",
    category: "Trainers, sneakers, shoes",
    purpose: "Model, style code, size label, sole wear, box evidence and replica-risk indicators.",
    status: "live",
    phase: "Rev 1.0",
    accent: "cyan",
    href: "/lenses/sole",
    studioEnabled: true,
    guardEnabled: true,
  },
  {
    id: "GeneralLens",
    name: "General Item Lens",
    displayName: "General Lens",
    category: "Fallback resale items",
    purpose: "General evidence checklist for items that do not yet have a specialist Lens.",
    status: "fallback",
    phase: "Rev 1.0",
    accent: "blue",
    studioEnabled: true,
    guardEnabled: true,
  },
  {
    id: "RecordLens",
    name: "RecordLens",
    displayName: "RecordLens",
    category: "Vinyl, CDs, cassettes, music media",
    purpose: "Pressing, matrix/runout, catalogue number, label, grading and bootleg or misdescription risk.",
    status: "next",
    phase: "Rev 1.2",
    accent: "orange",
    href: "/lenses/record",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "WatchLens",
    name: "WatchLens",
    displayName: "WatchLens",
    category: "Watches and timepieces",
    purpose: "Reference, case-back, serial/reference evidence, movement, box/papers and condition risk.",
    status: "future",
    phase: "Rev 1.3+",
    accent: "green",
    href: "/lenses/watch",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "CardLens",
    name: "CardLens",
    displayName: "CardLens",
    category: "Trading cards, sports cards, TCGs",
    purpose: "Card ID, set, rarity, slab/cert evidence, condition and fake-card risk indicators.",
    status: "future",
    phase: "Rev 1.3+",
    accent: "violet",
    href: "/lenses/card",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "ToyLens",
    name: "ToyLens",
    displayName: "ToyLens",
    category: "Toys, figures, LEGO, collectibles",
    purpose: "Completeness, missing accessories, box/instruction evidence and reproduction packaging risk.",
    status: "future",
    phase: "Rev 1.3+",
    accent: "amber",
    href: "/lenses/toy",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "TechLens",
    name: "TechLens",
    displayName: "TechLens",
    category: "Phones, laptops, cameras, consoles, electronics",
    purpose: "Model/spec evidence, working-status proof, damage, accessories and risky claims.",
    status: "future",
    phase: "Rev 1.5+",
    accent: "blue",
    href: "/lenses/tech",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "BookLens",
    name: "BookLens",
    displayName: "BookLens",
    category: "Books, first editions, collectable print",
    purpose: "ISBN, edition, publisher, dust jacket, signatures and condition.",
    status: "future",
    phase: "Rev 1.5+",
    accent: "blue",
    href: "/lenses/book",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "ClothingLens",
    name: "ClothingLens / ThreadLens",
    displayName: "ClothingLens / ThreadLens",
    category: "Clothing, vintage garments, apparel",
    purpose: "Brand, size, material, condition, fit and measurements.",
    status: "future",
    phase: "Rev 1.5+",
    accent: "cyan",
    href: "/lenses/clothing",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "MeasureLens",
    name: "MeasureLens",
    displayName: "MeasureLens",
    category: "Measurement support layer",
    purpose: "Uses reference objects or rulers to estimate dimensions for garments, items and parts.",
    status: "future",
    phase: "Future / TBC",
    accent: "orange",
    href: "/lenses/measure",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "AntiquesLens",
    name: "AntiquesLens",
    displayName: "AntiquesLens",
    category: "Antiques, decorative objects, vintage pieces",
    purpose: "Maker marks, era/style, material, damage and reproduction risk.",
    status: "future",
    phase: "Rev 1.5+",
    accent: "amber",
    href: "/lenses/antiques",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "AutographLens",
    name: "AutographLens",
    displayName: "AutographLens",
    category: "Signed items and memorabilia",
    purpose: "Provenance and evidence risk only; does not authenticate signatures.",
    status: "future",
    phase: "Rev 1.5+",
    accent: "violet",
    href: "/lenses/autograph",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "MarketLens",
    name: "MarketLens",
    displayName: "MarketLens",
    category: "Resale marketplace intelligence",
    purpose: "Pricing, demand, sell-through, market trends and best-marketplace recommendation.",
    status: "future",
    phase: "Rev 1.4",
    accent: "green",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "StockLens",
    name: "StockLens",
    displayName: "StockLens",
    category: "Equities intelligence",
    purpose: "Separate stock-market analysis product direction, not core resale MVP scope.",
    status: "separate",
    phase: "Separate",
    accent: "violet",
    studioEnabled: false,
    guardEnabled: false,
  },
  {
    id: "MotorLens",
    name: "MotorLens",
    displayName: "MotorLens",
    category: "Cars, motorbikes, vehicle parts",
    purpose: "Separate higher-risk product track requiring fitment, safety and legal scope controls.",
    status: "separate",
    phase: "Separate",
    accent: "red",
    href: "/lenses/motor",
    studioEnabled: false,
    guardEnabled: false,
  },
] as const;

export const STUDIO_LENS_OPTIONS = MVP_LENSES.filter((lens) => lens.studioEnabled);
export const GUARD_LENS_OPTIONS = MVP_LENSES.filter((lens) => lens.guardEnabled);

export const SAFE_GUARD_PHRASES = [
  "Authenticity cannot be confirmed from the available evidence.",
  "The listing is missing key proof.",
  "High-risk indicators are present.",
  "Ask the seller for more photos before buying.",
  "Use platform verification or professional authentication for high-value items.",
];

export const BANNED_GUARD_PHRASES = [
  "Definitely fake",
  "Definitely genuine",
  "Seller is scamming",
  "Guaranteed authentic",
  "Guaranteed safe",
  "Guaranteed fitment",
  "MOT or roadworthiness judgement",
  "Formal authentication",
];

export const SOLELENS_EVIDENCE = [
  "Style code",
  "Size label",
  "Box label",
  "Sole wear",
  "Insole",
  "Tongue label",
  "Heel tab",
  "Proof of purchase",
];

export const GENERAL_EVIDENCE = [
  "Clear front photo",
  "Clear back photo",
  "Brand or maker mark",
  "Model or serial detail",
  "Condition close-ups",
  "Accessories included",
];

export const STUDIO_SUGGESTED_SHOTS: Record<string, string[]> = {
  ShoeLens: [
    "Lateral side of both shoes",
    "Medial side of both shoes",
    "Toe box",
    "Heel tab",
    "Outsole / sole wear",
    "Tongue or size label",
    "Box label if available",
  ],
  GeneralLens: [
    "Front of the item",
    "Back of the item",
    "Brand, maker mark, model or serial label",
    "Close-up of damage, wear or missing parts",
    "Accessories, packaging or paperwork",
  ],
};

export const WORKFLOW_STEPS = [
  "Scan item or listing",
  "Identify visible evidence",
  "Flag missing proof",
  "Create seller draft or buyer report",
  "Save the decision history",
];

