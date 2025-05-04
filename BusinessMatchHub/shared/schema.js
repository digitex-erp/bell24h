const { pgTable, serial, text, timestamp, boolean, numeric, integer, json, date } = require('drizzle-orm/pg-core');
const { createInsertSchema } = require('drizzle-zod');

// Users table
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  email: text('email').notNull(),
  companyName: text('company_name').notNull(),
  location: text('location'),
  industry: text('industry'),
  gstNumber: text('gst_number'),
  gstVerified: boolean('gst_verified'),
  walletBalance: numeric('wallet_balance', { precision: 10, scale: 2 }).default('0'),
  userType: text('user_type').notNull(),
  profilePicture: text('profile_picture'),
  companyLogo: text('company_logo'),
  companyWebsite: text('company_website'),
  yearFounded: integer('year_founded'),
  employeeCount: integer('employee_count'),
  annualRevenue: numeric('annual_revenue', { precision: 14, scale: 2 }),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  socialProfiles: json('social_profiles'),
  createdAt: timestamp('created_at').defaultNow()
});

// RFQs table
const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  referenceNumber: text('reference_number').notNull(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  quantity: text('quantity').notNull(),
  deadline: timestamp('deadline').notNull(),
  category: text('category').notNull(),
  specifications: json('specifications'),
  rfqType: text('rfq_type').notNull(),
  mediaUrl: text('media_url'),
  status: text('status').default('open').notNull(),
  matchSuccessRate: numeric('match_success_rate', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow()
});

// Suppliers table
const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  industry: text('industry').notNull(),
  description: text('description'),
  subIndustries: json('sub_industries'),
  products: json('products'),
  serviceAreas: json('service_areas'),
  lateDeliveryRate: numeric('late_delivery_rate', { precision: 5, scale: 2 }),
  complianceScore: numeric('compliance_score', { precision: 5, scale: 2 }),
  financialStability: numeric('financial_stability', { precision: 5, scale: 2 }),
  userFeedback: numeric('user_feedback', { precision: 5, scale: 2 }),
  riskScore: numeric('risk_score', { precision: 5, scale: 2 }),
  certifications: json('certifications'),
  manufacturingCapacity: text('manufacturing_capacity'),
  paymentTerms: text('payment_terms'),
  createdAt: timestamp('created_at').defaultNow()
});

// Bids table
const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  rfqId: integer('rfq_id').notNull(),
  supplierId: integer('supplier_id').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  deliveryDays: integer('delivery_days').notNull(),
  message: text('message'),
  status: text('status').default('pending').notNull(),
  attachments: json('attachments'),
  createdAt: timestamp('created_at').defaultNow()
});

// Messages table
const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull(),
  receiverId: integer('receiver_id').notNull(),
  content: text('content').notNull(),
  rfqId: integer('rfq_id'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Wallet transactions table
const walletTransactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: text('type').notNull(), // deposit, withdrawal, payment, refund
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull(), // completed, pending, failed
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow()
});

// Contracts table
const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  rfqId: integer('rfq_id').notNull(),
  bidId: integer('bid_id').notNull(),
  supplierId: integer('supplier_id').notNull(),
  buyerId: integer('buyer_id').notNull(),
  totalValue: numeric('total_value', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull(), // draft, active, completed, cancelled
  milestones: json('milestones'),
  createdAt: timestamp('created_at').defaultNow()
});

// Market data table
const marketData = pgTable('market_data', {
  id: serial('id').primaryKey(),
  industry: text('industry').notNull(),
  subIndustry: text('sub_industry'),
  averagePrice: numeric('average_price', { precision: 10, scale: 2 }),
  priceVolatility: numeric('price_volatility', { precision: 5, scale: 2 }),
  supplyDemandRatio: numeric('supply_demand_ratio', { precision: 5, scale: 2 }),
  leadTime: integer('lead_time'), // in days
  qualityIndex: numeric('quality_index', { precision: 5, scale: 2 }),
  trendDirection: text('trend_direction'), // up, down, stable
  forecastedGrowth: numeric('forecasted_growth', { precision: 5, scale: 2 }),
  dataSource: text('data_source'),
  confidence: numeric('confidence', { precision: 5, scale: 2 }),
  timestamp: timestamp('timestamp').defaultNow()
});

// Products table
const products = pgTable('products', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  specifications: json('specifications'),
  certifications: json('certifications'),
  minimumOrderQuantity: text('minimum_order_quantity'),
  productionCapacity: text('production_capacity'),
  price: numeric('price', { precision: 10, scale: 2 }),
  priceUnit: text('price_unit'),
  currency: text('currency'),
  leadTime: text('lead_time'),
  images: json('images'),
  status: text('status'), // active, inactive, discontinued
  customizable: boolean('customizable').default(false),
  sampleAvailable: boolean('sample_available').default(false),
  origin: text('origin'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Portfolio items table
const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  clientName: text('client_name'),
  clientLocation: text('client_location'),
  projectValue: numeric('project_value', { precision: 10, scale: 2 }),
  completionDate: date('completion_date'),
  duration: integer('duration'), // in days
  challenge: text('challenge'),
  solution: text('solution'),
  results: text('results'),
  images: json('images'),
  createdAt: timestamp('created_at').defaultNow()
});

// Insert schemas using drizzle-zod
const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
const insertRfqSchema = createInsertSchema(rfqs).omit({ id: true, createdAt: true });
const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });
const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({ id: true, createdAt: true });
const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true });
const insertMarketDataSchema = createInsertSchema(marketData).omit({ id: true, timestamp: true });
const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({ id: true, createdAt: true });

module.exports = {
  users,
  rfqs,
  suppliers,
  bids,
  messages,
  walletTransactions,
  contracts,
  marketData,
  products,
  portfolioItems,
  insertUserSchema,
  insertRfqSchema,
  insertSupplierSchema,
  insertBidSchema,
  insertMessageSchema,
  insertWalletTransactionSchema,
  insertContractSchema,
  insertMarketDataSchema,
  insertProductSchema,
  insertPortfolioItemSchema
};