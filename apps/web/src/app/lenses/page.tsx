import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LensCard {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: "live" | "planned";
  href?: string;
}

const LENSES: readonly LensCard[] = [
  {
    id: "RecordLens",
    name: "RecordLens",
    category: "Music Media",
    description:
      "Vinyl, CDs and cassettes. Identifies release from a label photo, with a matrix runout clarification flow.",
    icon: "💿",
    status: "live",
    href: "/lenses/record",
  },
  {
    id: "ShoeLens",
    name: "ShoeLens",
    category: "Footwear",
    description: "Trainers, sneakers and shoes. Style code, size label and sole checks.",
    icon: "👟",
    status: "live",
    href: "/studio/new",
  },
  {
    id: "ClothingLens",
    name: "ClothingLens",
    category: "Apparel",
    description: "Clothing, vintage garments and apparel. Size label, fit and measurements.",
    icon: "👕",
    status: "planned",
  },
  {
    id: "MeasureLens",
    name: "MeasureLens",
    category: "Measurement",
    description:
      "Physical reference object + computer vision for accurate garment measurements.",
    icon: "📐",
    status: "planned",
  },
  {
    id: "TechLens",
    name: "TechLens",
    category: "Electronics",
    description: "Phones, laptops, cameras and audio gear. Model, condition and accessories.",
    icon: "📱",
    status: "planned",
  },
  {
    id: "BookLens",
    name: "BookLens",
    category: "Books",
    description: "Books, first editions and collectable print. ISBN, edition and condition.",
    icon: "📚",
    status: "planned",
  },
  {
    id: "CardLens",
    name: "CardLens",
    category: "Trading Cards",
    description: "Pokémon, Yu-Gi-Oh!, Magic and sports cards. Set, rarity and grading checks.",
    icon: "🎴",
    status: "planned",
  },
  {
    id: "ToyLens",
    name: "ToyLens",
    category: "Toys & Collectibles",
    description: "Toys, figures and LEGO. Completeness, packaging and reproduction checks.",
    icon: "🧸",
    status: "planned",
  },
  {
    id: "WatchLens",
    name: "WatchLens",
    category: "Watches",
    description: "Watches and timepieces. Reference, dial and provenance evidence checks.",
    icon: "⌚",
    status: "planned",
  },
  {
    id: "AntiquesLens",
    name: "AntiquesLens",
    category: "Antiques & Vintage",
    description: "Antiques and decorative objects. Maker marks, era and reproduction risk.",
    icon: "🏺",
    status: "planned",
  },
  {
    id: "AutographLens",
    name: "AutographLens",
    category: "Autographs",
    description: "Signed items and provenance. Evidence-led — never authenticates signatures.",
    icon: "✍️",
    status: "planned",
  },
  {
    id: "MotorLens",
    name: "MotorLens",
    category: "Vehicles & Parts",
    description:
      "Vehicles, parts and campers. Image + dimension-based fitment with MotorMeasureLens.",
    icon: "🚗",
    status: "planned",
  },
];

export default function LensesPage() {
  const live = LENSES.filter((l) => l.status === "live");
  const planned = LENSES.filter((l) => l.status === "planned");

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
              const cardInner = (
                <Card className="h-full hover:border-zinc-600 transition-colors cursor-pointer">
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
                  {cardInner}
                </Link>
              ) : (
                <div key={lens.id}>{cardInner}</div>
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
