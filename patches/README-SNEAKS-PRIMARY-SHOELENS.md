# #95 update — Make Sneaks API the primary ShoeLens sneaker database

This update changes the integration plan so ShoeLens uses **Sneaks API** as the primary sneaker metadata source, with **KicksCrew** kept as an optional by-URL enrichment source.

## Install

From the API server package:

```bash
npm install sneaks-api@1.2.3
```

If the repo uses workspaces, run the install from the workspace root using the API server workspace selector, for example:

```bash
npm install sneaks-api@1.2.3 -w artifacts/api-server
```

Adjust the workspace name/path if your package name differs.

---

## New source priority

Use this lookup order in ShoeLens Studio:

```text
1. Sneaks API — primary source
   Used when a style code, SKU, product name, model hint, or OCR-derived trainer identity is available.

2. KicksCrew — optional URL enrichment
   Used only when the user provides a KicksCrew product URL.

3. User/image evidence only
   Used when no external sneaker database candidate is available.
```

This is better than a KicksCrew-first flow because KicksCrew's current endpoint is by-product-URL only, while Sneaks API can be used as a broader sneaker lookup source for model/style-code style matching.

---

## Environment variables

Sneaks API does **not** require an API key.

Keep the KicksCrew key optional:

```bash
RAPIDAPI_KICKSCREW_KEY=
```

If `RAPIDAPI_KICKSCREW_KEY` is absent, the KicksCrew enrichment client should skip gracefully and return `null`.

---

## Add Sneaks source to ShoeIdentificationInput

In `artifacts/api-server/src/lib/shoe-identification-agent.ts`, add `SneaksAPI` to the marketplace candidate source union.

Example:

```ts
source:
  | "StockX"
  | "GOAT"
  | "eBay"
  | "Vinted"
  | "Nike"
  | "Adidas"
  | "KicksCrew"
  | "SneaksAPI"
  | "Other";
```

Recommended candidate shape:

```ts
export interface ShoeMarketplaceCandidate {
  source:
    | "StockX"
    | "GOAT"
    | "eBay"
    | "Vinted"
    | "Nike"
    | "Adidas"
    | "KicksCrew"
    | "SneaksAPI"
    | "Other";
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

## Create `sneaks-client.ts`

Add a new API server module:

`artifacts/api-server/src/lib/sneaks-client.ts`

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */

type SneaksApiConstructor = new () => {
  getProducts: (query: string, limit: number, callback: (error: unknown, products: any[]) => void) => void;
};

export interface SneaksProduct {
  source: "SneaksAPI";
  name: string;
  brand: string | null;
  colourway: string | null;
  sku: string | null;
  style_code: string | null;
  retail_price: number | null;
  currency: string;
  image_url: string | null;
  product_url: string | null;
  sizes: string[];
  raw: unknown;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function mapSneaksProduct(product: any): SneaksProduct | null {
  const name = firstString(product?.shoeName, product?.name, product?.title);
  if (!name) return null;

  const imageLinks = product?.imageLinks ?? product?.images ?? {};
  const imageUrl = firstString(
    imageLinks?.original,
    imageLinks?.small,
    imageLinks?.thumbnail,
    Array.isArray(product?.media?.imageUrl) ? product.media.imageUrl[0] : product?.media?.imageUrl,
    product?.thumbnail,
  );

  const retailPrice = numberOrNull(product?.retailPrice ?? product?.retail_price ?? product?.price);

  return {
    source: "SneaksAPI",
    name,
    brand: firstString(product?.brand, product?.make),
    colourway: firstString(product?.colorway, product?.colourway, product?.color),
    sku: firstString(product?.styleID, product?.styleId, product?.sku),
    style_code: firstString(product?.styleID, product?.styleId, product?.sku),
    retail_price: retailPrice,
    currency: "GBP",
    image_url: imageUrl,
    product_url: firstString(product?.url, product?.stockX, product?.goat, product?.flightClub),
    sizes: [],
    raw: product,
  };
}

export async function searchSneaksProducts(query: string, limit = 5): Promise<SneaksProduct[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  try {
    const mod = await import("sneaks-api");
    const SneaksAPI = ((mod as any).default ?? mod) as SneaksApiConstructor;
    const sneaks = new SneaksAPI();

    return await new Promise((resolve) => {
      sneaks.getProducts(cleanQuery, limit, (error, products) => {
        if (error || !Array.isArray(products)) {
          resolve([]);
          return;
        }

        resolve(products.map(mapSneaksProduct).filter(Boolean) as SneaksProduct[]);
      });
    });
  } catch {
    return [];
  }
}
```

