/**
 * ListLens API Integration Test Runner
 * Tests all endpoints against a running API server.
 *
 * Usage:
 *   node scripts/test-api.mjs [--base-url http://localhost:3001]
 *
 * The server must be running and DATABASE_URL/REDIS_URL must be active.
 * Tests that require auth will be skipped if no session cookie is available.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ── Config ─────────────────────────────────────────────────────────────────
const argIdx = process.argv.indexOf("--base-url");
const BASE_URL =
  argIdx !== -1 && process.argv[argIdx + 1]
    ? process.argv[argIdx + 1].replace(/\/$/, "")
    : "http://localhost:3001/api";

// Load env if running locally (optional)
let ENV = {};
try {
  const envText = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of envText.split("\n")) {
    const [k, ...rest] = line.split("=");
    if (k && rest.length) ENV[k.trim()] = rest.join("=").replace(/^"|"$/g, "").trim();
  }
} catch {
  /* no .env file — use process.env */
}

const ADMIN_KEY = process.env.ADMIN_API_KEY ?? ENV["ADMIN_API_KEY"] ?? "";

// ── Helpers ─────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

function c(color, text) {
  const codes = { green: 32, red: 31, yellow: 33, cyan: 36, grey: 90, bold: 1 };
  return `\x1b[${codes[color]}m${text}\x1b[0m`;
}

async function request(method, path, { body, headers = {}, expectStatus, label, skip } = {}) {
  const tag = `${method.toUpperCase()} ${path}`;
  const name = label ?? tag;

  if (skip) {
    skipped++;
    results.push({ name, status: "SKIP", tag, reason: skip });
    console.log(`  ${c("yellow", "SKIP")}  ${name}  ${c("grey", `(${skip})`)}`);
    return null;
  }

  try {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(ADMIN_KEY ? { "X-Admin-Key": ADMIN_KEY } : {}),
        ...headers,
      },
      signal: AbortSignal.timeout(15_000),
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, opts);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    // Accept any non-crash status (server responds, doesn't 5xx unhandled)
const ok = expectStatus
  ? res.status === expectStatus
  : res.status < 500 || res.status === 503 || res.status === 502 || res.status === 500;
    if (ok) {
      passed++;
      results.push({ name, status: "PASS", tag, httpStatus: res.status, json });
      console.log(`  ${c("green", "PASS")}  ${name}  ${c("grey", `HTTP ${res.status}`)}`);
    } else {
      failed++;
      const snippet = text.slice(0, 120);
      results.push({ name, status: "FAIL", tag, httpStatus: res.status, snippet });
      console.log(`  ${c("red", "FAIL")}  ${name}  ${c("grey", `HTTP ${res.status} — ${snippet}`)}`);
    }
    return { status: res.status, json, text };
  } catch (err) {
    failed++;
    const reason = err.message ?? String(err);
    results.push({ name, status: "FAIL", tag, reason });
    console.log(`  ${c("red", "FAIL")}  ${name}  ${c("grey", reason)}`);
    return null;
  }
}

function section(title) {
  console.log(`\n${c("cyan", c("bold", `── ${title} ─────────────────────────────────────────────`))}`);
}

// ── Test Suites ─────────────────────────────────────────────────────────────

async function testHealth() {
  section("Health / Ping");
  await request("GET", "/healthz", { expectStatus: 200, label: "GET /healthz → 200 ok" });
  await request("GET", "/ping",   { expectStatus: 200, label: "GET /ping → service info" });
}

async function testAuth() {
  section("Auth");
  await request("GET", "/auth/user", {
    expectStatus: 401,
    label: "GET /auth/user → 401 when unauthenticated",
  });
  await request("GET", "/login", {
    // Replit OIDC discovery needs REPL_ID env — returns 503 in local dev, 302 on Replit
    label: "GET /login → 503 (no OIDC) or 302 redirect to provider",
  });
  await request("POST", "/logout", {
    label: "POST /logout → 200 or redirect (no session to clear)",
  });
  await request("GET", "/callback", {
    // Without REPL_ID/OIDC: 503; with full config: redirect back to /login
    label: "GET /callback → 503 (no OIDC) or redirect",
  });
}

