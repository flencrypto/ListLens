# ShoeLens Sneaks API compatible patch

This replaces the uploaded CommonJS/callback `stockx-scraper.js` pattern with an app-compatible TypeScript/ESM client.

## Install

From the workspace/API server package:

```bash
npm install sneaks-api@1.2.3
```

or, if the repo uses pnpm:

```bash
pnpm add sneaks-api@1.2.3 --filter @workspace/api-server
```

## Files

- `sneaks-client.ts` → place at `artifacts/api-server/src/lib/sneaks-client.ts`
- `listlens.sneaks-primary.ts` → replacement for `artifacts/api-server/src/routes/listlens.ts`
- `shoe-identification-agent.sneaks-primary.ts` → replacement for `artifacts/api-server/src/lib/shoe-identification-agent.ts`

## Source priority

1. Sneaks API product lookup by SKU/style code/name/hint
2. KicksCrew by URL enrichment when `kickscrewUrl` is supplied
3. Existing `marketplace_candidates` from the request
4. Image/OCR evidence only fallback

## Notes

The uploaded `stockx-scraper.js` depended on:

- CommonJS `require`
- `got`
- `../models/Sneaker`
- callback-style functions

The app-compatible version removes those assumptions and returns typed plain objects that map directly into ShoeLens `marketplace_candidates`.
