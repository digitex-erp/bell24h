import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['buyer', 'supplier', 'admin', 'trader']);
export const rfqStatusEnum = pgEnum('rfq_status', ['draft', 'active', 'pending', 'closed']);
export const quoteStatusEnum = pgEnum('quote_status', ['pending', 'accepted', 'rejected']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high']);
export const orderTypeEnum = pgEnum('order_type', ['market', 'limit', 'stop', 'stop_limit', 'trailing_stop', 'oco', 'iceberg']);
export const orderSideEnum = pgEnum('order_side', ['buy', 'sell']);
export const orderStatusEnum = pgEnum('order_status', ['open', 'partial', 'filled', 'cancelled', 'rejected', 'expired']);
export const alertTypeEnum = pgEnum('alert_type', ['price', 'volume', 'technical', 'news']);
export const subscriptionTierEnum = z.enum(['free', 'pro_monthly', 'pro_yearly', 'enterprise', 'custom']);

export const subscriptionPlanSchema = z.object({
  tier: subscriptionTierEnum,
  price: z.number(),
  priceUSD: z.number(),
  rfqsPerMonth: z.number(),
  productsAllowed: z.number(),
  features: z.array(z.string()),
});

export const feesSchema = z.object({
  transactionFeePercent: z.number(),
  escrowFeePercent: z.number(),
  adListingPrice: z.number(),
  featuredRfqPrice: z.number(),
  invoiceDiscountFeePercent: z.number(),
});

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'basic', 'advanced', 'unlimited']);

export const subscriptionPlanFeatures = {
  free: {
    productLimit: 10,
    featuredProducts: 0,
    analytics: false,
    aiRecommendations: false,
    escrowFeePercent: 2,
    transactionFeePercent: 3,
    supportLevel: 'email',
    price: 0,
    priceLabel: 'Free Forever'
  },
  growth: {
    productLimit: 50,
    featuredProducts: 5,
    analytics: true,
    aiRecommendations: false,
    escrowFeePercent: 1.5,
    transactionFeePercent: 2.5,
    supportLevel: 'priority',
    price: 1499,
    priceLabel: '₹1,499/month'
  },
  professional: {
    productLimit: 200,
    featuredProducts: 15,
    analytics: true,
    aiRecommendations: true,
    escrowFeePercent: 1,
    transactionFeePercent: 2,
    supportLevel: 'dedicated',
    price: 3999,
    priceLabel: '₹3,999/month'
  },
  enterprise: {
    productLimit: Infinity,
    featuredProducts: 50,
    analytics: true,
    aiRecommendations: true,
    escrowFeePercent: 0.75,
    transactionFeePercent: 1.5,
    supportLevel: 'account_manager',
    customBranding: true,
    price: 9999,
    priceLabel: '₹9,999/month'
  }
};

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default('buyer'),
  company: text("company"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  lastSeen: timestamp("last_seen"),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  rfqs: many(rfqs),
}));

// RFQs table
export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  status: rfqStatusEnum("status").default('active'),
  location: text("location"),
  closingDate: timestamp("closing_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  quantity: integer("quantity"),
  specifications: jsonb("specifications"),
  budget: integer("budget"),
  attachments: jsonb("attachments"),
  isVoiceBased: boolean("is_voice_based").default(false),
  voiceTranscription: text("voice_transcription"),
});

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  user: one(users, {
    fields: [rfqs.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [rfqs.categoryId],
    references: [categories.id],
  }),
  quotes: many(quotes),
}));

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  userId: integer("user_id").references(() => users.id),
  price: integer("price").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  description: text("description"),
  status: quoteStatusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isNegotiable: boolean("is_negotiable").default(false),
  attachments: jsonb("attachments"),
});

export const quotesRelations = relations(quotes, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [quotes.rfqId],
    references: [rfqs.id],
  }),
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
}));

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  status: messageStatusEnum("status").default('sent'),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  quoteId: integer("quote_id").references(() => quotes.id),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
  rfq: one(rfqs, {
    fields: [messages.rfqId],
    references: [rfqs.id],
  }),
  quote: one(quotes, {
    fields: [messages.quoteId],
    references: [quotes.id],
  }),
}));

