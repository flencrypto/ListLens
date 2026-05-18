import datasetStats from "./datasetStats.json";

export type ScanSlot = {
  id: string;
  title: string;
  required: boolean;
  image: string;
  metric: string;
  captured: boolean;
};

export type ProductCandidate = {
  id: string;
  brand: string;
  model: string;
  colorway: string;
  sku: string;
  release: string;
  size: string;
  image: string;
  confidence: number;
  grade: string;
  gradeLabel: string;
  conditionScore: number;
  valueLow: number;
  valueHigh: number;
  suggestedPrice: number;
  fastSalePrice: number;
  risk: "low" | "medium-low" | "medium" | "high";
  nextAction: string;
  careImpact: string;
  dataSource?: "demo" | "catalog";
  catalogImageCount?: number;
  priceStatus?: "demo" | "pending" | "live";
  editionStory?: string;
};

export type ReviewRow = {
  priority: "High" | "Medium" | "Low";
  scanId: string;
  item: string;
  size: string;
  reason: string;
  risk: "Low" | "Medium" | "High";
  value: string;
  submitted: string;
  status: "Pending" | "Escalated" | "Approved";
  assignee: string;
};

export const scanSlots: ScanSlot[] = [
  {
    id: "upper-lateral",
    title: "Upper - lateral",
    required: true,
    image: "/assets/sneakers/scan-upper-lateral.jpg",
    metric: "Model silhouette",
    captured: true,
  },
  {
    id: "upper-medial",
    title: "Upper - medial",
    required: true,
    image: "/assets/sneakers/scan-upper-medial.jpg",
    metric: "Logo placement",
    captured: true,
  },
  {
    id: "heel",
    title: "Heel",
    required: true,
    image: "/assets/sneakers/scan-heel.jpg",
    metric: "Heel tab",
    captured: true,
  },
  {
    id: "sole",
    title: "Sole - outsole",
    required: true,
    image: "/assets/sneakers/scan-sole.jpg",
    metric: "Wear pattern",
    captured: false,
  },
  {
    id: "tongue-label",
    title: "Tongue label",
    required: true,
    image: "/assets/sneakers/scan-tongue-label.jpg",
    metric: "OCR and SKU",
    captured: true,
  },
  {
    id: "insole",
    title: "Insole",
    required: true,
    image: "/assets/sneakers/scan-insole.jpg",
    metric: "Print quality",
    captured: true,
  },
  {
    id: "box-label",
    title: "Box label",
    required: false,
    image: "/assets/sneakers/scan-box-label.jpg",
    metric: "Box consistency",
    captured: true,
  },
  {
    id: "defects",
    title: "Extra / defects",
    required: false,
    image: "/assets/sneakers/scan-defects.jpg",
    metric: "Damage notes",
    captured: false,
  },
];

export const productCandidates: ProductCandidate[] = [
  {
    id: "nike-dunk-high",
    brand: "Nike",
    model: "Dunk High Retro",
    colorway: "Black / White",
    sku: "DD1399-105",
    release: "2021",
    size: "UK 9 / US 10 / EU 44",
    image: "/assets/sneakers/candidate-dunk.jpg",
    confidence: 0.91,
    grade: "B+",
    gradeLabel: "Good",
    conditionScore: 78,
    valueLow: 120,
    valueHigh: 150,
    suggestedPrice: 145,
    fastSalePrice: 115,
    risk: "medium-low",
    nextAction: "Clean before listing",
    careImpact: "Expected resale lift of 8-12% after outsole and midsole cleaning.",
  },
  {
    id: "jordan-4",
    brand: "Nike",
    model: "Air Jordan 4 Retro",
    colorway: "Monochrome",
    sku: "DH6927-111",
    release: "2022",
    size: "UK 8 / US 9 / EU 42.5",
    image: "/assets/sneakers/candidate-jordan.jpg",
    confidence: 0.86,
    grade: "B",
    gradeLabel: "Good",
    conditionScore: 74,
    valueLow: 165,
    valueHigh: 210,
    suggestedPrice: 199,
    fastSalePrice: 155,
    risk: "medium",
    nextAction: "Route to expert review",
    careImpact: "High-value silhouette with moderate label ambiguity.",
  },
  {
    id: "yeezy-350",
    brand: "Yeezy",
    model: "Boost 350 V2",
    colorway: "Core",
    sku: "BY1604",
    release: "2017",
    size: "UK 10 / US 10.5 / EU 45",
    image: "/assets/sneakers/candidate-yeezy.jpg",
    confidence: 0.84,
    grade: "C+",
    gradeLabel: "Fair",
    conditionScore: 67,
    valueLow: 105,
    valueHigh: 140,
    suggestedPrice: 132,
    fastSalePrice: 98,
    risk: "medium",
    nextAction: "Upload clearer label image",
    careImpact: "Needs label and insole evidence before resale trust badge.",
  },
];

export const reviewQueue: ReviewRow[] = [
  {
    priority: "High",
    scanId: "SCAN-2026-0510-0015",
    item: "Nike Air Yeezy 2 Red October",
    size: "Size 11",
    reason: "High-value item",
    risk: "Medium",
    value: "GBP 2,100-2,600",
    submitted: "10 May 2026, 09:14",
    status: "Pending",
    assignee: "Jason Smith",
  },
  {
    priority: "High",
    scanId: "SCAN-2026-0510-0012",
    item: "Travis Scott x Nike Dunk Low",
    size: "Size 9",
    reason: "Counterfeit-prone model",
    risk: "Medium",
    value: "GBP 850-1,050",
    submitted: "10 May 2026, 08:47",
    status: "Pending",
    assignee: "Lisa Morgan",
  },
  {
    priority: "Medium",
    scanId: "SCAN-2026-0510-0009",
    item: "Jordan 1 Retro High OG UNC",
    size: "Size 10",
    reason: "Image quality issues",
    risk: "Low",
    value: "GBP 140-170",
    submitted: "10 May 2026, 07:59",
    status: "Pending",
    assignee: "Alex Rivera",
  },
];

export const modelCoverage = datasetStats.map((row) => ({
  className: row.class,
  count: Number(row.image_count),
  avgWidth: Number(row.avg_width),
  avgHeight: Number(row.avg_height),
}));

export const conditionFindings = [
  { label: "Sole wear", value: "Moderate", state: "warning" },
  { label: "Upper creasing", value: "Light", state: "good" },
  { label: "Heel drag", value: "Noticeable", state: "warning" },
  { label: "Stains / marks", value: "Minimal", state: "good" },
  { label: "Shape", value: "Good", state: "good" },
];

export const riskChecks = [
  { label: "SKU matches label and box", status: "pass" },
  { label: "Stitching and construction", status: "pass" },
  { label: "Swoosh placement", status: "pass" },
  { label: "Materials and shape", status: "pass" },
  { label: "Tongue label clarity", status: "warn" },
];
