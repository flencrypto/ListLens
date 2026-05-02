import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { LENS_REGISTRY, LENS_ICON_MAP, type LensEntry } from "@/lib/lenses-registry";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: LensEntry["status"] }) {
  if (status === "live") {
    return (
      <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
        Live
      </span>
    );
  }
  if (status === "planned") {
    return (
      <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/50">
        Soon
      </span>
    );
  }
  return null;
}

function LensCard({ lens }: { lens: LensEntry }) {
  const Icon = LENS_ICON_MAP[lens.id];
  const isLive = lens.status === "live";
  const interactive = isLive && Boolean(lens.href);

  const card = (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl p-4 h-full overflow-hidden",
        "border transition-all duration-300",
        "bg-[radial-gradient(130%_100%_at_50%_0%,rgba(34,211,238,0.05),transparent_60%),linear-gradient(180deg,rgba(10,22,40,0.85),rgba(8,19,37,0.9))]",
        isLive
          ? "border-cyan-500/20 hover:border-cyan-400/50 cursor-pointer"
          : "border-zinc-800/60 opacity-60",
        interactive && "hover:shadow-[0_0_28px_-8px_rgba(34,211,238,0.45)]"
      )}
    >
      {/* top light rail */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[1px]",
          isLive
            ? "bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent group-hover:via-cyan-400/60 transition-all duration-300"
            : "bg-gradient-to-r from-transparent via-zinc-600/20 to-transparent"
        )}
      />

      {/* diagonal shimmer sweep on hover */}
      {interactive && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-cyan-400/6 to-transparent skew-x-12" />
        </div>
      )}

      {/* header row: icon + status badge */}
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl border flex-shrink-0 transition-all duration-300",
            isLive
              ? "bg-cyan-950/50 border-cyan-500/25 text-cyan-300 group-hover:border-cyan-400/50 group-hover:text-cyan-200 group-hover:shadow-[0_0_12px_-2px_rgba(34,211,238,0.35)]"
              : "bg-zinc-900/50 border-zinc-700/40 text-zinc-500"
          )}
        >
          {Icon ? <Icon size={18} strokeWidth={1.5} /> : <span className="text-base">{lens.icon}</span>}
        </div>
        <StatusBadge status={lens.status} />
      </div>

      {/* name + category */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold leading-tight transition-colors duration-200",
              isLive ? "text-zinc-100 group-hover:text-white" : "text-zinc-400"
            )}
          >
            {lens.name}
          </span>
          {isLive && (
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-[10px] font-medium tracking-wider uppercase",
            isLive ? "text-cyan-500/70" : "text-zinc-600"
          )}
        >
          {lens.category}
        </p>
      </div>

      {/* description */}
      <p
        className={cn(
          "text-xs leading-relaxed mt-auto",
          isLive ? "text-zinc-400 group-hover:text-zinc-300 transition-colors duration-200" : "text-zinc-600"
        )}
      >
        {lens.description}
      </p>
    </div>
  );

  if (interactive) {
    return (
      <Link href={lens.href!}>
        {card}
      </Link>
    );
  }
  return card;
}

export default function LensesPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Catalogue · Lenses
          </p>
          <h1 className="text-2xl font-bold text-white">Lenses</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Specialist category agents that power Studio and Guard. Each Lens applies its own
            evidence rules, fields and trust language.
          </p>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LENS_REGISTRY.map((lens) => (
            <LensCard key={lens.id} lens={lens} />
          ))}
        </div>
      </main>
    </div>
  );
}
