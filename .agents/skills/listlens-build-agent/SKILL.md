---
name: listlens-build-agent
description: Product intelligence for the Mr.FLENS · List-LENS platform. Load when building, extending, reviewing or debugging any part of the ListLens codebase — Studio, Guard, Lenses, marketplace connectors, AI pipeline, billing, or browser extension. Contains architecture principles, specialist Lens specs, AI trust rules, marketplace roadmap, and React/Next.js performance rules.
version: "1.1.0"
---

# ListLens Build Agent v1.1.0

Full product and engineering context for the **Mr.FLENS · List-LENS** resale intelligence platform.

Core promise: **List smarter. Buy safer.**

For the full reference document, see:
`.agents/skills/listlens-build-agent/reference/full-agent.md`

---

## This Project's Actual Stack

> The reference doc describes a Next.js/Prisma target stack. The running Replit implementation differs:

| Layer | Reference spec | Actual implementation |
|---|---|---|
| Frontend web | Next.js 15 App Router | React + Vite (`@workspace/listlens`) |
| Mobile | – | Expo / React Native (`@workspace/listlens-mobile`) |
| Backend | NestJS / Route Handlers | Express API (`@workspace/api-server`, port 8080) |
| ORM | Prisma | Drizzle ORM |
| Auth | Clerk / Supabase Auth | Replit OIDC |
| Storage | S3 / R2 | Replit Object Storage (presigned URL flow) |
| Payments web | Stripe | Stripe (demo flow in web) |
| Payments mobile | – | RevenueCat |
| AI | OpenAI multimodal | xAI (`XAI_API_KEY`, grok-2-vision) |
| Analytics | PostHog | PostHog (posthog-js / posthog-react-native) |

---

## Core Products

| Product | What it does |
|---|---|
| **Studio** | Seller AI listing creation from photos → editable eBay/Vinted drafts |
| **Guard** | Buyer live listing risk checks — fraud, misdescription, missing evidence |
| **Extension** | Desktop browser access while browsing marketplaces (future) |

---

## Specialist Lenses

| Lens | Category | Status |
|---|---|---|
| RecordLens | Vinyl, CDs, cassettes, music media | Implemented (POC) |
| LPLens | LP-specific sub-lens | Implemented |
| ShoeLens | Trainers, sneakers, shoes | Implemented |
| ClothingLens | Clothing, fashion, apparel | Implemented |
| MeasureLens | Physical measurement reference object + CV system | Implemented |
| CardLens | Trading cards and sports cards | Implemented |
| ToyLens | Toys, figures, LEGO, collectibles | Implemented |
| WatchLens | Watches and timepieces | Implemented |
| MotorLens | Vehicles, car parts, campers + MotorMeasureLens | Implemented |
| TechLens | Electronics, gadgets, devices | Roadmap |
| BookLens | Books, first editions, collectable print | Roadmap |
| AntiquesLens | Antiques and vintage objects | Roadmap |
| AutographLens | Signatures and provenance checks | Roadmap |

---

## AI Architecture — Layered Intelligence Pipeline (13 stages)

Build a **layered intelligence pipeline**, not one monolithic prompt:

```
Photos / URL
→ Capture Agent
→ Quality Agent
→ Category Router Agent
→ Identity Agent
→ Evidence Agent
→ Specialist Lens Agent
→ Comps Agent
→ Pricing Agent
→ Guard Risk Agent
→ MeasureLens Agent
→ Copy / Report Agent
→ Validator Agent
→ Adjudicator Agent
→ Human review
```

| Agent | Responsibility |
|---|---|
| Capture Agent | Normalises images and extracts listing context |
| Quality Agent | Checks blur, lighting, missing angles, duplicates, sensitive data |
| Category Router | Selects RecordLens, ShoeLens, TechLens, etc. |
| Identity Agent | Identifies item/release/model/object |
| Evidence Agent | Extracts labels, barcodes, matrix, ISBN, serials, maker marks |
| Specialist Lens Agent | Applies category rules |
| Comps Agent | Searches and filters comparable items |
| Pricing Agent | Produces price ranges and price confidence |
| Guard Risk Agent | Finds missing evidence and safe risk language |
| MeasureLens Agent | Marker detection, pose estimation, geometry |
| Copy Agent | Marketplace-specific listing/report copy |
| Validator Agent | Schemas, contradictions, unsupported claims |
| Adjudicator Agent | Resolves conflict or asks for confirmation |

- All AI outputs must be **schema-validated** (Zod).
- Every AI job must store: prompt version, model, schema version, output, warnings, cost estimate, confidence.
- Use the cheapest reliable model. Escalate only when confidence is low, evidence conflicts, or item value is high.

---

## Trust & Safety Rules (non-negotiable)

**Never say:**
- "This is fake."
- "This seller is scamming."
- "This is definitely genuine / authentic."
- "This is guaranteed authentic."
- "First pressing / mint / rare" — unless evidence + user confirmation support it.

