/**
 * Database Schema for Bell24h
 */
// Forward declaration to handle circular dependencies
import { pgTable, serial, text, integer, timestamp, decimal, boolean, json, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations, type InferModel } from 'drizzle-orm';
import { z } from 'zod';

// Users table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name'),
  businessName: text('business_name'),
  businessType: text('business_type'),
  role: text('role'),
  gstNumber: text('gst_number'),
  businessAddress: text('business_address'),
  phone: text('phone'),
  isVerified: boolean('is_verified').default(false),
  walletBalance: decimal('wallet_balance', { precision: 10, scale: 2 }).default('0'),
  kycStatus: text('kyc_status').default('pending'),
  preferences: json('preferences'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User Roles table schema
export const user_roles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  permissions: json('permissions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// RFQs table schema
export const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  quantity: integer('quantity'),
  budget: text('budget'),
  deadline: timestamp('deadline'),
  status: text('status'),
  voiceUrl: text('voice_url'), // URL to voice recording file
  originalLanguage: text('original_language'), // Language of the voice recording
  category: text('category'),
  subcategory: text('subcategory'),
  tags: json('tags'),
  attachments: json('attachments'),
  requirements: text('requirements'),
  visibility: text('visibility').default('public'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Quotes/Bids table schema
export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  rfqId: integer('rfq_id').notNull().references(() => rfqs.id),
  userId: integer('user_id').notNull().references(() => users.id),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  deliveryTime: text('delivery_time'),
  status: text('status').notNull(),
  terms: text('terms'),
  attachments: json('attachments'),
  isNegotiable: boolean('is_negotiable').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Bids table schema (another name for quotes in the system)
export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  rfqId: integer('rfq_id').notNull().references(() => rfqs.id),
  supplierId: integer('supplier_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  deliveryTime: text('delivery_time'),
  status: text('status').default('pending'),
  termsOfService: text('terms_of_service'),
  attachments: json('attachments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Products table schema
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  category: text('category'),
  subcategory: text('subcategory'),
  images: json('images'),
  specifications: json('specifications'),
  inventory: integer('inventory').default(0),
  userId: integer('user_id').references(() => users.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Suppliers table schema
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  companyName: text('company_name').notNull(),
  description: text('description'),
  logo: text('logo'),
  website: text('website'),
  establishedYear: integer('established_year'),
  employeeCount: integer('employee_count'),
  annualRevenue: text('annual_revenue'),
  certifications: json('certifications'),
  categories: json('categories'),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Contracts table schema
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  rfqId: integer('rfq_id').references(() => rfqs.id),
  buyerId: integer('buyer_id').notNull().references(() => users.id),
  supplierId: integer('supplier_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  terms: text('terms'),
  status: text('status').default('draft'),
  documents: json('documents'),
  signatures: json('signatures'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Market data table schema
export const market_data = pgTable('market_data', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  priceIndex: decimal('price_index', { precision: 10, scale: 2 }),
  supplyIndex: decimal('supply_index', { precision: 10, scale: 2 }),
  demandIndex: decimal('demand_index', { precision: 10, scale: 2 }),
  timePeriod: text('time_period').notNull(),
  region: text('region'),
  dataSource: text('data_source'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Market trends table schema
export const market_trends = pgTable('market_trends', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  trendType: text('trend_type').notNull(),
  impact: text('impact'),
  timeframe: text('timeframe'),
  source: text('source'),
  confidence: decimal('confidence', { precision: 3, scale: 2 }),
  data: json('data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Message threads table schema
export const message_threads = pgTable('message_threads', {
  id: serial('id').primaryKey(),
  title: text('title'),
  rfqId: integer('rfq_id').references(() => rfqs.id),
  contractId: integer('contract_id').references(() => contracts.id),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  status: text('status').default('active'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Messages table schema
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  threadId: integer('thread_id'),
  content: text('content').notNull(),
  attachments: json('attachments'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Thread participants table schema
export const thread_participants = pgTable('thread_participants', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').notNull().references(() => message_threads.id),
  userId: integer('user_id').notNull().references(() => users.id),
  isActive: boolean('is_active').default(true),
  role: text('role'),
  lastReadAt: timestamp('last_read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Portfolio items table schema
export const portfolio_items = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  images: json('images'),
  details: json('details'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Wallet transactions table schema
export const wallet_transactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // credit, debit
  status: text('status').notNull(), // completed, pending, failed
  reference: text('reference'),
  description: text('description'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Buyer profiles table schema
export const buyer_profiles = pgTable('buyer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  companyDetails: json('company_details'),
  procurementPolicy: text('procurement_policy'),
  preferredPaymentTerms: text('preferred_payment_terms'),
  preferredSupplierCriteria: json('preferred_supplier_criteria'),
  annualProcurementBudget: decimal('annual_procurement_budget', { precision: 12, scale: 2 }),
  industryFocus: json('industry_focus'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  rfqs: many(rfqs),
  quotes: many(quotes),
  products: many(products),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'receiver' }),
  threadParticipations: many(thread_participants),
  walletTransactions: many(wallet_transactions),
  supplierProfile: many(suppliers),
  buyerProfile: many(buyer_profiles),
  portfolioItems: many(portfolio_items),
  buyerContracts: many(contracts, { relationName: 'buyer' }),
  supplierContracts: many(contracts, { relationName: 'supplier' }),
  bids: many(bids, { relationName: 'supplier' })
}));

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  user: one(users, {
    fields: [rfqs.userId],
    references: [users.id]
  }),
  quotes: many(quotes),
  bids: many(bids),
  contracts: many(contracts),
  messageThreads: many(message_threads)
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [quotes.rfqId],
    references: [rfqs.id]
  }),
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id]
  })
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [bids.rfqId],
    references: [rfqs.id]
  }),
  supplier: one(users, {
    fields: [bids.supplierId],
    references: [users.id]
  })
}));

export const productsRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id]
  })
}));

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  user: one(users, {
    fields: [suppliers.userId],
    references: [users.id]
  })
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  rfq: one(rfqs, {
    fields: [contracts.rfqId],
    references: [rfqs.id]
  }),
  buyer: one(users, {
    fields: [contracts.buyerId],
    references: [users.id]
  }),
  supplier: one(users, {
    fields: [contracts.supplierId],
    references: [users.id]
  }),
  messageThreads: many(message_threads)
}));

