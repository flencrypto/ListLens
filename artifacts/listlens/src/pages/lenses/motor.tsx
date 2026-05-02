import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOCUS_AREAS = [
  "Make, model, year, trim level and engine variant",
  "VIN / chassis number visibility and format check",
  "Exterior condition — panels, paint, rust and accident evidence",
  "Interior condition — dash, seats, headlining and electrics",
  "Tyre brand, tread depth estimate and rim condition",
  "Service history evidence and cambelt / timing chain status",
  "Camper and motorhome conversion quality assessment",
  "Part fitment checks — OEM vs aftermarket and compatibility",
];

const PHOTO_TIPS = [
  "Photograph all four corners of the vehicle in good light.",
  "Include the dashboard with ignition on to show warning lights.",
  "Capture the sills, arches and underbody if accessible.",
  "Show the engine bay with the bonnet open.",
  "Photograph the VIN plate (dashboard and door jamb) clearly.",
  "For campers, photograph the conversion interior — kitchen, bed and electrics.",
];

const GUARD_CHECKS = [
  "VIN format inconsistent with stated make and year",
  "Panel gap or paint overspray indicating accident repair",
  "Warning lights visible on dashboard in listing photos",
  "Tyre wear or cracking not disclosed",
  "Rust on sills or arches cropped from frame",
  "Part listing — fitment claim inconsistent with item markings",
  "Mileage inconsistency across multiple listing photos",
];

export default function MotorLensPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Lens · MotorLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚗</span>
            <div>
              <h1 className="text-2xl font-bold text-white">MotorLens</h1>
              <p className="text-zinc-400 text-sm">
                Vehicles, parts and campers. Image-based condition, fitment and provenance checks.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Vehicles &amp; Parts</Badge>
          <Badge variant="secondary">Cars</Badge>
          <Badge variant="secondary">Campers</Badge>
          <Badge variant="secondary">Parts</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What MotorLens analyses</CardTitle>
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
              When used with Guard, MotorLens flags these specific risk signals in vehicle and parts
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
            onClick={() => navigate("/studio/new?lens=MotorLens")}
          >
            Start listing
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=MotorLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
