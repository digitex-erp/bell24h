import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['buyer', 'supplier', 'admin']);

// User types
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default('buyer'),
  company: text("company"),
  address: text("address"),
  phone: text("phone"),
  gstNumber: text("gst_number"),
  gstVerified: boolean("gst_verified").default(false),
  walletBalance: numeric("wallet_balance").default("0"),
  profileComplete: boolean("profile_complete").default(false),
});

// RFQ status enum
export const rfqStatusEnum = pgEnum('rfq_status', ['open', 'matched', 'in_progress', 'completed', 'cancelled']);

// RFQ types
export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  budget: numeric("budget"),
  location: text("location").notNull(),
  deadline: timestamp("deadline").notNull(),
  status: rfqStatusEnum("status").notNull().default('open'),
  gstRequired: boolean("gst_required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quote types
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull().references(() => rfqs.id),
  supplierId: integer("supplier_id").notNull().references(() => users.id),
  price: numeric("price").notNull(),
  deliveryDate: timestamp("delivery_date").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, escrow
  status: text("status").notNull(), // pending, completed, failed
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
}).omit({
  id: true,
  walletBalance: true,
  gstVerified: true,
  profileComplete: true,
});

export const insertRfqSchema = createInsertSchema(rfqs).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Rfq = typeof rfqs.$inferSelect;
export type InsertRfq = z.infer<typeof insertRfqSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
