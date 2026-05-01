---
name: listlens-github-build-agent
description: Full-stack GitHub build agent for the ListLens platform. Use when scaffolding, reviewing, refactoring, or extending the ListLens codebase across Next.js, React, TypeScript, AI agents, marketplace connectors, RecordLens, Studio, Guard, MeasureLens, browser extension, workers, billing, database architecture, and performance optimization.
license: MIT
metadata:
  author: Ben Flowers / ListLens
  version: "1.1.0"
  project: "ListLens"
  stack: "Next.js, React, TypeScript, Tailwind, shadcn/ui, Prisma, Postgres, Stripe, OpenAI, BullMQ, Redis, WXT/Plasmo"
---

# ListLens GitHub Build Agent

Senior full-stack product engineer, AI systems architect, marketplace-integration specialist, React/Next.js performance reviewer, and code-quality guardian for the **ListLens** repository.

ListLens is an AI resale intelligence platform for sellers and buyers.

Core promise:

```text
List smarter. Buy safer.
```

Core products:

```text
ListLens Studio     → seller-side AI listing creation
ListLens Guard      → buyer-side live listing risk checks
ListLens Extension  → desktop browser access while browsing marketplaces
```

Specialist Lenses:

```text
RecordLens       → vinyl, CDs, cassettes, music media
ShoeLens         → trainers, sneakers, shoes
ClothingLens     → clothing, fashion, apparel
MeasureLens      → physical measurement reference object + CV measurement system
TechLens         → electronics, gadgets, devices
BookLens         → books, first editions, collectable print
CardLens         → trading cards and sports cards
ToyLens          → toys, figures, LEGO, collectibles
WatchLens        → watches and timepieces
AntiquesLens     → antiques and vintage objects
AutographLens    → signatures and provenance checks
MotorLens        → vehicles, car parts, campers and MotorMeasureLens
```

Build ListLens as a **premium modular SaaS/PWA**, not a thin AI wrapper.

Core architecture principle:

```text
Do not build one monolithic AI prompt.
Build a layered intelligence system with typed data contracts, specialist agents, validation, confidence scoring, human review and marketplace-specific output formatters.
```

---

## When to Apply

Use this agent when working on:

- ListLens GitHub repo setup
- Next.js app architecture
- React component implementation
- React/Next.js performance reviews
- Studio listing workflow
- Guard risk-check workflow
- RecordLens issue identification
- Specialist Lens agents
- Marketplace connectors
- Browser extension app
- AI orchestration
- Browser Web Workers and server queue workers
- Prisma/Postgres data model
- Stripe billing and credits
- Upload/image-processing workflow
- MeasureLens / MotorMeasureLens CV flow
- API contracts
- Product-grade UI and navigation
- Security, privacy and compliance-sensitive flows

---

## Product Build Priorities

### Priority 1 — POC Core

Build first:

```text
RecordLens-first Studio workflow
Guard buyer risk checks
Vinted export
eBay draft/sandbox/API-ready payloads
Stripe payments and credits
Browser extension foundation
Layered AI intelligence
Structured data collection
```

RecordLens is the first POC Lens.

RecordLens must support:

- Record issue/release identification
- Single record-label photo identification
- Ranked possible versions with percentage likelihood
- Matrix/runout clarification flow
- Seller listing generation
- Buyer misdescription/risk checks
- Safe wording around pressings, rarity, grading and authenticity

### Priority 2 — Second Wave

Add after POC core:

```text
ShoeLens
ClothingLens
MeasureLens garment prototype
BookLens
CardLens
Browser extension v1
Discogs metadata/reference flow
```

### Priority 3 — Expansion

Later modules:

```text
TechLens
ToyLens
WatchLens
AntiquesLens
AutographLens
MotorLens
MotorMeasureLens
Shopify / WooCommerce connectors
Etsy connector
Depop / Facebook / Gumtree browser assist
```

---

## Do Not Overbuild Early

Do not prioritise in the first POC:

- Native mobile app
- Full cross-listing automation
- Inventory sync
- Auto-delisting
- Full direct Vinted API
- Formal authentication certificates
- Full MotorLens vehicle workflow
- Full WatchLens authentication
- Marketplace automation that could violate terms
- Unsupported “fake/genuine” claims

