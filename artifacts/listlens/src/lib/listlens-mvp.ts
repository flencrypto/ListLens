import { LENS_REGISTRY, type LensStatus } from "@/lib/lenses-registry";

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

const MVP_LENS_ORDER = [
  "ShoeLens",
  "GeneralLens",
  "RecordLens",
  "WatchLens",
  "CardLens",
  "ToyLens",
  "TechLens",
  "BookLens",
  "ClothingLens",
  "MeasureLens",
  "AntiquesLens",
  "AutographLens",
  "MarketLens",
  "StockLens",
  "MotorLens",
] as const;

const MVP_LENS_CONFIG: Record<
  (typeof MVP_LENS_ORDER)[number],
  Pick<
    LensOption,
    "displayName" | "purpose" | "phase" | "accent" | "studioEnabled" | "guardEnabled"
  >
> = {
  ShoeLens: {
    displayName: "SoleLens / ShoeLens",
    purpose: "Model, style code, size label, sole wear, box evidence and replica-risk indicators.",
    phase: "Rev 1.0",
    accent: "cyan",
    studioEnabled: true,
    guardEnabled: true,
  },
  GeneralLens: {
    displayName: "General Lens",
    purpose: "General evidence checklist for items that do not yet have a specialist Lens.",
    phase: "Rev 1.0",
    accent: "blue",
    studioEnabled: true,
    guardEnabled: true,
  },
  RecordLens: {
    displayName: "RecordLens",
    purpose: "Pressing, matrix/runout, catalogue number, label, grading and bootleg or misdescription risk.",
    phase: "Rev 1.2",
    accent: "orange",
    studioEnabled: false,
    guardEnabled: false,
  },
  WatchLens: {
    displayName: "WatchLens",
    purpose: "Reference, case-back, serial/reference evidence, movement, box/papers and condition risk.",
    phase: "Rev 1.3+",
    accent: "green",
    studioEnabled: false,
    guardEnabled: false,
  },
  CardLens: {
    displayName: "CardLens",
    purpose: "Card ID, set, rarity, slab/cert evidence, condition and fake-card risk indicators.",
    phase: "Rev 1.3+",
    accent: "violet",
    studioEnabled: false,
    guardEnabled: false,
  },
  ToyLens: {
    displayName: "ToyLens",
    purpose: "Completeness, missing accessories, box/instruction evidence and reproduction packaging risk.",
    phase: "Rev 1.3+",
    accent: "amber",
    studioEnabled: false,
    guardEnabled: false,
  },
  TechLens: {
    displayName: "TechLens",
    purpose: "Model/spec evidence, working-status proof, damage, accessories and risky claims.",
    phase: "Rev 1.5+",
    accent: "blue",
    studioEnabled: false,
    guardEnabled: false,
  },
  BookLens: {
    displayName: "BookLens",
    purpose: "ISBN, edition, publisher, dust jacket, signatures and condition.",
    phase: "Rev 1.5+",
    accent: "blue",
    studioEnabled: false,
    guardEnabled: false,
  },
  ClothingLens: {
    displayName: "ClothingLens / ThreadLens",
    purpose: "Brand, size, material, condition, fit and measurements.",
    phase: "Rev 1.5+",
    accent: "cyan",
    studioEnabled: false,
    guardEnabled: false,
  },
  MeasureLens: {
    displayName: "MeasureLens",
    purpose: "Uses reference objects or rulers to estimate dimensions for garments, items and parts.",
    phase: "Future / TBC",
    accent: "orange",
    studioEnabled: false,
    guardEnabled: false,
  },
  AntiquesLens: {
    displayName: "AntiquesLens",
    purpose: "Maker marks, era/style, material, damage and reproduction risk.",
    phase: "Rev 1.5+",
    accent: "amber",
    studioEnabled: false,
    guardEnabled: false,
  },
  AutographLens: {
    displayName: "AutographLens",
    purpose: "Provenance and evidence risk only; does not authenticate signatures.",
    phase: "Rev 1.5+",
    accent: "violet",
    studioEnabled: false,
    guardEnabled: false,
  },
  MarketLens: {
    displayName: "MarketLens",
    purpose: "Pricing, demand, sell-through, market trends and best-marketplace recommendation.",
    phase: "Rev 1.4",
    accent: "green",
    studioEnabled: false,
    guardEnabled: false,
  },
  StockLens: {
    displayName: "StockLens",
    purpose: "Separate stock-market analysis product direction, not core resale MVP scope.",
    phase: "Separate",
    accent: "violet",
    studioEnabled: false,
    guardEnabled: false,
  },
  MotorLens: {
    displayName: "MotorLens",
    purpose: "Separate higher-risk product track requiring fitment, safety and legal scope controls.",
    phase: "Separate",
    accent: "red",
    studioEnabled: false,
    guardEnabled: false,
  },
};

function buildLensOption(lensId: (typeof MVP_LENS_ORDER)[number]): LensOption | null {
  const registryEntry = LENS_REGISTRY.find((lens) => lens.id === lensId);
  if (!registryEntry) return null;
  const config = MVP_LENS_CONFIG[lensId];
  return {
    id: registryEntry.id,
    name: registryEntry.name,
    displayName: config.displayName,
    category: registryEntry.category,
    purpose: config.purpose || registryEntry.description,
    status: registryEntry.status,
    phase: config.phase,
    accent: config.accent,
    href: registryEntry.href,
    studioEnabled: config.studioEnabled,
    guardEnabled: config.guardEnabled,
  };
}

export const MVP_LENSES: readonly LensOption[] = MVP_LENS_ORDER
  .map(buildLensOption)
  .filter((lens): lens is LensOption => Boolean(lens));

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
