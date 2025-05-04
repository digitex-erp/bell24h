import { pgTable, text, serial, integer, boolean, timestamp, json, real, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company"),
  role: text("role").default("buyer"),
  walletBalance: decimal("wallet_balance").default("0"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  company: true,
  role: true,
  walletAddress: true,
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  riskScore: integer("risk_score"),
  financialStability: integer("financial_stability"),
  qualityControl: integer("quality_control"),
  deliveryRecord: integer("delivery_record"),
  complianceRisk: integer("compliance_risk"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).pick({
  name: true,
  location: true,
  category: true,
  contactPerson: true,
  contactEmail: true,
  contactPhone: true,
  riskScore: true,
  financialStability: true,
  qualityControl: true,
  deliveryRecord: true,
  complianceRisk: true,
  userId: true,
});

export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  rfqNumber: text("rfq_number").notNull().unique(),
  product: text("product").notNull(),
  quantity: text("quantity").notNull(),
  status: text("status").notNull().default("pending"),
  successRate: real("success_rate"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  dueDate: timestamp("due_date"),
  description: text("description"),
  videoUrl: text("video_url"),
});

export const insertRfqSchema = createInsertSchema(rfqs).pick({
  rfqNumber: true,
  product: true,
  quantity: true,
  status: true,
  successRate: true,
  userId: true,
  dueDate: true,
  description: true,
  videoUrl: true,
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  price: decimal("price").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  notes: text("notes"),
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  rfqId: true,
  supplierId: true,
  price: true,
  deliveryTime: true,
  status: true,
  notes: true,
});

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  shipmentNumber: text("shipment_number").notNull().unique(),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  expectedDelivery: timestamp("expected_delivery"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  trackingSteps: json("tracking_steps"),
  trackingProgress: integer("tracking_progress").default(0),
  trackingUrl: text("tracking_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipments).pick({
  shipmentNumber: true,
  rfqId: true,
  supplierId: true,
  userId: true,
  status: true,
  expectedDelivery: true,
  origin: true,
  destination: true,
  trackingSteps: true,
  trackingProgress: true,
  trackingUrl: true,
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  userId: integer("user_id").references(() => users.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  amount: decimal("amount").notNull(),
  status: text("status").notNull().default("pending"),
  type: text("type").notNull(), // escrow, milestone, invoice
  milestoneNumber: integer("milestone_number"),
  milestoneTotal: integer("milestone_total"),
  milestonePercent: integer("milestone_percent"),
  invoiceNumber: text("invoice_number"),
  invoiceDueDate: timestamp("invoice_due_date"),
  discountFee: decimal("discount_fee"),
  razorpayPaymentId: text("razorpay_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  rfqId: true,
  userId: true,
  supplierId: true,
  amount: true,
  status: true,
  type: true,
  milestoneNumber: true,
  milestoneTotal: true,
  milestonePercent: true,
  invoiceNumber: true,
  invoiceDueDate: true,
  discountFee: true,
  razorpayPaymentId: true,
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  referenceId: integer("reference_id"),
  referenceType: text("reference_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true,
  referenceId: true,
  referenceType: true,
});

export const supplierRecommendations = pgTable("supplier_recommendations", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  matchScore: real("match_score").notNull(),
  shapValues: json("shap_values").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierRecommendationSchema = createInsertSchema(supplierRecommendations).pick({
  rfqId: true,
  supplierId: true,
  matchScore: true,
  shapValues: true,
});

export const marketTrends = pgTable("market_trends", {
  id: serial("id").primaryKey(),
  sector: text("sector").notNull(),
  data: json("data").notNull(),
  insights: json("insights"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertMarketTrendSchema = createInsertSchema(marketTrends).pick({
  sector: true,
  data: true,
  insights: true,
});

// Blockchain document storage table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  contentHash: text("content_hash").notNull().unique(),
  ipfsHash: text("ipfs_hash").notNull(),
  ipfsUrl: text("ipfs_url").notNull(),
  documentType: text("document_type").notNull(), // rfq, quote, shipment, payment, etc.
  referenceId: integer("reference_id"), // ID of the referenced entity (rfq, quote, etc.)
  userId: integer("user_id").references(() => users.id),
  description: text("description"),
  verified: boolean("verified").default(false),
  txHash: text("tx_hash"), // Blockchain transaction hash
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  contentHash: true,
  ipfsHash: true,
  ipfsUrl: true,
  documentType: true,
  referenceId: true,
  userId: true,
  description: true,
  verified: true,
  txHash: true,
});

// Blockchain transactions table
export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: serial("id").primaryKey(),
  txHash: text("tx_hash").notNull().unique(),
  txType: text("tx_type").notNull(), // rfq_create, quote_submit, payment_create, document_store, etc.
  referenceId: integer("reference_id"), // ID of the referenced entity
  referenceType: text("reference_type"), // rfq, quote, payment, document, etc.
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  data: json("data"), // Additional transaction data
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).pick({
  txHash: true,
  txType: true,
  referenceId: true,
  referenceType: true,
  userId: true,
  status: true,
  data: true,
  confirmedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Rfq = typeof rfqs.$inferSelect;
export type InsertRfq = z.infer<typeof insertRfqSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type SupplierRecommendation = typeof supplierRecommendations.$inferSelect;
export type InsertSupplierRecommendation = z.infer<typeof insertSupplierRecommendationSchema>;

export type MarketTrend = typeof marketTrends.$inferSelect;
export type InsertMarketTrend = z.infer<typeof insertMarketTrendSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
