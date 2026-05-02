import { logger } from "./logger";

const KICKSCREW_RAPIDAPI_HOST = "kickscrew-sneakers-data.p.rapidapi.com";
const KICKSCREW_BY_URL_ENDPOINT = `https://${KICKSCREW_RAPIDAPI_HOST}/description/byurl`;

export interface KickCrewProduct {
  source: "KicksCrew";
  name: string;
  brand: string | null;
  colourway: string | null;
  sku: string | null;
  style_code: string | null;
  retail_price: number | null;
  currency: string | null;
  sizes: string[];
  image_url: string | null;
  product_url: string;
}

type JsonObject = Record<string, unknown>;

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
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const parsed = asString(value);
    if (parsed) return parsed;
  }
  return null;
}

function pickNestedString(root: JsonObject, paths: string[][]): string | null {
  for (const path of paths) {
    let cursor: unknown = root;
    for (const key of path) {
      const obj = asObject(cursor);
      cursor = obj ? obj[key] : undefined;
    }
    const parsed = asString(cursor);
    if (parsed) return parsed;
  }
  return null;
}

function pickNestedNumber(root: JsonObject, paths: string[][]): number | null {
  for (const path of paths) {
    let cursor: unknown = root;
    for (const key of path) {
      const obj = asObject(cursor);
      cursor = obj ? obj[key] : undefined;
    }
    const parsed = asNumber(cursor);
    if (parsed !== null) return parsed;
  }
  return null;
}

function parseSizes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === "string" || typeof entry === "number") return String(entry);
      const obj = asObject(entry);
      return firstString(
        obj?.["size"],
        obj?.["us"],
        obj?.["uk"],
        obj?.["eu"],
        obj?.["label"],
        obj?.["name"],
      );
    })
    .filter((size): size is string => Boolean(size));
}

function parseImageUrl(root: JsonObject): string | null {
  const direct = pickNestedString(root, [
    ["image_url"],
    ["image"],
    ["thumbnail"],
    ["main_image"],
    ["product", "image_url"],
    ["product", "image"],
    ["data", "image_url"],
    ["data", "image"],
  ]);
  if (direct) return direct;

  const imageArrays = [root["images"], asObject(root["product"])?.["images"], asObject(root["data"])?.["images"]];
  for (const images of imageArrays) {
    if (!Array.isArray(images) || images.length === 0) continue;
    const first = images[0];
    if (typeof first === "string") return first;
    const firstObj = asObject(first);
    const url = firstString(firstObj?.["url"], firstObj?.["src"], firstObj?.["image_url"]);
    if (url) return url;
  }

  return null;
}

function unwrapPayload(json: unknown): JsonObject | null {
  const root = asObject(json);
  if (!root) return null;

  // RapidAPI responses vary between providers. Try the common wrapper keys first,
  // then fall back to the root object.
  for (const key of ["data", "result", "product", "description"]) {
    const child = asObject(root[key]);
    if (child) return child;
  }

  return root;
}

export function normaliseKicksCrewProduct(json: unknown, productUrl: string): KickCrewProduct | null {
  const payload = unwrapPayload(json);
  if (!payload) return null;

  const name = pickNestedString(payload, [
    ["name"],
    ["title"],
    ["product_name"],
    ["product", "name"],
    ["product", "title"],
  ]);

  if (!name) return null;

  const brand = pickNestedString(payload, [
    ["brand"],
    ["brand_name"],
    ["manufacturer"],
    ["product", "brand"],
  ]);

  const colourway = pickNestedString(payload, [
    ["colourway"],
    ["colorway"],
    ["colour"],
    ["color"],
    ["product", "colourway"],
    ["product", "colorway"],
  ]);

  const styleCode = pickNestedString(payload, [
    ["style_code"],
    ["styleCode"],
    ["style"],
    ["sku"],
    ["product", "style_code"],
    ["product", "sku"],
  ]);

  const sku = pickNestedString(payload, [
    ["sku"],
    ["style_code"],
    ["styleCode"],
    ["product", "sku"],
    ["product", "style_code"],
  ]);

  const retailPrice = pickNestedNumber(payload, [
    ["retail_price"],
    ["retailPrice"],
    ["price"],
    ["msrp"],
    ["product", "retail_price"],
    ["product", "price"],
  ]);

  const currency = pickNestedString(payload, [
    ["currency"],
    ["retail_currency"],
    ["product", "currency"],
  ]);

  const sizes = parseSizes(
    payload["sizes"] ??
      payload["available_sizes"] ??
      payload["size_options"] ??
      asObject(payload["product"])?.["sizes"],
  );

  return {
    source: "KicksCrew",
    name,
    brand,
    colourway,
    sku,
    style_code: styleCode,
    retail_price: retailPrice,
    currency,
    sizes,
    image_url: parseImageUrl(payload),
    product_url: productUrl,
  };
}

export async function fetchKicksCrewByUrl(productUrl: string): Promise<KickCrewProduct | null> {
  const apiKey = process.env["RAPIDAPI_KICKSCREW_KEY"];

  if (!apiKey) {
    logger.warn("[kickscrew-client] RAPIDAPI_KICKSCREW_KEY is not set; skipping KicksCrew lookup.");
    return null;
  }

  const trimmedUrl = productUrl.trim();
  if (!trimmedUrl) return null;

  try {
    // Validate early so we do not send accidental junk to RapidAPI.
    new URL(trimmedUrl);
  } catch {
    logger.warn({ productUrl }, "[kickscrew-client] Invalid KicksCrew product URL; skipping lookup.");
    return null;
  }

  const target = `${KICKSCREW_BY_URL_ENDPOINT}?url=${encodeURIComponent(trimmedUrl)}`;

  try {
    const response = await fetch(target, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": KICKSCREW_RAPIDAPI_HOST,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      logger.warn(
        { status: response.status, statusText: response.statusText },
        "[kickscrew-client] KicksCrew lookup failed.",
      );
      return null;
    }

    const json = (await response.json()) as unknown;
    return normaliseKicksCrewProduct(json, trimmedUrl);
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error) },
      "[kickscrew-client] KicksCrew lookup errored.",
    );
    return null;
  }
}
