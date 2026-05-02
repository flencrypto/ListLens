import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, studioItemsTable, guardChecksTable, listingsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/dashboard", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user!.id;

  try {
    const [[user], [studioCountRow], [guardCountRow], recentStudio, recentGuard, recentListings] =
      await Promise.all([
        db
          .select({ credits: usersTable.credits, planTier: usersTable.planTier })
          .from(usersTable)
          .where(eq(usersTable.id, userId)),
        db
          .select({ count: count() })
          .from(studioItemsTable)
          .where(eq(studioItemsTable.userId, userId)),
        db
          .select({ count: count() })
          .from(guardChecksTable)
          .where(eq(guardChecksTable.userId, userId)),
        db
          .select()
          .from(studioItemsTable)
          .where(eq(studioItemsTable.userId, userId))
          .orderBy(desc(studioItemsTable.createdAt))
          .limit(5),
        db
          .select()
          .from(guardChecksTable)
          .where(eq(guardChecksTable.userId, userId))
          .orderBy(desc(guardChecksTable.createdAt))
          .limit(5),
        db
          .select({
            id: listingsTable.id,
            title: listingsTable.title,
            price: listingsTable.price,
            status: listingsTable.status,
            lens: listingsTable.lens,
            photoUrls: listingsTable.photoUrls,
            createdAt: listingsTable.createdAt,
          })
          .from(listingsTable)
          .where(eq(listingsTable.userId, userId))
          .orderBy(desc(listingsTable.createdAt))
          .limit(20),
      ]);

    const studioActivity = recentStudio.map((item) => ({
      id: item.id,
      type: "studio" as const,
      title: item.title ?? "Studio listing",
      status: item.status,
      date: item.createdAt.toISOString(),
      href: `/studio/${item.id}`,
    }));

    const guardActivity = recentGuard.map((item) => ({
      id: item.id,
      type: "guard" as const,
      title: item.url ? (() => { try { return new URL(item.url!).hostname; } catch { return item.url!; } })() : "Guard check",
      status: item.riskLevel ?? item.status,
      date: item.createdAt.toISOString(),
      href: `/guard/${item.id}`,
    }));

    const recentActivity = [...studioActivity, ...guardActivity]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const listings = recentListings.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      status: item.status,
      lens: item.lens,
      photoUrls: (item.photoUrls ?? []).slice(0, 1),
      createdAt: item.createdAt.toISOString(),
    }));

    res.json({
      studioCount: studioCountRow?.count ?? 0,
      guardCount: guardCountRow?.count ?? 0,
      credits: user?.credits ?? 0,
      planTier: user?.planTier ?? "free",
      recentActivity,
      listings,
    });
  } catch (err) {
    logger.error({ err, userId }, "Dashboard query failed");
    res.status(500).json({ error: "Failed to load dashboard data." });
  }
});

export default router;
