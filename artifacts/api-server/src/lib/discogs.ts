import OAuth from "oauth-1.0a";
import crypto from "node:crypto";
import { logger } from "./logger";

const DISCOGS_BASE = "https://api.discogs.com";
const USER_AGENT = "MrFLENS-ListLens/1.0 +https://mrflens.com";

function makeOAuth(): OAuth {
  const key = process.env["DISCOGS_CONSUMER_KEY"]!;
  const secret = process.env["DISCOGS_CONSUMER_SECRET"]!;
  return new OAuth({
    consumer: { key, secret },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, signingKey) {
      return crypto
        .createHmac("sha1", signingKey)
        .update(baseString)
        .digest("base64");
    },
  });
}

async function discogsGet<T>(path: string): Promise<T> {
  const url = `${DISCOGS_BASE}${path}`;
  const oauth = makeOAuth();
  const requestData = { url, method: "GET" };
  const authHeader = oauth.toHeader(oauth.authorize(requestData));

  const res = await fetch(url, {
    headers: {
      Authorization: authHeader["Authorization"],
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Discogs ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface DiscogsSearchResult {
  id: number;
  title: string;
  label?: string[];
  catno?: string;
  year?: string;
  country?: string;
  format?: string[];
  cover_image?: string;
  thumb?: string;
  resource_url: string;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  artists?: { name: string }[];
  labels?: { name: string; catno: string }[];
  formats?: { name: string; descriptions?: string[] }[];
  year?: number;
  country?: string;
  tracklist?: { position: string; title: string; duration: string }[];
  community?: {
    have: number;
    want: number;
    rating?: { average: number; count: number };
  };
  lowest_price?: number;
  num_for_sale?: number;
  images?: { type: string; uri: string; width: number; height: number }[];
  notes?: string;
}

export async function searchDiscogs(query: {
  artist?: string | null;
  title?: string | null;
  catno?: string | null;
  label?: string | null;
}): Promise<DiscogsSearchResult[]> {
  const params = new URLSearchParams({ type: "release", per_page: "8" });
  if (query.artist) params.set("artist", query.artist);
  if (query.title) params.set("release_title", query.title);
  if (query.catno) params.set("catno", query.catno);
  if (query.label) params.set("label", query.label);

  const path = `/database/search?${params.toString()}`;
  try {
    const data = await discogsGet<{ results: DiscogsSearchResult[] }>(path);
    return data.results ?? [];
  } catch (err) {
    logger.warn({ err }, "Discogs search failed — returning empty results");
    return [];
  }
}

export async function getDiscogsRelease(
  releaseId: number
): Promise<DiscogsRelease | null> {
  try {
    return await discogsGet<DiscogsRelease>(`/releases/${releaseId}`);
  } catch (err) {
    logger.warn({ err, releaseId }, "Discogs release fetch failed — skipping enrichment");
    return null;
  }
}

/**
 * enrichDiscogsResults — fetches up to 4 Discogs release records in parallel.
 *
 * Used by the pressing identification pipeline to give the Identification Agent
 * full year / country / format / tracklist data for every candidate, not just
 * the top-ranked result.
 */
export async function enrichDiscogsResults(ids: number[]): Promise<DiscogsRelease[]> {
  const releases = await Promise.all(
    ids.slice(0, 4).map((id) => getDiscogsRelease(id).catch(() => null)),
  );
  return releases.filter((r): r is DiscogsRelease => r !== null);
}

/**
 * searchDiscogsViaMatrix — priority-one search when the user provides matrix/runout text.
 *
 * Matrix etchings uniquely identify a pressing, so when the user supplies them
 * as corrections we search Discogs with the matrix text as a free-text query.
 * This cuts through ambiguous label/catno matches and finds the exact pressing.
 *
 * @param matrixText  Combined matrix text (e.g. "HARVEST 1 A-1 // B-1")
 * @param perPage     Number of results to request (default 8)
 */
export async function searchDiscogsViaMatrix(
  matrixText: string,
  perPage = 8,
): Promise<DiscogsSearchResult[]> {
  const trimmed = matrixText.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({
    type: "release",
    per_page: String(perPage),
    q: trimmed,
  });
  const path = `/database/search?${params.toString()}`;
  try {
    const data = await discogsGet<{ results: DiscogsSearchResult[] }>(path);
    return data.results ?? [];
  } catch (err) {
    logger.warn({ err, matrixText: trimmed.slice(0, 60) }, "Discogs matrix search failed — returning empty results");
    return [];
  }
}
