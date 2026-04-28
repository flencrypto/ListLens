import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LENS_REGISTRY } from "@/lib/lenses-registry";

export default function LensesPage() {
  const live = LENS_REGISTRY.filter((l) => l.status === "live");
  const planned = LENS_REGISTRY.filter((l) => l.status === "planned");

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Lenses</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Specialist category agents that power Studio and Guard. Each Lens applies its own
            evidence rules, fields and trust language.
          </p>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">Available now</h2>
            <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">
              {live.length} live
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map((lens) => {
              const interactive = Boolean(lens.href);
              const card = (
                <Card
                  className={`h-full transition-colors ${
                    interactive ? "hover:border-zinc-600 cursor-pointer" : ""
                  }`}
                >
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="text-3xl">{lens.icon}</div>
                    <div>
                      <CardTitle className="text-base">{lens.name}</CardTitle>
                      <p className="text-xs text-zinc-500">{lens.category}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-zinc-400">{lens.description}</CardContent>
                </Card>
              );
              return lens.href ? (
                <Link key={lens.id} href={lens.href}>
                  {card}
                </Link>
              ) : (
                <div key={lens.id}>{card}</div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">Coming soon</h2>
            <Badge variant="secondary">{planned.length} planned</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {planned.map((lens) => (
              <Card key={lens.id} className="h-full opacity-70">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="text-3xl grayscale">{lens.icon}</div>
                  <div>
                    <CardTitle className="text-base">{lens.name}</CardTitle>
                    <p className="text-xs text-zinc-500">{lens.category}</p>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-zinc-400">{lens.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
