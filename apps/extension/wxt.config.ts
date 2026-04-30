import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Mr.FLENS · List-LENS Guard",
    description:
      "Run an AI Guard risk check on any eBay or Vinted listing without leaving the tab.",
    version: "0.0.1",
    permissions: ["storage", "activeTab"],
    host_permissions: [
      "https://*.ebay.co.uk/*",
      "https://*.ebay.com/*",
      "https://www.vinted.co.uk/*",
      "https://www.vinted.com/*",
      "https://*.replit.app/*",
      "https://*.replit.dev/*",
    ],
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "128": "icon/128.png",
    },
  },
  outDir: ".output",
  webExt: {
    disabled: true,
  },
});
