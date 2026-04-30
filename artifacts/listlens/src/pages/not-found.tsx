import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { BrandGlyph } from "@/components/brand/brand-glyph";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-zinc-950">
      <Navbar />
      <main className="flex items-center justify-center px-6 py-20">
        <div className="brand-card brand-card-glow p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <BrandGlyph size={56} className="opacity-90" />
          </div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Signal · Lost
          </p>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-400" />
            404 · Page not found
          </h1>
          <div className="hud-divider mx-auto my-4 max-w-[120px]" />
          <p className="text-sm text-zinc-400 mb-6">
            The lens lost focus on this route. Head back to a known surface.
          </p>
          <Button asChild className="bg-gradient-to-r from-cyan-500 to-violet-600 border-0">
            <Link href="/">Return to dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
