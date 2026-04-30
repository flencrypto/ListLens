# Deploying ListLens

This doc captures the **secrets, services, and steps** required to take ListLens to a real production deploy. It is the operator-facing companion to the in-repo build/CI workflow.

## 1. Required services

| Service | Purpose | Notes |
| --- | --- | --- |
| Vercel (or any Node runtime host) | Serves `apps/web` | `output: "standalone"` is enabled |
| Neon / Supabase Postgres | Primary database | Use the pooler URL for `DATABASE_URL`, the direct URL for `DIRECT_URL` |
| Upstash Redis (REST) | Rate-limit store + future queue | REST endpoint is used by `apps/web`; BullMQ uses `REDIS_URL` |
| Stripe | Subscriptions + credits | Live keys + webhook endpoint pointing at `/api/webhooks/stripe` |
| Clerk | Authentication | Webhook endpoint pointing at `/api/webhooks/clerk` (Svix-signed) |
| OpenAI | AI vision/text | `gpt-4o` is the default model in `apps/web/src/lib/ai/*` |
| eBay Developer Portal | Sandbox/draft API | Production keys gated behind a feature flag (off by default) |
| Sentry, PostHog, Axiom | Observability | Optional in dev, required in production |

## 2. Secrets

Copy `.env.production.example` and fill every field. Each variable is validated by `apps/web/src/lib/env.ts` at boot.

The build refuses to ship the placeholder Clerk key whenever `LISTLENS_ENV=production` or `VERCEL_ENV=production`. Set `LISTLENS_ENV=production` on real deploys.

## 3. Database setup

```bash
# Apply migrations
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma

# (Optional) seed reference data
DATABASE_URL=$DIRECT_URL npx tsx packages/db/prisma/seed.ts
```

`DATABASE_URL` should point at the pooler in production; `DIRECT_URL` is used for migrations to avoid pooler protocol limits.

Run `CREATE EXTENSION IF NOT EXISTS vector;` in the database once if you intend to use embeddings.

## 4. Webhooks

| Provider | Path | Verification |
| --- | --- | --- |
| Stripe | `POST /api/webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` |
| Clerk | `POST /api/webhooks/clerk` | `CLERK_WEBHOOK_SECRET` (Svix) |

Both routes are exempt from auth via the middleware allow-list. Stripe events are deduplicated by `stripeEventId` in the `StripeEvent` table.

## 5. Build & deploy

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
```

Vercel: the `apps/web` build script generates the Prisma client first, then runs `next build`. The `headers()` block in `next.config.ts` sets HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy on every response.

For self-hosted deploys, the standalone output is at `apps/web/.next/standalone/`. Worker images are built from `apps/worker/`.

## 6. Health checks

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Liveness — no external dependencies |
| `GET /api/ready` | Readiness — pings DB and (if configured) Upstash |

Set the load balancer / platform health check to `/api/ready` and the liveness probe to `/api/health`.

## 7. Rate limiting

`apps/web/src/lib/rate-limit.ts` uses Upstash Redis when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set, otherwise a process-local sliding window. Configure Upstash before scaling beyond a single instance.

## 8. Production cut-over checklist

- [ ] All secrets in `.env.production.example` are populated.
- [ ] `prisma migrate deploy` has been run against the production database.
- [ ] Stripe webhook endpoint is registered and a `checkout.session.completed` test event has been delivered.
- [ ] Clerk webhook endpoint is registered and a test `user.created` event has been delivered.
- [ ] `LISTLENS_ENV=production` is set; `LISTLENS_ALLOW_PLACEHOLDER_CLERK_KEY` is **unset**.
- [ ] `/api/ready` returns 200 from outside the cluster.
- [ ] Sentry has received a release marker for the deploy SHA.
- [ ] PostHog event volume is non-zero after a smoke test.

## 9. Known follow-ups

See `docs/production-readiness.md` for sections of the production-readiness plan that are tracked but not yet shipped (worker queue migration, full Sentry/PostHog wiring, Playwright E2E, etc.).
