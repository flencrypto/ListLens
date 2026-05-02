export default defineContentScript({
  matches: [
    "*://*.replit.app/*",
    "*://*.replit.dev/*",
  ],
  runAt: "document_idle",
  main() {
    chrome.runtime.sendMessage({
      type: "VERIFY_API_ORIGIN",
      origin: location.origin,
    });
  },
});
