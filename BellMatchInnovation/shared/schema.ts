import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, varchar, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("buyer"),
  company: text("company"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  fullName: (schema) => schema.min(3, "Full name must be at least 3 characters"),
  email: (schema) => schema.email("Please provide a valid email"),
  password: (schema) => schema.min(8, "Password must be at least 8 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  preferredCategories: jsonb("preferred_categories").default([]).notNull(),
  preferredSupplierTypes: jsonb("preferred_supplier_types").default([]).notNull(),
  preferredBusinessScale: text("preferred_business_scale"),
  preferredPriceRange: jsonb("preferred_price_range").default({min: null, max: null}).notNull(),
  qualityPreference: integer("quality_preference").default(3).notNull(), // 1-5 scale
  preferredLocations: jsonb("preferred_locations").default([]).notNull(),
  industryFocus: jsonb("industry_focus").default([]).notNull(),
  languagePreference: text("language_preference").default("en").notNull(),
  deliveryTimePreference: text("delivery_time_preference"), // fast, normal, flexible
  communicationPreference: text("communication_preference").default("email"), // email, chat, call
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const insertUserPreferencesSchema = createInsertSchema(userPreferences);
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// RFQ table
export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("active"),
  type: text("type").notNull().default("text"), // text, voice, video
  mediaUrl: text("media_url"), // For voice/video RFQs
  transcription: text("transcription"), // For voice RFQs
  quantity: integer("quantity"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRfqSchema = createInsertSchema(rfqs, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
});

export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type Rfq = typeof rfqs.$inferSelect;

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: text("company_name").notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
  categories: text("categories").array(),
  verified: boolean("verified").default(false),
  riskScore: decimal("risk_score", { precision: 3, scale: 1 }), // 1.0 to 5.0
  riskGrade: varchar("risk_grade", { length: 2 }), // A+, A, B, C, D, etc.
  location: text("location").notNull(),
  // GST Validation Fields
  gstin: varchar("gstin", { length: 15 }), // 15-character GST Identification Number
  gstinVerified: boolean("gstin_verified").default(false),
  gstinVerificationDate: timestamp("gstin_verification_date"),
  legalName: text("legal_name"), // Legal name as per GST registration
  tradeName: text("trade_name"), // Trade name as per GST registration
  taxPayerType: text("tax_payer_type"), // Regular, Composition, etc.
  businessType: text("business_type"), // Proprietorship, Partnership, etc.
  registrationDate: timestamp("registration_date"), // GST registration date
  complianceRating: integer("compliance_rating"), // 0-100 compliance rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupplierSchema = createInsertSchema(suppliers, {
  companyName: (schema) => schema.min(3, "Company name must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  gstin: (schema) => schema.length(15, "GSTIN must be 15 characters").optional(),
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  deliveryTime: integer("delivery_time").notNull(), // In days
  isAccepted: boolean("is_accepted").default(false),
  matchScore: decimal("match_score", { precision: 5, scale: 2 }),
  matchFactors: jsonb("match_factors"), // SHAP/LIME explanation
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes, {
  price: (schema) => schema.refine(val => parseFloat(String(val)) > 0, "Price must be positive"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  deliveryTime: (schema) => schema.refine(val => Number(val) > 0, "Delivery time must be positive"),
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

// Wallets table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  escrowBalance: decimal("escrow_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  razorpayXId: text("razorpayx_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(wallets);
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").references(() => wallets.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // deposit, withdrawal, escrow, release
  status: text("status").notNull().default("pending"),
  description: text("description"),
  externalId: text("external_id"), // RazorpayX transaction ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions, {
  amount: (schema) => schema.refine(val => val !== "0", "Amount cannot be zero"),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Invoices table (for KredX integration)
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"), // pending, discounted, paid
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }),
  discountedAmount: decimal("discounted_amount", { precision: 10, scale: 2 }),
  kredxReferenceId: text("kredx_reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices, {
  amount: (schema) => schema.refine(val => parseFloat(String(val)) > 0, "Amount must be positive"),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Market insights table
export const marketInsights = pgTable("market_insights", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  priceChange: decimal("price_change", { precision: 5, scale: 2 }),
  supplyStatus: text("supply_status"),
  forecastPeriod: text("forecast_period"),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketInsightSchema = createInsertSchema(marketInsights);
export type InsertMarketInsight = z.infer<typeof insertMarketInsightSchema>;
export type MarketInsight = typeof marketInsights.$inferSelect;

// Messages table (for real-time communication)
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages, {
  content: (schema) => schema.min(1, "Message cannot be empty"),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // message, rfq, quote, payment, system
  isRead: boolean("is_read").default(false),
  referenceId: integer("reference_id"),
  referenceType: text("reference_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(5, "Content must be at least 5 characters"),
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Supplier metrics table - for tracking supplier performance metrics
export const supplierMetrics = pgTable("supplier_metrics", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  responseTime: decimal("response_time", { precision: 5, scale: 2 }), // Average response time in hours
  acceptanceRate: decimal("acceptance_rate", { precision: 5, scale: 2 }), // Percentage of accepted quotes
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // Percentage of completed orders
  onTimeDelivery: decimal("on_time_delivery", { precision: 5, scale: 2 }), // Percentage of on-time deliveries
  qualityRating: decimal("quality_rating", { precision: 3, scale: 2 }), // Average quality rating (1-5)
  communicationRating: decimal("communication_rating", { precision: 3, scale: 2 }), // Average communication rating (1-5)
  priceCompetitiveness: decimal("price_competitiveness", { precision: 6, scale: 2 }), // Price comparison against market average (negative is better)
  similarRfqCount: integer("similar_rfq_count"), // Count of RFQs in similar categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupplierMetricsSchema = createInsertSchema(supplierMetrics);
export type InsertSupplierMetrics = z.infer<typeof insertSupplierMetricsSchema>;
export type SupplierMetrics = typeof supplierMetrics.$inferSelect;

// Supplier attributes table - for storing additional supplier information for matching
export const supplierAttributes = pgTable("supplier_attributes", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  certifications: text("certifications").array(), // List of certifications held by supplier
  manufacturingCapacity: integer("manufacturing_capacity"), // Monthly capacity units
  minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }), // Minimum order value accepted
  maxOrderValue: decimal("max_order_value", { precision: 10, scale: 2 }), // Maximum order value accepted
  sustainabilityScore: integer("sustainability_score"), // 0-100 score for sustainability practices
  yearsInBusiness: integer("years_in_business"), // Number of years the supplier has been in business
  employeeCount: integer("employee_count"), // Number of employees
  specializations: text("specializations").array(), // Specialized capabilities
  industries: text("industries").array(), // Industry focus areas
  preferredCategories: text("preferred_categories").array(), // Categories the supplier prefers
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupplierAttributesSchema = createInsertSchema(supplierAttributes);
export type InsertSupplierAttributes = z.infer<typeof insertSupplierAttributesSchema>;
export type SupplierAttributes = typeof supplierAttributes.$inferSelect;

// Supplier recommendation table - for storing AI-generated recommendations
export const supplierRecommendations = pgTable("supplier_recommendations", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  matchScore: decimal("match_score", { precision: 5, scale: 2 }).notNull(), // 0-100 matching score 
  matchReason: text("match_reason"), // Human-readable explanation of match
  matchFactors: jsonb("match_factors"), // SHAP/LIME explanation values for interpretability
  recommended: boolean("recommended").default(false), // If this is a recommended match
  contacted: boolean("contacted").default(false), // If the supplier was contacted
  responded: boolean("responded").default(false), // If the supplier responded to the RFQ
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupplierRecommendationSchema = createInsertSchema(supplierRecommendations);
export type InsertSupplierRecommendation = z.infer<typeof insertSupplierRecommendationSchema>;
export type SupplierRecommendation = typeof supplierRecommendations.$inferSelect;

// Historical matches table - for training the matching model and feedback
export const historicalMatches = pgTable("historical_matches", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  originalMatchScore: decimal("original_match_score", { precision: 5, scale: 2 }), // Score from recommendation
  wasSuccessful: boolean("was_successful"), // If the match resulted in a successful transaction
  buyerFeedback: integer("buyer_feedback"), // 1-5 star rating from buyer
  supplierFeedback: integer("supplier_feedback"), // 1-5 star rating from supplier
  feedbackNotes: text("feedback_notes"), // Additional feedback notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"), // When the match was completed or abandoned
});

// Relations - extended from the one defined earlier
export const extendedUsersRelations = relations(users, ({ many, one }) => ({
  rfqs: many(rfqs),
  messages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  wallets: many(wallets),
  notifications: many(notifications),
  preferences: one(userPreferences),
  milestonePayments: many(milestonePayments),
}));

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  user: one(users, { fields: [rfqs.userId], references: [users.id] }),
  quotes: many(quotes),
  milestonePayments: many(milestonePayments),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, { fields: [suppliers.userId], references: [users.id] }),
  quotes: many(quotes),
  invoices: many(invoices),
  metrics: many(supplierMetrics),
  attributes: many(supplierAttributes),
  recommendations: many(supplierRecommendations),
  historicalMatches: many(historicalMatches),
  milestonePayments: many(milestonePayments),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  rfq: one(rfqs, { fields: [quotes.rfqId], references: [rfqs.id] }),
  supplier: one(suppliers, { fields: [quotes.supplierId], references: [suppliers.id] }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  supplier: one(suppliers, { fields: [invoices.supplierId], references: [suppliers.id] }),
  buyer: one(users, { fields: [invoices.buyerId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receiver" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Milestone Payments table - for tracking milestone-based payments for contracts
export const milestonePayments = pgTable("milestone_payments", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(), // The buyer
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  milestoneNumber: integer("milestone_number").notNull().default(1),
  milestoneTotal: integer("milestone_total").notNull().default(1),
  milestonePercent: integer("milestone_percent").notNull(), // Percentage of total contract (1-100)
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, approved, released, disputed
  approvalDate: timestamp("approval_date"),
  releaseDate: timestamp("release_date"),
  razorpayPaymentId: text("razorpay_payment_id"),
  contractId: text("contract_id"), // Reference to blockchain contract if implemented
  contractAddress: text("contract_address"), // Ethereum address of smart contract
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMilestonePaymentSchema = createInsertSchema(milestonePayments, {
  amount: (schema) => schema.refine(val => parseFloat(String(val)) > 0, "Amount must be positive"),
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  milestonePercent: (schema) => schema.refine(val => Number(val) >= 1 && Number(val) <= 100, "Percentage must be between 1 and 100"),
});

export type InsertMilestonePayment = z.infer<typeof insertMilestonePaymentSchema>;
export type MilestonePayment = typeof milestonePayments.$inferSelect;

// Relations for milestone payments
export const milestonePaymentsRelations = relations(milestonePayments, ({ one }) => ({
  rfq: one(rfqs, { fields: [milestonePayments.rfqId], references: [rfqs.id] }),
  supplier: one(suppliers, { fields: [milestonePayments.supplierId], references: [suppliers.id] }),
  user: one(users, { fields: [milestonePayments.userId], references: [users.id] }),
}));

// M1 Exchange Transactions table - for tracking early payments through M1 Exchange
export const m1exchangeTransactions = pgTable("m1exchange_transactions", {
  id: serial("id").primaryKey(),
  milestoneId: integer("milestone_id").references(() => milestonePayments.id).notNull(),
  transactionId: text("transaction_id").notNull().unique(),
  originalAmount: text("original_amount").notNull(),
  discountedAmount: text("discounted_amount").notNull(),
  discountRate: text("discount_rate").notNull(),
  status: text("status").notNull().default("pending"),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const m1exchangeTransactionsRelations = relations(m1exchangeTransactions, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [m1exchangeTransactions.supplierId],
    references: [suppliers.id]
  }),
  buyer: one(users, {
    fields: [m1exchangeTransactions.buyerId],
    references: [users.id]
  }),
  milestone: one(milestonePayments, {
    fields: [m1exchangeTransactions.milestoneId],
    references: [milestonePayments.id]
  })
}));