export const messageThreadsRelations = relations(message_threads, ({ one, many }) => ({
  rfq: one(rfqs, {
    fields: [message_threads.rfqId],
    references: [rfqs.id]
  }),
  contract: one(contracts, {
    fields: [message_threads.contractId],
    references: [contracts.id]
  }),
  messages: many(messages, { relationName: 'messageThread' }),
  participants: many(thread_participants, { relationName: 'participant' })
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id]
  }),
  thread: one(message_threads, {
    fields: [messages.threadId],
    references: [message_threads.id],
    relationName: 'messageThread'
  })
}));

export const threadParticipantsRelations = relations(thread_participants, ({ one }) => ({
  thread: one(message_threads, {
    fields: [thread_participants.threadId],
    references: [message_threads.id],
    relationName: 'participant'
  }),
  user: one(users, {
    fields: [thread_participants.userId],
    references: [users.id]
  })
}));

export const portfolioItemsRelations = relations(portfolio_items, ({ one }) => ({
  user: one(users, {
    fields: [portfolio_items.userId],
    references: [users.id]
  })
}));

export const walletTransactionsRelations = relations(wallet_transactions, ({ one }) => ({
  user: one(users, {
    fields: [wallet_transactions.userId],
    references: [users.id]
  })
}));

export const buyerProfilesRelations = relations(buyer_profiles, ({ one }) => ({
  user: one(users, {
    fields: [buyer_profiles.userId],
    references: [users.id]
  })
}));

// Create Zod schemas for validation
export const usersInsertSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.min(8, "Password must be at least 8 characters")
});

export const rfqsInsertSchema = createInsertSchema(rfqs, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  description: (schema) => schema.nullable().optional()
});

export const quotesInsertSchema = createInsertSchema(quotes, {
  price: (schema) => schema.min(0, "Price must be positive"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters")
});

// Create select schemas for type safety
export const usersSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof usersSelectSchema>;

export const rfqsSelectSchema = createSelectSchema(rfqs);
export type RFQ = z.infer<typeof rfqsSelectSchema>;

export const quotesSelectSchema = createSelectSchema(quotes);
export type Quote = z.infer<typeof quotesSelectSchema>;

export const productsSelectSchema = createSelectSchema(products);
export type Product = z.infer<typeof productsSelectSchema>;

export const suppliersSelectSchema = createSelectSchema(suppliers);
export type Supplier = z.infer<typeof suppliersSelectSchema>;

export const contractsSelectSchema = createSelectSchema(contracts);
export type Contract = z.infer<typeof contractsSelectSchema>;

export const messagesSelectSchema = createSelectSchema(messages);
export type Message = z.infer<typeof messagesSelectSchema>;

export const messageThreadsSelectSchema = createSelectSchema(message_threads);
export type MessageThread = z.infer<typeof messageThreadsSelectSchema>;

export const threadParticipantsSelectSchema = createSelectSchema(thread_participants);
export type ThreadParticipant = z.infer<typeof threadParticipantsSelectSchema>;

export const marketDataSelectSchema = createSelectSchema(market_data);
export type MarketData = z.infer<typeof marketDataSelectSchema>;

export const marketTrendsSelectSchema = createSelectSchema(market_trends);
export type MarketTrend = z.infer<typeof marketTrendsSelectSchema>;

export const portfolioItemsSelectSchema = createSelectSchema(portfolio_items);
export type PortfolioItem = z.infer<typeof portfolioItemsSelectSchema>;

export const walletTransactionsSelectSchema = createSelectSchema(wallet_transactions);
export type WalletTransaction = z.infer<typeof walletTransactionsSelectSchema>;

export const buyerProfilesSelectSchema = createSelectSchema(buyer_profiles);
export type BuyerProfile = z.infer<typeof buyerProfilesSelectSchema>;

export const userRolesSelectSchema = createSelectSchema(user_roles);
export type UserRole = z.infer<typeof userRolesSelectSchema>;

export const bidsSelectSchema = createSelectSchema(bids);
export type Bid = z.infer<typeof bidsSelectSchema>;