// Supplier profiles
export const supplierProfiles = pgTable("supplier_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  description: text("description"),
  foundedYear: integer("founded_year"),
  employeeCount: integer("employee_count"),
  website: text("website"),
  certifications: jsonb("certifications"),
  specialties: jsonb("specialties"),
  riskScore: real("risk_score"),
  riskLevel: riskLevelEnum("risk_level"),
  avgRating: real("avg_rating"),
  totalOrders: integer("total_orders").default(0),
  onTimeDeliveryRate: real("on_time_delivery_rate"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const supplierProfilesRelations = relations(supplierProfiles, ({ one }) => ({
  user: one(users, {
    fields: [supplierProfiles.userId],
    references: [users.id],
  }),
}));

// Market data
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  change: real("change"),
  changePercent: real("change_percent"),
  volume: integer("volume"),
  updatedAt: timestamp("updated_at").defaultNow(),
  category: text("category"),
  relatedCategories: jsonb("related_categories"),
});

// AI matches
export const aiMatches = pgTable("ai_matches", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  supplierId: integer("supplier_id").references(() => users.id),
  score: real("score").notNull(),
  explanation: jsonb("explanation"),
  factors: jsonb("factors"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiMatchesRelations = relations(aiMatches, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [aiMatches.rfqId],
    references: [rfqs.id],
  }),
  supplier: one(users, {
    fields: [aiMatches.supplierId],
    references: [users.id],
  }),
}));

// Analytics
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  rfqCreated: integer("rfq_created").default(0),
  quotesReceived: integer("quotes_received").default(0),
  messagesExchanged: integer("messages_exchanged").default(0),
  dealsCompleted: integer("deals_completed").default(0),
  totalSpent: integer("total_spent").default(0),
  avgResponseTime: real("avg_response_time"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
}));

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").references(() => quotes.id),
  buyerId: integer("buyer_id").references(() => users.id),
  supplierId: integer("supplier_id").references(() => users.id),
  amount: integer("amount").notNull(),
  currency: text("currency").default("USD"),
  status: paymentStatusEnum("status").default("pending"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  quote: one(quotes, {
    fields: [payments.quoteId],
    references: [quotes.id],
  }),
  buyer: one(users, {
    fields: [payments.buyerId],
    references: [users.id],
  }),
  supplier: one(users, {
    fields: [payments.supplierId],
    references: [users.id],
  }),
}));

