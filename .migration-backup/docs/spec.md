# ListLens Product Specification

> **Note**: This is a copy of the product spec provided during the initial scaffold PR. The canonical
> version lives with the project stakeholders. Update this file when the spec evolves.

---

## Overview

**ListLens** is an AI resale trust layer — _"List smarter. Buy safer."_

It combines:
- **Studio** (seller): photos → listing draft for eBay/Vinted
- **Guard** (buyer): listing URL/screenshots → risk report
- **Specialist Lenses**: ShoeLens, ClothingLens, MeasureLens, LPLens, WatchLens, MotorLens, CardLens, ToyLens
- **Browser extension** for eBay/Vinted quick access

---

## §1 — Mission

Help resale buyers and sellers transact with confidence by combining computer vision,
large-language models, and marketplace-specific domain knowledge into a single trust layer.

---

## §2 — Core Products

### Studio (Seller Flow)
1. Upload photos of item
2. AI identifies item (brand, model, condition, attributes)
3. Generates marketplace-ready listing copy for eBay and Vinted
4. Suggests pricing based on comparable sold items
5. Flags missing evidence photos
6. One-click export to Vinted CSV or eBay sandbox draft

### Guard (Buyer Flow)
1. Paste listing URL or upload screenshots
2. AI analyses listing for risk indicators
3. Returns risk level (low → high) with specific red flags
4. Generates follow-up questions for the seller
5. Never makes definitive authentication claims (AI-assisted screen only)

---

## §3 — Specialist Lenses

| Lens          | Use Case                                              |
|---------------|-------------------------------------------------------|
| ShoeLens      | Footwear authentication, sizing, condition            |
| ClothingLens  | Garment authentication, measurements, grading         |
| MeasureLens   | AR-marker based physical measurement                  |
| LPLens        | Vinyl record pressing identification, grading         |
| WatchLens     | Watch reference, serial, movement, authenticity       |
| MotorLens     | Vehicle parts identification, VIN, condition          |
| CardLens      | Trading card grading, replica detection               |
| ToyLens       | Toy completeness, copyright verification              |

---

## §4 — Browser Extension

- Manifest V3 (Chrome/Edge)
- Content script detects listing pages on eBay/Vinted
- Extracts: `{ url, title, price, images[], description }`
- Popup: QuickGuardCheck, SendToStudio buttons
- Side panel placeholder for deeper integration

---

## §5 — Marketplace Integration

### eBay
- Sandbox publishing via eBay Developer API
- Category mapping, condition codes, item specifics
- Image upload, draft creation

### Vinted
- CSV export (Vinted does not provide a public publishing API)
- Listing fetch for Guard checks

---

## §6 — Safe Language Policy (Guard)

Guard AI output MUST NEVER use the following phrases:
- "This is fake."
- "Definitely counterfeit."
- "guaranteed authentic."
- "This seller is a scammer."
- "This is a scam."
- "This is fraudulent."
- Any form of: fake, counterfeit, scammer, scam, fraud, fraudulent

**Approved phrasings:**
- "High replica-risk indicators found"
- "Authenticity cannot be confirmed from the available evidence"
- "Seller behaviour raises concerns"
- "Listing lacks expected authenticity evidence"
- "AI-assisted risk screen, not formal authentication."
- "Request additional photos to proceed"
- "Price is below typical market value"

The `disclaimer` field in GuardOutput is a Zod literal:
`"AI-assisted risk screen, not formal authentication."`

---

## §7 — UI Design Principles

- Premium dark theme: `zinc-950` background
- Accent: cyan/violet gradients
- Glass cards with `backdrop-blur`
- Lens rings on category indicators
- Respect `prefers-reduced-motion`
- Accessibility: focus states, semantic landmarks, WCAG AA contrast
- Mobile-first with `MobileTabBar`

---

## §8 — System Architecture

See [architecture.md](./architecture.md) for the full architecture diagram.

---

## §9 — StudioOutput Schema

```json
{
  "mode": "studio",
  "lens": "ShoeLens",
  "identity": {
    "brand": "Nike",
    "model": "Air Max 90",
    "confidence": 0.82
  },
  "attributes": {
    "size_uk": null,
    "size_eu": null,
    "size_us": null,
    "gender": "Men's",
    "colourway": "White/Black",
    "condition": "Used - Good",
    "visible_flaws": ["Minor creasing on toe box", "Light sole wear"],
    "style_code": "CN8490-100",
    "has_box": false,
    "has_laces": true
  },
  "missing_photos": ["Inside size label", "Sole photo", "Box label"],
  "pricing": {
    "quick_sale": 45,
    "recommended": 60,
    "high": 75,
    "currency": "GBP",
    "confidence": 0.72
  },
  "marketplace_outputs": {
    "ebay": {
      "title": "Nike Air Max 90 White/Black CN8490-100 UK Size Unknown Used",
      "description": "Nike Air Max 90 in White/Black colourway.",
      "item_specifics": { "Brand": "Nike", "Model": "Air Max 90" },
      "category_id": "15709",
      "condition_id": "3000"
    },
    "vinted": {
      "title": "Nike Air Max 90 White/Black Used Good Condition",
      "description": "Nike Air Max 90 in White/Black.",
      "price_suggestion": 60,
      "category_id": "1"
    }
  },
  "warnings": ["Size not visible in photos", "Authenticity not independently verified"]
}
```