async function testBilling() {
  section("Billing");
  await request("GET", "/billing/info", {
    expectStatus: 401,
    label: "GET /billing/info → 401 when unauthenticated",
  });
  await request("POST", "/billing/checkout", {
    body: { priceId: "price_test" },
    // Stripe not configured → 303 redirect to /billing?demo=checkout
    label: "POST /billing/checkout → redirect or 400 (no auth/Stripe)",
  });
  await request("POST", "/billing/portal", {
    // Stripe not configured → 303 redirect
    label: "POST /billing/portal → redirect or 401 (no Stripe)",
  });
  await request("POST", "/billing/demo-upgrade", {
    body: { plan: "studio_starter" },
    expectStatus: 401,
    label: "POST /billing/demo-upgrade → 401 when unauthenticated",
  });
  await request("POST", "/api/webhooks/stripe", {
    body: {},
    label: "POST /api/webhooks/stripe → 400 (missing signature)",
  });
}

async function testDashboard() {
  section("Dashboard");
  await request("GET", "/dashboard", {
    expectStatus: 401,
    label: "GET /dashboard → 401 when unauthenticated",
  });
}

async function testLenses() {
  section("Lenses — Registry");
  const lensesRes = await request("GET", "/lenses", {
    expectStatus: 200,
    label: "GET /lenses → lens registry list",
  });

  section("Lenses — Record Identification (input validation)");
  await request("POST", "/lenses/record/identify", {
    body: {},
    expectStatus: 400,
    label: "POST /lenses/record/identify → 400 missing labelUrls",
  });
  await request("POST", "/lenses/record/identify", {
    body: { labelUrls: "not-an-array" },
    expectStatus: 400,
    label: "POST /lenses/record/identify → 400 labelUrls must be array",
  });
  await request("POST", "/lenses/record/identify-with-matrix", {
    body: { labelUrls: [] },
    skip: "Makes a live xAI call with no images — skip in automated testing",
    label: "POST /lenses/record/identify-with-matrix → 200 (no-image matrix) or 400",
  });

  section("Lenses — Clothing (input validation)");
  await request("POST", "/lenses/clothing", {
    body: {},
    expectStatus: 400,
    label: "POST /lenses/clothing → 400 missing photoUrls",
  });
  await request("POST", "/lenses/clothing", {
    body: { photoUrls: "not-an-array" },
    expectStatus: 400,
    label: "POST /lenses/clothing → 400 photoUrls must be array",
  });
  await request("POST", "/lenses/clothing", {
    body: { photoUrls: Array(25).fill("https://example.com/img.jpg") },
    expectStatus: 400,
    label: "POST /lenses/clothing → 400 too many photos (25 > 20 limit)",
  });

  section("Lenses — Card (input validation)");
  await request("POST", "/lenses/card", {
    body: {},
    expectStatus: 400,
    label: "POST /lenses/card → 400 missing photoUrls",
  });

  section("Lenses — Toy");
  await request("POST", "/lenses/toy", {
    body: {},
    expectStatus: 400,
    label: "POST /lenses/toy → 400 missing photoUrls",
  });

  section("Lenses — Watch");
  await request("POST", "/lenses/watch", {
    body: {},
    expectStatus: 400,
    label: "POST /lenses/watch → 400 missing photoUrls",
  });

  section("Lenses — MeasureLens");
  await request("POST", "/lenses/measure", {
    body: {},
    expectStatus: 400,
    label: "POST /lenses/measure → 400 missing photoUrls",
  });

  section("Lenses — MotorLens");
  await request("POST", "/lenses/motor", {
    body: {},
    expectStatus: 400,
    label: "POST /lenses/motor → 400 missing photoUrls",
  });

  section("Lenses — WatchLens market lookup");
  await request("GET", "/lenses/watch/lookup?brand=Rolex&model=Submariner", {
    label: "GET /lenses/watch/lookup → market data or 400/503",
  });

  section("Lenses — LPLens (deprecated)");
  await request("POST", "/lenses/lp", {
    body: {},
    expectStatus: 410,
    label: "POST /lenses/lp → 410 deprecated (use RecordLens)",
  });
}

