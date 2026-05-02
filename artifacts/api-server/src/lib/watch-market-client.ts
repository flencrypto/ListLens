/**
 * watch-market-client.ts — Chrono24 market data via RapidAPI
 *
 * Used by WatchLens to enrich AI price estimates with real pre-owned
 * market listings, similar to how discogs.ts backs RecordLens and
 * kickscrew-client.ts backs ShoeLens.
 *
 * Required env var: RAPIDAPI_WATCH_KEY
 */

import { logger } from "./logger";

const CHRONO24_HOST = "chrono24-api.p.rapidapi.com";
const CHRONO24_SEARCH_URL = `https://${CHRONO24_HOST}/search`;

const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_SIZE = 200;

interface CacheEntry {
  result: WatchMarketResult;
  expiresAt: number;
}

const searchCache = new Map<string, CacheEntry>();

function evictSearchCache(): void {
  const now = Date.now();
  for (const [key, entry] of searchCache) {
    if (entry.expiresAt <= now) searchCache.delete(key);
  }
  if (searchCache.size >= CACHE_MAX_SIZE) {
    const oldest = searchCache.keys().next().value;
    if (oldest !== undefined) searchCache.delete(oldest);
  }
}

function normaliseCacheKey(brand: string | null, modelOrReference: string | null): string {
  return [brand, modelOrReference]
    .filter(Boolean)
    .map((s) => s!.trim().toLowerCase())
    .join(" ");
}

const GBP_FX: Record<string, number> = {
  GBP: 1.0,
  EUR: 0.86,
  USD: 0.79,
  CHF: 0.89,
  JPY: 0.0052,
  SGD: 0.59,
  HKD: 0.10,
  AUD: 0.52,
  CAD: 0.58,
};

export interface WatchMarketListing {
  source: "Chrono24";
  listing_id: string | null;
  title: string | null;
  brand: string | null;
  model: string | null;
  reference_number: string | null;
  price_gbp: number | null;
  currency_original: string;
  price_original: number | null;
  year_of_production: number | null;
  condition: string | null;
  case_material: string | null;
  listing_url: string | null;
}

export interface WatchMarketResult {
  source: "Chrono24";
  search_query: string;
  listing_count: number;
  total_count: number;
  price_min_gbp: number | null;
  price_median_gbp: number | null;
  price_max_gbp: number | null;
  currency: "GBP";
  listings: WatchMarketListing[];
}

type JsonObject = Record<string, unknown>;

function asObject(v: unknown): JsonObject | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as JsonObject) : null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toGbp(price: number, currency: string): number {
  const rate = GBP_FX[currency.toUpperCase()] ?? null;
  if (rate === null) return price;
  return Math.round(price * rate);
}

function extractListingsArray(json: unknown): unknown[] {
  const root = asObject(json);
  if (!root) return [];

  for (const key of [
    "listings",
    "results",
    "items",
    "watches",
    "data",
  ]) {
    const child = root[key];
    if (Array.isArray(child)) return child;
    const nested = asObject(child);
    if (nested) {
      for (const nestedKey of ["listings", "results", "items", "watches"]) {
        if (Array.isArray(nested[nestedKey])) return nested[nestedKey] as unknown[];
      }
    }
  }

  return [];
}

function extractTotalCount(json: unknown): number {
  const root = asObject(json);
  if (!root) return 0;

  const top = asNumber(root["totalCount"] ?? root["total"] ?? root["count"] ?? root["total_count"]);
  if (top !== null) return top;

  const nested =
    asObject(root["data"]) ??
    asObject(root["meta"]) ??
    asObject(root["pagination"]);
  if (nested) {
    const n = asNumber(
      nested["totalCount"] ?? nested["total"] ?? nested["count"] ?? nested["total_count"],
    );
    if (n !== null) return n;
  }

  return 0;
}

