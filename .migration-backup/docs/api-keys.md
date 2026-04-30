# API Keys & External Services

ListLens depends on several third-party APIs. This guide lists every key referenced in [`.env.example`](../.env.example), where to obtain it, and which tier is **free** so you can run the full app without paying anything during development.

> **TL;DR — minimal local dev set:** PostgreSQL (local Docker, free) + Redis (local Docker, free) + OpenAI (paid, ~$1 covers a lot of testing) + Clerk (free). Everything else has a working fallback or is only needed for specific integrations.

---

## 1. Database — PostgreSQL

| Var(s) | `DATABASE_URL`, `DIRECT_URL` |
|---|---|
| Used by | Prisma (`packages/db`) |
| Required? | Yes |

### Free options
- **Local Docker** (recommended for dev):
  ```bash
  docker run --name listlens-pg -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16
  ```
- **[Neon](https://neon.tech)** — free tier: 0.5 GB storage, autoscaling, branching. Use the *pooled* connection string for `DATABASE_URL` and the *direct* one for `DIRECT_URL`.
- **[Supabase](https://supabase.com)** — free tier: 500 MB Postgres + auth + storage.
- **[Railway](https://railway.app)** — $5/mo trial credit, then pay-as-you-go.

---

## 2. Redis — BullMQ + Rate Limiting

| Var(s) | `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
|---|---|
| Used by | `apps/worker` (BullMQ), rate limiter |
| Required? | `REDIS_URL` for the worker. Upstash vars optional (in-memory fallback for single-instance) |

### Free options
- **Local Docker**: `docker run --name listlens-redis -p 6379:6379 -d redis:7`
- **[Upstash](https://upstash.com)** — free tier: 10k commands/day, REST API, perfect for serverless (Vercel/Netlify). Sign up → "Create database" → copy `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.

---

## 3. OpenAI — Studio & Guard AI

| Var(s) | `OPENAI_API_KEY` |
|---|---|
| Used by | `packages/ai`, `apps/web/src/lib/ai/*` |
| Required? | Yes (the app falls back to mock data if unset, but Studio/Guard won't really work) |

### How to get one
1. Sign up at <https://platform.openai.com>
2. **Billing → Add payment method** (a card is required even for low-volume use).
3. **API keys → Create new secret key** → paste into `OPENAI_API_KEY`.

> **Free credits:** New accounts occasionally get $5 in trial credits (subject to OpenAI's policies; check your dashboard). Otherwise it's pay-as-you-go — Studio/Guard runs on `gpt-4o`/`gpt-4o-mini` and typical analyses cost a few cents each.

---

## 4. Clerk — Authentication

| Var(s) | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` |
|---|---|
| Used by | `apps/web` middleware, providers, webhooks |
| Required? | No — set `LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY=1` for demo mode (auth bypassed; uses `DEMO_USER_ID`) |

### Free tier
**[Clerk](https://clerk.com/pricing)** — free up to **10,000 monthly active users**. Plenty for development and early launch.

1. Sign up → create application.
2. **API Keys** → copy publishable + secret keys.
3. **Webhooks** → add endpoint `https://yourdomain/api/webhooks/clerk`, subscribe to `user.created`, `user.updated`, `user.deleted` → copy signing secret into `CLERK_WEBHOOK_SECRET`.

### Alternative: Supabase Auth
Uncomment the `NEXT_PUBLIC_SUPABASE_*` block in `.env.example`. Free tier: 50k MAUs.

---

## 5. Stripe — Payments

| Var(s) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_STUDIO_STARTER_PRICE_ID`, `STRIPE_STUDIO_RESELLER_PRICE_ID`, `STRIPE_GUARD_MONTHLY_PRICE_ID` |
|---|---|
| Used by | `/billing`, `/api/webhooks/stripe` |
| Required? | Only if you exercise the billing flow |

### Free / test mode
**[Stripe](https://dashboard.stripe.com/register)** is **free in test mode forever**. No card needed to get test keys.

1. Sign up → toggle **Test mode** (top right).
2. **Developers → API keys** → copy `pk_test_...` and `sk_test_...`.
3. **Products** → create 3 products with recurring prices, copy each price ID into the matching `STRIPE_*_PRICE_ID`.
4. Local webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

Live-mode fees only apply once you go live (2.9% + 30p UK).

---

## 6. eBay Developer Program

| Var(s) | `EBAY_APP_ID`, `EBAY_CERT_ID`, `EBAY_DEV_ID`, `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_ENV` |
|---|---|
| Used by | eBay sandbox publishing (`packages/marketplace`) |
| Required? | Only for the eBay export flow |

### Free
**[eBay Developers Program](https://developer.ebay.com/signin)** is free. Sign in with your eBay account → **My Account → Application Keysets** → create a **Sandbox** keyset (also create Production when ready). `EBAY_ENV=sandbox` for development.

---

## 7. Sentry — Error & Performance Monitoring

| Var(s) | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
|---|---|
| Used by | `@sentry/nextjs` instrumentation, source-map upload at build time |
| Required? | No — instrumentation no-ops without a DSN |

### Free tier
**[Sentry Developer plan](https://sentry.io/pricing/)** — free: 5k errors/mo, 10k performance units, 50 replays. Sign up → create a **Next.js** project → copy DSN. For source-maps in CI, create an **Auth Token** with `project:releases` + `project:write` scopes (Settings → Account → Auth Tokens) and put it in `SENTRY_AUTH_TOKEN` as a *secret* in Vercel/Netlify (never commit).

---

## 8. PostHog — Product Analytics (optional)

| Var(s) | `POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
|---|---|
| Used by | Funnel/feature usage analytics |
| Required? | No |

### Free tier
**[PostHog Cloud](https://posthog.com/pricing)** — free: 1M events/mo + 5k session recordings. EU + US regions available. Project → **Settings → Project API Key**.

---

## 9. Axiom — Log Drain (optional)

| Var(s) | `AXIOM_TOKEN`, `AXIOM_DATASET` |
|---|---|
| Used by | Structured log shipping |
| Required? | No |

### Free tier
**[Axiom](https://axiom.co/pricing)** — free: 0.5 TB/mo ingest, 30-day retention. Sign up → create dataset `listlens` → **Settings → API tokens** → ingest token.

---

## 10. App URL & build flags

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Absolute base URL used for OG images, webhooks, redirects. `http://localhost:3000` for dev. |
| `LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY` | `1` lets `next build` succeed without a real Clerk key (CI/dev). **Never set in production.** |
| `LISTLENS_ENV` | `production` rejects the placeholder Clerk key even if the flag above leaks in. |

---

## Quick-start: copy & fill

```bash
cp .env.example apps/web/.env.local
# then edit apps/web/.env.local with the keys you actually have
```

`.env*` (other than `.env.example`) is gitignored — your secrets will not be committed.

For a one-command demo with **no API keys at all**, set:
```bash
LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY=1
```
The app boots in demo mode (auth bypassed, AI returns mock data when `OPENAI_API_KEY` is unset).
