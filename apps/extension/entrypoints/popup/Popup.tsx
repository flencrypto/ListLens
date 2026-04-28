import React, { useEffect, useState } from "react";

interface ListingContext {
  url: string;
  title: string | null;
  price: string | null;
  description: string | null;
  images: string[];
}

export function Popup() {
  const [listing, setListing] = useState<ListingContext | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  useEffect(() => {
    browser.storage.local.get("lastListing").then((data) => {
      if (data.lastListing) setListing(data.lastListing as ListingContext);
    });
  }, []);

  async function sendToGuard() {
    if (!listing) return;
    setStatus("loading");
    try {
      await fetch("https://app.listlens.io/api/extension/send-to-guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  async function sendToStudio() {
    if (!listing) return;
    setStatus("loading");
    try {
      await fetch("https://app.listlens.io/api/extension/send-to-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

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
