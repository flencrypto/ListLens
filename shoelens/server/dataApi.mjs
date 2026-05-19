import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { providerStatus } from "./aiApi.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "public", "data", "solelens-catalog.json");

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}

function loadCatalog() {
  if (!existsSync(catalogPath)) {
    return null;
  }
  return JSON.parse(readFileSync(catalogPath, "utf8"));
}

function summarizeReadiness(catalog) {
  const providers = providerStatus();
  const marketplaceFeeds = catalog?.marketplaceFeeds ?? {
    enabled: false,
    reason: "No catalog has been generated yet.",
    requiredForProductionComps: [],
  };

  return {
    ok: true,
    catalog: {
      available: Boolean(catalog),
      catalogPath: "/data/solelens-catalog.json",
      profiles: catalog?.summary?.profileCount ?? 0,
      referenceImages: catalog?.summary?.imageCount ?? 0,
      extractedSamples: catalog?.summary?.sampleImageCount ?? 0,
      corruptFiles: catalog?.summary?.corruptFileCount ?? 0,
      brands: catalog?.summary?.brands ?? [],
      sourceArchive: catalog?.summary?.sourceArchive ?? null,
    },
    aiProviders: providers,
    marketplaceFeeds,
    productionStatus: {
      referenceCatalog: Boolean(catalog?.summary?.profileCount),
      liveAi: providers.openai || providers.xai,
      liveMarketplaceComps: Boolean(marketplaceFeeds.enabled),
    },
  };
}

export async function handleDataApiRequest(req, res) {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith("/api/data/")) {
    return false;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return true;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return true;
  }

  try {
    const catalog = loadCatalog();

    if (url.pathname === "/api/data/readiness") {
      sendJson(res, 200, summarizeReadiness(catalog));
      return true;
    }

    if (url.pathname === "/api/data/catalog") {
      if (!catalog) {
        sendJson(res, 503, { ok: false, error: "SoleLens catalog has not been generated" });
        return true;
      }

      sendJson(res, 200, {
        ok: true,
        schemaVersion: catalog.schemaVersion,
        summary: catalog.summary,
        profiles: catalog.profiles,
        marketplaceFeeds: catalog.marketplaceFeeds,
      });
      return true;
    }

    const profileMatch = url.pathname.match(/^\/api\/data\/catalog\/([^/]+)$/);
    if (profileMatch) {
      if (!catalog) {
        sendJson(res, 503, { ok: false, error: "SoleLens catalog has not been generated" });
        return true;
      }

      const id = decodeURIComponent(profileMatch[1]);
      const profile = catalog.profiles.find((item) => item.id === id || item.className === id);
      if (!profile) {
        sendJson(res, 404, { ok: false, error: "Catalog profile not found" });
        return true;
      }

      sendJson(res, 200, { ok: true, profile });
      return true;
    }

    sendJson(res, 404, { ok: false, error: "Unknown data API route" });
    return true;
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
    return true;
  }
}
