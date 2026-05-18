import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};
const aiRequestBuckets = new Map();
const aiRateLimitWindowMs = 60_000;
const aiRateLimitMaxRequests = 20;
const maxEvidenceItems = 8;
const minConfidenceDelta = -0.2;
const maxConfidenceDelta = 0.2;

function loadLocalEnv() {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const trustProxyForwardedFor = process.env.SOLELENS_TRUST_PROXY === "true";
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const xaiModel = process.env.XAI_MODEL ?? "grok-4.3";

function getOpenAiKey() {
  return process.env.OPENAI_API || process.env.OPENAI_API_KEY || "";
}

function getXaiKey() {
  return process.env.XAI_API || process.env.XAI_API_KEY || "";
}

export function providerStatus() {
  return {
    openai: Boolean(getOpenAiKey()),
    xai: Boolean(getXaiKey()),
    openaiModel: openAiModel,
    xaiModel,
  };
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}

function getClientIdentifier(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (trustProxyForwardedFor && typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

function hasValidScanToken(req) {
  const expected = process.env.SOLELENS_PUBLIC_SCAN_TOKEN;
  if (!expected) {
    return true;
  }

  const headerToken = req.headers["x-solelens-scan-token"];
  if (typeof headerToken === "string" && headerToken === expected) {
    return true;
  }

  const authorization = req.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim() === expected;
  }

  return false;
}

function isWithinRateLimit(req) {
  const now = Date.now();
  for (const [clientId, bucket] of aiRequestBuckets.entries()) {
    if (now >= bucket.resetAt) {
      aiRequestBuckets.delete(clientId);
    }
  }

  const key = getClientIdentifier(req);
  const current = aiRequestBuckets.get(key);
  if (!current || now >= current.resetAt) {
    aiRequestBuckets.set(key, { count: 1, resetAt: now + aiRateLimitWindowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= aiRateLimitMaxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function canAccessProviderRoutes(req, res) {
  if (!hasValidScanToken(req)) {
    sendJson(res, 401, { ok: false, error: "Unauthorized" });
    return false;
  }

  const rateLimit = isWithinRateLimit(req);
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
    sendJson(res, 429, { ok: false, error: "Rate limit exceeded. Try again shortly." });
    return false;
  }

  return true;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Model did not return JSON");
  }
}

async function postChatJson({ provider, messages, temperature = 0.2 }) {
  const isXai = provider === "xai";
  const apiKey = isXai ? getXaiKey() : getOpenAiKey();
  if (!apiKey) {
    throw new Error(`${provider} API key is not configured`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(isXai ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: isXai ? xaiModel : openAiModel,
        messages,
        temperature,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`${provider} returned ${response.status}: ${responseText.slice(0, 240)}`);
    }

    const payload = JSON.parse(responseText);
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`${provider} returned no message content`);
    }
    return extractJson(content);
  } finally {
    clearTimeout(timeout);
  }
}

function scanFallback(input) {
  const product = input.product ?? {};
  const capturedRequired = Number(input.capturedRequired ?? 0);
  const requiredTotal = Number(input.requiredTotal ?? 6);
  const ready = capturedRequired >= Math.max(1, requiredTotal - 1);

  return {
    summary: ready
      ? `${product.brand ?? "SoleLens"} ${product.model ?? "shoe"} is ready for identification, condition grading, and resale guidance.`
      : `Capture ${Math.max(0, requiredTotal - capturedRequired)} more required views before high-confidence identification.`,
    identityConfidenceDelta: ready ? 0.03 : -0.08,
    authenticityRisk: ready ? "medium-low" : "inconclusive",
    recommendedAction: ready ? product.nextAction ?? "Analyze and prepare listing" : "Add missing required photos",
    evidence: [
      `${capturedRequired} of ${requiredTotal} required views captured`,
      "Local fallback result used when provider output is unavailable",
    ],
    missingEvidence: ready ? [] : ["Required scan views are incomplete"],
  };
}

function normalizeStringList(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback;
  }
  const cleaned = value
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return cleaned.length ? cleaned.slice(0, maxEvidenceItems) : fallback;
}

function normalizeScanAnalysis(raw, fallback) {
  const parsed = raw && typeof raw === "object" ? raw : {};
  const rawDelta = Number(parsed.identityConfidenceDelta);
  const identityConfidenceDelta = Number.isFinite(rawDelta)
    ? Math.max(minConfidenceDelta, Math.min(maxConfidenceDelta, rawDelta))
    : fallback.identityConfidenceDelta;

  return {
    summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary : fallback.summary,
    identityConfidenceDelta,
    authenticityRisk:
      typeof parsed.authenticityRisk === "string" && parsed.authenticityRisk.trim()
        ? parsed.authenticityRisk
        : fallback.authenticityRisk,
    recommendedAction:
      typeof parsed.recommendedAction === "string" && parsed.recommendedAction.trim()
        ? parsed.recommendedAction
        : fallback.recommendedAction,
    evidence: normalizeStringList(parsed.evidence, fallback.evidence),
    missingEvidence: normalizeStringList(parsed.missingEvidence, fallback.missingEvidence),
  };
}

function defaultEditionStory(product) {
  const signature = `${product.id ?? ""} ${product.brand ?? ""} ${product.model ?? ""} ${product.colorway ?? ""}`.toLowerCase();

  if (signature.includes("dunk")) {
    return "The Dunk began as a basketball silhouette and became a streetwear staple thanks to its clean panelled upper, padded collar, and strong colour-blocking.";
  }
  if (signature.includes("jordan 4")) {
    return "The Air Jordan 4 is one of Jordan Brand's most recognisable retro silhouettes, known for wing eyelets, mesh panels, visible Air, and a chunky court profile.";
  }
  if (signature.includes("yeezy") || signature.includes("boost 350")) {
    return "The Yeezy Boost 350 V2 line is known for its low-profile knit-style shape, cushioned feel, and strong collector demand.";
  }
  if (signature.includes("forum")) {
    return "The Adidas Forum is a court-inspired classic with roots in 1980s basketball design, recognisable for its structured upper and ankle-strap attitude.";
  }
  if (signature.includes("air max")) {
    return "Nike Air Max models are known for visible-Air cushioning, layered uppers, and broad lifestyle appeal.";
  }
  if (signature.includes("new balance")) {
    return "New Balance retro runners and court silhouettes sell on comfort, understated heritage styling, and clean everyday wearability.";
  }

  return `${product.brand ?? "This"} ${product.model ?? "shoe"} has buyer appeal when the exact identity, edition context, and condition evidence are presented clearly.`;
}

function listingFallback(input) {
  const product = input.product ?? {};
  const marketplace = input.marketplaceAgentResults?.[0];
  const marketplaceFeedsEnabled = input.marketplaceFeedStatus?.enabled === true;
  const editionStory = product.editionStory ?? defaultEditionStory(product);
  if (product.dataSource === "catalog") {
    return {
      title: `${product.brand ?? "Sneaker"} ${product.model ?? "Shoe"} - Reference catalog match - Size pending`,
      description: `A strong candidate for buyers searching for the ${product.brand ?? "sneaker"} ${product.model ?? "shoe"} look.\n\nEdition background: ${editionStory}\n\nCondition and listing notes: this pair has matched a SoleLens reference catalog profile, but size, condition grade, authenticity-risk evidence, and resale pricing are pending until the full scan set and live marketplace sold-comps are available.`,
      checklist: [
        "Capture lateral, medial, heel, outsole, tongue label, and insole photos.",
        "Confirm exact size, box/accessory status, and any visible defects.",
        "Connect live marketplace sold-comps before publishing price or sale-speed claims.",
      ],
      priceRationale: marketplaceFeedsEnabled
        ? "Use marketplace intelligence only after exact sold-comps are connected."
        : "Live marketplace feeds are required before naming a best marketplace or publishing exact sale-speed claims.",
    };
  }
  return {
    title: `${product.brand ?? "Sneaker"} ${product.model ?? "Shoe"} - ${product.colorway ?? "Verified"} - ${product.size ?? "Size listed"} - ${product.gradeLabel ?? "Good"} Condition`,
    description: `A strong pickup for buyers after the ${product.brand ?? "sneaker"} ${product.model ?? "shoe"} ${product.colorway ?? ""}.\n\nEdition background: ${editionStory}\n\nCondition and listing notes: ${(product.gradeLabel ?? "good")} condition. SoleLens condition notes should lead with visible outsole wear, creasing, staining, box/accessory status, and any authenticity-risk evidence.${marketplaceFeedsEnabled ? ` Suggested route: ${marketplace?.marketplace ?? "best-fit marketplace"}.` : " Live marketplace sold-comps are not connected yet, so publish only after pricing feed review."}`,
    checklist: [
      "Include lateral, medial, heel, outsole, tongue label, and insole photos.",
      "Show close-ups of sole wear, toe-box creasing, and any visible marks.",
      "Mention box/accessory status and whether expert review is complete.",
    ],
    priceRationale: !marketplaceFeedsEnabled
      ? "Live marketplace feeds are required before naming a best marketplace or publishing exact sale-speed claims."
      : marketplace
      ? `${marketplace.marketplace} balances expected net value, exact comparable volume, and sale speed.`
      : "Use SoleLens marketplace intelligence before publishing.",
  };
}

function enforceGbpText(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replace(/\$\s?(\d[\d,]*(?:\.\d+)?)/g, "GBP $1")
    .replace(/\bUSD\s?(\d[\d,]*(?:\.\d+)?)/gi, "GBP $1")
    .replace(/\bUS dollars?\b/gi, "GBP")
    .replace(/\bdollars?\b/gi, "GBP");
}

function normalizeListingDraft(input, fallback, generated) {
  const listing = { ...fallback, ...generated };
  const evidenceLimited = input.product?.dataSource === "catalog" || !(input.conditionFindings?.length);
  const marketplaceClaimPattern = /\b(eBay|StockX|GOAT|Depop|Vinted|comps\/week|weekly comps|sale speed|sold-comp volume|\d+\s*(?:days|d)\b)\b/i;

  if (evidenceLimited) {
    listing.title = fallback.title;
    listing.description = fallback.description;
    listing.checklist = fallback.checklist;
    listing.priceRationale = fallback.priceRationale;
  }

  const description = String(listing.description ?? "");
  const hasEditionContext = /\b(edition|background|history|heritage|silhouette|collector|court|basketball|runner|lifestyle)\b/i.test(description);
  const hasConditionContext = /\b(condition|wear|creasing|staining|pending|scan evidence|authenticity)\b/i.test(description);

  if (!hasEditionContext || !hasConditionContext) {
    listing.description = fallback.description;
  }

  if (!Array.isArray(listing.checklist) || listing.checklist.length < 3) {
    listing.checklist = fallback.checklist;
  }

  if (input.marketplaceFeedStatus?.enabled === false && marketplaceClaimPattern.test(`${listing.description ?? ""} ${listing.priceRationale ?? ""} ${listing.checklist?.join?.(" ") ?? ""}`)) {
    listing.description = fallback.description;
    listing.checklist = fallback.checklist;
    listing.priceRationale = fallback.priceRationale;
  }

  listing.title = enforceGbpText(listing.title);
  listing.description = enforceGbpText(listing.description);
  listing.priceRationale = enforceGbpText(listing.priceRationale);
  listing.checklist = listing.checklist.map(enforceGbpText);

  return listing;
}

function expertFallback(input) {
  const product = input.product ?? {};
  return {
    summary: `${product.brand ?? "Shoe"} ${product.model ?? "scan"} can be routed to expert review when confidence is low, item value is high, or required evidence is missing.`,
    reviewLane: "manual_review",
    flags: ["Use human review for paid authentication language", "Keep audit trail of overrides"],
  };
}

async function handleScanAnalysis(input) {
  const fallback = scanFallback(input);
  const messages = [
    {
      role: "system",
      content: "You are SoleLens, a footwear inspection API. Return compact JSON only with keys: summary, identityConfidenceDelta, authenticityRisk, recommendedAction, evidence, missingEvidence. Do not claim definitive authentication.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Analyze a sneaker scan session from structured metadata.",
        product: input.product,
        capturedRequired: input.capturedRequired,
        requiredTotal: input.requiredTotal,
        slots: input.slots,
      }),
    },
  ];

  const status = providerStatus();
  const preferredProviders = status.xai ? ["xai", "openai"] : ["openai"];
  const errors = [];

  for (const provider of preferredProviders) {
    try {
      const analysis = await postChatJson({ provider, messages, temperature: 0.15 });
      return {
        ok: true,
        mode: "provider",
        provider,
        providerStatus: status,
        analysis: normalizeScanAnalysis(analysis, fallback),
        errors,
      };
    } catch (error) {
      errors.push({ provider, message: error.message });
    }
  }

  return {
    ok: true,
    mode: "fallback",
    provider: "local",
    providerStatus: status,
    analysis: fallback,
    errors,
  };
}

