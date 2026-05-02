import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOCUS_AREAS = [
  "Brand, line, set number and year of manufacture",
  "Figure or model completeness — all accessories and parts",
  "LEGO set completeness and minifigure identification",
  "Packaging condition — box, inserts and instructions",
  "Reproduction and bootleg detection signals",
  "Paint wear, breakage and play-wear grading",
  "Original vs re-issue vs licensed reproduction",
  "Battery compartment and electronic functionality evidence",
];

const PHOTO_TIPS = [
  "Lay all parts and accessories out together for a completeness shot.",
  "Include the original box and any instructions, even if damaged.",
  "Photograph any markings, stamps or copyright dates on the base or feet.",
  "Show all sides of the figure or model, including underside.",
  "Capture close-ups of any paint chips, cracks or stress marks.",
];

const GUARD_CHECKS = [
  "Missing parts or accessories not disclosed",
  "Bootleg or unlicensed reproduction sold as official",
  "Re-seal on claimed factory-sealed packaging",
  "Year of manufacture inconsistent with stated vintage",
  "Paint touch-ups or repairs not mentioned",
  "LEGO set number mismatch vs parts shown",
];

export default function ToyLensPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Link href="/lenses" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/90 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Lenses
        </Link>
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Lens · ToyLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧸</span>
            <div>
              <h1 className="text-2xl font-bold text-white">ToyLens</h1>
              <p className="text-zinc-400 text-sm">
                Toys, figures and LEGO. Completeness, packaging condition and reproduction checks.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Toys &amp; Collectibles</Badge>
          <Badge variant="secondary">Figures</Badge>
          <Badge variant="secondary">LEGO</Badge>
          <Badge variant="secondary">Vintage Toys</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What ToyLens analyses</CardTitle>
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
              When used with Guard, ToyLens flags these specific risk signals in toy and collectible
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
            onClick={() => navigate("/studio/new?lens=ToyLens")}
          >
            Start listing
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=ToyLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
