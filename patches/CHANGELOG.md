# #95 ShoeLens sneaker data patch

## Updated direction

ShoeLens should now use **Sneaks API** as the primary sneaker database lookup source:

```bash
npm install sneaks-api@1.2.3
```

KicksCrew remains as an optional by-URL enrichment source when the user supplies a KicksCrew product URL.

## Patched/generated files in this pack

- `artifacts/api-server/src/lib/kickscrew-client.ts` — optional RapidAPI client for `/description/byurl`, gracefully returns `null` when the key is missing or the request fails.
- `artifacts/api-server/src/lib/shoe-identification-agent.ts` — currently patched for `KicksCrew`; needs `SneaksAPI` added to the same candidate source union.
- `artifacts/api-server/src/routes/listlens.ts` — currently patched for `kickscrewUrl`; update per `README-SNEAKS-PRIMARY-SHOELENS.md` so Sneaks API runs first.
- `artifacts/listlens/src/pages/lenses/Sole.tsx` — currently patched with a KicksCrew URL field; update wording and add/use a product/style-code hint field as the primary lookup input.
- `.env.example.addition` — keep `RAPIDAPI_KICKSCREW_KEY=` only for optional KicksCrew enrichment.
- `patches/README-SNEAKS-PRIMARY-SHOELENS.md` — new source-of-truth docs for Sneaks-first implementation.

## Required next code patch

Create:

```text
artifacts/api-server/src/lib/sneaks-client.ts
```

Then update the Studio ShoeLens branch to build candidates in this order:

```text
SneaksAPI candidates
KicksCrew candidate, if URL supplied
User-provided marketplace candidates
```

## Notes

- Sneaks API does not require an API key.
- KicksCrew stays optional because the current KicksCrew endpoint is by-URL only.
- The UI should still fall back to the existing demo sneaker when no live source returns a usable candidate.