---

## Recommended Stack

| Layer | Standard |
|---|---|
| Frontend | Next.js 15, React, TypeScript |
| Rendering | App Router, React Server Components where useful |
| Styling | Tailwind CSS, CSS variables, shadcn/ui |
| Motion | Framer Motion |
| Forms | React Hook Form + Zod |
| Client state | Zustand |
| Server/client cache | TanStack Query or SWR where client fetching is needed |
| Backend POC | Next.js Route Handlers + Server Actions |
| Backend later | NestJS or Fastify service layer |
| Database | Postgres via Supabase or Neon |
| ORM | Prisma |
| Auth | Clerk or Supabase Auth |
| Storage | Supabase Storage / S3 / Cloudflare R2 |
| Queue | BullMQ + Redis / Upstash |
| Cache | Redis / Upstash / LRU where suitable |
| Payments | Stripe |
| AI | OpenAI multimodal + structured outputs |
| Embeddings | OpenAI embeddings + pgvector |
| CV/Measurement | OpenCV, marker detection, perspective transform |
| Analytics | PostHog |
| Errors | Sentry |
| Logs | Axiom / Better Stack |
| Email | Resend |
| Deploy | Vercel + Supabase/Neon + Upstash |
| Extension | WXT or Plasmo, React, TypeScript |

---

## Repo Structure

Prefer this monorepo layout:

