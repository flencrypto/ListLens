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

- `artifacts/listlens` — Mr.FLENS · List-LENS web app (Vite + React + Tailwind v4 + wouter). Auth via Replit OIDC (cookie sessions, `@workspace/replit-auth-web`). The navbar shows a "Log in / Log out" button using `useAuth()`. Auth shims (`auth-shim.ts`, `clerk-config.ts`) remain in place but are no longer used in the navbar. Routes: `/`, `/splash`, `/dashboard`, `/billing`, `/history`, `/lenses`, `/lenses/record`, `/studio/new`, `/studio/:id`, `/guard/new`, `/guard/:id`, `/legal/{privacy,terms,ai-disclaimer}`, `/offline`.
- `artifacts/listlens-mobile` — Mr.FLENS · List-LENS native companion (Expo SDK 54 + expo-router 6, dark-only). Auth via `expo-auth-session` (PKCE) + `expo-secure-store`. `AuthProvider` from `lib/auth.tsx` wraps the root layout; `useAuth()` available throughout. The More tab shows a "Log in / Log out" row. API base URL set via `EXPO_PUBLIC_DOMAIN`. Routes: `/splash`, `/(tabs)/{index,lenses,studio,guard,more}`, `/studio/{new,capture,review}`, `/guard/{check,report}`, `/more/{history,billing,legal}`, `/lenses/[id]`. Studio capture screen uses `expo-image-picker` with `base64: true` to capture/pick photos, encodes them as data URLs, and POSTs to the API server (`/api/items` + `/api/items/:id/analyse`). The AI result is passed as a JSON param to the review screen. `lib/api.ts` contains typed API client functions. Metro config blocks `openai_tmp_*` paths to avoid watcher crashes.
- `artifacts/api-server` — Express API server. Hosts `/healthz`, Replit Auth routes (`/login`, `/callback`, `/logout`, `/auth/user`, `/mobile-auth/token-exchange`, `/mobile-auth/logout`), and the ListLens demo router at `src/routes/listlens.ts`. Auth middleware (`authMiddleware`) runs on every request, loading user from PostgreSQL sessions. `openid-client` v6 handles OIDC/PKCE.
- `artifacts/mockup-sandbox` — Component preview server (unchanged).

## Browser Extension

- `apps/extension` — WXT-based Chrome/Edge browser extension ("Mr.FLENS · List-LENS Guard"). Builds to `apps/extension/.output/chrome-mv3/` for loading in Chrome developer mode.
  - **Content script** — Matches eBay (`*.ebay.co.uk/itm/*`, `*.ebay.com/itm/*`) and Vinted (`www.vinted.co.uk/items/*`, `.../catalog/*`) listing pages; extracts the listing URL and responds to popup messages.
  - **Background service worker** — Proxies Guard API calls (POST `/api/guard/checks` + POST `/api/guard/checks/:id/analyse`) with `credentials: "include"` so the user's session cookie is forwarded.
  - **Popup UI** — Shows the detected marketplace tag, listing URL, a "Run Guard check" button, loading state, and the Guard result card (risk badge with confidence %, red flags list, seller questions). Brand tokens mirror the main app. API base URL is configurable via the ⚙ settings panel and persisted in `chrome.storage.local`.
  - **Build**: `pnpm --filter extension build` → outputs to `.output/chrome-mv3/`
  - **Install in Chrome**: Go to `chrome://extensions` → Enable Developer mode → Load unpacked → select `apps/extension/.output/chrome-mv3/`.
