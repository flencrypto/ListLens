export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-invert">
      <h1>Privacy Policy</h1>
      <p>This Policy describes what data ListLens collects, why, and how we handle it.</p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — name, email, avatar (via Clerk).
        </li>
        <li>
          <strong>Listing data</strong> — photos, hints and AI output you create using Studio.
        </li>
        <li>
          <strong>Risk-check data</strong> — URLs, screenshots and AI output you create using Guard.
        </li>
        <li>
          <strong>Billing data</strong> — Stripe customer id and subscription state. We do not store card
          numbers.
        </li>
        <li>
          <strong>Operational data</strong> — request logs and error reports (PII redacted where possible).
        </li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell personal data.</li>
        <li>
          We do not share your photos or listing drafts with third parties beyond the AI provider that
          processes them on our behalf.
        </li>
        <li>The browser extension only sends listing data after you click an explicit action.</li>
      </ul>

      <h2>AI providers</h2>
      <p>
        AI analysis is performed by OpenAI under their data-processing terms. Inputs and outputs are
        retained by ListLens for audit and quality assurance.
      </p>

      <h2>Cookies</h2>
      <p>We use first-party cookies for authentication and CSRF protection only. Analytics are loaded
        only after explicit consent.</p>

      <h2>Your rights</h2>
      <p>
        You can export your data, correct inaccurate data, or request deletion at any time by contacting
        support. Deletion removes account-linked records and anonymises operational logs after a 30-day
        retention window.
      </p>

      <p className="text-zinc-500 text-sm mt-12">Last updated: 2026-04-28</p>
    </main>
  );
}
