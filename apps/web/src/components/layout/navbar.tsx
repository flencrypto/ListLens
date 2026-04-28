import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          ListLens
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
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
