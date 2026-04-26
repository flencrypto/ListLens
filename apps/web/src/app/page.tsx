import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">
          List smarter.{" "}
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Buy safer.
          </span>
        </h1>
        <p className="text-xl text-zinc-400 mb-8">
          AI-powered listing studio and buyer protection for eBay and Vinted.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/guard/new">
            <Button size="lg" variant="outline">Check a listing</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
