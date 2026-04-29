import type { MetadataRoute } from "next";

// Web App Manifest — generated via the Next.js Metadata API so it always lives at
// `/manifest.webmanifest` with correct headers. Mobile browsers and PWA installers
// (Chrome, Safari, Edge) use this for the "Add to Home Screen" experience.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ListLens — List smarter. Buy safer.",
    short_name: "ListLens",
    description:
      "AI-powered listing studio and buyer protection for eBay and Vinted.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#09090b",
    theme_color: "#09090b",
    categories: ["productivity", "shopping", "utilities"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New listing",
        short_name: "Studio",
        url: "/studio/new",
      },
      {
        name: "Check a listing",
        short_name: "Guard",
        url: "/guard/new",
      },
    ],
  };
}
