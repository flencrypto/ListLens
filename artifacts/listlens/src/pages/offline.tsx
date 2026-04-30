import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { BrandGlyph } from "@/components/brand/brand-glyph";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="flex items-center justify-center px-6 py-20">
        <div className="brand-card p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <BrandGlyph size={56} className="opacity-90" />
          </div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Link · Offline
          </p>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <WifiOff className="h-6 w-6 text-cyan-400" />
            You&apos;re offline
          </h1>
          <div className="hud-divider mx-auto my-4 max-w-[120px]" />
          <p className="text-sm text-zinc-400 mb-6">
            ListLens needs an internet connection for AI analysis, marketplace
            lookups, and account sync. Reconnect and try again.
          </p>
          <Button asChild className="bg-gradient-to-r from-cyan-500 to-violet-600 border-0">
            <Link href="/">Retry</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
