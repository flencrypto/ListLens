import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";
import { BrandWordmark } from "@/components/brand/brand-wordmark";

export function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/dashboard" aria-label="Mr.FLENS List-LENS — go to dashboard">
          <BrandWordmark layout="inline" size="sm" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/studio/new" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Studio
          </Link>
          <Link href="/guard/new" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Guard
          </Link>
          <Link href="/lenses" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Lenses
          </Link>
          <Link href="/history" className="text-sm text-zinc-400 hover:text-white transition-colors">
            History
          </Link>
          <Link href="/billing" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Billing
          </Link>
          {isClerkConfigured() ? (
            <UserButton />
          ) : (
            <span
              className="text-xs text-zinc-500 border border-zinc-800 rounded-full px-2 py-0.5"
              title="Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable sign-in."
            >
              Demo mode
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
