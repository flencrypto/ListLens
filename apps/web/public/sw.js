/* eslint-disable no-restricted-globals */
// ListLens minimal service worker.
//
// Scope: app shell + offline fallback only. We deliberately do NOT cache API
// responses (Studio/Guard analyses, Stripe/Clerk/Sentry traffic, marketplace
// data) because:
//   - AI/Guard responses contain user-specific, time-sensitive risk info.
//   - Auth (Clerk) and payments (Stripe) must never be served from cache.
//   - Sentry tunnel (`/monitoring`) and webhooks must always hit the network.
//
// Strategy:
//   - Precache the offline fallback + manifest icons on install.
//   - For navigation requests: network-first, fall back to /offline on failure.
//   - For everything else: pass through to the network.
//
// The cache name is versioned per SW build (the SW file changes whenever Next
// rebuilds the app) so the `activate` step prunes old hashed `_next/static`
// entries from previous deploys, preventing unbounded Cache Storage growth.

const CACHE_VERSION = "1";
const CACHE_PREFIX = "listlens-shell-";
const CACHE = `${CACHE_PREFIX}v${CACHE_VERSION}`;
// Cap the runtime shell cache so a long-lived browser doesn't accumulate
// arbitrarily many static entries between deploys.
const MAX_SHELL_ENTRIES = 60;
const PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => {
        // Don't block activation on a precache failure — the SW still adds value
        // for online navigation. Log so it surfaces in DevTools / Sentry breadcrumbs.
        console.warn("[ListLens SW] precache failed:", err);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        // Drop every prior ListLens shell cache so old hashed _next/static
        // entries don't accumulate across deploys.
        Promise.all(
          keys
            .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Trim the shell cache to MAX_SHELL_ENTRIES (FIFO) so a single long-lived
// version doesn't grow without bound either.
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const toDelete = keys.slice(0, keys.length - maxEntries);
  await Promise.all(toDelete.map((req) => cache.delete(req)));
}

// Never intercept non-GET, cross-origin, or sensitive routes.
function shouldBypass(request) {
  if (request.method !== "GET") return true;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return true;
  if (url.pathname.startsWith("/api/")) return true;
  if (url.pathname.startsWith("/monitoring")) return true; // Sentry tunnel
  if (url.pathname.startsWith("/_next/data/")) return true;
  return false;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (shouldBypass(request)) return;

  // Navigation: network-first → offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then(
          (resp) =>
            resp ||
            new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
        )
      )
    );
    return;
  }

  // Static assets: stale-while-revalidate for the shell only.
  const url = new URL(request.url);
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((resp) => {
            if (resp && resp.ok) {
              const copy = resp.clone();
              caches.open(CACHE).then((c) =>
                c.put(request, copy).then(() => trimCache(CACHE, MAX_SHELL_ENTRIES))
              );
            }
            return resp;
          })
          .catch(() => cached);
        return (
          cached ||
          network.then(
            (resp) =>
              resp ||
              new Response("Offline", {
                status: 503,
                headers: { "Content-Type": "text/plain" },
              })
          )
        );
      })
    );
  }
});