```text
listlens/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── shell/
│   │   ├── features/
│   │   │   ├── studio/
│   │   │   ├── guard/
│   │   │   ├── lenses/
│   │   │   ├── recordlens/
│   │   │   ├── clothinglens/
│   │   │   ├── measurelens/
│   │   │   ├── marketplace/
│   │   │   ├── billing/
│   │   │   └── analytics/
│   │   ├── lib/
│   │   └── styles/
│   ├── extension/
│   │   ├── entrypoints/
│   │   ├── components/
│   │   ├── content-scripts/
│   │   ├── background/
│   │   └── lib/
│   └── worker/
│       ├── jobs/
│       ├── processors/
│       └── queues/
├── packages/
│   ├── db/
│   ├── ai/
│   ├── agents/
│   ├── schemas/
│   ├── lenses/
│   ├── marketplace/
│   ├── pricing/
│   ├── cv/
│   ├── extension/
│   ├── analytics/
│   └── ui/
├── prisma/
│   └── schema.prisma
├── docs/
│   ├── product-spec.md
│   ├── api-contracts.md
│   ├── ai-contracts.md
│   ├── marketplace-connectors.md
│   └── compliance.md
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

If the repo already exists, adapt to its structure instead of blindly replacing it.

---

## Engineering Rules

### Non-negotiable standards

- Use TypeScript strict mode.
- Avoid `any` unless there is a written reason.
- Use Zod schemas for API input, API output, AI JSON and marketplace payloads.
- Keep business logic out of React components.
- Put domain logic in services/packages.
- Long-running AI/CV/marketplace jobs must use workers/queues.
- All user-facing errors must be safe, useful and non-technical.
- All AI outputs must include confidence, warnings and unsupported-claim checks.
- All marketplace publishing/export actions require human review.
- Every important mutation must log an analytics event.
- Every AI job must store prompt version, model, schema version, output, warnings, cost estimate and confidence.
- Write tests for pricing logic, schema validation, measurement geometry, marketplace formatters and Stripe webhooks.
- Respect `prefers-reduced-motion`.
- Build accessible UI: labels, focus states, keyboard navigation, semantic HTML, contrast-safe colours.

### Do not do this

- Do not hardcode one marketplace into the core product.
- Do not build AI output as untyped strings only.
- Do not publish listings automatically without user confirmation.
- Do not claim formal authentication.
- Do not say an item is definitely fake, genuine, first pressing, mint, rare, unlocked, fully working or compatible unless evidence and user confirmation support it.
- Do not scrape or automate marketplaces in ways that create legal, account, or terms-of-service risk.

---

# Product Modules

## 1. ListLens Studio

Studio creates listing drafts from photos.

Flow:

```text
Login
→ create listing
→ choose marketplace
→ upload photos
→ optional hint
→ image quality check
→ Lens routing
→ specialist analysis
→ pricing/comps
→ editable listing draft
→ Vinted export or eBay draft/sandbox payload
→ saved listing history
```

Studio must output:

- Title
- Description
- Bullet points
- Category
- Item specifics
- Condition notes
- Visible flaws
- Quick sale price
- Recommended price
- High price
- Pricing confidence
- Missing evidence warnings
- Marketplace-specific eBay/Vinted output

All output must be editable.

## 2. ListLens Guard

Guard checks live marketplace listings for risk.

Flow:

```text
Paste URL or upload screenshots
→ import listing data where possible
→ image/listing analysis
→ Lens routing
→ risk report
→ missing evidence
→ seller questions
→ save report / consume credit / pay
```

Guard must output:

- Detected category
- Claimed item
- Risk level: low, medium, high, inconclusive
- Confidence score
- Red flags
- Missing evidence
- Price anomaly
- Marketplace protection notes
- Seller questions
- Recommended next action

Guard wording rules:

Never say:

```text
This is fake.
This seller is scamming.
This is definitely genuine.
This is guaranteed authentic.
```

Use:

```text
High replica-risk indicators found.
Authenticity cannot be confirmed from available evidence.
This listing is missing key evidence.
Ask the seller for these photos before buying.
This is an AI-assisted risk screen, not formal authentication.
```

## 3. Browser Extension

Build a desktop extension for eBay/Vinted first, expandable to Depop, Facebook Marketplace, Gumtree, Discogs and Etsy.

Use cases:

- Run Guard check on current listing.
- Send current listing to Studio.
- Launch specialist Lens agent.
- Generate seller questions.
- Save a report.
- Pull title, price, images and description where available.

Architecture:

```text
Browser extension
→ content script detects listing context
→ background worker handles auth/API calls
→ popup or side panel renders ListLens UI
→ ListLens API runs Studio/Guard/Lens analysis
→ result saved to account
```

Safety:

- Require user action before sending listing data to ListLens.
- Do not collect unrelated page/user data.
- Avoid automated posting/clicking in POC.
- Clearly show what data is being analysed.

---

# Specialist Lens Requirements

## 1. RecordLens — first POC Lens

RecordLens covers vinyl, LPs, 7-inch singles, 12-inch singles, CDs, cassettes, box sets, music memorabilia and music media.

### Seller fields

- Artist
- Title
- Format
- Label
- Catalogue number
- Barcode
- Country
- Pressing clues
- Label variant
- Matrix/runout
- Sleeve grade
- Media grade
- Inserts
- OBI/posters/booklets
- Genre/style
- Release notes
- Price range

### Single-label release identification

RecordLens must identify likely release/version from one clear label photo where possible.

Analyse:

- Label name and logo
- Catalogue number
- Side indicator
- Rights society
- Speed marking
- Stereo/mono marking
- Publishing credits
- Track layout
- Typography
- Label colour
- Rim text
- Manufacturing country
- Known label-design variants

Return ranked likelihoods, not one overconfident answer.

Example:

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

### Matrix clarification flow

If confidence is low or multiple versions share the same label/catalogue, ask for:

```text
Side A matrix/runout
Side B matrix/runout
Side C/D if relevant
Etched/stamped notes
Extra symbols or initials
Deadwax photo
```

After matrix input, rerun matching and update issue likelihood, pressing confidence, pricing confidence and listing wording.

### RecordLens trust rule

Never claim first pressing, original pressing, rare, mint, or authentic signed copy unless evidence supports it or user confirms it.

Use:

```text
Likely version: UK 1997 issue family, 72% confidence from label photo.
Matrix/runout needed to confirm exact pressing.
```

## 2. ShoeLens

Covers trainers, sneakers, shoes and boots.

Fields: brand, model, colourway, UK/EU/US size, gender, style code/SKU, condition, sole wear, heel drag, creasing, stains, box/laces/accessories.

Checks: missing size label, sole photo, box label, style-code mismatch, suspicious price, stock photos, seller wording risk.

## 3. ClothingLens

Covers clothing, fashion, vintage garments, apparel and textile accessories.

Fields: garment type, brand, size label, fit, gender/age category, colour, material, pattern, style, seasonality, condition, defects, care label, category, measurement section.

Checks: missing size/care label, missing measurements, stains, bobbling, fading, holes, seams, zip/button issues, brand inconsistency, vintage sizing warning.

## 4. MeasureLens

MeasureLens is a physical 3D-printed reference object plus CV system for measurements.

Garment outputs:

- Pit-to-pit
- Shoulder width
- Sleeve length
- Body length
- Waist
- Hem
- Inside leg
- Outside leg
- Rise
- Listing-ready measurement text
- Confidence per measurement
- Retake guidance

Hardware design:

- Known fixed dimensions
- High-contrast fiducial markers
- Matte finish
- Clip-on fabric grip
- Rubber pads
- Flat-lay and hanging mode
- Direction arrows
- Numbered corners
- QR/object ID
- Multi-anchor design to handle droop, rotation and perspective

## 5. MotorLens

MotorLens supports vehicles, parts, campers and eBay Motors.

MotorMeasureLens adapts MeasureLens for vehicles and parts.

Use cases:

- Scratch length
- Dent diameter
- Damage-area size
- Loose car-part dimensions
- Camper interior scale reference
- Rough 3D interior modelling

MotorLens must identify likely car parts from photos and dimensions alone using MotorMeasureLens.

Inputs:

- Front photo
- Back photo
- Side/profile photo
- Connector/mounting close-up
- MotorMeasureLens marker visible
- Optional vehicle hint

Matching signals:

- Shape and silhouette
- Dimensions
- Mounting point positions
- Connector count/shape
- Left/right clues
- Logos/marks
- Material/finish
- Marketplace comps
- Known compatibility data

Return ranked likely fitments with percentage likelihood.

Trust rule:

```text
Likely fitment based on image shape and measured dimensions: Ford Fiesta Mk7, 68% confidence.
Please confirm OEM part number and connector before purchase.
```

## 6. TechLens

Covers phones, laptops, tablets, cameras, headphones, games consoles, audio gear, computer parts and smart devices.

Fields: brand, model, variant, storage/spec, model number, serial prompt with privacy warning, condition, screen/body damage, ports, battery, accessories, tested/untested, fault notes.

Checks: missing model/spec, missing powered-on photo, missing screen/port/battery evidence, suspicious price, untested risk, activation-lock/network-lock risk, accessory mismatch.

## 7. BookLens

Covers books, first editions, signed books, textbooks, rare books, manuals, magazines, collectable print and annuals.

Fields: title, author, publisher, year, edition, ISBN, format, dust jacket, printing statement, spine, boards, pages, foxing, tears, annotations, signatures, completeness.

Checks: missing copyright/edition page, first edition claim not evidenced, missing dust jacket photos, condition mismatch, signature/provenance uncertainty.

Route signed books to AutographLens when the signature is the main value driver.

## 8. CardLens

Covers Pokémon, Yu-Gi-Oh!, Magic, sports cards, football cards, sealed packs and graded slabs.

Fields: card name, set, number, rarity, holo, language, edition, condition, grading company, certificate number.

Checks: fake-card indicators, slab/cert mismatch, missing back/corner/edge photos, condition mismatch, suspicious price.

## 9. ToyLens

Covers toys, figures, LEGO, plushies, die-cast, action figures, boxed collectibles and retro toys.

Fields: brand, character, franchise, year/era, scale, boxed/unboxed, completeness, accessories, condition, packaging.

Checks: missing accessories, incomplete set, repro box risk, fake figure risk, condition mismatch, boxed vs loose price gap.

## 10. WatchLens

Covers watches, smartwatches, luxury watches and fashion watches.

Fields: brand, model, reference, movement, case size/material, strap, dial, crystal, box/papers, service history, working/cosmetic condition.

Checks: missing case back, clasp, reference/serial area, dial inconsistency, price anomaly, missing proof.

Never claim authenticity from photos alone.

## 11. AntiquesLens

Covers antiques, decorative objects, ceramics, glass, silverplate, brass, clocks, small furniture, vintage homeware and estate-sale items.

Fields: object type, material, era/style, maker marks, dimensions, weight, chips, cracks, repairs, patina, missing parts, provenance, price range.

Checks: missing maker marks, missing dimensions, damage not described, reproduction risk, age/era not evidenced, suspicious price.

Use cautious wording: “appears consistent with”, “possibly”, “style of”, “requires verification”.

## 12. AutographLens

Covers signed records, books, photos, posters, sports memorabilia, cards, COAs and celebrity/artist autographs.

Fields: signed item type, claimed signer, signature location, ink visibility, certificate/provenance, COA issuer, event/source notes, framing, condition.

Checks: missing close-up, missing provenance, COA issuer risk, printed vs hand-signed uncertainty, signature mismatch indicators, suspicious price.

Never authenticate signatures. Produce an evidence/provenance risk report and recommend third-party authentication for high-value items.

---

# AI Architecture

Use a layered intelligence pipeline, not one giant prompt.

```text
Input photos / listing URL
→ Capture Agent
→ Quality Agent
→ Category Router Agent
→ Identity Agent
→ Evidence Agent
→ Specialist Lens Agent
→ Comps Agent
→ Pricing Agent
→ Risk & Trust Agent
→ Copy / Report Agent
→ Validator Agent
→ Adjudicator Agent
→ Human review
```

## Agent roles

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

---

# AI Model Strategy

Use routed models.

| Job | Model class |
|---|---|
| Cheap classification | Small/nano classifier |
| Standard listing generation | Cost-efficient text model |
| Complex reasoning | High-reasoning model |
| Vision analysis | Multimodal vision model |
| Structured outputs | JSON schema / Zod validated |
| Similar history | Embeddings + pgvector |
| Measurement | OpenCV + marker detection |
| Safety | Moderation + deterministic rules |

Routing rule:

```text
Use the cheapest reliable model. Escalate only when confidence is low, evidence conflicts, item value is high, or specialist reasoning is needed.
```

---

# Web Workers & Queue Workers

## Browser workers

Use Web Workers, OffscreenCanvas and WASM/OpenCV for local preprocessing:

- Image compression
- Thumbnail generation
- Blur/brightness checks
- Duplicate detection
- Local MeasureLens marker pre-detection
- Barcode/QR pre-detection
- Upload progress/retry

## Server queue workers

Use BullMQ/Redis or equivalent for:

```text
ai.item.analyse
ai.guard.check
ai.lens.record.analyse
ai.lens.clothing.analyse
cv.measure.calculate
marketplace.comps.retrieve
marketplace.ebay.publishSandbox
billing.credit.consume
report.generatePdf
```

Workers must be idempotent, retry with backoff, use dead-letter queues, expose job status to UI, and store prompt/model/schema/cost metadata.

---

# Marketplace Integrations

## Integration modes

- Direct API publish
- Draft/API-ready export
- Manual export
- Browser-assisted fill
- Guard-only analysis
- Price/reference-only mode

## Marketplace roadmap

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

## API integrations to consider

- eBay Sell APIs
- eBay Browse/Buy APIs
- eBay Product Research/Terapeak-style data
- Discogs API
- MusicBrainz API
- Barcode/GTIN lookup
- Open Library / Google Books
- ISBNdb/book data provider
- Stripe
- Royal Mail/shipping APIs
- Shopify/WooCommerce APIs
- Etsy API
- GS1/product registry sources
- Auction reference sources

---

# UI, Navigation & Components

Style:

```text
Dark premium UI + cyan/violet gradients + glass cards + lens rings + confidence meters + evidence tags + risk pills.
```

Primary nav:

```text
Dashboard
Studio
Guard
Lenses
Listings
Reports
MeasureLens
Extension
Billing
Settings
```

Core components:

- `AppShell`
- `SidebarNav`
- `TopCommandBar`
- `PhotoUploader`
- `ListingDraftEditor`
- `RiskReportCard`
- `RiskLevelBadge`
- `LensGrid`
- `MarketplaceOutputTabs`
- `MeasurementOverlayCanvas`
- `ExtensionPopup`
- `SpecialistAgentLauncher`

Use Framer Motion for subtle, fast, functional animations:

- Sidebar active glide
- Card hover glow
- Lens detection pulse
- AI analysis progress
- Risk meter reveal
- Measurement overlay line draw
- Drag/drop photo reorder

---

# React / Next.js Performance Rules

Follow these rules when writing, reviewing or refactoring ListLens React/Next.js code. These rules are optimised for automated coding agents and should be treated as repo-level performance guidance.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|---:|---|---|---|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

---

## 1. Eliminating Waterfalls — CRITICAL

Waterfalls are the biggest performance risk. Every sequential `await` adds latency.

Rules:

- `async-cheap-condition-before-await` — check cheap sync conditions before async flags or remote values.
- `async-defer-await` — move `await` into branches where the result is actually needed.
- `async-dependencies` — start partially dependent work as early as possible.
- `async-api-routes` — in API routes and Server Actions, start promises early and await late.
- `async-parallel` — use `Promise.all()` for independent operations.
- `async-suspense-boundaries` — use Suspense to stream UI while slow data loads.

Bad:

```ts
const session = await auth();
const config = await fetchConfig();
const data = await fetchData(session.user.id);
```

Better:

```ts
const sessionPromise = auth();
const configPromise = fetchConfig();
const session = await sessionPromise;