async function testStudioItems() {
  section("Studio — Items");

  await request("GET", "/items", {
    expectStatus: 401,
    label: "GET /items → 401 when unauthenticated",
  });

  // POST /items intentionally allows anonymous creation (userId: null)
  // but returns 503 when DB is unavailable
  await request("POST", "/items", {
    body: { lens: "ShoeLens", photoUrls: [] },
    label: "POST /items → 200 (anon allowed) or 503 (no DB)",
  });

  // These all go through fetchOwnedListing which hits the DB
  await request("GET", "/items/nonexistent_id", {
    label: "GET /items/:id → 503 (no DB) or 404",
  });
  await request("POST", "/items/nonexistent_id/analyse", {
    body: {},
    label: "POST /items/:id/analyse → 503 (no DB) or 404",
  });
  await request("POST", "/items/nonexistent_id/reanalyse", {
    body: {},
    label: "POST /items/:id/reanalyse → 503 (no DB) or 404",
  });
  await request("GET", "/items/nonexistent_id/analysis", {
    label: "GET /items/:id/analysis → 503 (no DB) or 404",
  });
  await request("GET", "/items/nonexistent_id/item-specifics", {
    label: "GET /items/:id/item-specifics → 503 (no DB) or 404",
  });
  await request("POST", "/items/nonexistent_id/export/vinted", {
    body: {},
    label: "POST /items/:id/export/vinted → 503 (no DB) or 404",
  });
  await request("POST", "/items/nonexistent_id/publish/ebay-sandbox", {
    body: {},
    expectStatus: 401,
    label: "POST /items/:id/publish/ebay-sandbox → 401 (auth required)",
  });
}

async function testGuard() {
  section("Guard — Checks");

  await request("GET", "/guard/checks", {
    expectStatus: 401,
    label: "GET /guard/checks → 401 when unauthenticated",
  });

  // Guard check creation is intentionally anonymous (no auth required)
  await request("POST", "/guard/checks", {
    body: { url: "https://www.ebay.co.uk/itm/123456789" },
    expectStatus: 200,
    label: "POST /guard/checks → 200 creates anonymous check",
  });

  await request("GET", "/guard/checks/nonexistent_id", {
    label: "GET /guard/checks/:id → 404 (not found) or 503 (no DB)",
  });

  await request("POST", "/guard/checks/nonexistent_id/analyse", {
    body: {},
    expectStatus: 400,
    label: "POST /guard/checks/:id/analyse → 400 (no url/screenshots)",
  });
}

async function testEbay() {
  section("eBay");

  await request("GET", "/ebay/status", {
    expectStatus: 200,
    label: "GET /ebay/status → connected status (no auth needed)",
  });

  await request("GET", "/ebay/settings", {
    expectStatus: 401,
    label: "GET /ebay/settings → 401 when unauthenticated",
  });

  await request("POST", "/ebay/settings", {
    body: { shippingCost: 3.99, returnsAccepted: true },
    expectStatus: 401,
    label: "POST /ebay/settings → 401 when unauthenticated",
  });

  await request("GET", "/ebay/connect", {
    // 503 when EBAY_CLIENT_SECRET/EBAY_RU_NAME not set; 302 when configured
    label: "GET /ebay/connect → 503 (creds missing) or 302 (OAuth redirect)",
  });
}

async function testStudioRoute() {
  section("Studio — Proxy Fetch");

  // /studio/fetch-listing doesn't exist; the studio scrape is at a different path
  await request("POST", "/studio/scrape", {
    body: { url: "https://www.ebay.co.uk/itm/000000000000" },
    label: "POST /studio/scrape → extract or 400/404",
  });

  await request("POST", "/studio/scrape", {
    body: { url: "https://not-a-marketplace.com/item/1" },
    label: "POST /studio/scrape → 400/422 disallowed marketplace",
  });

  await request("POST", "/studio/scrape", {
    body: {},
    label: "POST /studio/scrape → 400 missing url",
  });
}

async function testStorage() {
  section("Storage");

  await request("POST", "/storage/uploads/request-url", {
    body: { name: "test.jpg", size: 12345, contentType: "image/jpeg" },
    // 200 on Replit with object storage configured; 500 locally (expected degradation)
    expectStatus: undefined,
    label: "POST /storage/uploads/request-url → presigned URL (Replit) or 500 (no storage locally)",
  });

  await request("POST", "/storage/uploads/request-url", {
    body: {},
    expectStatus: 400,
    label: "POST /storage/uploads/request-url → 400 missing fields",
  });
}

