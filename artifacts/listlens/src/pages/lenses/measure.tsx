import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOCUS_AREAS = [
  "Pixel-calibrated dimension estimation using a reference object",
  "Length, width and height derived from photo geometry",
  "Standard reference objects: coins, credit cards, rulers, A4 paper",
  "Garment flat-lay measurements — chest, waist, length, sleeve",
  "Part fitment checks — dimension cross-reference against specs",
  "Confidence interval reporting for each estimated measurement",
  "Multiple reference objects for cross-validation",
  "Scale ambiguity warnings when reference is absent or unclear",
];

const PHOTO_TIPS = [
  "Place a reference object (coin, credit card or ruler) directly next to the item.",
  "Shoot from directly above in a flat-lay — avoid perspective distortion.",
  "Use a plain, high-contrast background so edges are clearly visible.",
  "For garments, lay completely flat with no bunching or folding.",
  "Photograph in bright, even light to eliminate shadows that obscure edges.",
];

const GUARD_CHECKS = [
  "No reference object — dimensions cannot be verified from photo alone",
  "Reference object placed at an angle introducing scale error",
  "Stated dimensions inconsistent with photo geometry",
  "Perspective distortion making measurement unreliable",
  "Garment bunched or hung rather than laid flat",
  "Scale reference cropped out of frame",
];

export default function MeasureLensPage() {
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
            Lens · MeasureLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📐</span>
            <div>
              <h1 className="text-2xl font-bold text-white">MeasureLens</h1>
              <p className="text-zinc-400 text-sm">
                Physical reference object for accurate dimension estimation. Ideal for garments,
                parts and any item where size matters.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Measurement</Badge>
          <Badge variant="secondary">Garments</Badge>
          <Badge variant="secondary">Parts</Badge>
          <Badge variant="secondary">Dimensions</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What MeasureLens analyses</CardTitle>
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
              When used with Guard, MeasureLens flags these specific risk signals related to
              dimensions and scale:
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
            onClick={() => navigate("/studio/new?lens=MeasureLens")}
          >
            Start listing
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=MeasureLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
