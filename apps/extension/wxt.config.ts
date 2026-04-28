import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "ListLens",
    description: "AI resale trust layer for eBay and Vinted. List smarter. Buy safer.",
    version: "0.1.0",
    permissions: ["activeTab", "storage", "sidePanel"],
    host_permissions: [
      "https://*.ebay.co.uk/*",
      "https://*.ebay.com/*",
      "https://www.vinted.co.uk/*",
      "https://www.vinted.com/*",
    ],
  },
});
