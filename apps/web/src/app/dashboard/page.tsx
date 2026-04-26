import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  await auth();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Studio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 mb-4">Upload photos and let AI create your listing.</p>
              <Link href="/studio/new">
                <Button>New listing</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Guard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 mb-4">Check a listing before you buy.</p>
              <Link href="/guard/new">
                <Button variant="secondary">Check listing</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
