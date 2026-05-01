import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ANTIQUES_FOCUS = [
  "Object type, material and construction technique",
  "Era or style — expressed cautiously ('appears consistent with', 'possibly', 'style of')",
  "Maker marks, hallmarks, factory stamps and impressed numbers",
  "Dimensions and overall form",
  "Chips, cracks, hairlines, fills and repairs",
  "Patina and surface consistency with claimed age",
  "Missing parts or later additions",
  "Provenance: auction labels, estate sale paperwork, old dealer labels",
  "Estimated price range based on current market evidence",
];

const ANTIQUES_PHOTO_TIPS = [
  "Photograph the base / underside showing the foot rim, glaze and any marks.",
  "Shoot maker marks with a macro lens or macro mode — they must be legible.",
  "Shine a torch at 45° across the surface to reveal hairlines and crazing.",
  "Include photos from all angles: front, back, sides, top, and underneath.",
  "Show any auction stickers, estate sale tags or dealer labels — they add provenance.",
];

const GUARD_CHECKS = [
  "No close-up of maker marks — prevents attribution verification",
  "Era or style claimed definitively without evidence",
  "Hairlines, cracks or filled repairs not disclosed in description",
  "Patina inconsistency suggesting later reproduction or refinishing",
  "Price anomalously low for a claimed rare or named maker piece",
  "No provenance paperwork for high-value claims",
];

export default function AntiquesLensPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Lens · AntiquesLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏺</span>
            <div>
              <h1 className="text-2xl font-bold text-white">AntiquesLens</h1>
              <p className="text-zinc-400 text-sm">
                Antiques, ceramics, silverplate, vintage homeware and estate items.
                Maker marks, era consistency, condition and reproduction risk — expressed with careful,
                evidence-led language.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Antiques</Badge>
          <Badge variant="secondary">Ceramics</Badge>
          <Badge variant="secondary">Silverplate</Badge>
          <Badge variant="secondary">Vintage Homeware</Badge>
          <Badge variant="secondary">Estate Items</Badge>
        </div>

        <Card className="border-amber-900/30">
          <CardContent className="pt-4">
            <p className="text-xs text-amber-300/80 leading-relaxed">
              <strong>Trust note:</strong> AntiquesLens uses cautious attribution language — "appears
              consistent with", "possibly", "style of" — and never makes definitive maker
              attributions from photos alone. For high-value pieces, always seek in-person specialist
              appraisal.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What AntiquesLens analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {ANTIQUES_FOCUS.map((item) => (
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
              {ANTIQUES_PHOTO_TIPS.map((tip) => (
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
              When used with Guard, AntiquesLens flags these specific risk signals:
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
            onClick={() => navigate("/studio/new?lens=AntiquesLens")}
          >
            Use AntiquesLens in Studio
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=AntiquesLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
