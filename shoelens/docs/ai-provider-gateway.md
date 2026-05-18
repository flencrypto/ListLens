# AI Provider Gateway

SoleLens is an AI-powered footwear intelligence app backed by `XAI_API` and `OPENAI_API`.

These keys must live in the backend/API gateway, not in the browser. The React app should call first-party routes, and those routes should decide when to use xAI, OpenAI, classical vision models, OCR, pgvector search, or human review.

## Provider Responsibilities

| Provider | Environment variable | Primary role |
| --- | --- | --- |
| xAI API | `XAI_API` | Visual reasoning, anomaly triage, inspection assist |
| OpenAI API | `OPENAI_API` | Structured reports, listing copy, explanations, support summaries |

## Suggested Routes

```text
POST /api/ai/scan-analysis
POST /api/ai/listing-draft
POST /api/ai/expert-summary
```

## Production Rules

- Never send raw API keys to the mobile app or browser dashboard.
- Store provider request/response metadata in audit logs.
- Keep authenticity claims evidence-based and confidence-scored.
- Route high-value, low-confidence, or disputed scans to human review.
- Treat LLM output as explanation and workflow support, not as the source of truth for authenticity.
