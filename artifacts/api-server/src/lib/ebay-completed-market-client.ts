import { logger } from "./logger";

const EBAY_COMPLETED_ITEMS_HOST = "ebay-average-selling-price.p.rapidapi.com";
const EBAY_COMPLETED_ITEMS_URL = `https://${EBAY_COMPLETED_ITEMS_HOST}/findCompletedItems`;
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_SIZE = 200;

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

type JsonObject = Record<string, unknown>;

export interface EbayCompletedAspectInput {
  name: string;
  value: string;
}

export interface EbayCompletedSearchInput {
  keywords: string;
  excludedKeywords?: string | null;
  categoryId?: string | null;
  aspects?: EbayCompletedAspectInput[];
  maxSearchResults?: number;
  siteId?: string;
}

export interface EbayCompletedMarketResult {
  source: "eBay Completed Items";
  search_query: string;
  listing_count: number;
  price_min_gbp: number | null;
  price_median_gbp: number | null;
  price_max_gbp: number | null;
  average_price_gbp: number | null;
  currency: "GBP";
  category_id: string | null;
  excluded_keywords: string | null;
  aspects_applied: EbayCompletedAspectInput[];
}

interface CacheEntry {
  expiresAt: number;
  result: EbayCompletedMarketResult;
}

const cache = new Map<string, CacheEntry>();

function evictCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  const obj = asObject(value);
  if (!obj) return null;
  return (
    asNumber(obj["value"]) ??
    asNumber(obj["amount"]) ??
    asNumber(obj["price"])
  );
}