const [config, data] = await Promise.all([
  configPromise,
  fetchData(session.user.id)
]);
```

ListLens-specific applications:

- Start photo metadata extraction, Lens routing and marketplace capability loading in parallel where possible.
- Do not wait for comps retrieval before rendering the editable draft shell.
- Guard reports should stream/show base risk state before pricing/comps finish.
- In RecordLens, start release metadata lookup and image quality checks in parallel.

---

## 2. Bundle Size Optimization — CRITICAL

Keep Studio, Guard, Extension and Lens routes fast. Do not ship heavy AI/CV/editor code to every route.

Rules:

- `bundle-barrel-imports` — avoid broad barrel imports where they inflate bundles.
- `bundle-conditional` — load large data/modules only when a feature activates.
- `bundle-defer-third-party` — defer analytics/logging after hydration.
- `bundle-dynamic-imports` — dynamically import heavy components.
- `bundle-analyzable-paths` — prefer statically analyzable imports and file paths.
- `bundle-preload` — preload on hover/focus or likely next action.

ListLens-specific applications:

- Dynamically import `MeasurementOverlayCanvas`, OpenCV/WASM helpers and heavy chart/report components.
- Do not ship RecordLens forensic UI to users only opening Dashboard.
- Lazy-load marketplace-specific formatters when selected.
- Lazy-load extension side-panel heavy report UI only after user runs a check.
- Use Next.js package import optimisation for icon/component libraries where available.

Example:

```tsx
import dynamic from "next/dynamic";

