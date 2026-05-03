import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface MarketplaceEntry {
  name: string;
  hostnames: Set<string>;
  pathPattern: RegExp;
}

const MARKETPLACE_ALLOWLIST: MarketplaceEntry[] = [
  {
    name: "eBay",
    hostnames: new Set([
      "www.ebay.com", "ebay.com",
      "www.ebay.co.uk", "ebay.co.uk",
      "www.ebay.de", "ebay.de",
      "www.ebay.fr", "ebay.fr",
      "www.ebay.es", "ebay.es",
      "www.ebay.it", "ebay.it",
      "www.ebay.com.au", "ebay.com.au",
      "www.ebay.ca", "ebay.ca",
      "www.ebay.nl", "ebay.nl",
    ]),
    pathPattern: /^\/(itm|p|i)\//,
  },
  {
    name: "Depop",
    hostnames: new Set(["www.depop.com", "depop.com"]),
    pathPattern: /^\/products\//,
  },
  {
    name: "Vinted",
    hostnames: new Set([
      "www.vinted.co.uk", "vinted.co.uk",
      "www.vinted.com", "vinted.com",
      "www.vinted.fr", "vinted.fr",
      "www.vinted.de", "vinted.de",
      "www.vinted.es", "vinted.es",
      "www.vinted.nl", "vinted.nl",
      "www.vinted.pl", "vinted.pl",
      "www.vinted.be", "vinted.be",
      "www.vinted.lu", "vinted.lu",
      "www.vinted.at", "vinted.at",
      "www.vinted.cz", "vinted.cz",
      "www.vinted.sk", "vinted.sk",
      "www.vinted.hu", "vinted.hu",
      "www.vinted.lt", "vinted.lt",
      "www.vinted.lv", "vinted.lv",
      "www.vinted.ee", "vinted.ee",
      "www.vinted.pt", "vinted.pt",
    ]),
    pathPattern: /^\/(items|l)\//,
  },
  {
    name: "Etsy",
    hostnames: new Set(["www.etsy.com", "etsy.com"]),
    pathPattern: /^\/listing\//,
  },
  {
    name: "Poshmark",
    hostnames: new Set([
      "www.poshmark.com", "poshmark.com",
      "www.poshmark.ca", "poshmark.ca",
      "www.poshmark.com.au", "poshmark.com.au",
      "www.poshmark.co.uk", "poshmark.co.uk",
    ]),
    pathPattern: /^\//,
  },
];

function detectMarketplaceFromParsed(hostname: string, pathname: string): string | null {
  for (const entry of MARKETPLACE_ALLOWLIST) {
    if (entry.hostnames.has(hostname) && entry.pathPattern.test(pathname)) {
      return entry.name;
    }
  }
  return null;
}

function isAllowedHost(hostname: string): boolean {
  for (const entry of MARKETPLACE_ALLOWLIST) {
    if (entry.hostnames.has(hostname)) return true;
  }
  return false;
}

function isPrivateHost(hostname: string): boolean {
  if (hostname === "localhost") return true;
  const ipv4Private = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.|0\.)/;
  if (ipv4Private.test(hostname)) return true;
  if (hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd")) return true;
  return false;
}

function extractOgImage(html: string): string | null {
  const match =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (match?.[1]) return match[1];
  return null;
}

const extractSchema = z.object({
  url: z.string().url(),
});

router.post("/studio/extract-image", async (req: Request, res: Response) => {
  const parsed = extractSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid URL is required." });
    return;
  }

  const { url } = parsed.data;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "A valid URL is required." });
    return;
  }

  if (parsedUrl.protocol !== "https:") {
    res.status(422).json({ error: "Only https:// marketplace URLs are supported." });
    return;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname;

  if (isPrivateHost(hostname)) {
    res.status(422).json({ error: "URL is not a recognised marketplace listing page." });
    return;
  }

  if (!isAllowedHost(hostname)) {
    res.status(422).json({ error: "URL is not a recognised marketplace listing page." });
    return;
  }

  const marketplace = detectMarketplaceFromParsed(hostname, pathname);
  if (!marketplace) {
    res.status(422).json({ error: "URL is not a recognised marketplace listing page." });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let html: string;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; ListLensBot/1.0; +https://listlens.app)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-GB,en;q=0.9",
        },
      });

      const finalHostname = (() => {
        try { return new URL(response.url).hostname.toLowerCase(); } catch { return ""; }
      })();
      if (finalHostname && (isPrivateHost(finalHostname) || !isAllowedHost(finalHostname))) {
        res.status(422).json({ error: "URL is not a recognised marketplace listing page." });
        return;
      }

      if (!response.ok) {
        res.status(502).json({
          error: `Marketplace page returned status ${response.status}.`,
        });
        return;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html")) {
        res.status(502).json({ error: "Marketplace URL did not return an HTML page." });
        return;
      }

      html = await response.text();
    } finally {
      clearTimeout(timeout);
    }

    const imageUrl = extractOgImage(html);

    if (!imageUrl) {
      res.status(404).json({
        error: `Could not find a product image on the ${marketplace} listing page.`,
      });
      return;
    }

    logger.info({ marketplace, imageUrl }, "Extracted marketplace image");

    res.json({ imageUrl, marketplace });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      res.status(504).json({ error: "The marketplace page took too long to respond." });
      return;
    }
    logger.error({ err }, "Failed to extract marketplace image");
    res.status(500).json({ error: "Failed to fetch the marketplace listing page." });
  }
});

export default router;
