import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — ListLens",
  description: "You're offline. Reconnect to keep listing and checking.",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-zinc-950 text-zinc-100">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-3xl">
          📡
        </div>
        <h1 className="text-2xl font-semibold mb-3">You&apos;re offline</h1>
        <p className="text-zinc-400 mb-8">
          ListLens needs an internet connection for AI analysis, marketplace
          lookups, and account sync. Reconnect and try again.
        </p>
        <a
          href="/"
          className="inline-block rounded-md bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500"
        >
          Retry
        </a>
      </div>
    </main>
  );
}
