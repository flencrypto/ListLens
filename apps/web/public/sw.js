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

const CACHE = "listlens-shell-v1";
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
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

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
              caches.open(CACHE).then((c) => c.put(request, copy));
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
