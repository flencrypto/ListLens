import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "ListLens – List smarter. Buy safer.",
  description: "AI-powered listing studio and buyer protection for eBay and Vinted.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-50 antialiased min-h-screen">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
