import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "ListLens – List smarter. Buy safer.",
  description: "AI-powered listing studio and buyer protection for eBay and Vinted.",
  applicationName: "ListLens",
  appleWebApp: {
    capable: true,
    title: "ListLens",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS Home Screen requires a PNG apple-touch-icon (SVG is ignored).
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
  },
};

// Mobile-friendly viewport. `viewport-fit=cover` lets the dark UI extend under
// iOS notches when installed as a PWA. Theme colour matches the zinc-950 body.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-50 antialiased min-h-screen">
        <ClerkProvider>{children}</ClerkProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