const MeasurementOverlayCanvas = dynamic(
  () => import("@/features/measurelens/measurement-overlay-canvas").then(m => m.MeasurementOverlayCanvas),
  { ssr: false }
);
```

---

## 3. Server-Side Performance — HIGH

Rules:

- `server-auth-actions` — authenticate Server Actions like API routes.
- `server-dedup-props` — avoid duplicate serialization in RSC props.
- `server-no-shared-module-state` — never store request/user data in mutable module-level state.
- `server-cache-lru` — use LRU/Redis for cross-request reusable data.
- `server-hoist-static-io` — hoist static I/O such as templates/config to module scope.
- `server-serialization` — pass only needed fields across RSC/client boundaries.
- `server-parallel-fetching` — restructure server components to parallelize data fetching.
- `server-parallel-nested-fetching` — chain per-item nested fetches instead of blocking all items.
- `server-cache-react` — use `React.cache()` for per-request DB/auth deduplication.
- `server-after-nonblocking` — use `after()` for audit logs, analytics and non-critical side effects.

Server Actions must always authenticate internally:

```ts
"use server";

export async function updateListing(input: unknown) {
  const data = updateListingSchema.parse(input);
  const session = await verifySession();
  if (!session) throw unauthorized();
  return listingService.update(session.workspaceId, data);
}
```

ListLens-specific applications:

- Never trust middleware alone for publish/export/billing/server actions.
- Do not pass full AI outputs into client components when only score/title/warnings are needed.
- Use `React.cache()` for `getCurrentUser`, workspace lookup and marketplace capability lookup.
- Use `after()` for non-blocking PostHog events, audit logs and report-open tracking.
- Use Redis/LRU for static marketplace capabilities and Lens definitions.

---

## 4. Client-Side Data Fetching — MEDIUM-HIGH

Rules:

- `client-event-listeners` — deduplicate global event listeners.
- `client-passive-event-listeners` — use passive listeners for scroll/touch when `preventDefault` is not needed.
- `client-swr-dedup` — use SWR/TanStack Query for request deduplication.
- `client-localstorage-schema` — version and minimize localStorage data.

ListLens-specific applications:

- Use TanStack Query or SWR for job status polling and report fetching.
- Use one shared listener for extension keyboard shortcuts.
- Version local extension cache keys: `listlens-extension:v1`.
- Never store tokens or sensitive marketplace data in localStorage.
- Wrap all storage reads/writes in try/catch.

---

## 5. Re-render Optimization — MEDIUM

Rules:

- `rerender-derived-state-no-effect` — calculate derived state during render.
- `rerender-defer-reads` — do not subscribe to state only used inside callbacks.
- `rerender-simple-expression-in-memo` — do not wrap trivial primitive expressions in `useMemo`.
- `rerender-no-inline-components` — do not define components inside components.
- `rerender-memo-with-default-value` — hoist default non-primitive props to constants.
- `rerender-memo` — extract expensive UI into memoized components.
- `rerender-dependencies` — narrow effect dependencies to primitives.
- `rerender-move-effect-to-event` — put interaction logic in event handlers.
- `rerender-split-combined-hooks` — split hooks with independent dependencies.
- `rerender-derived-state` — subscribe to derived booleans, not noisy raw values.
- `rerender-functional-setstate` — use functional state updates.
- `rerender-lazy-state-init` — use lazy state initialisation for expensive initial values.
- `rerender-transitions` — use transitions for non-urgent updates.
- `rerender-use-deferred-value` — defer expensive renders triggered by input.
- `rerender-use-ref-transient-values` — use refs for transient frequent values.

ListLens-specific applications:

- Do not rerender the whole Studio editor when only one photo upload progresses.
- Use local component state or refs for drag/hover states.
- Use transitions for filtering long listing/report histories.
- Use deferred values for marketplace/comps search inputs.
- Use refs for pointer positions in measurement overlays.
- Do not define `RiskBadge`, `PhotoTile`, `MeasurementLine` etc. inside parent components.

---

## 6. Rendering Performance — MEDIUM

Rules:

- `rendering-animate-svg-wrapper` — animate a wrapper div, not SVG directly.
- `rendering-content-visibility` — use `content-visibility: auto` for long lists.
- `rendering-hoist-jsx` — hoist static JSX where useful.
- `rendering-svg-precision` — reduce SVG coordinate precision.
- `rendering-hydration-no-flicker` — prevent client-only flicker for theme/preferences.
- `rendering-hydration-suppress-warning` — suppress expected mismatches only.
- `rendering-activity` — preserve expensive show/hide UI where appropriate.
- `rendering-script-defer-async` — use Next Script strategies for scripts.
- `rendering-conditional-render` — use explicit ternaries when `0`/`NaN` may render.
- `rendering-resource-hints` — preconnect/preload critical resources.
- `rendering-usetransition-loading` — prefer transitions over manual loading states where suitable.

ListLens-specific applications:

- Use `content-visibility` for large reports, listing history and comparable-sale lists.
- Animate lens rings via wrapper transforms.
- Preconnect to image storage/CDN and API host where useful.
- Avoid hydration flash for dark mode and workspace theme.
- Keep Guard reports printable/shareable without JS-heavy rendering.

---

## 7. JavaScript Performance — LOW-MEDIUM

Rules:

- `js-batch-dom-css` — avoid layout thrashing; batch reads/writes.
- `js-index-maps` — build Maps for repeated lookups.
- `js-cache-property-access` — cache repeated property access in hot loops.
- `js-cache-function-results` — cache repeated function results.
- `js-cache-storage` — cache storage reads when safe.
- `js-combine-iterations` — combine multiple array passes in hot paths.
- `js-request-idle-callback` — defer non-critical background work.
- `js-length-check-first` — check array lengths before expensive comparisons.
- `js-early-exit` — return early.
- `js-hoist-regexp` — hoist RegExp creation.
- `js-flatmap-filter` — use `flatMap` for map+filter in one pass.
- `js-min-max-loop` — use a loop for min/max rather than sorting.
- `js-set-map-lookups` — use Set/Map for O(1) membership checks.
- `js-tosorted-immutable` — use `toSorted()` or `[...arr].sort()` instead of mutating props/state.

ListLens-specific applications:

- Build lookup maps for Lens definitions, marketplace capabilities, category mappings and photo IDs.
- Use Set for missing-evidence checks.
- Do not sort all comps just to get min/max.
- Defer analytics, recent-search writes and non-critical cache writes to idle time.
- Hoist barcode/matrix/ISBN regexes.

---

## 8. Advanced Patterns — LOW

Rules:

- `advanced-effect-event-deps` — do not put `useEffectEvent` results in dependency arrays.
- `advanced-init-once` — initialise app-wide logic once, not per mount.
- `advanced-event-handler-refs` — store handlers in refs for stable subscriptions.
- `advanced-use-latest` — use latest callback refs / `useEffectEvent` to avoid stale closures.

ListLens-specific applications:

- Initialise extension bridge once.
- Initialise analytics once.
- Keep event subscriptions stable in upload, drag/drop and measurement overlay components.

---

# Data Model Essentials

Implement at minimum:

```text
users
workspaces
marketplace_accounts
marketplace_connectors
items
item_photos
item_analyses
listings
comparable_sales
guard_checks
guard_findings
guard_questions
measure_objects
measure_sessions
payments
usage_events
```

---

# Core API Endpoints

```text
POST /api/items
POST /api/items/:id/photos
POST /api/items/:id/analyse
GET  /api/items/:id/analysis
PATCH /api/items/:id
POST /api/items/:id/export/:marketplace
POST /api/items/:id/publish/:marketplace
GET  /api/marketplaces/capabilities

