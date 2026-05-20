import { useState } from "react";
import { Link, useLocation } from "wouter";

import { useAuth } from "@workspace/replit-auth-web";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
    <nav className="sticky top-0 z-50 border-b border-[color:var(--brand-outline)] bg-[color:var(--brand-nav-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          aria-label="ListLens — go to dashboard"
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
                    ? "text-[color:var(--brand-text-strong)]"
                    : "text-[color:var(--brand-text-muted)] hover:text-[color:var(--brand-text-strong)]",
                )}
              >
                {link.label}
                {isActive ? (
                  <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_8px_rgba(0,240,255,0.55)]"
                    />
                  ) : null}
              </Link>
            );
          })}
          <ThemeToggle className="ml-2" />
          {!isLoading && (
            <button
              onClick={isAuthenticated ? handleLogout : login}
              className={cn(
                "ml-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                isAuthenticated
                  ? "border-[color:var(--brand-outline)] text-[color:var(--brand-text-muted)] hover:border-[color:var(--brand-outline-strong)] hover:text-[color:var(--brand-text-strong)]"
                  : "border-[#0082ff]/28 bg-[#0082ff]/8 text-cyan-600 dark:text-[#7fefff] hover:bg-[#0082ff]/16 hover:text-cyan-700 dark:hover:text-white",
              )}
            >
              {isAuthenticated ? "Log out" : "Log in"}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md text-[color:var(--brand-text-muted)] hover:text-[color:var(--brand-text-strong)] transition-colors"
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
        <div className="sm:hidden border-t border-[color:var(--brand-outline)] bg-[color:var(--brand-nav-bg)] backdrop-blur-xl px-4 py-3 space-y-2">
          <ThemeToggle />
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
                    ? "text-[color:var(--brand-text-strong)] bg-[color:var(--brand-accent-soft)]"
                    : "text-[color:var(--brand-text-muted)] hover:text-[color:var(--brand-text-strong)] hover:bg-[color:var(--brand-accent-soft)]",
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
                  ? "border-[color:var(--brand-outline)] text-[color:var(--brand-text-muted)] hover:border-[color:var(--brand-outline-strong)] hover:text-[color:var(--brand-text-strong)]"
                  : "border-[#0082ff]/28 bg-[#0082ff]/8 text-cyan-600 dark:text-[#7fefff] hover:bg-[#0082ff]/16 hover:text-cyan-700 dark:hover:text-white",
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
