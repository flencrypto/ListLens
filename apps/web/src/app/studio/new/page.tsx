"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewStudioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lens: "ShoeLens" }),
    });
    const data = await res.json();
    router.push(`/studio/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">New Listing</h1>
        <Card>
          <CardHeader>
            <CardTitle>Choose lens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-400">Select the AI lens for your item type.</p>
            <Button onClick={handleStart} disabled={loading}>
              {loading ? "Creating…" : "Start with ShoeLens"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
