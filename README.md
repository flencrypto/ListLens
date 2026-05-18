# ListLens

ListLens is the parent marketplace-intelligence workspace for the LENS app family.

## Apps

- `artifacts/listlens` - primary ListLens web artifact.
- `apps/extension` - browser extension package.
- `apps/solelens` - SoleLens footwear intelligence app for scan, identification, authenticity-risk, grading, pricing, and resale-listing workflows.

## SoleLens

Run the SoleLens app from the workspace root:

```bash
pnpm install
pnpm dev:solelens
```

Build or serve the production bundle:

```bash
pnpm build:solelens
pnpm start:solelens
```
