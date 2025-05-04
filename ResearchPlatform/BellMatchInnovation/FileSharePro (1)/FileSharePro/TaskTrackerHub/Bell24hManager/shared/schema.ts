import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enumerations
export const industryEnum = pgEnum('industry', [
  'manufacturing',
  'electronics',
  'chemicals',
  'automotive',
  'textiles'
]);

export const rfqStatusEnum = pgEnum('rfq_status', [
  'draft',
  'pending_approval',
  'published',
  'closed',
  'canceled'
]);

export const quoteStatusEnum = pgEnum('quote_status', [
  'submitted',
  'under_review',
  'accepted',
  'rejected',
  'revised'
]);

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  companyName: text("company_name").notNull(),
  role: text("role").notNull().default('buyer'), // buyer, supplier, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  rfqs: many(rfqs),
  suppliers: many(suppliers),
  quotes: many(quotes),
}));

// Suppliers schema
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  industry: industryEnum("industry").notNull(),
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, {
    fields: [suppliers.userId],
    references: [users.id],
  }),
  quotes: many(quotes),
  rfqSuppliers: many(rfqSuppliers),
}));

// RFQs schema
export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  industry: industryEnum("industry").notNull(),
  quantity: integer("quantity").notNull(),
  budget: doublePrecision("budget"),
  deadline: timestamp("deadline"),
  status: rfqStatusEnum("status").default('draft').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  user: one(users, {
    fields: [rfqs.userId],
    references: [users.id],
  }),
  quotes: many(quotes),
  rfqSuppliers: many(rfqSuppliers),
}));

// RFQ-Supplier junction table (for tracking which suppliers are matched to which RFQs)
export const rfqSuppliers = pgTable("rfq_suppliers", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  matchScore: doublePrecision("match_score"), // AI-calculated match percentage
  isSubmitted: boolean("is_submitted").default(false), // Has the RFQ been submitted to this supplier?
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rfqSuppliersRelations = relations(rfqSuppliers, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [rfqSuppliers.rfqId],
    references: [rfqs.id],
  }),
  supplier: one(suppliers, {
    fields: [rfqSuppliers.supplierId],
    references: [suppliers.id],
  }),
}));

// Quotes schema
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(), // The user who created the quote
  price: doublePrecision("price").notNull(),
  deliveryTime: integer("delivery_time").notNull(), // In days
  message: text("message"),
  status: quoteStatusEnum("status").default('submitted').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotesRelations = relations(quotes, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [quotes.rfqId],
    references: [rfqs.id],
  }),
  supplier: one(suppliers, {
    fields: [quotes.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
}));

// Analytics schema
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  rfqCount: integer("rfq_count").default(0),
  quoteCount: integer("quote_count").default(0),
  industryBreakdown: text("industry_breakdown"), // JSON string with industry counts
  avgResponseTime: doublePrecision("avg_response_time"), // In hours
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true 
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ 
  id: true, 
  createdAt: true,
  rating: true,
  reviewCount: true,
  isVerified: true
});

export const insertRfqSchema = createInsertSchema(rfqs).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true,
  status: true
});

export const insertRfqSupplierSchema = createInsertSchema(rfqSuppliers).omit({ 
  id: true, 
  createdAt: true,
  isSubmitted: true,
  submittedAt: true
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true,
  status: true
});

// Types for insert and select operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type Rfq = typeof rfqs.$inferSelect;

export type InsertRfqSupplier = z.infer<typeof insertRfqSupplierSchema>;
export type RfqSupplier = typeof rfqSuppliers.$inferSelect;

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

export type Analytics = typeof analytics.$inferSelect;
