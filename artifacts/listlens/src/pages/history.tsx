import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { BrandGlyph } from "@/components/brand/brand-glyph";

interface Listing {
  id: string;
  lens: string;
  marketplace: string | null;
  title: string | null;
  description: string | null;
  price: string | null;
  status: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/items")
      .then(async (res) => {
        if (res.status === 401) {
          setError("Sign in to see your history.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load listings");
        const data = await res.json();
        setListings(data.listings ?? []);
      })
      .catch(() => setError("Could not load listings."))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
              Archive · v1.0
            </p>
            <h1 className="text-2xl font-bold text-white mb-1">History</h1>
            <p className="text-zinc-400 text-sm">Your saved listings and Guard checks.</p>
            <div className="hud-divider mt-3 max-w-[160px]" />
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-500">
              <Link href="/studio/new">New listing</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-violet-700 text-violet-300 hover:bg-violet-950/40">
              <Link href="/guard/new">New check</Link>
            </Button>
          </div>
        </div>

        {/* Listings section */}
        <div className="brand-card p-6">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>📸</span> Studio Listings
            </h2>
            {!loading && !error && (
              <Badge variant="secondary">{listings.length} listing{listings.length !== 1 ? "s" : ""}</Badge>
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <Spinner className="text-cyan-400" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-zinc-800 gap-3">
              <p className="text-zinc-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-zinc-800 gap-3">
              <p className="text-zinc-500 text-sm">No listings yet.</p>
              <p className="text-zinc-600 text-xs max-w-xs text-center">
                Create a listing in Studio. After analysis, your drafts will appear here.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/studio/new">Create first listing</Link>
              </Button>
            </div>
          )}

          {!loading && !error && listings.length > 0 && (
            <div className="space-y-3">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/studio/${listing.id}`}>
                  <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 hover:border-cyan-800/50 hover:bg-zinc-900 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {listing.title ?? `${listing.lens} draft`}
                      </p>
                      {listing.description && (
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{listing.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {listing.price && (
                        <span className="text-xs text-cyan-400 font-mono-hud">£{listing.price}</span>
                      )}
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                        {listing.lens}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={
                          listing.status === "analysed"
                            ? "bg-cyan-900/30 text-cyan-400 border border-cyan-800/30"
                            : "bg-zinc-800 text-zinc-400"
                        }
                      >
                        {listing.status}
                      </Badge>
                      <span className="text-xs text-zinc-600">{formatDate(listing.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="hud-divider opacity-40" />

        {/* Guard checks section */}
        <div className="brand-card brand-card-violet p-6">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>🛡️</span> Guard Checks
            </h2>
            <Badge variant="secondary">0 checks</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-zinc-800 gap-3">
            <p className="text-zinc-500 text-sm">No Guard checks yet.</p>
            <p className="text-zinc-600 text-xs max-w-xs text-center">
              Check a listing before you buy. Saved reports will appear here.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/guard/new">Check a listing</Link>
            </Button>
          </div>
        </div>
        <div className="hud-divider opacity-30" />
        <div className="flex justify-center py-2">
          <BrandGlyph size={22} showSparks={false} />
        </div>
      </main>
    </div>
  );
}
