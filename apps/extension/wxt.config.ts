import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Mr.FLENS · List-LENS Guard",
    description:
      "AI-assisted marketplace risk screens for trainers, records, watches, cards and toys — with motors excluded.",
    version: "0.3.0",
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