function parseListing(entry: unknown): WatchMarketListing | null {
  const obj = asObject(entry);
  if (!obj) return null;

  const priceRaw =
    asNumber(obj["price"]) ??
    asNumber(asObject(obj["price"])?.["amount"]) ??
    asNumber(obj["retailPrice"]) ??
    asNumber(obj["listPrice"]);

  const currency =
    asString(obj["currency"]) ??
    asString(asObject(obj["price"])?.["currency"]) ??
    "EUR";

  const priceGbp = priceRaw !== null ? toGbp(priceRaw, currency) : null;

  const id =
    asString(obj["id"]) ??
    asString(obj["listingId"]) ??
    asString(obj["watchId"]);

  const title =
    asString(obj["title"]) ??
    asString(obj["name"]) ??
    asString(obj["watchTitle"]);

  const brand =
    asString(obj["brand"]) ??
    asString(obj["manufacturer"]) ??
    asString(asObject(obj["brand"])?.["name"]);

  const model =
    asString(obj["model"]) ??
    asString(obj["modelName"]) ??
    asString(obj["name"]);

  const reference =
    asString(obj["referenceNumber"]) ??
    asString(obj["reference"]) ??
    asString(obj["ref"]) ??
    asString(obj["sku"]);

  const year = asNumber(obj["yearOfProduction"] ?? obj["year"] ?? obj["productionYear"]);

  const condition =
    asString(obj["condition"]) ??
    asString(obj["watchCondition"]) ??
    asString(obj["itemCondition"]);

  const caseMaterial =
    asString(obj["caseMaterial"]) ??
    asString(obj["case_material"]) ??
    asString(obj["material"]);

  const listingUrl =
    asString(obj["url"]) ??
    asString(obj["watchUrl"]) ??
    asString(obj["listingUrl"]) ??
    asString(obj["link"]);

  return {
    source: "Chrono24",
    listing_id: id,
    title,
    brand,
    model,
    reference_number: reference,
    price_gbp: priceGbp,
    currency_original: currency,
    price_original: priceRaw,
    year_of_production: year !== null ? Math.round(year) : null,
    condition,
    case_material: caseMaterial,
    listing_url: listingUrl,
  };
}

function computePriceStats(prices: number[]): {
  min: number | null;
  median: number | null;
  max: number | null;
} {
  if (prices.length === 0) return { min: null, median: null, max: null };
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? Math.round(((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2)
      : sorted[mid]!;
  return {
    min: sorted[0] ?? null,
    median,
    max: sorted[sorted.length - 1] ?? null,
  };
}

export async function searchWatchMarket(
  brand: string | null,
  modelOrReference: string | null,
): Promise<WatchMarketResult | null> {
  const apiKey = process.env["RAPIDAPI_WATCH_KEY"];

  if (!apiKey) {
    logger.debug("[watch-market-client] RAPIDAPI_WATCH_KEY not set — skipping market lookup.");
    return null;
  }

  const queryParts = [brand, modelOrReference].filter(Boolean);
  if (queryParts.length === 0) {
    logger.debug("[watch-market-client] No brand or model to search — skipping.");
    return null;
  }

  const searchQuery = queryParts.join(" ").trim();
  const cacheKey = normaliseCacheKey(brand, modelOrReference);

  evictSearchCache();

  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    logger.debug({ cacheKey, searchQuery }, "[watch-market-client] Cache HIT — returning cached Chrono24 result.");
    return cached.result;
  }
  if (cached) {
    searchCache.delete(cacheKey);
  }
  logger.debug({ cacheKey, searchQuery }, "[watch-market-client] Cache MISS — fetching from Chrono24.");

  const params = new URLSearchParams({
    query: searchQuery,
    currency: "GBP",
    limit: "20",
  });

  const url = `${CHRONO24_SEARCH_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": CHRONO24_HOST,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      logger.warn(
        { status: response.status, statusText: response.statusText, searchQuery },
        "[watch-market-client] Chrono24 search failed.",
      );
      return null;
    }

    const json = (await response.json()) as unknown;

    const rawListings = extractListingsArray(json);
    const totalCount = extractTotalCount(json);

    const listings: WatchMarketListing[] = rawListings
      .map(parseListing)
      .filter((l): l is WatchMarketListing => l !== null);

    const gbpPrices = listings
      .map((l) => l.price_gbp)
      .filter((p): p is number => p !== null && p > 0);

    const { min, median, max } = computePriceStats(gbpPrices);

    logger.info(
      {
        searchQuery,
        listingCount: listings.length,
        totalCount,
        priceMin: min,
        priceMedian: median,
        priceMax: max,
      },
      "[watch-market-client] Chrono24 search complete.",
    );

    const result: WatchMarketResult = {
      source: "Chrono24",
      search_query: searchQuery,
      listing_count: listings.length,
      total_count: totalCount || listings.length,
      price_min_gbp: min,
      price_median_gbp: median,
      price_max_gbp: max,
      currency: "GBP",
      listings,
    };

    searchCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });

    return result;
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error), searchQuery },
      "[watch-market-client] Chrono24 lookup errored.",
    );
    return null;
  }
}
