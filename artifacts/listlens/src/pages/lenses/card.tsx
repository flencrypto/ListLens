import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOCUS_AREAS = [
  "Set, series, edition and language identification",
  "Rarity tier and print run variant",
  "Card number, name and expansion symbol cross-check",
  "Centering, corners, edges and surface condition",
  "Holo pattern and foil authenticity signals",
  "PSA / BGS / CGC grade estimate from photos",
  "First edition and shadowless stamps",
  "Counterfeit detection flags",
];

const PHOTO_TIPS = [
  "Photograph the card front in flat, diffused light to avoid glare on the holo.",
  "Angle the card slightly to catch the foil or holo pattern on a second shot.",
  "Include the card back so the set symbol and card number are legible.",
  "Use a plain dark background to show centering and edge wear clearly.",
  "For graded slabs, photograph the label and all four sides of the case.",
];

const GUARD_CHECKS = [
  "Counterfeit holo pattern or card stock",
  "Set symbol mismatch vs stated set",
  "Hidden corner or edge damage not disclosed",
  "Poor centering understated in condition description",
  "First edition stamp absent on claimed 1st-ed copy",
  "Repackaged card sold as sealed/unplayed",
];

export default function CardLensPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Lens · CardLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎴</span>
            <div>
              <h1 className="text-2xl font-bold text-white">CardLens</h1>
              <p className="text-zinc-400 text-sm">
                Pokémon, Yu-Gi-Oh!, Magic and sports cards. Set, rarity, condition and grading
                checks.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Trading Cards</Badge>
          <Badge variant="secondary">Pokémon</Badge>
          <Badge variant="secondary">Magic</Badge>
          <Badge variant="secondary">Sports Cards</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What CardLens analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {FOCUS_AREAS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="text-cyan-400 mt-0.5">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photo tips for best results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {PHOTO_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-emerald-400 mt-0.5">📷</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-900/40">
          <CardHeader>
            <CardTitle className="text-base">Guard checks for buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500 mb-3">
              When used with Guard, CardLens flags these specific risk signals in trading card
              listings:
            </p>
            <ul className="space-y-2">
              {GUARD_CHECKS.map((check) => (
                <li key={check} className="flex items-start gap-2 text-sm text-amber-300/80">
                  <span className="mt-0.5">⚠</span>
                  {check}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            className="bg-cyan-600 hover:bg-cyan-500"
            onClick={() => navigate("/studio/new?lens=CardLens")}
          >
            Start listing
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=CardLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
