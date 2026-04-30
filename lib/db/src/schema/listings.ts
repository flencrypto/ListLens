import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const listingsTable = pgTable("listings", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id"),
  lens: varchar("lens").notNull().default("ShoeLens"),
  marketplace: varchar("marketplace"),
  photoUrls: jsonb("photo_urls").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  hint: text("hint"),
  title: text("title"),
  description: text("description"),
  price: text("price"),
  analysis: jsonb("analysis").$type<Record<string, unknown>>(),
  status: varchar("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
