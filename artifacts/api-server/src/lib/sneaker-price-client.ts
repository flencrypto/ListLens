/**
 * sneaker-price-client.ts — Real-Time Sneaker Prices via RapidAPI
 *
 * Used by ShoeLens to enrich AI price estimates with live resale market data
 * (StockX/GOAT aggregates), mirroring the Chrono24 pattern used by WatchLens.
 *
 * Required env var: RAPIDAPI_SNEAKER_KEY
 */

import { logger } from "./logger";

const SNEAKER_API_HOST = "real-time-sneaker-prices.p.rapidapi.com";
const SNEAKER_SEARCH_URL = `https://${SNEAKER_API_HOST}/v1/sneakers`;

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

export interface SneakerMarketResult {
  source: "Real-Time Sneaker Prices";
  search_query: string;
  listing_count: number;
  price_min_gbp: number | null;
  price_median_gbp: number | null;
  price_max_gbp: number | null;
  source_listings: number;
  currency: "GBP";
}

type JsonObject = Record<string, unknown>;

function asObject(v: unknown): JsonObject | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as JsonObject) : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function toGbp(price: number, currency: string): number {
  const rate = GBP_FX[currency.toUpperCase()] ?? null;
  if (rate === null) return price;
  return Math.round(price * rate);
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

function extractPricesFromResponse(json: unknown): number[] {
  const root = asObject(json);
  if (!root) return [];

  const prices: number[] = [];

  const extractFromItem = (item: unknown): void => {
    const obj = asObject(item);
    if (!obj) return;

    const currency =
      asString(obj["currency"]) ??
      asString(asObject(obj["market"])?.["currency"]) ??
      "USD";

    const rawPrice =
      asNumber(obj["retailPrice"]) ??
      asNumber(obj["lowestAsk"]) ??
      asNumber(obj["highestBid"]) ??
      asNumber(obj["lastSale"]) ??
      asNumber(asObject(obj["market"])?.["lowestAsk"]) ??
      asNumber(asObject(obj["market"])?.["lastSale"]) ??
      asNumber(obj["price"]);

    if (rawPrice !== null && rawPrice > 0) {
      prices.push(toGbp(rawPrice, currency));
    }
  };

  for (const key of ["results", "data", "items", "sneakers"]) {
    const child = root[key];
    if (Array.isArray(child)) {
      child.forEach(extractFromItem);
      if (prices.length > 0) return prices;
    }
    const nested = asObject(child);
    if (nested) {
      for (const nestedKey of ["results", "items", "sneakers"]) {
        const arr = nested[nestedKey];
        if (Array.isArray(arr)) {
          arr.forEach(extractFromItem);
          if (prices.length > 0) return prices;
        }
      }
    }
  }

  extractFromItem(root);

  return prices;
}

const cache = new Map<string, { result: SneakerMarketResult; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

export async function fetchSneakerMarketPrice(
  styleCode: string | null,
  brandModel: string | null,
): Promise<SneakerMarketResult | null> {
  const apiKey = process.env["RAPIDAPI_SNEAKER_KEY"];

  if (!apiKey) {
    logger.debug(
      "[sneaker-price-client] RAPIDAPI_SNEAKER_KEY not set — skipping sneaker market lookup.",
    );
    return null;
  }

  const queryParts = [styleCode, brandModel].filter(Boolean);
  if (queryParts.length === 0) {
    logger.debug("[sneaker-price-client] No style code or model to search — skipping.");
    return null;
  }

  const searchQuery = (styleCode ?? brandModel ?? "").trim();

  const cached = cache.get(searchQuery);
  if (cached && cached.expiresAt > Date.now()) {
    logger.debug({ searchQuery }, "[sneaker-price-client] Returning cached result.");
    return cached.result;
  }

  const params = new URLSearchParams({
    query: searchQuery,
    limit: "20",
  });

  const url = `${SNEAKER_SEARCH_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": SNEAKER_API_HOST,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      logger.warn(
        { status: response.status, statusText: response.statusText, searchQuery },
        "[sneaker-price-client] Real-Time Sneaker Prices search failed.",
      );
      return null;
    }

    const json = (await response.json()) as unknown;

    const prices = extractPricesFromResponse(json);
    const { min, median, max } = computePriceStats(prices);

    const result: SneakerMarketResult = {
      source: "Real-Time Sneaker Prices",
      search_query: searchQuery,
      listing_count: prices.length,
      price_min_gbp: min,
      price_median_gbp: median,
      price_max_gbp: max,
      source_listings: prices.length,
      currency: "GBP",
    };

    logger.info(
      {
        searchQuery,
        listingCount: prices.length,
        priceMin: min,
        priceMedian: median,
        priceMax: max,
      },
      "[sneaker-price-client] Real-Time Sneaker Prices search complete.",
    );

    cache.set(searchQuery, { result, expiresAt: Date.now() + CACHE_TTL_MS });

    return result;
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error), searchQuery },
      "[sneaker-price-client] Real-Time Sneaker Prices lookup errored.",
    );
    return null;
  }
}