async function handleListingDraft(input) {
  const fallback = listingFallback(input);
  const messages = [
    {
      role: "system",
      content: "You are SoleLens listing generation API. Return JSON only with keys: title, description, checklist, priceRationale. Write like a persuasive resale listing that helps sell the product, but stay evidence-bound. The description must be structured in this order: 1) buyer-facing sales hook for the exact shoe, 2) edition/model background with a short history or cultural context, 3) condition, authenticity-risk evidence, included accessories, and pricing/marketplace notes. Use product.editionStory when present. Use GBP for all money; do not output $, USD, dollars, or US currency notation. If marketplaceFeedStatus.enabled is false, do not name a best marketplace, exact sold-comp volume, or sale-speed claim; say live sold-comps are required. If product.dataSource is catalog or conditionFindings is empty, do not invent condition wear, size, authenticity, defects, or pricing details; say they are pending full scan evidence.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Generate a resale-ready sneaker listing draft.",
        product: input.product,
        descriptionStructure: [
          "Sales hook: make the shoe desirable to a buyer.",
          "Edition/history: explain the model line, silhouette, or collector appeal.",
          "Condition/details: only use supplied scan evidence; mark missing evidence as pending.",
        ],
        marketplaceAgentResults: input.marketplaceAgentResults?.slice?.(0, 3) ?? [],
        marketplaceFeedStatus: input.marketplaceFeedStatus ?? { enabled: false },
        conditionFindings: input.conditionFindings ?? [],
      }),
    },
  ];

  const status = providerStatus();
  const errors = [];
  if (status.openai) {
    try {
      const listing = await postChatJson({ provider: "openai", messages, temperature: 0.35 });
      return { ok: true, mode: "provider", provider: "openai", providerStatus: status, listing: normalizeListingDraft(input, fallback, listing), errors };
    } catch (error) {
      errors.push({ provider: "openai", message: error.message });
    }
  }

  return { ok: true, mode: "fallback", provider: "local", providerStatus: status, listing: fallback, errors };
}

