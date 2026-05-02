# #95 — KicksCrew API Integration for ShoeLens

This patch pack contains the new API client plus paste-ready edits for the missing repo files.

## Important repo note
The uploaded `api-server.zip` does **not** include these target files:

- `artifacts/api-server/src/lib/shoe-identification-agent.ts`
- `artifacts/api-server/src/routes/listlens.ts`
- `artifacts/listlens/src/pages/lenses/Sole.tsx`

So the only file I can provide as a complete drop-in file from the available repo is:

- `artifacts/api-server/src/lib/kickscrew-client.ts`

The blocks below are the exact edits to apply to the missing files when you have the full repo open.

---

## 1. Add env var

Add to `.env.example`:

```bash
RAPIDAPI_KICKSCREW_KEY=
```

Do **not** commit the real key.

---

## 2. Add KicksCrew source to `shoe-identification-agent.ts`

Find the marketplace candidate source union and add `"KicksCrew"`.

Example:

```ts
export type ShoeMarketplaceSource =
  | "StockX"
  | "GOAT"
  | "eBay"
  | "Vinted"
  | "KicksCrew"
  | "Manual"
  | "Unknown";
```

If the type is inline instead, change this:

```ts
source: "StockX" | "GOAT" | "eBay" | "Vinted" | "Manual" | "Unknown";
```

to:

```ts
source: "StockX" | "GOAT" | "eBay" | "Vinted" | "KicksCrew" | "Manual" | "Unknown";
```

Recommended candidate fields if your interface allows them:

```ts
export interface ShoeMarketplaceCandidate {
  source: "StockX" | "GOAT" | "eBay" | "Vinted" | "KicksCrew" | "Manual" | "Unknown";
  title?: string | null;
  brand?: string | null;
  model_name?: string | null;
  colourway?: string | null;
  colorway?: string | null;
  sku?: string | null;
  style_code?: string | null;
  retail_price?: number | null;
  price?: number | null;
  currency?: string | null;
  sizes?: string[];
  image_url?: string | null;
  product_url?: string | null;
  evidence?: string[];
  confidence_hint?: number;
}
```

---

## 3. Inject KicksCrew in `routes/listlens.ts`

Add import near the other lib imports:

```ts
import { fetchKicksCrewByUrl } from "../lib/kickscrew-client";
```

Inside the ShoeLens branch of Studio `/analyse`, before `runShoeIdentificationAgent(...)`, add:

```ts
const kickscrewUrl = typeof req.body?.kickscrewUrl === "string"
  ? req.body.kickscrewUrl.trim()
  : "";

const kickscrewProduct = kickscrewUrl
  ? await fetchKicksCrewByUrl(kickscrewUrl)
  : null;

const kickscrewCandidate = kickscrewProduct
  ? {
      source: "KicksCrew" as const,
      title: kickscrewProduct.name,
      brand: kickscrewProduct.brand,
      model_name: kickscrewProduct.name,
      colourway: kickscrewProduct.colourway,
      colorway: kickscrewProduct.colourway,
      sku: kickscrewProduct.sku,
      style_code: kickscrewProduct.style_code ?? kickscrewProduct.sku,
      retail_price: kickscrewProduct.retail_price,
      price: kickscrewProduct.retail_price,
      currency: kickscrewProduct.currency,
      sizes: kickscrewProduct.sizes,
      image_url: kickscrewProduct.image_url,
      product_url: kickscrewProduct.product_url,
      confidence_hint: 0.72,
      evidence: [
        "Fetched from KicksCrew RapidAPI by product URL.",
        kickscrewProduct.style_code || kickscrewProduct.sku
          ? `Style/SKU: ${kickscrewProduct.style_code ?? kickscrewProduct.sku}`
          : null,
        kickscrewProduct.colourway ? `Colourway: ${kickscrewProduct.colourway}` : null,
        kickscrewProduct.retail_price !== null
          ? `Retail price: ${kickscrewProduct.currency ?? ""} ${kickscrewProduct.retail_price}`.trim()
          : null,
      ].filter(Boolean) as string[],
    }
  : null;
```

Then when constructing the input passed to `runShoeIdentificationAgent`, prepend the candidate:

