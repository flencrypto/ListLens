import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const studioItemsTable = pgTable("studio_items", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id"),
  lens: varchar("lens").notNull().default("ShoeLens"),
  title: varchar("title"),
  status: varchar("status").notNull().default("analysed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
});

export type StudioItem = typeof studioItemsTable.$inferSelect;

export const guardChecksTable = pgTable("guard_checks", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id"),
  lens: varchar("lens").notNull().default("ShoeLens"),
  url: varchar("url"),
  screenshotUrls: jsonb("screenshot_urls").$type<string[]>().default(sql`'[]'::jsonb`),
  riskLevel: varchar("risk_level"),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
});

export type GuardCheck = typeof guardChecksTable.$inferSelect;

export const aiJobLogsTable = pgTable("ai_job_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id"),
  jobType: varchar("job_type").notNull(),
  itemId: varchar("item_id"),
  checkId: varchar("check_id"),
  lens: varchar("lens"),
  model: varchar("model").notNull(),
  promptVersion: varchar("prompt_version").notNull(),
  schemaVersion: varchar("schema_version").notNull(),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  estimatedCostPence: integer("estimated_cost_pence").notNull().default(0),
  confidence: integer("confidence_pct").notNull().default(0),
  warnings: jsonb("warnings").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  fullOutput: jsonb("full_output").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
});

export type AiJobLog = typeof aiJobLogsTable.$inferSelect;

export const usageEventsTable = pgTable("usage_events", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id"),
  eventType: varchar("event_type").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
});

export type UsageEvent = typeof usageEventsTable.$inferSelect;
