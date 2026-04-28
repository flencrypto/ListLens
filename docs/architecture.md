# ListLens — Architecture Overview

This document summarises the ListLens system architecture covering the key design decisions
from the product spec (sections 8, 10, 16, 17).

---

## §8 — High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         LISTLENS PLATFORM                          │
│                                                                    │
│  ┌─────────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│  │   apps/web       │   │   apps/worker    │   │ apps/extension │  │
│  │  Next.js 15 App  │   │  BullMQ + Redis  │   │  WXT MV3       │  │
│  │  Clerk + Stripe  │──▶│  AI / CV / Mktp  │   │  Chrome/Edge   │  │
│  │  App Router      │   │  Billing / PDF   │   │  eBay / Vinted │  │
│  └────────┬─────────┘   └──────────────────┘   └────────────────┘  │
│           │                                                         │
│  ┌────────▼─────────────────────────────────────────────────────┐  │
│  │                     SHARED PACKAGES                           │  │
│  │                                                               │  │
│  │  @listlens/schemas   — Zod contracts (Studio, Guard, Measure) │  │
│  │  @listlens/ai        — OpenAI wrapper, model routing, prompts │  │
│  │  @listlens/cv        — AR-marker CV pipeline stubs            │  │
│  │  @listlens/lenses    — Per-category configs + safe wording    │  │
│  │  @listlens/marketplace — eBay/Vinted connector stubs          │  │
│  │  @listlens/pricing   — Quartile-based heuristics              │  │
│  │  @listlens/ui        — Shared React primitives                │  │
│  │  @listlens/db        — Prisma schema + client                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## §10 — Specialist Lenses

Each lens encapsulates category-specific knowledge for both Studio (seller) and Guard (buyer) flows:

| Lens          | Category          | Key Risk Checks                                           |
|---------------|-------------------|-----------------------------------------------------------|
| ShoeLens      | Footwear          | Size label, sole, style code, StitchWatch stitching       |
| ClothingLens  | Clothing          | Brand label, measurements, material, replica indicators   |
| MeasureLens   | Measured Items    | AR-marker detection, perspective correction, landmarks    |
| LPLens        | Vinyl Records     | Matrix runout, pressing, grading, bootleg indicators      |
| WatchLens     | Watches           | Serial/ref, caseback, crown, dial consistency             |
| MotorLens     | Vehicles & Parts  | VIN, odometer, part numbers, condition mismatch           |
| CardLens      | Trading Cards     | Surface, edges, grading consistency, reprint risk         |
| ToyLens       | Toys & Games      | Completeness, copyright mark, replica risk                |

**Category Routing**: `routeLens(hint: string): string` in `packages/lenses` selects the
appropriate lens from a text hint. Falls back to `ShoeLens` when no match is found.

---

## §16 — Data Flow: Studio (Seller)

```
Seller uploads photos
        │
        ▼
POST /api/items (create item)
        │
        ▼
POST /api/items/:id/photos (upload each photo URL)
        │
        ▼
POST /api/items/:id/analyse
  → enqueues ai.item.analyse job
  → immediate mock response while job runs
        │
        ▼
GET /api/items/:id/analysis
  → returns StudioOutput (mode: "studio")
  → identity, attributes, missing_photos, pricing, marketplace_outputs
        │
        ▼
PATCH /api/items/:id (edit draft)
        │
        ├─▶ POST /api/items/:id/export/vinted  (CSV export)
        └─▶ POST /api/items/:id/publish/ebay-sandbox
```

**StudioOutput JSON shape** (schema: `packages/schemas/src/studio.ts`):
```json
{
  "mode": "studio",
  "lens": "ShoeLens",
  "identity": { "brand": "Nike", "model": "Air Max 90", "confidence": 0.82 },
  "attributes": { "size_uk": null, "condition": "Used - Good" },
  "missing_photos": ["Inside size label"],
  "pricing": { "quick_sale": 45, "recommended": 60, "high": 75, "currency": "GBP", "confidence": 0.72 },
  "marketplace_outputs": { "ebay": { "title": "...", "category_id": "15709" }, "vinted": { "title": "..." } },
  "warnings": ["Size not visible in photos"]
}
```

---

## §17 — Data Flow: Guard (Buyer)

```
Buyer provides listing URL / screenshots
        │
        ▼
POST /api/guard/checks (create check)
        │
        ▼
POST /api/guard/checks/:id/analyse
  → enqueues ai.guard.check job
        │
        ▼
GET /api/guard/checks/:id
  → returns GuardOutput (mode: "guard")
  → risk.level, red_flags, missing_photos, seller_questions, disclaimer
        │
        ▼
POST /api/guard/checks/:id/questions
  → generates follow-up questions for the seller
```

**GuardOutput JSON shape** (schema: `packages/schemas/src/guard.ts`):
```json
{
  "mode": "guard",
  "lens": "ShoeLens",
  "risk": { "level": "medium_high", "confidence": 0.74 },
  "red_flags": [
    { "severity": "high", "type": "missing_evidence", "message": "No inner size label photo is provided." }
  ],
  "missing_photos": ["Inside size label"],
  "seller_questions": ["Could you upload a clear photo of the inside size label?"],
  "disclaimer": "AI-assisted risk screen, not formal authentication."
}
```

**Risk levels**: `low | medium | medium_high | high | inconclusive`

### Safe Language (§6)

Guard output MUST NOT use: `fake`, `counterfeit`, `scammer`, `scam`, `fraud`, `fraudulent`.

The `packages/lenses/src/safeWording.ts` module exposes:
- `ALLOWED_PHRASES` — recommended safe phrasings
- `DISALLOWED_PHRASES` — banned terms
- `sanitiseSafeLanguage(text)` — replaces banned phrases
- `assertSafeLanguage(text)` — throws if banned phrase found (use in tests)

---

## Worker Queues

`apps/worker` uses BullMQ with five named queues. Jobs use exponential backoff (3 retries).

| Queue        | Job Names                                                           |
|--------------|---------------------------------------------------------------------|
| `ai`         | `ai.item.analyse`, `ai.guard.check`, `ai.lens.shoe.analyse`, etc.   |
| `cv`         | `cv.measure.calculate`                                              |
| `marketplace`| `marketplace.ebay.publishSandbox`, `marketplace.comps.retrieve`     |
| `billing`    | `billing.credit.consume`                                            |
| `report`     | `report.generatePdf`                                                |

---

## Key Deferments

The following are **not yet implemented** and will be addressed in follow-up PRs:

- Real OpenAI API calls (stubs return mock data when `OPENAI_API_KEY` is absent)
- Real OpenCV / AR-marker detection (CV pipeline returns stub results)
- Real eBay API publishing (sandbox stub only)
- Real Vinted API (CSV export only)
- Real Stripe payments (Stripe client wrapped; handlers stubbed)
- MotorLens full part-identification logic
- MeasureLens hardware tooling
- Mobile native app
- Clerk authentication (placeholder key in CI)
- pgvector extension migration
