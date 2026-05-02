import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOCUS_AREAS = [
  "Sleeve grade (VG, VG+, EX, NM) with visual evidence",
  "Media grade and playback surface condition",
  "Matrix / runout inscription and pressing country",
  "Original vs repress vs reissue identification",
  "Label variant and catalogue number verification",
  "Seam splits, ring wear and spine damage",
  "Insert and inner sleeve completeness",
  "Country-of-pressing consistency cross-check",
];

const PHOTO_TIPS = [
  "Photograph front and back of sleeve in natural daylight.",
  "Include a close-up of the label on both sides (Side A and Side B).",
  "Shoot the matrix runout area in the dead wax — angle the light to reveal etchings.",
  "Show any inserts, lyric sheet or original inner sleeve.",
  "Capture seams and spine at close range to show split or wear accurately.",
];

const GUARD_CHECKS = [
  "Grade inflation — NM claimed but sleeve shows ring wear",
  "Wrong pressing country vs catalogue number",
  "Repress sold as original first pressing",
  "Missing insert or replaced inner sleeve not disclosed",
  "Matrix text inconsistent with stated pressing year",
  "Seam splits or spine damage hidden by cropped photos",
];

export default function LPLensPage() {
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
            Lens · LPLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎵</span>
            <div>
              <h1 className="text-2xl font-bold text-white">LPLens</h1>
              <p className="text-zinc-400 text-sm">
                LP vinyl albums. Sleeve and media grading, matrix runout, pressing country and
                edition details.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Music Media</Badge>
          <Badge variant="secondary">Vinyl</Badge>
          <Badge variant="secondary">Albums</Badge>
          <Badge variant="secondary">Grading</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What LPLens analyses</CardTitle>
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
              When used with Guard, LPLens flags these specific risk signals in vinyl listings:
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
            onClick={() => navigate("/studio/new?lens=LPLens")}
          >
            Start listing
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=LPLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
