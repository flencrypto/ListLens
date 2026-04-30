import { Link, useLocation } from "wouter";

import { isClerkConfigured } from "@/lib/clerk-config";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/studio/new", label: "Studio", match: /^\/studio/ },
  { href: "/guard/new", label: "Guard", match: /^\/guard/ },
  { href: "/lenses", label: "Lenses", match: /^\/lenses/ },
  { href: "/history", label: "History", match: /^\/history/ },
  { href: "/billing", label: "Billing", match: /^\/billing/ },
] as const;

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-400/15 bg-[#040a14]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          aria-label="Mr.FLENS List-LENS — go to dashboard"
          className="transition-opacity hover:opacity-90"
        >
          <BrandWordmark layout="inline" size="sm" />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = link.match.test(location);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "text-cyan-200"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                {link.label}
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  />
                ) : null}
              </Link>
            );
          })}
          {isClerkConfigured() ? null : (
            <span
              className="ml-2 hidden rounded-full border border-cyan-700/40 bg-cyan-950/30 px-2 py-0.5 text-xs text-cyan-300/80 sm:inline-block"
              title="Authentication is disabled in this demo build."
            >
              Demo
            </span>
          )}
        </div>
      </div>
      {/* HUD accent strip under the bar */}
      <div className="hud-divider opacity-60" />
    </nav>
  );
}
