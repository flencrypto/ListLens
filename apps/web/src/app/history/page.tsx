import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HistoryPage() {
  await auth();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">History</h1>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">No activity yet. Create your first listing with Studio or check a listing with Guard.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
