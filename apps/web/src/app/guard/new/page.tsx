"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function NewGuardPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const res = await fetch("/api/guard/checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, lens: "ShoeLens" }),
    });
    const data = await res.json();
    router.push(`/guard/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Guard — Check a Listing</h1>
        <Card>
          <CardHeader><CardTitle>Listing URL</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="https://www.vinted.co.uk/items/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={handleStart} disabled={loading || !url.trim()}>
              {loading ? "Starting…" : "Start Guard Check"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
