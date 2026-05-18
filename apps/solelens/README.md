# SoleLens

SoleLens is a production-grade frontend prototype for an AI-powered footwear inspection and intelligence platform in the List-Lens brand family. The primary workflow is:

```text
Scan -> Identify -> Authenticate -> Grade -> Price -> List
```

The app is intentionally positioned as an inspection and resale-assist layer, not a marketplace. It demonstrates guided image capture, authenticity risk language, condition grading, value estimation, listing draft generation, candidate matching, B2B metrics, and expert-review routing.

## Marketplace intelligence agent

The app includes a Marketplace Agent page and listing-drawer recommendation. The agent ranks where to sell the exact item by combining:

- exact-match strength for SKU, model family, condition, size band, box status, and region
- comparable sales volume, not just the highest sold outlier
- expected net value after fees and shipping
- sell-through rate and expected sale-speed range
- confidence and channel tradeoffs

Each recommendation returns a value range and speed range, for example `GBP 130-140` and `7-12 days`, so sellers can choose between maximum expected return and faster cash-out.

## AI provider stack

SoleLens is designed as an AI-powered app backed by:

- `XAI_API` for xAI-powered visual reasoning, anomaly triage, and inspection assist.
- `OPENAI_API` for structured reports, listing generation, explanations, and support flows.

Keep both keys server-side only. Do not expose `XAI_API` or `OPENAI_API` through Vite `VITE_*` variables or any browser bundle. The production path should route browser requests through a backend/API gateway that owns provider selection, rate limits, logging, retries, and audit trails.

Recommended backend route shape:

```text
POST /api/ai/scan-analysis
POST /api/ai/listing-draft
POST /api/ai/expert-summary
```

These routes are now implemented by the local server middleware in `server/aiApi.mjs`.
During `npm run dev`, Vite serves them as same-origin API routes. For a built
deployment, run `npm run build` and `npm start` to serve `dist` plus the API
routes from `server.mjs`.

## Real sneaker reference data

The local sneaker archive in `C:\Users\benrf\Downloads\archive.zip` is ingested
into a browser/API-ready catalog with:

- 50 real sneaker model classes
- 5,953 catalog image references from `dataset_stats.csv`
- 200 extracted sample images under `public/assets/catalog`
- zero corrupt files reported by the supplied dataset stats

Regenerate the catalog whenever the archive changes:

```bash
python scripts/build_real_catalog.py
```

The generated artifact is `public/data/solelens-catalog.json`. It is served
through:

```text
GET /api/data/readiness
GET /api/data/catalog
GET /api/data/catalog/{id}
```

`/api/data/readiness` reports what is production-live: reference catalog,
AI-provider health, and marketplace-feed status. The current app has live OpenAI
provider routing when `OPENAI_API`/`OPENAI_API_KEY` is configured. xAI support is
wired but remains inactive until `XAI_API`/`XAI_API_KEY` is configured.

Marketplace recommendations are production-shaped, but live sold-comps are not
production-live until marketplace data contracts/API credentials are added. The
readiness endpoint exposes this explicitly instead of presenting synthetic comps
as real market data.

Recommended server environment:

```bash
XAI_API=...
OPENAI_API=...
# Alias names are also supported:
XAI_API_KEY=...
OPENAI_API_KEY=...
```

If xAI is not configured, scan analysis falls back to OpenAI when available.
If no provider is available or a provider fails, the API returns a conservative
local fallback rather than exposing errors to the browser.

## Run locally

```bash
pnpm install
pnpm --filter @list-lens/sole-lens run dev
```

Then open the Vite URL shown in the terminal.

## Production checks

```bash
pnpm --filter @list-lens/sole-lens run build
pnpm --filter @list-lens/sole-lens run preview
```

## Included assets

- `public/assets/brand/brandpack.png` is copied from the supplied List-Lens brandpack.
- `public/assets/brand/hoard.png` is copied from the supplied updated Shoe-Lens / Record-Lens / Hoard-Lens brand board.
- `public/assets/brand/solelens-logo.png` is copied from the supplied SoleLens logo.
- `public/assets/sneakers/*` contains a curated sample of sneaker images extracted from the supplied archive.
- `public/assets/catalog/*` contains generated sample images for each real catalog class.
- `public/data/solelens-catalog.json` contains the generated real sneaker reference catalog.
- `src/data/datasetStats.json` contains model coverage rows extracted from the supplied archive dataset stats.
- `docs/sole-lens-dashboard-concept.png` stores the generated dashboard concept used as the visual implementation reference.

## Current scope

This is the production web dashboard surface for reseller and operator workflows. The next production slice would be the API boundary:

- FastAPI scan-session service
- S3-compatible pre-signed upload flow
- PostgreSQL + pgvector product reference store
- Redis/Celery AI processing workers
- human expert-review queue persistence
- marketplace export adapters
