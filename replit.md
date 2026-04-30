# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- `artifacts/listlens` — Mr.FLENS · List-LENS web app (Vite + React + Tailwind v4 + wouter). Ported from a Vercel/v0 Next.js export. Demo-mode auth (no Clerk), demo-mode billing (Stripe plans render disabled). Routes: `/`, `/splash`, `/dashboard`, `/billing`, `/history`, `/lenses`, `/lenses/record`, `/studio/new`, `/studio/:id`, `/guard/new`, `/guard/:id`, `/legal/{privacy,terms,ai-disclaimer}`, `/offline`. Auth/Stripe shims live in `src/lib/{auth-shim,clerk-config,stripe}.ts`.
- `artifacts/listlens-mobile` — Mr.FLENS · List-LENS native companion (Expo SDK 54 + expo-router 6, dark-only). Mirrors the web app's brand (deep navy background, cyan→violet/green/amber gradients, Inter typography, MR.FLENS wordmark, animated HUD lens). Frontend-only with demo state (no API calls yet). Routes: `/splash`, `/(tabs)/{index,lenses,studio,guard,more}`, `/studio/{new,capture,review}`, `/guard/{check,report}`, `/more/{history,billing,legal}`, `/lenses/[id]`. Uses `expo-image-picker` (camera + library) for the Studio capture flow. Brand primitives live in `components/brand/{BrandLens,BrandWordmark,BrandBackground,BrandGlyph}.tsx`; UI primitives in `components/ui/`. Lens registry mirrored at `constants/lenses.ts`.
- `artifacts/api-server` — Express API server. Hosts `/healthz` plus the ListLens demo router at `src/routes/listlens.ts`, mounted under `/api/*` for the workspace path-based proxy. The demo router returns deterministic mocks (no AI / Stripe / DB) for every endpoint the ListLens frontend calls (items, guard checks, RecordLens identify, lenses).
- `artifacts/mockup-sandbox` — Component preview server (unchanged).
