import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOCUS_AREAS = [
  "Brand, reference number and model line identification",
  "Dial variant — colour, text, indices and hands",
  "Case material, size and lug-to-lug dimensions",
  "Serial number era dating and reference cross-check",
  "Movement type evidence (auto, manual, quartz)",
  "Bracelet or strap originality and clasp marks",
  "Service history evidence and crown / pusher condition",
  "Box and papers (B&P) presence and matching serial",
];

const PHOTO_TIPS = [
  "Photograph the dial straight-on with the watch running (seconds hand visible).",
  "Show the case back — unscrew if possible to reveal movement and serial.",
  "Include a close-up of the crown side to show pushers, gasket and any wear.",
  "Lay the bracelet fully extended and flat to show clasp and link condition.",
  "Photograph any box, guarantee card or papers with the serial number legible.",
];

const GUARD_CHECKS = [
  "Reference number inconsistent with dial or case proportions",
  "Aftermarket dial replacing original — font or index anomalies",
  "Serial number era mismatch with stated model year",
  "Non-original bracelet or strap not disclosed",
  "Missing crown or damaged pushers not mentioned",
  "B&P serial mismatch with case serial",
];

export default function WatchLensPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Lens · WatchLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">⌚</span>
            <div>
              <h1 className="text-2xl font-bold text-white">WatchLens</h1>
              <p className="text-zinc-400 text-sm">
                Watches and timepieces. Reference, dial variant and provenance evidence checks.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Watches</Badge>
          <Badge variant="secondary">Timepieces</Badge>
          <Badge variant="secondary">Luxury</Badge>
          <Badge variant="secondary">Vintage</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What WatchLens analyses</CardTitle>
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
              When used with Guard, WatchLens flags these specific risk signals in watch listings:
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
            onClick={() => navigate("/studio/new?lens=WatchLens")}
          >
            Start listing
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=WatchLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
