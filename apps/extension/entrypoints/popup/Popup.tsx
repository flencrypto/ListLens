import React, { useEffect, useState } from "react";

interface ListingContext {
  url: string;
  title: string | null;
  price: string | null;
  description: string | null;
  images: string[];
}

/**
 * Resolve the ListLens API base URL.
 *
 * Resolution order:
 *   1. Build-time env var `VITE_LISTLENS_API_BASE_URL` / `LISTLENS_API_BASE_URL`
 *      (WXT exposes Vite-style import.meta.env).
 *   2. User-configured value persisted in extension storage under
 *      `apiBaseUrl` (set via the side panel / settings, not yet shipped).
 *   3. Fallback: production origin.
 *
 * This keeps local dev / staging working without code changes and avoids
 * accidentally posting dev data to prod.
 */
const PROD_API_BASE_URL = "https://app.listlens.io";
const BUILD_TIME_ENV = (import.meta as unknown as {
  env?: Record<string, string | undefined>;
}).env;
const BUILD_TIME_API_BASE_URL =
  BUILD_TIME_ENV?.VITE_LISTLENS_API_BASE_URL ??
  BUILD_TIME_ENV?.LISTLENS_API_BASE_URL ??
  undefined;

async function resolveApiBaseUrl(): Promise<string> {
  if (BUILD_TIME_API_BASE_URL) return BUILD_TIME_API_BASE_URL;
  try {
    const stored = await browser.storage.local.get("apiBaseUrl");
    const url = (stored as { apiBaseUrl?: string }).apiBaseUrl;
    if (url && typeof url === "string") return url;
  } catch {
    // ignore — fall through to default
  }
  return PROD_API_BASE_URL;
}

export function Popup() {
  const [listing, setListing] = useState<ListingContext | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  useEffect(() => {
    browser.storage.local.get("lastListing").then((data) => {
      if (data.lastListing) setListing(data.lastListing as ListingContext);
    });
  }, []);

  async function postListing(path: string) {
    if (!listing) return;
    setStatus("loading");
    try {
      const base = await resolveApiBaseUrl();
      const response = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`,
        );
      }
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  const sendToGuard = () => postListing("/api/extension/send-to-guard");
  const sendToStudio = () => postListing("/api/extension/send-to-studio");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>🔍</span>
        <strong style={{ fontSize: "14px", color: "#22d3ee" }}>ListLens</strong>
        <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "auto" }}>v0.1.0</span>
      </div>

      {listing ? (
        <div style={{ background: "#1e293b", borderRadius: "8px", padding: "10px", fontSize: "12px" }}>
          <p style={{ fontWeight: 600, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {listing.title ?? "Listing"}
          </p>
          {listing.price && <p style={{ color: "#22d3ee" }}>{listing.price}</p>}
          <p style={{ color: "#64748b", marginTop: "4px" }}>{listing.images.length} image(s) detected</p>
        </div>
      ) : (
        <p style={{ fontSize: "12px", color: "#64748b" }}>Navigate to an eBay or Vinted listing to get started.</p>
      )}

      {status === "sent" && (
        <p style={{ fontSize: "12px", color: "#22d3ee" }}>✓ Sent to ListLens</p>
      )}

      <button
        onClick={sendToGuard}
        disabled={!listing || status === "loading"}
        style={{
          background: listing ? "#7c3aed" : "#334155",
          color: "#f1f5f9",
          border: "none",
          borderRadius: "6px",
          padding: "8px 12px",
          fontSize: "13px",
          cursor: listing ? "pointer" : "not-allowed",
          fontWeight: 600,
        }}
        aria-label="Run Guard check on this listing"
      >
        🛡️ Guard Check
      </button>

      <button
        onClick={sendToStudio}
        disabled={!listing || status === "loading"}
        style={{
          background: listing ? "#0891b2" : "#334155",
          color: "#f1f5f9",
          border: "none",
          borderRadius: "6px",
          padding: "8px 12px",
          fontSize: "13px",
          cursor: listing ? "pointer" : "not-allowed",
          fontWeight: 600,
        }}
        aria-label="Send listing to Studio for draft creation"
      >
        📸 Send to Studio
      </button>
    </div>
  );
}
