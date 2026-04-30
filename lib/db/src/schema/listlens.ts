import { sql } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

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
  riskLevel: varchar("risk_level"),
  status: varchar("status").notNull().default("checked"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`NOW()`),
});

export type GuardCheck = typeof guardChecksTable.$inferSelect;
