# Marketplace policy

ListLens is committed to operating within the terms of every marketplace it integrates with. This document captures hard rules that all contributors and integrations MUST follow.

## What we never do

- We do not scrape marketplace HTML or run headless browsers against marketplace surfaces.
- We do not auto-publish, auto-edit, auto-relist or auto-delete listings without explicit user confirmation.
- We do not bypass marketplace rate limits, paywalls or authentication flows.
- We do not store or transmit marketplace credentials we are not licensed to hold.
- We do not falsely describe an item as authentic, mint, first pressing, original, or guaranteed working without evidence and explicit user confirmation.

## Per-marketplace rules

### eBay

- Use **only** the official eBay APIs (Sell, Browse, Buy, Trading where applicable) under a registered application and a valid OAuth grant.
- Live publishing is gated behind a feature flag and is off by default.
- Sandbox and draft payload generation is the default path.

### Vinted

- ListLens does **not** integrate with any unofficial Vinted API.
- The only supported export path is **CSV/JSON download** initiated by the seller. Any direct publish endpoint must return HTTP 501.
- The browser extension may pre-fill the seller's manual listing form but must never auto-submit.

### Discogs / MusicBrainz / Open Library / Google Books

- Use only the public APIs at the documented rate limits, with attribution where required.

### All other marketplaces

- Until a connector is documented in `packages/marketplace/`, ListLens treats the marketplace as **Guard-only** (analysis from user-provided URL/screenshots) and **manual export only** for sellers.

## Browser extension safety

- The extension never reads or transmits marketplace data without a user-initiated click.
- Network requests originating from the extension are scoped to ListLens domains and the explicitly opted-in marketplace.
- A "what data is sent" preview is shown before transmission.
- A kill switch in the extension popup disables all listing capture.

## Reporting policy violations

If you spot code or behaviour that contradicts this policy, open an issue with the `policy:violation` label or escalate privately to the maintainers.
