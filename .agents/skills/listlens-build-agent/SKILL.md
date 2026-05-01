---
name: listlens-build-agent
description: Product intelligence for the Mr.FLENS · List-LENS platform. Load when building, extending, reviewing or debugging any part of the ListLens codebase — Studio, Guard, Lenses, marketplace connectors, AI pipeline, billing, or browser extension. Contains architecture principles, specialist Lens specs, AI trust rules, marketplace roadmap, and React/Next.js performance rules.
---

# ListLens Build Agent

Full product and engineering context for the **Mr.FLENS · List-LENS** resale intelligence platform.

Core promise: **List smarter. Buy safer.**

For the full reference document (1 277 lines), see:
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

Currently implemented or partially implemented:
`RecordLens`, `LPLens`, `ShoeLens`, `ClothingLens`, `CardLens`, `ToyLens`, `WatchLens`, `MeasureLens`, `MotorLens`

Roadmap: `TechLens`, `BookLens`, `AntiquesLens`, `AutographLens`

---

## AI Architecture — Key Principles

Build a **layered intelligence pipeline**, not one monolithic prompt:

```
Photos / URL
→ Capture Agent → Quality Agent → Category Router
→ Identity Agent → Evidence Agent → Specialist Lens Agent
→ Comps Agent → Pricing Agent → Risk & Trust Agent
→ Copy Agent → Validator Agent → Adjudicator Agent
→ Human review
```

- All AI outputs must be **schema-validated** (Zod).
- Every AI job must store: prompt version, model, schema version, output, warnings, cost estimate, confidence.
- Use the cheapest reliable model. Escalate only when confidence is low, evidence conflicts, or item value is high.

---

## Trust & Safety Rules (non-negotiable)

**Never say:**
- "This is fake."
- "This seller is scamming."
- "This is definitely genuine / authentic."
- "First pressing / mint / rare" — unless evidence + user confirmation support it.

**Always use:**
- "High replica-risk indicators found."
- "Authenticity cannot be confirmed from available evidence."
- "Likely version: UK 1997 issue family, 72% confidence from label photo."
- "This is an AI-assisted risk screen, not formal authentication."

Never auto-publish or export listings without **human review**.

---

## RecordLens — First POC Lens (most important)

Single-label photo must return **ranked version likelihoods**, not one overconfident answer:

```json
{
  "top_match": { "likely_release": "UK 1997 double LP", "likelihood_percent": 72 },
  "alternate_matches": [{ "likely_release": "Later EU reissue", "likelihood_percent": 18 }],
  "needs_matrix_for_clarification": true
}
```

Matrix/runout clarification flow is essential — always offer it when confidence < 80 %.

---

## Current API Endpoints

```
POST /api/items
POST /api/items/:id/analyse
GET  /api/items/:id/analysis
POST /api/guard/checks
POST /api/guard/checks/:id/analyse
GET  /api/guard/checks/:id
POST /api/storage/uploads/request-url   (presigned URL)
GET  /api/storage/*                     (object proxy)
POST /api/billing/checkout              (Stripe)
POST /api/webhooks/stripe
```

---

## Key Performance Rules (summary)

| Priority | Rule |
|---|---|
| CRITICAL | Eliminate waterfalls — `Promise.all()` for independent ops |
| CRITICAL | Bundle splitting — dynamic import for heavy Lens/CV/editor code |
| HIGH | Server Actions must re-authenticate internally, never trust middleware alone |
| MEDIUM | Avoid re-renders in photo upload — use local state / refs per photo tile |
| MEDIUM | Use transitions for filtering listing history |
| LOW | Defer analytics/PostHog events with `after()` / idle callbacks |

---

## Data Model (minimum)

`users · workspaces · items · item_photos · item_analyses · listings · comparable_sales · guard_checks · guard_findings · payments · usage_events`

---

## Build Phase Priorities

1. **POC** — Studio, Guard, RecordLens, eBay draft, Vinted export, Stripe, Analytics
2. **MVP** — ShoeLens, ClothingLens, BookLens, CardLens, Browser Extension v1, Discogs
3. **Expansion** — TechLens, ToyLens, WatchLens, AntiquesLens, Etsy/Shopify
4. **Scale** — MotorLens, multi-marketplace publish, bulk tools, US markets

---

## Full Reference

All specialist Lens field specs, full AI agent role table, marketplace roadmap, React/Next.js performance rules with examples, and the complete build plan are in:

`.agents/skills/listlens-build-agent/reference/full-agent.md`