// Trading tables
export const tradingPairs = pgTable("trading_pairs", {
  id: serial("id").primaryKey(),
  baseAsset: text("base_asset").notNull(),
  quoteAsset: text("quote_asset").notNull(),
  minQty: real("min_qty").notNull(),
  maxQty: real("max_qty").notNull(),
  stepSize: real("step_size").notNull(),
  minPrice: real("min_price").notNull(),
  maxPrice: real("max_price").notNull(),
  tickSize: real("tick_size").notNull(),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const tradingOrders = pgTable("trading_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pairId: integer("pair_id").references(() => tradingPairs.id),
  type: orderTypeEnum("type").notNull(),
  side: orderSideEnum("side").notNull(),
  status: orderStatusEnum("status").default("open"),
  price: real("price"),
  stopPrice: real("stop_price"),
  quantity: real("quantity").notNull(),
  filledQuantity: real("filled_quantity").default(0),
  totalCost: real("total_cost"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  clientOrderId: text("client_order_id"),
  notes: text("notes"),
});

export const tradingPositions = pgTable("trading_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pairId: integer("pair_id").references(() => tradingPairs.id),
  side: orderSideEnum("side").notNull(),
  entryPrice: real("entry_price").notNull(),
  quantity: real("quantity").notNull(),
  leverage: real("leverage").default(1),
  liquidationPrice: real("liquidation_price"),
  takeProfitPrice: real("take_profit_price"),
  stopLossPrice: real("stop_loss_price"),
  unrealizedPnl: real("unrealized_pnl"),
  realizedPnl: real("realized_pnl").default(0),
  margin: real("margin").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const tradingAlerts = pgTable("trading_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pairId: integer("pair_id").references(() => tradingPairs.id),
  type: alertTypeEnum("type").notNull(),
  triggerValue: real("trigger_value").notNull(),
  comparison: text("comparison").notNull(), // e.g., 'above', 'below', 'at'
  isActive: boolean("is_active").default(true),
  message: text("message"),
  notifyVia: text("notify_via").array(), // e.g., ['email', 'sms', 'app']
  lastTriggered: timestamp("last_triggered"),
  cooldownMinutes: integer("cooldown_minutes").default(60),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const marketDepth = pgTable("market_depth", {
  id: serial("id").primaryKey(),
  pairId: integer("pair_id").references(() => tradingPairs.id),
  side: orderSideEnum("side").notNull(),
  price: real("price").notNull(),
  quantity: real("quantity").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const tradingOrdersRelations = relations(tradingOrders, ({ one }) => ({
  user: one(users, {
    fields: [tradingOrders.userId],
    references: [users.id],
  }),
  pair: one(tradingPairs, {
    fields: [tradingOrders.pairId],
    references: [tradingPairs.id],
  }),
}));

export const tradingPositionsRelations = relations(tradingPositions, ({ one }) => ({
  user: one(users, {
    fields: [tradingPositions.userId],
    references: [users.id],
  }),
  pair: one(tradingPairs, {
    fields: [tradingPositions.pairId],
    references: [tradingPairs.id],
  }),
}));

export const tradingAlertsRelations = relations(tradingAlerts, ({ one }) => ({
  user: one(users, {
    fields: [tradingAlerts.userId],
    references: [users.id],
  }),
  pair: one(tradingPairs, {
    fields: [tradingAlerts.pairId],
    references: [tradingPairs.id],
  }),
}));

export const marketDepthRelations = relations(marketDepth, ({ one }) => ({
  pair: one(tradingPairs, {
    fields: [marketDepth.pairId],
    references: [tradingPairs.id],
  }),
}));

// Subscription tables
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  tier: subscriptionTierEnum("tier").default("free"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  productLimit: integer("product_limit").default(10),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  autoRenew: boolean("auto_renew").default(true),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// Product catalog tables
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price"),
  currency: text("currency").default("USD"),
  categoryId: integer("category_id").references(() => categories.id),
  images: jsonb("images"),
  specifications: jsonb("specifications"),
  stockQuantity: integer("stock_quantity"),
  isVisible: boolean("is_visible").default(true),
  featuredOrder: integer("featured_order"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const productsRelations = relations(products, ({ one }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

// Update user relations to include products and subscription
export const usersRelations = relations(users, ({ many, one }) => ({
  rfqs: many(rfqs),
  quotes: many(quotes),
  messages: many(messages),
  products: many(products),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastSeen: true });
export const insertRfqSchema = createInsertSchema(rfqs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertSupplierProfileSchema = createInsertSchema(supplierProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketDataSchema = createInsertSchema(marketData).omit({ id: true, updatedAt: true });
export const insertAiMatchSchema = createInsertSchema(aiMatches).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });

// Trading schemas
export const insertTradingPairSchema = createInsertSchema(tradingPairs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTradingOrderSchema = createInsertSchema(tradingOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTradingPositionSchema = createInsertSchema(tradingPositions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTradingAlertSchema = createInsertSchema(tradingAlerts).omit({ id: true, createdAt: true, updatedAt: true, lastTriggered: true });
export const insertMarketDepthSchema = createInsertSchema(marketDepth).omit({ id: true, timestamp: true });

// Subscription and Product schemas
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type RFQ = typeof rfqs.$inferSelect;
export type InsertRFQ = z.infer<typeof insertRfqSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Category = typeof categories.$inferSelect;

export type SupplierProfile = typeof supplierProfiles.$inferSelect;
export type InsertSupplierProfile = z.infer<typeof insertSupplierProfileSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type AIMatch = typeof aiMatches.$inferSelect;
export type InsertAIMatch = z.infer<typeof insertAiMatchSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Analytics = typeof analytics.$inferSelect;

// Trading types
export type TradingPair = typeof tradingPairs.$inferSelect;
export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;

export type TradingOrder = typeof tradingOrders.$inferSelect;
export type InsertTradingOrder = z.infer<typeof insertTradingOrderSchema>;

export type TradingPosition = typeof tradingPositions.$inferSelect;
export type InsertTradingPosition = z.infer<typeof insertTradingPositionSchema>;

export type TradingAlert = typeof tradingAlerts.$inferSelect;
export type InsertTradingAlert = z.infer<typeof insertTradingAlertSchema>;

export type MarketDepthEntry = typeof marketDepth.$inferSelect;
export type InsertMarketDepthEntry = z.infer<typeof insertMarketDepthSchema>;

// Subscription and Product types
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  type: z.enum(['subscription', 'transaction_fee', 'escrow_fee', 'ad_promotion']),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.string(),
  metadata: z.record(z.any()).optional()
});

export const escrowSchema = z.object({
  id: z.string(),
  rfqId: z.string(),
  amount: z.number(),
  buyerId: z.string(),
  sellerId: z.string(),
  status: z.enum(['pending', 'locked', 'released', 'disputed']),
  createdAt: z.string()
});

export const adPromotionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['featured_rfq', 'featured_supplier', 'banner_ad']),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'scheduled', 'completed']),
  amount: z.number()
});