import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";
import "./globals.css";

export const metadata: Metadata = {
  title: "ListLens – List smarter. Buy safer.",
  description: "AI-powered listing studio and buyer protection for eBay and Vinted.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // In demo mode (no real Clerk keys configured) we skip <ClerkProvider> entirely.
  // Mounting it with the placeholder publishable key crashes the client bundle
  // ("Missing publishableKey"), and there is no usable Clerk session anyway.
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-50 antialiased min-h-screen">
        {isClerkConfigured() ? <ClerkProvider>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}
