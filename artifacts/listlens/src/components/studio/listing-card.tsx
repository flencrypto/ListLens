import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export interface ListingCardData {
  id: string;
  title: string | null;
  price: string | null;
  status: string;
  lens: string;
  photoUrls: string[];
  createdAt: string;
}

function statusBadge(status: string) {
  switch (status) {
    case "analysed":
    case "analyzed":
      return (
        <Badge className="bg-cyan-900/60 text-cyan-300 border-cyan-700/50 text-[10px] px-1.5 py-0">
          Analysed
        </Badge>
      );
    case "published":
      return (
        <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700/50 text-[10px] px-1.5 py-0">
          Published
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/50 text-[10px] px-1.5 py-0">
          Draft
        </Badge>
      );
  }
}

function relativeDate(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const thumb = listing.photoUrls[0];

  return (
    <Link href={`/studio/${listing.id}`}>
      <div className="brand-card overflow-hidden cursor-pointer group hover:shadow-[0_0_28px_-10px_rgba(34,211,238,0.5)] hover:-translate-y-0.5 transition-all flex flex-col">
        <div className="relative w-full aspect-square bg-zinc-900 overflow-hidden">
          {thumb ? (
            <img
              src={thumb}
              alt={listing.title ?? "Listing photo"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18A.75.75 0 0021.75 21v-3.75M16.5 8.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          )}
          <div className="absolute top-1.5 right-1.5">
            {statusBadge(listing.status)}
          </div>
        </div>
        <div className="p-3 flex flex-col gap-0.5 flex-1">
          <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors leading-snug">
            {listing.title ?? "Untitled listing"}
          </p>
          <div className="flex items-center justify-between mt-auto pt-1.5">
            {listing.price ? (
              <span className="text-sm font-semibold text-cyan-300">{listing.price}</span>
            ) : (
              <span className="text-xs text-zinc-600">No price</span>
            )}
            <span className="text-[10px] text-zinc-600">{relativeDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
