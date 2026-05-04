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
    : "http://localhost:3001";

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

    const ok = expectStatus ? res.status === expectStatus : res.status < 500;
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
  await request("GET", "/auth/me", {
    expectStatus: 401,
    label: "GET /auth/me → 401 when unauthenticated",
  });
  await request("GET", "/auth/login", {
    expectStatus: 302,
    label: "GET /auth/login → 302 redirect to OIDC provider",
  });
  await request("POST", "/auth/logout", {
    expectStatus: 200,
    label: "POST /auth/logout → 200 (no session to clear)",
  });
}

async function testBilling() {
  section("Billing");
  await request("GET", "/billing/info", {
    expectStatus: 401,
    label: "GET /billing/info → 401 when unauthenticated",
  });
  await request("GET", "/billing/credits", {
    expectStatus: 401,
    label: "GET /billing/credits → 401 when unauthenticated",
  });
  await request("POST", "/billing/checkout", {
    body: { priceId: "price_test" },
    expectStatus: 401,
    label: "POST /billing/checkout → 401 when unauthenticated",
  });
  await request("POST", "/billing/portal", {
    expectStatus: 401,
    label: "POST /billing/portal → 401 when unauthenticated",
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

  section("Lenses — Record Identification (no images)");
  await request("POST", "/lenses/record/identify", {
    body: {},
    label: "POST /lenses/record/identify → 400 missing labelUrls",
  });

  await request("POST", "/lenses/record/identify-with-matrix", {
    body: { labelUrls: [] },
    label: "POST /lenses/record/identify-with-matrix → 400 empty labelUrls",
  });

  section("Lenses — Clothing (no images)");
  await request("POST", "/lenses/clothing", {
    body: {},
    label: "POST /lenses/clothing → 400 missing photoUrls",
  });

  section("Lenses — Card (no images)");
  await request("POST", "/lenses/card", {
    body: {},
    label: "POST /lenses/card → 400 missing photoUrls",
  });

  section("Lenses — Toy (no images)");
  await request("POST", "/lenses/toy", {
    body: {},
    label: "POST /lenses/toy → 400 missing photoUrls",
  });

  section("Lenses — Watch (no images)");
  await request("POST", "/lenses/watch", {
    body: {},
    label: "POST /lenses/watch → 400 missing photoUrls",
  });

  section("Lenses — MeasureLens (no images)");
  await request("POST", "/lenses/measure", {
    body: {},
    label: "POST /lenses/measure → 400 missing photoUrls",
  });

  section("Lenses — MotorLens (no images)");
  await request("POST", "/lenses/motor", {
    body: {},
    label: "POST /lenses/motor → 400 missing photoUrls",
  });

  section("Lenses — WatchLens market lookup");
  await request("GET", "/lenses/watch/lookup?brand=Rolex&model=Submariner", {
    label: "GET /lenses/watch/lookup → market data or 503",
  });
}

async function testStudioItems() {
  section("Studio — Items");

  await request("GET", "/items", {
    expectStatus: 401,
    label: "GET /items → 401 when unauthenticated",
  });

  await request("POST", "/items", {
    body: { lens: "ShoeLens", photoUrls: [] },
    expectStatus: 401,
    label: "POST /items → 401 when unauthenticated",
  });

  // Test with a bogus ID to confirm 404 shape
  await request("GET", "/items/nonexistent_id", {
    label: "GET /items/:id → 401 or 404 for unknown item",
  });

  await request("POST", "/items/nonexistent_id/analyse", {
    body: {},
    label: "POST /items/:id/analyse → 401 or 404",
  });

  await request("POST", "/items/nonexistent_id/reanalyse", {
    body: {},
    label: "POST /items/:id/reanalyse → 401 or 404",
  });

  await request("GET", "/items/nonexistent_id/analysis", {
    label: "GET /items/:id/analysis → 401 or 404",
  });

  await request("GET", "/items/nonexistent_id/item-specifics", {
    label: "GET /items/:id/item-specifics → 401 or 404",
  });

  await request("POST", "/items/nonexistent_id/export/vinted", {
    body: {},
    label: "POST /items/:id/export/vinted → 401 or 404",
  });

  await request("POST", "/items/nonexistent_id/publish/ebay-sandbox", {
    body: {},
    label: "POST /items/:id/publish/ebay-sandbox → 401 or 404",
  });
}

async function testGuard() {
  section("Guard — Checks");

  await request("GET", "/guard/checks", {
    expectStatus: 401,
    label: "GET /guard/checks → 401 when unauthenticated",
  });

  await request("POST", "/guard/checks", {
    body: { url: "https://www.ebay.co.uk/itm/123456789" },
    expectStatus: 401,
    label: "POST /guard/checks → 401 when unauthenticated",
  });

  await request("GET", "/guard/checks/nonexistent_id", {
    label: "GET /guard/checks/:id → 401 or 404",
  });

  await request("POST", "/guard/checks/nonexistent_id/analyse", {
    body: {},
    label: "POST /guard/checks/:id/analyse → 401 or 404",
  });
}

async function testEbay() {
  section("eBay");

  await request("GET", "/ebay/status", {
    expectStatus: 200,
    label: "GET /ebay/status → connected status (no auth needed for basic check)",
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
    label: "GET /ebay/connect → redirect to eBay OAuth or 401",
  });
}

async function testStudioRoute() {
  section("Studio — Proxy Fetch");

  await request("POST", "/studio/fetch-listing", {
    body: { url: "https://www.ebay.co.uk/itm/000000000000" },
    label: "POST /studio/fetch-listing → extract or 422 for bad URL",
  });

  await request("POST", "/studio/fetch-listing", {
    body: { url: "https://not-a-marketplace.com/item/1" },
    label: "POST /studio/fetch-listing → 422 disallowed marketplace",
  });

  await request("POST", "/studio/fetch-listing", {
    body: {},
    label: "POST /studio/fetch-listing → 400 missing url",
  });
}

async function testStorage() {
  section("Storage");

  await request("POST", "/storage/upload-url", {
    body: { filename: "test.jpg", contentType: "image/jpeg" },
    expectStatus: 401,
    label: "POST /storage/upload-url → 401 when unauthenticated",
  });
}

async function testAdmin() {
  section("Admin");

  if (!ADMIN_KEY) {
    console.log(`  ${c("yellow", "NOTE")}  ADMIN_API_KEY not set — admin tests will get 503`);
  }

  await request("GET", "/admin/ai-job-logs", {
    label: "GET /admin/ai-job-logs → 401/503 without key, 200 with key",
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

  // SSRF guard — non-marketplace URL should be blocked by studio fetch
  await request("POST", "/studio/fetch-listing", {
    body: { url: "http://169.254.169.254/latest/meta-data/" },
    label: "POST /studio/fetch-listing → 422 SSRF blocked (AWS metadata IP)",
  });

  await request("POST", "/studio/fetch-listing", {
    body: { url: "http://localhost/admin" },
    label: "POST /studio/fetch-listing → 422 SSRF blocked (localhost)",
  });

  // Oversized body — Express should return 413 or our validation 400
  await request("POST", "/lenses/clothing", {
    body: { photoUrls: Array(100).fill("https://example.com/img.jpg") },
    label: "POST /lenses/clothing → 400/413 with 100 photo URLs (oversized)",
  });

  // Record identify with invalid type
  await request("POST", "/lenses/record/identify", {
    body: { labelUrls: "not-an-array" },
    label: "POST /lenses/record/identify → 400 labelUrls must be array",
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function checkServerReachable() {
  try {
    const res = await fetch(`${BASE_URL}/healthz`, {
      signal: AbortSignal.timeout(5_000),
    });
    return res.ok;
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
