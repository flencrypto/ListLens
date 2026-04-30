import { sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const ebayTokensTable = pgTable("ebay_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  scope: text("scope"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type EbayToken = typeof ebayTokensTable.$inferSelect;
export type InsertEbayToken = typeof ebayTokensTable.$inferInsert;

export const ebayOauthStateTable = pgTable("ebay_oauth_state", {
  state: varchar("state").primaryKey(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export type EbayOauthState = typeof ebayOauthStateTable.$inferSelect;
export type InsertEbayOauthState = typeof ebayOauthStateTable.$inferInsert;

export const ebaySettingsTable = pgTable("ebay_settings", {
  userId: varchar("user_id").primaryKey(),
  shippingCost: varchar("shipping_cost").notNull().default("3.99"),
  returnsAccepted: boolean("returns_accepted").notNull().default(true),
  returnPeriod: varchar("return_period").notNull().default("Days_30"),
  paymentMethod: varchar("payment_method").notNull().default("PayPal"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type EbaySettings = typeof ebaySettingsTable.$inferSelect;
export type InsertEbaySettings = typeof ebaySettingsTable.$inferInsert;
