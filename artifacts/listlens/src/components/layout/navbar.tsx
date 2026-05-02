import { useState } from "react";
import { Link, useLocation } from "wouter";

import { useAuth } from "@workspace/replit-auth-web";
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
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
  }

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

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
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
          {!isLoading && (
            <button
              onClick={isAuthenticated ? handleLogout : login}
              className={cn(
                "ml-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                isAuthenticated
                  ? "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  : "border-cyan-700/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:text-cyan-100",
              )}
            >
              {isAuthenticated ? "Log out" : "Log in"}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md text-zinc-400 hover:text-white transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={cn("block h-0.5 w-5 bg-current transition-all origin-center", menuOpen && "rotate-45 translate-y-2")} />
          <span className={cn("block h-0.5 w-5 bg-current transition-all", menuOpen && "opacity-0")} />
          <span className={cn("block h-0.5 w-5 bg-current transition-all origin-center", menuOpen && "-rotate-45 -translate-y-2")} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="sm:hidden border-t border-cyan-400/10 bg-[#040a14]/95 backdrop-blur-md px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.match.test(location);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-cyan-200 bg-cyan-950/40"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {!isLoading && (
            <button
              onClick={isAuthenticated ? handleLogout : login}
              className={cn(
                "w-full mt-1 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors text-left",
                isAuthenticated
                  ? "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  : "border-cyan-700/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:text-cyan-100",
              )}
            >
              {isAuthenticated ? "Log out" : "Log in"}
            </button>
          )}
        </div>
      )}

      {/* HUD accent strip under the bar */}
      <div className="hud-divider opacity-60" />
    </nav>
  );
}
