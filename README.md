# ListLens — AI Resale Trust Layer

ListLens is a monorepo powering an AI-driven resale intelligence platform. It helps sellers create accurate listings and buyers evaluate risk across eBay, Vinted, and other marketplaces.

## Workspace Layout

```
listlens/
├── apps/
│   ├── web/          # Next.js 15 App Router — main web app (Clerk, Stripe, AI)
│   ├── worker/       # BullMQ background worker (AI jobs, CV, billing, reports)
│   └── extension/    # WXT browser extension for eBay & Vinted (Chrome/Edge)
└── packages/
    ├── ai/           # OpenAI wrapper — Studio & Guard analyse functions
    ├── cv/           # Computer vision pipeline stubs (AR marker, measurements)
    ├── db/           # Prisma schema + client
    ├── lenses/       # Lens configs (ShoeLens, LPLens, ClothingLens, WatchLens…)
    ├── marketplace/  # Marketplace connectors (eBay stub, Vinted stub)
    ├── pricing/      # Pricing heuristics (quartile-based, comparable sales)
    ├── schemas/      # Shared Zod schemas (Studio, Guard, Measure, Intelligence…)
    └── ui/           # Shared React component library (Button, Card, Tabs…)
```

## Architecture

- **Studio** — AI analyses seller photos → structured listing data + pricing
- **Guard** — AI risk-screens buyer listings → red flags + seller questions
- **Lenses** — Category-specific rulesets routing to the right AI prompt
- **MeasureLens** — AR-marker CV pipeline for garment/motor measurements (stub)
- **Worker** — BullMQ queues: `ai`, `cv`, `marketplace`, `billing`, `report`
- **Extension** — Detects listing context on eBay/Vinted and sends to Studio/Guard

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (for `packages/db`)
- Redis (for `apps/worker`)

### Install

```bash
npm install
```

### Environment

```bash
cp .env.example .env
# fill in DATABASE_URL, REDIS_URL, OPENAI_API_KEY, STRIPE_*, CLERK_*, EBAY_*
```

See **[`docs/api-keys.md`](docs/api-keys.md)** for where to obtain each key — every external service used by ListLens has a free tier or test mode.

### Development

```bash
npm run dev           # run all apps in watch mode via Turbo
```

### Typecheck

```bash
npm run typecheck     # runs tsc --noEmit across all packages
```

### Test

```bash
npm run test          # runs vitest in packages/schemas, cv, pricing, lenses
```

### Build

```bash
npm run build         # builds all packages and apps via Turbo
```

## Packages

| Package | Description |
|---|---|
| `@listlens/schemas` | Zod schemas for all AI outputs (Studio, Guard, Measure, Motor, Intelligence, Marketplace) |
| `@listlens/ui` | Shared React components: Button, Card, Badge, Input, Tabs, RiskLevelBadge, ConfidenceMeter |
| `@listlens/cv` | CV pipeline stubs: marker detection, pose estimation, garment landmark detection |
| `@listlens/marketplace` | eBay + Vinted connectors with `formatListing`, `publishDraft`, `fetchListing` |
| `@listlens/pricing` | Quartile-based pricing: `derivePricing(comps)` → quickSale / recommended / high |
| `@listlens/lenses` | Lens configs + `routeLens(hint)` + safe-language guardrails (`assertSafeLanguage`) |
| `@listlens/ai` | OpenAI wrapper: `analyseForStudio`, `analyseForGuard`, `routeModel`, `getPrompt`, `estimateCost` |
| `@listlens/db` | Prisma schema: User, Workspace, Item, GuardCheck, Payment, UsageEvent, MeasureSession… |

## What's Scaffolded vs Deferred

### ✅ Scaffolded (working stubs)
- All packages with full TypeScript types and Zod schemas
- BullMQ worker with 5 queues and job handlers
- Browser extension entrypoints (background, content, popup)
- Marketplace connectors (eBay sandbox stub, Vinted CSV stub)
- Pricing heuristics with full test coverage
- Safe-language guardrails for Guard AI output
- CI workflow (GitHub Actions)

### 🔜 Deferred (real implementations needed)
- Real OpenCV for CV pipeline (`packages/cv` — stubs only)
- Real eBay API calls (`packages/marketplace/src/ebay.ts`)
- Vinted API / CSV export (`packages/marketplace/src/vinted.ts`)
- pgvector embeddings (`packages/db` — schema note included)
- WXT extension build (requires `wxt dev` to generate `.wxt/tsconfig.json`)

## CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs on push to `main` and all PRs:
`install → typecheck → lint → test → migrate-diff → build`

## Production

See [`docs/deploy.md`](docs/deploy.md) for the operator-facing deploy guide
and [`docs/production-readiness.md`](docs/production-readiness.md) for the
tracked follow-up work that is not yet shipped.

The web app validates required environment variables at boot via
`apps/web/src/lib/env.ts`; the build refuses to ship the placeholder Clerk
key whenever `LISTLENS_ENV=production` (or `VERCEL_ENV=production`).
