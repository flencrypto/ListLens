# listlens-agents

Repo-ready scaffold for the ListLens agent swarm.

ListLens is an AI **resale intelligence and trust layer** for marketplaces such
as eBay and Vinted. It has two product surfaces:

- **ListLens Studio** — seller-side listing creation from photos.
- **ListLens Guard** — buyer-side listing risk checks before purchase.

Specialist category modules are called **Lenses** (RecordLens, SoleLens,
WatchLens, CardLens, ToyLens, etc.).

## Operating principle

1. Evidence first.
2. Confidence second.
3. Action third.
4. Never certainty without proof.

## Folder layout

```
listlens-agents/
  core/         # base swarm, routing, evidence + confidence primitives
  lenses/       # one module per specialist Lens (Studio + Guard variants)
  retrieval/    # vector store, similarity search, reference data
  hoardlens/    # multi-item / video frame triage agent
  tests/        # router, RecordLens, safe wording stubs
```

## Status

These files are **prototype scaffolds**. Each module marks production vs
prototype sections clearly and uses `# TODO(production)` / `# PLACEHOLDER`
markers so they can be filled in without changing the public API.

The scaffold is intentionally framework-agnostic (no FastAPI / Flask / Django
imports) so it can be wired into the existing TypeScript backend via a thin
adapter, or run standalone for experiments.

## Non-negotiables enforced here

- Risk and confidence are **separate** fields.
- Missing evidence is a **first-class** output, never silently dropped.
- Safe wording is applied **before** any user-visible Guard text leaves a Lens.
- MotorLens is **excluded** from the default registry; opt-in only.
- No formal authentication claims. No seller accusations. No price-implies-fake
  shortcuts.

See `core/safe_wording.py` (imported by `core/base_swarm.py`) for the
post-processor that rewrites unsafe phrasing.

## File naming note

The original outline used hyphenated filenames (e.g. `base-swarm.py`). Python
cannot `import` modules whose names contain hyphens, so the files on disk use
**underscores** (`base_swarm.py`, `lens_router.py`, …). Module boundaries and
public API are otherwise exactly as specified.

## Running the tests

```bash
cd listlens-agents
python -m unittest discover -s tests -v
```

The tests are deterministic stubs — no network, no LLM calls.