```ts
const marketplaceCandidates = [
  ...(kickscrewCandidate ? [kickscrewCandidate] : []),
  ...(Array.isArray(req.body?.marketplace_candidates) ? req.body.marketplace_candidates : []),
];

const shoeInput = {
  ...existingShoeInput,
  marketplace_candidates: marketplaceCandidates,
};

const shoeResult = await runShoeIdentificationAgent(shoeInput);
```

If your code builds the object inline, the minimum change is:

```ts
marketplace_candidates: [
  ...(kickscrewCandidate ? [kickscrewCandidate] : []),
  ...(existingMarketplaceCandidates ?? []),
],
```

Recommended response addition so SoleLens can surface the live data cleanly:

```ts
res.json({
  ...existingResponsePayload,
  kickscrew_product: kickscrewProduct,
});
```

If the route already returns `analysis`, attach it there instead:

```ts
analysis: {
  ...analysis,
  kickscrew_product: kickscrewProduct,
},
```

---

## 4. Add `kickscrewUrl` input to `Sole.tsx`

Add state near the other form state:

```tsx
const [kickscrewUrl, setKickscrewUrl] = useState("");
```

Add this input in the capture/input section:

```tsx
<label className="space-y-2 text-sm">
  <span className="font-medium text-slate-200">KicksCrew product URL <span className="text-slate-500">optional</span></span>
  <input
    value={kickscrewUrl}
    onChange={(event) => setKickscrewUrl(event.target.value)}
    placeholder="Paste a KicksCrew product URL"
    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
  />
</label>
```

When calling the Studio API, include:

```ts
kickscrewUrl: kickscrewUrl.trim() || undefined,
```

Example:

```ts
const response = await fetch("/api/listlens/analyse", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    lens: "ShoeLens",
    mode: "studio",
    images,
    userHint,
    kickscrewUrl: kickscrewUrl.trim() || undefined,
  }),
});
```

---

## 5. Surface live KicksCrew data in `Sole.tsx`

Add a helper after your result state:

```tsx
const kickscrewCandidate = analysisResult?.marketplace_candidates?.find(
  (candidate: any) => candidate?.source === "KicksCrew",
);

const kickscrewProduct = analysisResult?.kickscrew_product ?? kickscrewCandidate;

const displaySneaker = {
  name: kickscrewProduct?.name ?? kickscrewProduct?.title ?? demoSneaker.name,
  brand: kickscrewProduct?.brand ?? demoSneaker.brand,
  colourway: kickscrewProduct?.colourway ?? kickscrewProduct?.colorway ?? demoSneaker.colourway,
  sku: kickscrewProduct?.style_code ?? kickscrewProduct?.sku ?? demoSneaker.sku,
  retailPrice: kickscrewProduct?.retail_price ?? kickscrewProduct?.price ?? demoSneaker.retailPrice,
  currency: kickscrewProduct?.currency ?? demoSneaker.currency ?? "GBP",
  imageUrl: kickscrewProduct?.image_url ?? demoSneaker.imageUrl,
  sizes: kickscrewProduct?.sizes ?? demoSneaker.sizes ?? [],
  source: kickscrewProduct ? "KicksCrew" : "Demo",
};
```

Then replace hardcoded demo fields with:

```tsx
{displaySneaker.imageUrl ? (
  <img src={displaySneaker.imageUrl} alt={displaySneaker.name} className="h-full w-full object-cover" />
) : null}

<h3>{displaySneaker.name}</h3>
<p>{displaySneaker.brand}</p>
<p>{displaySneaker.colourway}</p>
<p>{displaySneaker.sku}</p>
<p>
  {displaySneaker.currency} {displaySneaker.retailPrice ?? "—"}
</p>

{displaySneaker.source === "KicksCrew" ? (
  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-300/20">
    Live KicksCrew data
  </span>
) : null}
```

---

## 6. Optional response shape contract

For easiest UI mapping, the API response should include:

```ts
{
  analysis: {
    marketplace_candidates: [
      {
        source: "KicksCrew",
        title: string,
        brand: string | null,
        colourway: string | null,
        sku: string | null,
        style_code: string | null,
        retail_price: number | null,
        currency: string | null,
        sizes: string[],
        image_url: string | null,
        product_url: string
      }
    ]
  },
  kickscrew_product: {
    source: "KicksCrew",
    name: string,
    brand: string | null,
    colourway: string | null,
    sku: string | null,
    style_code: string | null,
    retail_price: number | null,
    currency: string | null,
    sizes: string[],
    image_url: string | null,
    product_url: string
  } | null
}
```
