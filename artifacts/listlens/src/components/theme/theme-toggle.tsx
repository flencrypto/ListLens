import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const activeTheme = theme ?? "dark";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-1",
        "border-[color:var(--brand-outline)] bg-[color:var(--brand-nav-bg)] shadow-[var(--brand-nav-shadow)] backdrop-blur-xl",
        className,
      )}
      aria-label="Theme switcher"
    >
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const isActive = activeTheme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
              isActive
                ? "bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-text-strong)] shadow-[0_10px_24px_-18px_rgba(0,130,255,0.85)]"
                : "text-[color:var(--brand-text-muted)] hover:text-[color:var(--brand-text-strong)]",
            )}
            aria-pressed={isActive}
          >
            <Icon size={13} strokeWidth={1.8} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