---

## Inject Sneaks API before KicksCrew in `routes/listlens.ts`

Add imports:

```ts
import { searchSneaksProducts } from "../lib/sneaks-client";
import { fetchKicksCrewByUrl } from "../lib/kickscrew-client";
```

Before calling `runShoeIdentificationAgent(...)`, build a primary sneaker query from the strongest available signal:

```ts
const kickscrewUrl = typeof req.body?.kickscrewUrl === "string"
  ? req.body.kickscrewUrl.trim()
  : "";

const styleCode = typeof req.body?.styleCode === "string"
  ? req.body.styleCode.trim()
  : "";

const productHint = typeof req.body?.productHint === "string"
  ? req.body.productHint.trim()
  : "";

const userHint = typeof req.body?.userHint === "string"
  ? req.body.userHint.trim()
  : "";

const sneaksQuery = styleCode || productHint || userHint;

const sneaksProducts = sneaksQuery
  ? await searchSneaksProducts(sneaksQuery, 5)
  : [];

const sneaksCandidates = sneaksProducts.map((product, index) => ({
  source: "SneaksAPI" as const,
  title: product.name,
  brand: product.brand,
  model_name: product.name,
  colourway: product.colourway,
  colorway: product.colourway,
  sku: product.sku,
  style_code: product.style_code ?? product.sku,
  retail_price: product.retail_price,
  price: product.retail_price,
  currency: product.currency,
  sizes: product.sizes,
  image_url: product.image_url,
  product_url: product.product_url,
  confidence_hint: index === 0 ? 0.74 : 0.62,
  evidence: [
    "Fetched from Sneaks API primary sneaker lookup.",
    product.style_code || product.sku ? `Style/SKU: ${product.style_code ?? product.sku}` : null,
    product.colourway ? `Colourway: ${product.colourway}` : null,
    product.retail_price !== null ? `Retail/MSRP: ${product.currency} ${product.retail_price}` : null,
  ].filter(Boolean) as string[],
}));

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
      evidence: ["Fetched from KicksCrew RapidAPI by product URL."],
    }
  : null;

const marketplaceCandidates = [
  ...sneaksCandidates,
  ...(kickscrewCandidate ? [kickscrewCandidate] : []),
  ...(Array.isArray(req.body?.marketplace_candidates) ? req.body.marketplace_candidates : []),
];
```

Then pass `marketplaceCandidates` into `runShoeIdentificationAgent(...)`.

Recommended response additions:

```ts
analysis: {
  ...analysis,
  sneaker_data_source: sneaksCandidates.length ? "SneaksAPI" : kickscrewCandidate ? "KicksCrew" : "ImageEvidenceOnly",
  sneaks_products: sneaksProducts,
  kickscrew_product: kickscrewProduct,
  marketplace_candidates: marketplaceCandidates,
}
```

---

## SoleLens UI wording change

The optional URL field should no longer look like the main data path. Rename it from:

```text
KicksCrew product URL optional
```

to:

```text
KicksCrew URL optional enrichment
```

Add/keep a normal product hint field for Sneaks API:

```tsx
<label className="space-y-2 text-sm">
  <span className="font-medium text-slate-200">
    Product / style code hint <span className="text-slate-500">optional</span>
  </span>
  <input
    value={productHint}
    onChange={(event) => setProductHint(event.target.value)}
    placeholder="e.g. Nike Dunk Low Panda DD1391-100"
    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
  />
</label>
```

Send both fields to the Studio API:

```ts
productHint: productHint.trim() || undefined,
kickscrewUrl: kickscrewUrl.trim() || undefined,
```

Display source label priority:

```ts
const liveSource = displaySneaker.source === "SneaksAPI"
  ? "Live Sneaks API data"
  : displaySneaker.source === "KicksCrew"
    ? "Live KicksCrew enrichment"
    : "Demo fallback";
```

---

## Updated done state

Done now looks like:

- `sneaks-api@1.2.3` installed in the API server.
- `sneaks-client.ts` created as the primary sneaker product lookup client.
- `SneaksAPI` added to `ShoeIdentificationInput.marketplace_candidates.source`.
- Studio ShoeLens branch queries Sneaks API first from `styleCode`, `productHint`, or `userHint`.
- KicksCrew remains optional enrichment when a `kickscrewUrl` is supplied.
- SoleLens UI treats product/style-code hint as the main external-data input.
- KicksCrew URL field remains optional and clearly labelled as enrichment.
