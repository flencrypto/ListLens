

import { useEffect } from "react";

/**
 * Registers the ListLens service worker for PWA / offline support.
 *
 * Runs only:
 *  - in the browser
 *  - when the SW API is available
 *  - in production builds (avoids stale dev caches confusing local development)
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          // Non-fatal — site works fine without the SW.
          console.warn("[ListLens] Service worker registration failed:", err);
        });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
