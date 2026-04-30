import { Navbar } from "@/components/layout/navbar";

export default function AiDisclaimerPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="brand-card brand-card-violet p-8 prose prose-invert">
          <p className="text-violet-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2 not-prose">
            Legal · AI Disclaimer
          </p>
          <h1 className="!mt-0">AI Disclaimer</h1>
          <div className="hud-divider not-prose mb-6" />
          <p>
            ListLens uses AI to assist sellers in writing listing drafts and to assist buyers in screening
            listings for risk. ListLens is <strong>not</strong> a formal authentication, appraisal, grading,
            or certification service.
          </p>

          <h2>What ListLens does</h2>
          <ul>
            <li>Identifies likely items, categories and attributes from photos and listing context.</li>
            <li>Suggests pricing ranges based on heuristics and comparable sales where available.</li>
            <li>Highlights missing evidence, possible red flags and questions to ask the seller.</li>
          </ul>

          <h2>What ListLens does not do</h2>
          <ul>
            <li>It does not declare items genuine, fake, original, mint, rare or first pressing.</li>
            <li>It does not authenticate signatures, watches, sneakers, cards or any other item.</li>
            <li>It does not guarantee that pricing is accurate or current.</li>
            <li>
              Guard reports are an &ldquo;AI-assisted risk screen, not formal authentication.&rdquo; This wording
              is enforced in our safety guardrails on every report.
            </li>
          </ul>

          <h2>Your responsibility</h2>
          <p>
            Always review AI output before publishing a listing or making a purchase. For high-value items we
            recommend independent third-party authentication.
          </p>

          <p className="text-zinc-500 text-sm mt-12 not-prose">Last updated: 2026-04-28</p>
        </div>
      </main>
    </div>
  );
}