---

## §10 — GuardOutput Schema

```json
{
  "mode": "guard",
  "lens": "ShoeLens",
  "risk": {
    "level": "medium_high",
    "confidence": 0.74
  },
  "red_flags": [
    {
      "severity": "high",
      "type": "missing_evidence",
      "message": "No inner size label photo is provided."
    },
    {
      "severity": "medium",
      "type": "price_anomaly",
      "message": "Listed price is 40% below typical market value."
    }
  ],
  "missing_photos": ["Inside size label", "Soles", "Box label"],
  "seller_questions": [
    "Could you upload a clear photo of the inside size label?",
    "Please provide photos of both soles."
  ],
  "disclaimer": "AI-assisted risk screen, not formal authentication."
}
```

**Risk levels**: `low | medium | medium_high | high | inconclusive`

---

## §11 — MeasureLens

MeasureLens uses an AR fiducial marker (ArUco) placed next to the garment as a size reference.

**Flow:**
1. Register reference object (`POST /api/measure/objects/register`)
2. Create measurement session (`POST /api/measure/sessions`)
3. Upload photo with marker visible
4. Calculate measurements (`POST /api/measure/sessions/:id/calculate`)
5. Returns `MeasureGarmentSchema` with chest/waist/hip/shoulder/sleeve/body/inseam in cm

**CV Pipeline** (stub in `packages/cv`):
- `detectMarker(imageData)` — ArUco marker detection
- `estimatePose(detection, markerSizeMm)` — 3D pose estimation
- `correctPerspective(imageData, pose)` — homography correction
- `detectGarmentLandmarks(imageData)` — keypoint detection
- `calculateMeasurements(landmarks, pose, markerSizeMm)` — physical measurements

---

## §12 — Marketplace Capabilities (GET /api/marketplaces/capabilities)

```json
[
  {
    "marketplace": "ebay",
    "canPublish": true,
    "canFetchListing": true,
    "canExportCsv": false,
    "supportedCategories": ["Footwear", "Clothing", "Electronics"],
    "requiredFields": ["title", "price", "condition", "category_id"],
    "optionalFields": ["brand", "model", "description"],
    "sandbox": true
  },
  {
    "marketplace": "vinted",
    "canPublish": false,
    "canFetchListing": true,
    "canExportCsv": true,
    "supportedCategories": ["Footwear", "Clothing", "Accessories"],
    "requiredFields": ["title", "price", "brand"],
    "optionalFields": ["description", "condition", "size"],
    "sandbox": false
  }
]
```

---

## §13 — Extension API Routes

```
POST /api/extension/listing-context  — receive listing context from content script
POST /api/extension/send-to-guard   — trigger Guard check from extension
POST /api/extension/send-to-studio  — send listing to Studio from extension
```

---

## §14 — Database Schema

Tables: `users`, `workspaces`, `workspace_members`, `marketplace_accounts`,
`items`, `item_photos`, `item_analyses`, `listings`, `comparable_sales`,
`guard_checks`, `guard_findings`, `guard_questions`, `payments`, `usage_events`,
`measure_objects`, `measure_sessions`.

PostgreSQL with pgvector for embeddings (migration comment in schema.prisma).

---

## §15 — AI Model Routing

| Task         | Model             | Purpose                              |
|--------------|-------------------|--------------------------------------|
| `classify`   | gpt-4o-mini       | Category routing, quick classification|
| `listing`    | gpt-4o            | Full listing copy generation          |
| `reasoning`  | o1-mini           | Complex multi-step analysis           |
| `vision`     | gpt-4o            | Photo analysis with vision            |
| `embeddings` | text-embedding-3-small | Vector embeddings for search    |

---

## §16 — Studio Data Flow

See [architecture.md §16](./architecture.md).

---

## §17 — Guard Data Flow

See [architecture.md §17](./architecture.md).

---

## Out of Scope (v1 Scaffold)

- Real AI calls (stubs return mock data without `OPENAI_API_KEY`)
- Real OpenCV / hardware tooling
- Real eBay publishing (sandbox stub)
- Real Stripe payments
- Mobile native app
- MotorLens full part-identification
- pgvector migration execution