**Always use:**
- "High replica-risk indicators found."
- "Authenticity cannot be confirmed from available evidence."
- "This listing is missing key evidence."
- "Ask the seller for these photos before buying."
- "Likely version: UK 1997 issue family, 72% confidence from label photo."
- "This is an AI-assisted risk screen, not formal authentication."

Never auto-publish or export listings without **human review**.

---

## RecordLens — First POC Lens

Single-label photo must return **ranked version likelihoods**, not one overconfident answer:

```json
{
  "release_identification": {
    "input_type": "single_label_photo",
    "top_match": {
      "artist": "Radiohead",
      "title": "OK Computer",
      "label": "Parlophone",
      "catalogue_number": "NODATA 02",
      "likely_release": "UK 1997 double LP pressing",
      "likelihood_percent": 72
    },
    "alternate_matches": [
      { "likely_release": "Later UK/EU reissue", "likelihood_percent": 18 },
      { "likely_release": "Unclear variant / needs matrix", "likelihood_percent": 10 }
    ],
    "needs_matrix_for_clarification": true
  }
}
```

Matrix/runout clarification flow is essential — always offer it when confidence < 80 %.

RecordLens trust rule: never claim first pressing, original pressing, rare, mint, or authentic signed copy unless evidence supports it or user confirms it.

---

## Guard Wording Rules

Guard must output: detected category, claimed item, risk level (low/medium/high/inconclusive), confidence score, red flags, missing evidence, price anomaly, marketplace protection notes, seller questions, recommended next action.

**Never say:** "This is fake." / "This seller is scamming." / "This is definitely genuine." / "This is guaranteed authentic."

**Always use safe wording.** Buy recommendation requires missing evidence + risk level + seller questions output. Never make a definitive buy/no-buy recommendation — provide an evidence-led risk assessment only.

---

## Current API Endpoints (live in api-server)

```
GET  /api/healthz

GET  /api/login                          (Replit OIDC redirect)
GET  /api/callback                       (Replit OIDC callback)
GET  /api/logout
GET  /api/auth/user
POST /api/mobile-auth/token-exchange
POST /api/mobile-auth/logout

GET  /api/dashboard

GET  /api/items
POST /api/items
POST /api/items/:id/analyse
GET  /api/items/:id/analysis
POST /api/items/:id/export/vinted
POST /api/items/:id/publish/ebay-sandbox

GET  /api/guard/checks
POST /api/guard/checks
POST /api/guard/checks/:id/analyse
GET  /api/guard/checks/:id
POST /api/guard/checks/:id/save

GET  /api/lenses                         (lists available lenses)
POST /api/lenses/record/identify
POST /api/lenses/record/identify-with-matrix
POST /api/lenses/lp
POST /api/lenses/clothing
POST /api/lenses/card
POST /api/lenses/toy
POST /api/lenses/watch
POST /api/lenses/measure
POST /api/lenses/motor

POST /api/storage/uploads/request-url   (presigned URL)
GET  /api/storage/objects/*path        (object proxy)
GET  /api/storage/public-objects/*filePath (public object proxy)

GET  /api/billing/info
POST /api/billing/checkout              (Stripe)
POST /api/billing/portal
POST /api/billing/demo-upgrade
POST /api/webhooks/stripe

GET  /api/ebay/connect
GET  /api/ebay/mobile-connect
GET  /api/ebay/callback
GET  /api/ebay/status
GET  /api/ebay/settings
POST /api/ebay/settings
POST /api/ebay/disconnect
```

Full spec API (additional target/reference routes not yet live):

```
POST /api/items/:id/photos
PATCH /api/items/:id
GET  /api/marketplaces/capabilities
POST /api/guard/checks/:id/questions
POST /api/lenses/shoe/analyse
POST /api/lenses/tech/analyse
POST /api/lenses/book/analyse
POST /api/lenses/antiques/analyse
POST /api/lenses/autograph/analyse
POST /api/measure/objects/register
POST /api/measure/sessions
POST /api/measure/sessions/:id/calculate
POST /api/extension/detect-marketplace
POST /api/extension/send-to-guard
POST /api/extension/send-to-studio
```

---

## Marketplace Roadmap (4 phases)

| Priority | Marketplace | Support |
|---|---|---|
| POC | eBay | Draft/sandbox/API-ready, Guard checks |
| POC | Vinted | Export-first, Guard checks |
| Phase 2 | Discogs | RecordLens metadata/comps/reference checks |
| Phase 2 | Depop | Export + browser assist |
| Phase 2 | Facebook Marketplace | Manual export + browser assist |
| Phase 2 | Gumtree | Manual export + browser assist |
| Phase 3 | Etsy | Vintage/antiques/books export/API where permitted |
| Phase 3 | Shopify/WooCommerce | Seller-owned shop export/API |
| Phase 3 | Reverb | Music gear expansion |
| Phase 4 | Poshmark/Mercari | US expansion |
| Phase 4 | Catawiki/auction channels | Antiques, books, autographs |