async function handleExpertSummary(input) {
  const fallback = expertFallback(input);
  const messages = [
    {
      role: "system",
      content: "You are SoleLens expert-review API. Return JSON only with keys: summary, reviewLane, flags. Be conservative about authenticity.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Summarize whether this footwear scan should be reviewed by a human expert.",
        product: input.product,
        capturedRequired: input.capturedRequired,
        requiredTotal: input.requiredTotal,
        riskChecks: input.riskChecks ?? [],
      }),
    },
  ];

  const status = providerStatus();
  const errors = [];
  if (status.openai) {
    try {
      const review = await postChatJson({ provider: "openai", messages, temperature: 0.2 });
      return { ok: true, mode: "provider", provider: "openai", providerStatus: status, review: { ...fallback, ...review }, errors };
    } catch (error) {
      errors.push({ provider: "openai", message: error.message });
    }
  }

  return { ok: true, mode: "fallback", provider: "local", providerStatus: status, review: fallback, errors };
}

export async function handleAiApiRequest(req, res) {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith("/api/ai/")) {
    return false;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return true;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return true;
  }

  try {
    if (url.pathname === "/api/ai/health") {
      sendJson(res, 200, { ok: true, providerStatus: providerStatus() });
      return true;
    }

    if (!canAccessProviderRoutes(req, res)) {
      return true;
    }

    const input = await readJson(req);

    if (url.pathname === "/api/ai/scan-analysis") {
      sendJson(res, 200, await handleScanAnalysis(input));
      return true;
    }

    if (url.pathname === "/api/ai/listing-draft") {
      sendJson(res, 200, await handleListingDraft(input));
      return true;
    }

    if (url.pathname === "/api/ai/expert-summary") {
      sendJson(res, 200, await handleExpertSummary(input));
      return true;
    }

    sendJson(res, 404, { ok: false, error: "Unknown AI API route" });
    return true;
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
    return true;
  }
}
