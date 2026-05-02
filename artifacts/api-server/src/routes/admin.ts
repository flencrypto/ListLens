import { Router, type IRouter, type Request, type Response } from "express";
import { db, aiJobLogsTable, usageEventsTable } from "@workspace/db";
import {
  and,
  eq,
  gte,
  lte,
  desc,
  count,
  sum,
  avg,
  sql,
} from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function requireAdminKey(req: Request, res: Response): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    logger.warn("ADMIN_API_KEY env var is not set — admin endpoints are disabled");
    res.status(503).json({ error: "Admin endpoints are not configured on this server." });
    return false;
  }
  const provided = req.headers["x-admin-key"];
  if (!provided || provided !== adminKey) {
    res.status(401).json({ error: "Unauthorized. Valid X-Admin-Key header required." });
    return false;
  }
  return true;
}

function parsePagination(query: Record<string, unknown>): { limit: number; offset: number } {
  const limit = Math.min(Math.max(parseInt(String(query["limit"] ?? "50"), 10) || 50, 1), 200);
  const page = Math.max(parseInt(String(query["page"] ?? "1"), 10) || 1, 1);
  const offset = (page - 1) * limit;
  return { limit, offset };
}

router.get("/admin/ai-job-logs", async (req: Request, res: Response) => {
  if (!requireAdminKey(req, res)) return;

  const q = req.query as Record<string, unknown>;
  const { limit, offset } = parsePagination(q);

  const conditions = [];

  if (typeof q["jobType"] === "string" && q["jobType"]) {
    conditions.push(eq(aiJobLogsTable.jobType, q["jobType"]));
  }
  if (typeof q["userId"] === "string" && q["userId"]) {
    conditions.push(eq(aiJobLogsTable.userId, q["userId"]));
  }
  if (typeof q["from"] === "string" && q["from"]) {
    const fromDate = new Date(q["from"]);
    if (!isNaN(fromDate.getTime())) {
      conditions.push(gte(aiJobLogsTable.createdAt, fromDate));
    }
  }
  if (typeof q["to"] === "string" && q["to"]) {
    const toDate = new Date(q["to"]);
    if (!isNaN(toDate.getTime())) {
      conditions.push(lte(aiJobLogsTable.createdAt, toDate));
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const [rows, [totals], jobTypeCounts] = await Promise.all([
      db
        .select()
        .from(aiJobLogsTable)
        .where(where)
        .orderBy(desc(aiJobLogsTable.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({
          totalRows: count(),
          totalCostPence: sum(aiJobLogsTable.estimatedCostPence),
          avgPromptTokens: avg(aiJobLogsTable.promptTokens),
          avgCompletionTokens: avg(aiJobLogsTable.completionTokens),
        })
        .from(aiJobLogsTable)
        .where(where),

      db
        .select({
          jobType: aiJobLogsTable.jobType,
          jobCount: count(),
          totalCostPence: sum(aiJobLogsTable.estimatedCostPence),
        })
        .from(aiJobLogsTable)
        .where(where)
        .groupBy(aiJobLogsTable.jobType)
        .orderBy(desc(count())),
    ]);

    const totalRows = Number(totals?.totalRows ?? 0);

    res.json({
      data: rows,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: totalRows,
        totalPages: Math.ceil(totalRows / limit),
      },
      aggregates: {
        totalRows,
        totalCostPence: Number(totals?.totalCostPence ?? 0),
        totalCostGBP: Number(totals?.totalCostPence ?? 0) / 100,
        avgPromptTokens: Math.round(Number(totals?.avgPromptTokens ?? 0)),
        avgCompletionTokens: Math.round(Number(totals?.avgCompletionTokens ?? 0)),
        byJobType: (jobTypeCounts as { jobType: string | null; jobCount: unknown; totalCostPence: unknown }[]).map((r) => ({
          jobType: r.jobType,
          jobCount: Number(r.jobCount),
          totalCostPence: Number(r.totalCostPence ?? 0),
        })),
      },
    });
  } catch (err) {
    logger.error({ err }, "admin/ai-job-logs query failed");
    res.status(500).json({ error: "Failed to query ai_job_logs." });
  }
});

router.get("/admin/usage-events", async (req: Request, res: Response) => {
  if (!requireAdminKey(req, res)) return;

  const q = req.query as Record<string, unknown>;
  const { limit, offset } = parsePagination(q);

  const conditions = [];

  if (typeof q["eventType"] === "string" && q["eventType"]) {
    conditions.push(eq(usageEventsTable.eventType, q["eventType"]));
  }
  if (typeof q["userId"] === "string" && q["userId"]) {
    conditions.push(eq(usageEventsTable.userId, q["userId"]));
  }
  if (typeof q["from"] === "string" && q["from"]) {
    const fromDate = new Date(q["from"]);
    if (!isNaN(fromDate.getTime())) {
      conditions.push(gte(usageEventsTable.createdAt, fromDate));
    }
  }
  if (typeof q["to"] === "string" && q["to"]) {
    const toDate = new Date(q["to"]);
    if (!isNaN(toDate.getTime())) {
      conditions.push(lte(usageEventsTable.createdAt, toDate));
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  try {
    const [rows, [totals], eventTypeCounts] = await Promise.all([
      db
        .select()
        .from(usageEventsTable)
        .where(where)
        .orderBy(desc(usageEventsTable.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({
          totalRows: count(),
        })
        .from(usageEventsTable)
        .where(where),

      db
        .select({
          eventType: usageEventsTable.eventType,
          eventCount: count(),
        })
        .from(usageEventsTable)
        .where(where)
        .groupBy(usageEventsTable.eventType)
        .orderBy(desc(count())),
    ]);

    const totalRows = Number(totals?.totalRows ?? 0);

    res.json({
      data: rows,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: totalRows,
        totalPages: Math.ceil(totalRows / limit),
      },
      aggregates: {
        totalRows,
        byEventType: (eventTypeCounts as { eventType: string; eventCount: unknown }[]).map((r) => ({
          eventType: r.eventType,
          eventCount: Number(r.eventCount),
        })),
      },
    });
  } catch (err) {
    logger.error({ err }, "admin/usage-events query failed");
    res.status(500).json({ error: "Failed to query usage_events." });
  }
});

export default router;
