export const metadata = {
  title: "Terms of Service · ListLens",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-invert">
      <h1>Terms of Service</h1>
      <p>
        These Terms govern your use of ListLens (the &ldquo;Service&rdquo;). By creating an account or
        otherwise using the Service you agree to these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        ListLens provides AI-assisted listing creation (&ldquo;Studio&rdquo;), AI-assisted buyer risk
        screening (&ldquo;Guard&rdquo;), and related tools. ListLens is an evidence-led assistant; it
        does not provide formal authentication, appraisal, or guarantees of authenticity.
      </p>

      <h2>2. Acceptable use</h2>
      <ul>
        <li>You may not use the Service to create listings that violate any marketplace&apos;s terms.</li>
        <li>You may not use the Service to scrape, automate, or interfere with marketplace platforms.</li>
        <li>
          You may not present ListLens output as a formal certificate of authenticity, provenance, or
          condition.
        </li>
      </ul>

      <h2>3. AI output</h2>
      <p>
        AI output is probabilistic and may be incomplete or wrong. You are responsible for reviewing every
        listing draft and risk report before acting on it. See our{" "}
        <a href="/legal/ai-disclaimer">AI Disclaimer</a> for details.
      </p>

      <h2>4. Payments</h2>
      <p>
        Paid plans and credits are processed by Stripe. Charges are non-refundable except where required
        by law.
      </p>

      <h2>5. Termination</h2>
      <p>
        We may suspend or terminate access for breach of these Terms or for activity that puts the Service,
        other users, or marketplaces at risk.
      </p>

      <h2>6. Liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo;. To the maximum extent permitted by law, ListLens is
        not liable for indirect or consequential losses, lost profits, or losses arising from reliance on
        AI output.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these Terms. Material changes will be communicated via the Service or by email.
      </p>

      <p className="text-zinc-500 text-sm mt-12">Last updated: 2026-04-28</p>
    </main>
  );
}
