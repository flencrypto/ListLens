# Production readiness — tracked follow-ups

This file tracks the remaining sections of the production-readiness plan that
were not shipped in the initial slice. The shipped slice is documented in
`docs/deploy.md`. Sections below are roughly ordered by user-impact.

## #2 — DB-backed persistence (in progress)

The in-memory `apps/web/src/lib/store.ts` still backs item ownership, item
metadata, AI analysis output and Guard reports. The Prisma schema already has
`Item`, `ItemAnalysis`, `GuardCheck` and friends; ~15 API routes need to be
refactored to read/write through Prisma scoped to the caller's workspace.

Acceptance: deleting `store.ts` causes no test failures; restarting the web
server preserves listings and Guard reports.

## #5 — AI safety + observability

* Persist every AI run as an `AiJobRun` row with prompt version, model id,
  schema version, raw output, parsed output, warnings, latency, token usage,
  estimated cost, confidence, user, workspace.
* Add request-level timeouts and a circuit breaker for OpenAI failures.
* Add OpenAI moderation pre-check on user-supplied free text (hint, seller
  questions input).
* Extend `sanitiseSafeLanguage` coverage to Studio "condition notes" and Lens
  specialist outputs.

## #6 — Background jobs

* Move long-running AI/CV/marketplace work from API routes into the existing
  BullMQ queues in `apps/worker`.
* Add `/api/jobs/[id]` endpoint and a `useJobStatus` client hook.
* Add idempotency keys, retry with backoff, dead-letter queue and job-status
  persistence.
* Add a Dockerfile + Fly.io/Railway deploy doc for `apps/worker`.

## #7 — Marketplace connectors

* eBay: real OAuth refresh, response Zod validation, error mapping, feature
  flag for live publish (off by default), tests for token refresh and 401
  retry.
* Vinted: lock to export-only; add a unit test asserting any direct publish
  path returns 501.
* Implement `GET /api/marketplaces/capabilities` and drive UI button
  visibility from it.

## #9 — Observability

* Wire Sentry in `apps/web` (server + client) and `apps/worker`; tag releases
  with the git SHA.
* Ship structured logs (pino) to Axiom/Better Stack with PII redaction.
* Add OpenTelemetry traces around AI calls, DB queries and marketplace calls.
* Wire PostHog feature flags.

## #10 — Performance & reliability

* Audit per-route runtime (Edge for read-only public pages, Node for
  AI/Stripe/Prisma routes).
* Memoise lens registry, pricing comps, category routing.
* Add `revalidate` / `cache: 'no-store'` consciously per route.

## #11 — Accessibility & UX polish

* Audit components for keyboard nav, focus rings, ARIA labels.
* Honour `prefers-reduced-motion` in Framer Motion variants.
* Add an error boundary + branded 404/500 pages.
* Add toast-based safe error messages distinct from technical logs.

## #12 — Testing & CI gates

* Raise coverage on critical paths (Stripe webhook, marketplace formatters,
  ownership checks, MeasureLens geometry).
* Add Playwright E2E for: sign-in → create item → analyse → export Vinted,
  and paste URL → Guard report.
* Add `npm audit --omit=dev`, CodeQL, `prisma migrate diff --exit-code` and
  bundle-size checks to CI.

## #13 — Deployment automation

* `vercel.json` for `apps/web` with regions and per-route function memory
  and timeout (AI routes: 60s / 1024MB).
* Dockerfile for `apps/worker` and `fly.toml` (or chosen provider).
* Runbooks under `docs/runbooks/` (Stripe webhook failures, AI quota
  exhaustion, queue backlog, DB failover).
* Release script that tags `v0.1.0`, generates a changelog and stamps Sentry
  releases.
