import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AUTOGRAPH_FOCUS = [
  "Signed item type (photo, book, shirt, ball, bat, etc.)",
  "Claimed signer and signature location on the item",
  "Ink visibility, pen type and signature legibility",
  "COA (Certificate of Authenticity) — issuer, hologram, item description match",
  "Provenance chain: purchase receipts, event photos, verifiable source",
  "In-person signing evidence (photo or video with signer)",
  "Item condition and preservation / framing quality",
  "COA issuer credibility (PSA/DNA, Beckett, JSA, AFTAL vs unknown issuers)",
];

const AUTOGRAPH_PHOTO_TIPS = [
  "Photograph the signature close-up — it must be sharp and fully in frame.",
  "Show the COA front and back, including the hologram and issuer name.",
  "Include any in-person signing photos or videos — these are the strongest evidence.",
  "Photograph the full item so the context of the signature is clear.",
  "Show any purchase receipts, event tickets or other provenance paperwork.",
];

const GUARD_CHECKS = [
  "Generic or unknown COA issuer — self-issued COAs carry no weight",
  "No COA at all for a high-value signature claim",
  "COA item description does not match the listed item",
  "No provenance chain beyond 'I bought it at a market'",
  "Ink fading, smearing or signature inconsistency vs known references",
  "Price anomalously low for a claimed high-demand signer",
  "No in-person signing evidence for rare or deceased signers",
];

export default function AutographLensPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Lens · AutographLens
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">✍️</span>
            <div>
              <h1 className="text-2xl font-bold text-white">AutographLens</h1>
              <p className="text-zinc-400 text-sm">
                Signed memorabilia, COAs, provenance checks and risk reports.
                Evidence-led analysis — AutographLens never authenticates signatures.
              </p>
            </div>
          </div>
          <div className="hud-divider mt-3 max-w-[160px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">Live</Badge>
          <Badge variant="secondary">Autographs</Badge>
          <Badge variant="secondary">Signed Memorabilia</Badge>
          <Badge variant="secondary">COAs</Badge>
          <Badge variant="secondary">Provenance</Badge>
        </div>

        <Card className="border-red-900/30">
          <CardContent className="pt-4">
            <p className="text-xs text-red-300/80 leading-relaxed">
              <strong>Important:</strong> AutographLens produces a provenance evidence risk report only.
              It does not authenticate signatures. For high-value signed items, always obtain
              third-party authentication from a recognised service such as PSA/DNA, Beckett (BAS),
              JSA or AFTAL before buying or selling.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What AutographLens analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {AUTOGRAPH_FOCUS.map((item) => (
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
              {AUTOGRAPH_PHOTO_TIPS.map((tip) => (
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
              When used with Guard, AutographLens flags these specific provenance risk signals:
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
            onClick={() => navigate("/studio/new?lens=AutographLens")}
          >
            Use AutographLens in Studio
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => navigate("/guard/new?lens=AutographLens")}
          >
            Check a listing with Guard
          </Button>
        </div>
      </main>
    </div>
  );
}