---

## Browser Extension Architecture

Build for eBay/Vinted first, expandable to Depop, Facebook Marketplace, Gumtree, Discogs and Etsy.

```
Browser extension
→ content script detects listing context
→ background worker handles auth/API calls
→ popup or side panel renders ListLens UI
→ ListLens API runs Studio/Guard/Lens analysis
→ result saved to account
```

Use WXT or Plasmo with React + TypeScript. Safety rules: require user action before sending data; do not collect unrelated page/user data; avoid automated posting/clicking in POC.

---

## Key Performance Rules (summary)

| Priority | Category | Impact | Rule |
|---|---|---|---|
| 1 | Eliminating Waterfalls | CRITICAL | `Promise.all()` for independent ops; start promises early, await late |
| 2 | Bundle Size Optimization | CRITICAL | Dynamic import for heavy Lens/CV/editor code; no barrel imports inflating bundles |
| 3 | Server-Side Performance | HIGH | Server Actions must re-authenticate internally; use `React.cache()` for per-request dedup |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | TanStack Query/SWR dedup; version localStorage keys; never store tokens in storage |
| 5 | Re-render Optimization | MEDIUM | Avoid re-renders in photo upload; use local state/refs per tile; transitions for list filtering |
| 6 | Rendering Performance | MEDIUM | `content-visibility: auto` for long lists; animate wrapper divs not SVG directly |
| 7 | JavaScript Performance | LOW-MEDIUM | Build Maps for Lens/category lookups; Set for missing-evidence checks; early returns |
| 8 | Advanced Patterns | LOW | Init extension bridge and analytics once; stable event subscriptions in upload/drag/measure |

---

## MeasureLens / MotorMeasureLens Hardware

MeasureLens is a physical 3D-printed reference object + CV system. Outputs: pit-to-pit, shoulder width, sleeve length, body length, waist, hem, inside leg, outside leg, rise, confidence per measurement, retake guidance.

Hardware: known fixed dimensions, high-contrast fiducial markers, matte finish, clip-on fabric grip, rubber pads, flat-lay and hanging mode, direction arrows, numbered corners, QR/object ID, multi-anchor design.

MotorMeasureLens adapts this for vehicle damage (scratch length, dent diameter, damage-area size, loose car-part dimensions, camper interior scale reference). Returns ranked likely fitments with percentage likelihood and trust-safe wording.

---

## Build Phase Priorities

1. **POC** — Studio, Guard, RecordLens, eBay draft, Vinted export, Stripe, Analytics
2. **MVP** — ShoeLens, ClothingLens, BookLens, CardLens, Browser Extension v1, Discogs, MeasureLens accessory
3. **Expansion** — TechLens, ToyLens, WatchLens, AntiquesLens, AutographLens, Etsy/Shopify, MotorLens marker prototype
4. **Scale** — MotorLens full, multi-marketplace publish, bulk tools, API/licensing, US markets

---

## Engineering Rules (non-negotiable)

- TypeScript strict mode; avoid `any` without written reason.
- Zod schemas for API input, API output, AI JSON and marketplace payloads.
- Business logic out of React components; domain logic in services/packages.
- Long-running AI/CV/marketplace jobs use workers/queues (BullMQ/Redis).
- All user-facing errors must be safe, useful and non-technical.
- All AI outputs include confidence, warnings and unsupported-claim checks.
- All marketplace publishing/export actions require human review.
- Every important mutation logs an analytics event.
- Every AI job stores: prompt version, model, schema version, output, warnings, cost estimate, confidence.
- Write tests for pricing logic, schema validation, measurement geometry, marketplace formatters and Stripe webhooks.
- Respect `prefers-reduced-motion`. Build accessible UI: labels, focus states, keyboard navigation, semantic HTML, contrast-safe colours.

**Prohibited:**
- Do not hardcode one marketplace into the core product.
- Do not build AI output as untyped strings only.
- Do not publish listings automatically without user confirmation.
- Do not claim formal authentication.
- Do not say an item is definitely fake, genuine, first pressing, mint, rare, unlocked, fully working or compatible without evidence + user confirmation.
- Do not scrape or automate marketplaces in ways that create legal, account, or ToS risk.

---

## Data Model (minimum)

`users · workspaces · marketplace_accounts · marketplace_connectors · items · item_photos · item_analyses · listings · comparable_sales · guard_checks · guard_findings · guard_questions · measure_objects · measure_sessions · payments · usage_events`

---

## Full Reference

All specialist Lens field specs, full AI agent role table, marketplace roadmap, React/Next.js performance rules with examples, and the complete build plan are in:

`.agents/skills/listlens-build-agent/reference/full-agent.md`
