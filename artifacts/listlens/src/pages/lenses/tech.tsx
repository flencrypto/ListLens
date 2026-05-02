import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TECH_FOCUS = [
  "Brand, model, variant, storage and spec",
  "Model number and serial / IMEI visibility",
  "Screen and body damage assessment",
  "Ports, buttons and camera module condition",
  "Battery health evidence",
  "Included accessories, charger and packaging",
  "Tested / untested status and fault notes",
  "Activation lock and network lock risk",
];

const TECH_PHOTO_TIPS = [
  "Power the device on and show the home screen or settings 'About' page.",
  "For phones, photograph the IMEI sticker and the About screen side by side.",
  "Include a Battery Health screenshot (Settings > Battery on iOS; third-party app on Android).",
  "Shoot all four sides of the device, front, back, and the port edge.",
  "Show original box, charger, cables and earbuds if included.",
];

const GUARD_CHECKS = [
  "Missing powered-on photo — major risk indicator",
  "Activation lock / network lock evidence",
  "Spec and model mismatch vs listing description",
  "No IMEI check evidence for phone listings",
  "Battery health not disclosed on high-value devices",
  "Stolen / blacklisted device risk",
];

export default function TechLensPage() {
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
            Lens · TechLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📱</span>
            <div>
              <h1 className="text-2xl font-bold text-white">TechLens</h1>
              <p className="text-zinc-400 text-sm">
                Phones, laptops, cameras, consoles and audio gear. Model identification,
                condition grading and accessory completeness.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Electronics</Badge>
          <Badge variant="secondary">Phones</Badge>
          <Badge variant="secondary">Laptops</Badge>
          <Badge variant="secondary">Cameras</Badge>
          <Badge variant="secondary">Consoles</Badge>
          <Badge variant="secondary">Audio</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What TechLens analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {TECH_FOCUS.map((item) => (
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
              {TECH_PHOTO_TIPS.map((tip) => (
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
              When used with Guard, TechLens flags these specific risk signals in tech listings:
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
            onClick={() => navigate("/studio/new?lens=TechLens")}
          >
            Use TechLens in Studio
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=TechLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
