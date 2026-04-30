import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/dashboard", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user!.id;

  try {
    const [user] = await db
      .select({
        credits: usersTable.credits,
        planTier: usersTable.planTier,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    res.json({
      studioCount: 0,
      guardCount: 0,
      credits: user?.credits ?? 0,
      planTier: user?.planTier ?? "free",
      recentActivity: [] as {
        id: string;
        type: "studio" | "guard";
        title: string;
        status: string;
        date: string;
        href: string;
      }[],
    });
  } catch (err) {
    logger.error({ err, userId }, "Dashboard query failed");
    res.status(500).json({ error: "Failed to load dashboard data." });
  }
});

export default router;
