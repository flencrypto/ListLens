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
  const params = new URLSearchParams({ type: "release", per_page: "5" });
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