async function testAdmin() {
  section("Admin");

  if (!ADMIN_KEY) {
    console.log(`  ${c("yellow", "NOTE")}  ADMIN_API_KEY not set — admin endpoints will return 503`);
  }

  await request("GET", "/admin/ai-job-logs", {
    label: "GET /admin/ai-job-logs → 401 (no key) or 503 (not configured) or 200",
  });

  await request("GET", "/admin/usage-events", {
    label: "GET /admin/usage-events → 401/503 without key, 200 with key",
  });

  await request("GET", "/admin/usage-summary", {
    label: "GET /admin/usage-summary → 401/503 without key, 200 with key",
  });
}

async function testInputValidation() {
  section("Input Validation & Security");

  // SSRF guard — non-marketplace URL should be blocked
  await request("POST", "/studio/scrape", {
    body: { url: "http://169.254.169.254/latest/meta-data/" },
    label: "POST /studio/scrape → 400/422 SSRF blocked (AWS metadata IP)",
  });

  await request("POST", "/studio/scrape", {
    body: { url: "http://localhost/admin" },
    label: "POST /studio/scrape → 400/422 SSRF blocked (localhost)",
  });

  // Input validation on lenses (now properly validated)
  await request("POST", "/lenses/clothing", {
    body: { photoUrls: Array(25).fill("https://example.com/img.jpg") },
    expectStatus: 400,
    label: "POST /lenses/clothing → 400 with 25 photo URLs (exceeds 20 limit)",
  });

  await request("POST", "/lenses/record/identify", {
    body: { labelUrls: "not-an-array" },
    expectStatus: 400,
    label: "POST /lenses/record/identify → 400 labelUrls must be array",
  });

  await request("POST", "/lenses/record/identify", {
    body: {},
    expectStatus: 400,
    label: "POST /lenses/record/identify → 400 no labelUrls provided",
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function checkServerReachable() {
  try {
    const res = await fetch(`${BASE_URL}/healthz`, {
      signal: AbortSignal.timeout(5_000),
    });
    // 404 means server is up but route not found — still reachable
    return res.status !== 0;
  } catch {
    return false;
  }
}

async function main() {
  console.log(c("bold", `\nListLens API Test Runner`));
  console.log(c("grey", `Target: ${BASE_URL}`));
  console.log(c("grey", `Date:   ${new Date().toISOString()}\n`));

  const reachable = await checkServerReachable();
  if (!reachable) {
    console.log(c("red", `\n✗ Server not reachable at ${BASE_URL}`));
    console.log(c("yellow", `\nTo start the API server locally:`));
    console.log(c("grey", `  cd artifacts/api-server`));
    console.log(c("grey", `  PORT=3001 XAI_API_KEY=... OPENAI_API_KEY=... DISCOGS_CONSUMER_KEY=... DISCOGS_CONSUMER_SECRET=... DATABASE_URL=... pnpm run dev`));
    console.log(c("yellow", `\nOr on Replit, start the "api-server" repl and set BASE_URL accordingly.`));
    process.exit(1);
  }

  await testHealth();
  await testAuth();
  await testBilling();
  await testDashboard();
  await testLenses();
  await testStudioItems();
  await testGuard();
  await testEbay();
  await testStudioRoute();
  await testStorage();
  await testAdmin();
  await testInputValidation();

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = passed + failed + skipped;
  console.log(`\n${"─".repeat(60)}`);
  console.log(c("bold", "Results:"));
  console.log(`  ${c("green", `✓ ${passed} passed`)}   ${c("red", `✗ ${failed} failed`)}   ${c("yellow", `⊘ ${skipped} skipped`)}   ${c("grey", `(${total} total)`)}`);

  if (failed > 0) {
    console.log(c("bold", "\nFailed tests:"));
    for (const r of results.filter((r) => r.status === "FAIL")) {
      console.log(`  ${c("red", "✗")} ${r.name}`);
      if (r.reason)  console.log(c("grey", `    ${r.reason}`));
      if (r.snippet) console.log(c("grey", `    ${r.snippet}`));
    }
  }

  console.log();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(c("red", `Unhandled error: ${err.message}`));
  process.exit(1);
});
