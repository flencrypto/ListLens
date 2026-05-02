import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOCUS_AREAS = [
  "Brand, label and care tag identification",
  "Era and decade dating from label style and font",
  "Size label reading and modern size equivalent",
  "Fabric composition and weave description",
  "Condition grading — fading, pilling, stains, repairs",
  "Measurements from photos with reference objects",
  "Vintage authenticity signals and reproduction flags",
  "Distressing — natural vs artificial wear",
];

const PHOTO_TIPS = [
  "Lay the garment flat on a neutral background with no creases.",
  "Photograph the brand label, care label and any size tags clearly.",
  "Include a measuring tape or ruler alongside for scale.",
  "Shoot front, back and any detail areas (pockets, collar, cuffs).",
  "In natural light, capture any fading, staining or repair work honestly.",
];

const GUARD_CHECKS = [
  "Size label mismatch vs stated measurements",
  "Reproduction label on claimed vintage piece",
  "Undisclosed staining or alterations",
  "Fabric composition misrepresented in listing",
  "Era mismatch — styling inconsistent with claimed decade",
  "Missing care label on vintage items",
];

export default function ClothingLensPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Lens · ClothingLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">👕</span>
            <div>
              <h1 className="text-2xl font-bold text-white">ClothingLens</h1>
              <p className="text-zinc-400 text-sm">
                Clothing, vintage garments and apparel. Size label, fit, measurements and
                authenticity signals.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Apparel</Badge>
          <Badge variant="secondary">Vintage</Badge>
          <Badge variant="secondary">Fashion</Badge>
          <Badge variant="secondary">Sizing</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What ClothingLens analyses</CardTitle>
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
              When used with Guard, ClothingLens flags these specific risk signals in clothing
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
            onClick={() => navigate("/studio/new?lens=ClothingLens")}
          >
            Start listing
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=ClothingLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
