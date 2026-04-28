export default defineBackground(() => {
  console.log("[ListLens] background worker started");

  // Listen for messages from content scripts or popup
  browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    const msg = message as { type?: string; payload?: unknown };

    if (msg.type === "LISTING_CONTEXT") {
      console.log("[ListLens] received listing context:", msg.payload);
      // Store in extension storage for popup
      browser.storage.local.set({ lastListing: msg.payload }).catch(console.error);
      sendResponse({ ok: true });
    }

    if (msg.type === "SEND_TO_GUARD") {
      sendResponse({ ok: true, redirectUrl: "https://app.listlens.io/guard/new" });
    }

    if (msg.type === "SEND_TO_STUDIO") {
      sendResponse({ ok: true, redirectUrl: "https://app.listlens.io/studio/new" });
    }

    return true; // keep channel open for async response
  });
});
