import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BOOK_FOCUS = [
  "Title, author, publisher and year",
  "Edition and printing statement from the copyright page",
  "ISBN and format (hardback / paperback / first edition)",
  "Dust jacket presence and condition",
  "Spine condition: tight, bumped, sunned or cracked",
  "Boards or covers: foxing, staining, inscriptions",
  "Pages: tanning, foxing, annotations, missing pages",
  "Signatures and dedications with provenance evidence",
  "Completeness: maps, plates, inserts",
];

const BOOK_PHOTO_TIPS = [
  "Always photograph the copyright page — it is essential for first edition claims.",
  "Shoot the spine, all four edges and both boards / covers.",
  "Include a close-up of any signature, bookplate or ownership inscription.",
  "Show the dust jacket front, spine, back and inside flaps separately.",
  "Photograph any ISBN barcode and the back cover price clipping.",
];

const GUARD_CHECKS = [
  "First edition claim without copyright page evidence",
  "Missing printing statement photo for premium-priced listings",
  "ISBN mismatch with claimed edition or year",
  "Dust jacket damage not disclosed in description",
  "Signature claimed without provenance — recommend AutographLens",
  "Missing maps, plates or inserts in illustrated editions",
];

export default function BookLensPage() {
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
            Lens · BookLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-2xl font-bold text-white">BookLens</h1>
              <p className="text-zinc-400 text-sm">
                Books, first editions, signed copies, rare print and textbooks.
                Edition verification, condition grading and provenance checks.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Books</Badge>
          <Badge variant="secondary">First Editions</Badge>
          <Badge variant="secondary">Signed Copies</Badge>
          <Badge variant="secondary">Rare Print</Badge>
          <Badge variant="secondary">Textbooks</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What BookLens analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {BOOK_FOCUS.map((item) => (
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
              {BOOK_PHOTO_TIPS.map((tip) => (
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
              When used with Guard, BookLens flags these specific risk signals:
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
            onClick={() => navigate("/studio/new?lens=BookLens")}
          >
            Use BookLens in Studio
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=BookLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