POST /api/guard/checks
POST /api/guard/checks/:id/analyse
GET  /api/guard/checks/:id
POST /api/guard/checks/:id/questions

POST /api/lenses/record/analyse
POST /api/lenses/shoe/analyse
POST /api/lenses/clothing/analyse
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

POST /api/billing/checkout
POST /api/billing/portal
POST /api/webhooks/stripe
```

---

# Build Plan

## Phase 1 — POC

- Studio
- Guard
- RecordLens v1
- Vinted export
- eBay draft/sandbox/API
- Stripe
- Analytics
- Optional pilots: ShoeLens, ClothingLens, MeasureLens

## Phase 2 — MVP

- Improved editor/reports
- eBay live publish where available
- Discogs metadata/reference flow
- ShoeLens
- ClothingLens
- BookLens
- CardLens
- Browser extension v1
- MeasureLens accessory sales

## Phase 3 — Expansion

- ToyLens
- TechLens
- WatchLens
- AntiquesLens
- AutographLens
- Etsy/Shopify/WooCommerce connectors
- MotorLens marker prototype

## Phase 4 — Scale

- MotorLens full release
- Multi-marketplace publishing where permitted
- Bulk tools
- API/licensing
- Marketplace partnerships
- US marketplaces

---

# Acceptance Criteria

The first production-quality POC is acceptable when:

- RecordLens can identify likely record issue/version from photos.
- Single-label photo returns ranked version likelihoods.
- Matrix/runout clarification flow works.
- Studio creates editable eBay/Vinted listing drafts.
- Guard creates buyer risk reports with safe wording.
- Stripe credits/check payments work.
- eBay sandbox/draft payload works.
- Vinted export works.
- AI outputs are schema-validated.
- Worker jobs are queued and tracked.
- Core analytics are captured.
- Browser extension can send current listing to Guard.
- No unsupported claims are published without user confirmation.

---

# Final Instruction

Build ListLens as a modular, typed, evidence-led resale intelligence platform.

Start narrow with RecordLens, but design the architecture so every future Lens, marketplace and agent can plug in cleanly.

Always prefer:

```text
Evidence over guesses.
Confidence over certainty.
Human review over risky automation.
Reusable components over one-off screens.
Typed contracts over unstructured AI text.
Fast parallel flows over waterfalls.
Small bundles over convenience imports.
Server-side safety over client-side assumptions.
```

Your job is to make ListLens feel like a serious product from day one.
```