function toGbp(price: number, currency: string | null): number {
  if (!currency) return Math.round(price);
  const rate = GBP_FX[currency.toUpperCase()] ?? null;
  return Math.round(rate === null ? price : price * rate);
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

function extractArray(root: JsonObject): unknown[] {
  for (const key of [
    "items",
    "results",
    "data",
    "completedItems",
    "completed_items",
    "listings",
  ]) {
    const child = root[key];
    if (Array.isArray(child)) return child;
    const nested = asObject(child);
    if (nested) {
      for (const nestedKey of ["items", "results", "completedItems", "completed_items", "listings"]) {
        const arr = nested[nestedKey];
        if (Array.isArray(arr)) return arr;
      }
    }
  }
  return [];
}

function extractPriceFromItem(item: unknown): number | null {
  const obj = asObject(item);
  if (!obj) return null;

  const currency =
    asString(obj["currency"]) ??
    asString(asObject(obj["price"])?.["currency"]) ??
    asString(asObject(obj["sellingStatus"])?.["currentPrice"] && asObject(asObject(obj["sellingStatus"])?.["currentPrice"])?.["currencyId"]) ??
    asString(obj["currency_code"]);

  const rawPrice =
    asNumber(obj["soldPrice"]) ??
    asNumber(obj["price"]) ??
    asNumber(obj["value"]) ??
    asNumber(obj["averagePrice"]) ??
    asNumber(obj["salePrice"]) ??
    asNumber(asObject(obj["sellingStatus"])?.["currentPrice"]) ??
    asNumber(asObject(obj["price"])?.["value"]);

  if (rawPrice === null || rawPrice <= 0) return null;
  return toGbp(rawPrice, currency);
}

function extractAggregatePrice(root: JsonObject, keys: string[]): number | null {
  for (const key of keys) {
    const value = asNumber(root[key]);
    if (value !== null && value > 0) return value;
  }

  for (const key of ["data", "summary", "stats", "meta"]) {
    const nested = asObject(root[key]);
    if (!nested) continue;
    for (const candidate of keys) {
      const value = asNumber(nested[candidate]);
      if (value !== null && value > 0) return value;
    }
  }

  return null;
}

function extractListingCount(root: JsonObject, fallbackCount: number): number {
  const direct =
    asNumber(root["count"]) ??
    asNumber(root["total"]) ??
    asNumber(root["totalCount"]) ??
    asNumber(root["itemCount"]);

  if (direct !== null && direct >= 0) return Math.round(direct);

  for (const key of ["data", "summary", "stats", "meta"]) {
    const nested = asObject(root[key]);
    if (!nested) continue;
    const nestedCount =
      asNumber(nested["count"]) ??
      asNumber(nested["total"]) ??
      asNumber(nested["totalCount"]) ??
      asNumber(nested["itemCount"]);
    if (nestedCount !== null && nestedCount >= 0) return Math.round(nestedCount);
  }

  return fallbackCount;
}

function normaliseCacheKey(input: EbayCompletedSearchInput): string {
  return JSON.stringify({
    keywords: input.keywords.trim().toLowerCase(),
    excludedKeywords: input.excludedKeywords?.trim().toLowerCase() ?? null,
    categoryId: input.categoryId ?? null,
    aspects: (input.aspects ?? [])
      .map((aspect) => ({ name: aspect.name.trim().toLowerCase(), value: aspect.value.trim().toLowerCase() }))
      .sort((a, b) => `${a.name}:${a.value}`.localeCompare(`${b.name}:${b.value}`)),
    maxSearchResults: input.maxSearchResults ?? 120,
    siteId: input.siteId ?? "3",
  });
}

function resolveRapidApiKey(): string | null {
  return process.env["RAPIDAPI_EBAY_COMPLETED_KEY"]
    ?? process.env["RAPIDAPI_WATCH_KEY"]
    ?? process.env["RAPIDAPI_SNEAKER_KEY"]
    ?? process.env["RAPIDAPI_KICKSCREW_KEY"]
    ?? null;
}

export async function fetchEbayCompletedMarketPrice(
  input: EbayCompletedSearchInput,
): Promise<EbayCompletedMarketResult | null> {
  const apiKey = resolveRapidApiKey();
  if (!apiKey) {
    logger.debug(
      "[ebay-completed-market-client] No RapidAPI key configured — skipping eBay completed-items lookup.",
    );
    return null;
  }

  const keywords = input.keywords.trim();
  if (!keywords) return null;

  evictCache();

  const cacheKey = normaliseCacheKey(input);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    logger.debug({ keywords }, "[ebay-completed-market-client] Returning cached completed-items result.");
    return cached.result;
  }
  if (cached) cache.delete(cacheKey);

  const payload = {
    keywords,
    excluded_keywords: input.excludedKeywords?.trim() || undefined,
    max_search_results: String(input.maxSearchResults ?? 120),
    category_id: input.categoryId?.trim() || undefined,
    remove_outliers: "true",
    site_id: input.siteId ?? "3",
    aspects: (input.aspects ?? [])
      .filter((aspect) => aspect.name.trim() && aspect.value.trim())
      .map((aspect) => ({ name: aspect.name.trim(), value: aspect.value.trim() })),
  };

  try {
    const response = await fetch(EBAY_COMPLETED_ITEMS_URL, {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": EBAY_COMPLETED_ITEMS_HOST,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      logger.warn(
        { status: response.status, statusText: response.statusText, keywords },
        "[ebay-completed-market-client] eBay completed-items lookup failed.",
      );
      return null;
    }

    const text = await response.text();
    const parsed = JSON.parse(text) as unknown;
    const root = asObject(parsed);
    if (!root) return null;

    const arrayPrices = extractArray(root)
      .map(extractPriceFromItem)
      .filter((price): price is number => price !== null && price > 0);

    const stats = computePriceStats(arrayPrices);
    const average = extractAggregatePrice(root, ["averagePrice", "avgPrice", "average", "meanPrice"]);
    const median = extractAggregatePrice(root, ["medianPrice", "median", "medianSoldPrice"]);
    const min = extractAggregatePrice(root, ["minPrice", "lowestPrice"]);
    const max = extractAggregatePrice(root, ["maxPrice", "highestPrice"]);

    const listingCount = extractListingCount(root, arrayPrices.length);

    const result: EbayCompletedMarketResult = {
      source: "eBay Completed Items",
      search_query: keywords,
      listing_count: listingCount,
      price_min_gbp: stats.min ?? (min !== null ? Math.round(min) : null),
      price_median_gbp: stats.median ?? (median !== null ? Math.round(median) : null),
      price_max_gbp: stats.max ?? (max !== null ? Math.round(max) : null),
      average_price_gbp: average !== null ? Math.round(average) : stats.median,
      currency: "GBP",
      category_id: payload.category_id ?? null,
      excluded_keywords: payload.excluded_keywords ?? null,
      aspects_applied: payload.aspects,
    };

    if (result.listing_count === 0 && result.price_median_gbp === null) {
      return null;
    }

    logger.info(
      {
        keywords,
        listingCount: result.listing_count,
        priceMin: result.price_min_gbp,
        priceMedian: result.price_median_gbp,
        priceMax: result.price_max_gbp,
      },
      "[ebay-completed-market-client] eBay completed-items lookup complete.",
    );

    cache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error), keywords },
      "[ebay-completed-market-client] eBay completed-items lookup errored.",
    );
    return null;
  }
}