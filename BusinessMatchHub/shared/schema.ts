import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tables first
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  companyName: text("company_name").notNull(),
  location: text("location"),
  industry: text("industry"),
  gstNumber: text("gst_number"),
  gstVerified: boolean("gst_verified").default(false),
  walletBalance: integer("wallet_balance").default(0),
  userType: text("user_type").notNull(), // 'buyer', 'supplier', or 'both'
  profilePicture: text("profile_picture"),
  companyLogo: text("company_logo"),
  companyWebsite: text("company_website"),
  yearFounded: integer("year_founded"),
  employeeCount: integer("employee_count"),
  annualRevenue: text("annual_revenue"),
  phoneNumber: text("phone_number"),
  bio: text("bio"),
  verificationStatus: text("verification_status").default("pending"), // 'pending', 'verified', 'rejected'
  socialProfiles: jsonb("social_profiles"), // LinkedIn, Twitter, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  quantity: text("quantity").notNull(),
  deadline: timestamp("deadline").notNull(),
  category: text("category").notNull(),
  specifications: jsonb("specifications"),
  rfqType: text("rfq_type").notNull(), // 'text', 'voice', or 'video'
  mediaUrl: text("media_url"), // URL for voice or video content
  status: text("status").notNull().default("open"), // 'open', 'closed', 'awarded', 'expired'
  matchSuccessRate: integer("match_success_rate"), // 0-100 percentage
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  industry: text("industry").notNull(),
  subIndustries: jsonb("sub_industries"), // Array of sub-industries
  products: jsonb("products"),
  serviceAreas: jsonb("service_areas"), // Geographical service coverage
  description: text("description"),
  lateDeliveryRate: doublePrecision("late_delivery_rate").default(0),
  complianceScore: doublePrecision("compliance_score").default(100),
  financialStability: doublePrecision("financial_stability").default(100),
  userFeedback: doublePrecision("user_feedback").default(100),
  riskScore: doublePrecision("risk_score"),
  certifications: jsonb("certifications"), // ISO, etc.
  manufacturingCapacity: text("manufacturing_capacity"),
  minimumOrderQuantity: text("minimum_order_quantity"),
  leadTime: text("lead_time"),
  exportMarkets: jsonb("export_markets"), // Countries they export to
  paymentTerms: text("payment_terms"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull().references(() => rfqs.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  price: integer("price").notNull(),
  deliveryDays: integer("delivery_days").notNull(),
  message: text("message"),
  attachments: jsonb("attachments"),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const threadParticipants = pgTable("thread_participants", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => messageThreads.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  threadId: integer("thread_id").references(() => messageThreads.id),
  rfqId: integer("rfq_id").references(() => rfqs.id),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'fee', 'refund', 'escrow_funding', 'milestone_payment'
  description: text("description"),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  contractId: integer("contract_id").references(() => contracts.id),
  milestoneId: integer("milestone_id").references(() => milestones.id),
  reference: text("reference"), // External reference ID (e.g., RazorpayX transaction ID)
  createdAt: timestamp("created_at").defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull().references(() => rfqs.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  supplierId: integer("supplier_id").notNull().references(() => users.id),
  bidId: integer("bid_id").notNull().references(() => bids.id),
  totalValue: integer("total_value").notNull(),
  value: integer("value").notNull(),
  milestones: jsonb("milestones"),
  status: text("status").notNull(), // 'active', 'completed', 'disputed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  // Escrow-related fields
  escrowAccountId: text("escrow_account_id"),
  escrowReferenceId: text("escrow_reference_id"),
  escrowFunded: boolean("escrow_funded").default(false),
  escrowAmount: integer("escrow_amount"),
  escrowFee: integer("escrow_fee"),
  escrowTransactionId: text("escrow_transaction_id"),
  hasEscrow: boolean("has_escrow").default(false),
});

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  industry: text("industry").notNull(),
  symbol: text("symbol").notNull(),
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category"),
  sku: text("sku"), // Stock Keeping Unit
  price: doublePrecision("price"), // Base price as decimal for precision
  priceUnit: text("price_unit"), // e.g., "per_piece", "per_kg", "per_meter"
  currency: text("currency").default("USD"),
  minimumOrderQuantity: text("minimum_order_quantity"),
  availableQuantity: integer("available_quantity"),
  leadTime: integer("lead_time"), // Production/delivery time in days
  specifications: jsonb("specifications"), // Technical specifications
  images: jsonb("images"), // Array of image URLs
  imageUrl: text("image_url"), // Primary image URL
  isCustomizable: boolean("is_customizable").default(false),
  sampleAvailable: boolean("sample_available").default(false),
  bulkDiscount: boolean("bulk_discount").default(false),
  sustainableMaterial: boolean("sustainable_material").default(false),
  featured: boolean("featured").default(false),
  customizationOptions: jsonb("customization_options"),
  origin: text("origin"), // Country of origin
  warranty: text("warranty"), // Warranty information
  certifications: jsonb("certifications"), // Array of certification names
  shippingWeight: doublePrecision("shipping_weight"), // Weight in kg
  availability: text("availability").default("in_stock"), // "in_stock", "low_stock", "out_of_stock", "made_to_order"
  status: text("status").default("active"), // "active", "inactive", "discontinued", "coming_soon"
  tags: jsonb("tags"), // Array of searchable tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clientName: text("client_name"),
  clientLocation: text("client_location"),
  projectValue: integer("project_value"),
  completionDate: timestamp("completion_date"),
  category: text("category").notNull(),
  images: jsonb("images"), // Array of image URLs
  testimonial: text("testimonial"),
  orderSize: text("order_size"), // Size or quantity of the order
  projectDuration: text("project_duration"), // How long the project took
  results: text("results"), // Outcomes or results achieved
  createdAt: timestamp("created_at").defaultNow(),
});

export const blockchainRecords = pgTable("blockchain_records", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull().references(() => rfqs.id),
  txHash: text("tx_hash").notNull(),
  blockchainHash: text("blockchain_hash").notNull(),
  network: text("network").notNull(),
  status: text("status").notNull().default("pending"),
  blockNumber: integer("block_number"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Milestones table for blockchain-based milestone payments
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  milestoneNumber: integer("milestone_number").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'paid', 'refunded', 'disputed'
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  refundAmount: integer("refund_amount"),
  transactionHash: text("transaction_hash"),
  blockchainRecordId: integer("blockchain_record_id").references(() => blockchainRecords.id),
  // Escrow payment fields
  escrowPayoutId: text("escrow_payout_id"), // RazorpayX payout ID
  escrowTransactionId: text("escrow_transaction_id"), // RazorpayX transaction ID
  payoutStatus: text("payout_status"), // 'pending', 'processing', 'processed', 'failed'
  payoutDetails: jsonb("payout_details"), // Detailed payout information from RazorpayX
  deliverableUrl: text("deliverable_url"), // URL to milestone deliverable
  deliverableHash: text("deliverable_hash"), // Hash of deliverable content for verification
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Analytics data for dashboard
// RazorpayX tables for enhanced Escrow Wallet
export const razorpayContacts = pgTable("razorpay_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  razorpayContactId: varchar("razorpay_contact_id", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  contact: text("contact"),
  type: text("type").notNull(), // 'vendor' or 'customer'
  referenceId: text("reference_id").notNull(),
  notes: jsonb("notes"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const razorpayFundAccounts = pgTable("razorpay_fund_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contactId: integer("contact_id").notNull().references(() => razorpayContacts.id),
  razorpayContactId: varchar("razorpay_contact_id", { length: 64 }).notNull(),
  razorpayFundAccountId: varchar("razorpay_fund_account_id", { length: 64 }).notNull().unique(),
  accountType: text("account_type").notNull(), // 'bank_account', 'vpa', 'card' etc.
  accountDetails: jsonb("account_details").notNull(), // Bank account details
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const razorpayVirtualAccounts = pgTable("razorpay_virtual_accounts", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  razorpayVirtualAccountId: varchar("razorpay_virtual_account_id", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull(), // 'active', 'closed'
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  balance: integer("balance").default(0), // Current balance in paisa
  notes: jsonb("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const razorpayPayments = pgTable("razorpay_payments", {
  id: serial("id").primaryKey(),
  virtualAccountId: integer("virtual_account_id").notNull().references(() => razorpayVirtualAccounts.id),
  razorpayVirtualAccountId: varchar("razorpay_virtual_account_id", { length: 64 }).notNull(),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 64 }).notNull().unique(),
  amount: integer("amount").notNull(), // Amount in paisa
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull(), // 'authorized', 'captured', 'failed'
  method: text("method"), // Payment method
  description: text("description"),
  email: text("email"),
  contact: text("contact"),
  notes: jsonb("notes"),
  walletTransactionId: integer("wallet_transaction_id").references(() => walletTransactions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const razorpayPayouts = pgTable("razorpay_payouts", {
  id: serial("id").primaryKey(),
  virtualAccountId: integer("virtual_account_id").notNull().references(() => razorpayVirtualAccounts.id),
  fundAccountId: integer("fund_account_id").references(() => razorpayFundAccounts.id),
  razorpayVirtualAccountId: varchar("razorpay_virtual_account_id", { length: 64 }).notNull(),
  razorpayFundAccountId: varchar("razorpay_fund_account_id", { length: 64 }),
  razorpayPayoutId: varchar("razorpay_payout_id", { length: 64 }).notNull().unique(),
  amount: integer("amount").notNull(), // Amount in paisa
  currency: text("currency").notNull().default("INR"),
  purpose: text("purpose").notNull(), // 'milestone_payment', 'refund', etc.
  status: text("status").notNull(), // 'initiated', 'processed', 'failed'
  utr: text("utr"), // Unique Transaction Reference from bank
  fees: integer("fees"), // Fees charged by Razorpay in paisa
  tax: integer("tax"), // Tax on fees in paisa
  milestoneId: integer("milestone_id").references(() => milestones.id),
  reference: text("reference").notNull(), // Unique reference ID for this payout
  notes: jsonb("notes"),
  failureReason: text("failure_reason"),
  walletTransactionId: integer("wallet_transaction_id").references(() => walletTransactions.id),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const escrowTransactions = pgTable("escrow_transactions", {
  id: serial("id").primaryKey(),
  virtualAccountId: integer("virtual_account_id").notNull().references(() => razorpayVirtualAccounts.id),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  milestoneId: integer("milestone_id").references(() => milestones.id),
  transactionType: text("transaction_type").notNull(), // 'funding', 'payment_release', 'refund'
  amount: integer("amount").notNull(), // Amount in paisa
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  paymentId: integer("payment_id").references(() => razorpayPayments.id),
  payoutId: integer("payout_id").references(() => razorpayPayouts.id),
  externalId: text("external_id"), // RazorpayX payment/payout ID
  externalReference: text("external_reference"), // Additional reference ID
  senderType: text("sender_type").notNull(), // 'buyer', 'platform', 'escrow'
  receiverType: text("receiver_type").notNull(), // 'seller', 'buyer', 'escrow', 'platform'
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  description: text("description"),
  metadata: jsonb("metadata"),
  walletTransactionId: integer("wallet_transaction_id").references(() => walletTransactions.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // 'razorpay', 'kredx', etc.
  eventType: text("event_type").notNull(), // 'payment.authorized', 'payout.processed', etc.
  eventId: text("event_id").notNull(),
  signature: text("signature"),
  isVerified: boolean("is_verified").default(false),
  payload: jsonb("payload").notNull(),
  processingStatus: text("processing_status").notNull().default("pending"), // 'pending', 'processed', 'failed'
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  dataType: text("data_type").notNull(), // rfq_stats, product_stats, market_data, etc.
  dataKey: text("data_key").notNull(), // specific key like 'active_rfqs', 'rfq_by_category', etc.
  dataValue: jsonb("data_value").notNull(), // JSON containing the actual data
  period: text("period").notNull(), // daily, weekly, monthly, yearly
  timestamp: timestamp("timestamp").defaultNow(),
});

// Product analytics data
export const productAnalytics = pgTable("product_analytics", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  views: integer("views").default(0),
  rfqMentions: integer("rfq_mentions").default(0),
  conversionRate: doublePrecision("conversion_rate").default(0),
  timeOnPage: integer("time_on_page").default(0), // in seconds
  timestamp: timestamp("timestamp").defaultNow(),
});

// RFQ analytics data
export const rfqAnalytics = pgTable("rfq_analytics", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull().references(() => rfqs.id),
  responseTime: integer("response_time").default(0), // in seconds
  bidCount: integer("bid_count").default(0),
  viewCount: integer("view_count").default(0),
  categoryPerformance: jsonb("category_performance"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Market trends data
export const marketTrends = pgTable("market_trends", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  subCategory: text("sub_category"),
  region: text("region"),
  priceIndex: doublePrecision("price_index"),
  demandIndex: doublePrecision("demand_index"),
  supplyIndex: doublePrecision("supply_index"),
  volatilityIndex: doublePrecision("volatility_index"),
  forecast: jsonb("forecast"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Invoices table (for KredX integration)
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  contractId: integer("contract_id").references(() => contracts.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("INR"),
  dueDate: timestamp("due_date").notNull(),
  issuedDate: timestamp("issued_date").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'paid', 'overdue', 'discounted', 'cancelled'
  items: jsonb("items").notNull(), // Array of invoice line items
  taxDetails: jsonb("tax_details"), // GST and other tax information
  discountRate: doublePrecision("discount_rate"), // KredX discount rate (if discounted)
  discountAmount: doublePrecision("discount_amount"), // Amount received after discount
  advanceAmount: doublePrecision("advance_amount"), // Advance amount (85% of invoice amount)
  remainingAmount: doublePrecision("remaining_amount"), // Remaining amount (14.5% after fee)
  feePercentage: doublePrecision("fee_percentage"), // Fee percentage (0.5% for KredX)
  earlyPaymentDate: timestamp("early_payment_date"), // Date early payment was received (if discounted)
  kredxReferenceId: text("kredx_reference_id"), // Reference ID from KredX (if discounted)
  kredxStatus: text("kredx_status"), // Status from KredX API
  discountFee: doublePrecision("discount_fee"), // Fee charged by KredX (0.5%)
  discountRequested: boolean("discount_requested").default(false), // Flag to track if an invoice has been submitted for discounting
  fileUrl: text("file_url"), // URL to the invoice PDF/document
  verificationStatus: text("verification_status").default("pending"), // 'pending', 'verified', 'rejected'
  kredxEligible: boolean("kredx_eligible").default(false), // Whether invoice is eligible for KredX discounting
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KredX transaction logs
export const kredxTransactions = pgTable("kredx_transactions", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  transactionType: text("transaction_type").notNull(), // 'submission', 'verification', 'discounting', 'payment'
  status: text("status").notNull(), // 'success', 'pending', 'failed'
  amount: doublePrecision("amount"),
  fee: doublePrecision("fee"), // KredX processing fee (0.5% of invoice amount)
  feeAmount: doublePrecision("fee_amount"), // Legacy field for backward compatibility
  referenceId: text("reference_id"), // KredX reference ID
  responseData: jsonb("response_data"), // Full response from KredX API
  createdAt: timestamp("created_at").defaultNow(),
});

// Logistics tracking - Shipments
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  contractId: integer("contract_id").references(() => contracts.id),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  serviceProvider: text("service_provider").notNull(), // 'shiprocket', 'dhl', 'fedex', etc.
  serviceType: text("service_type").notNull(), // 'standard', 'express', 'priority', etc.
  status: text("status").notNull().default("pending"), // 'pending', 'shipped', 'in_transit', 'delivered', 'exception'
  weight: doublePrecision("weight"), // in kg
  dimensions: jsonb("dimensions"), // length, width, height
  packageCount: integer("package_count").default(1),
  contentValue: doublePrecision("content_value"), // declared value
  currency: text("currency").default("INR"),
  fromAddress: jsonb("from_address").notNull(),
  toAddress: jsonb("to_address").notNull(),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  shippedDate: timestamp("shipped_date"),
  labelUrl: text("label_url"), // URL to shipping label
  providerData: jsonb("provider_data"), // Raw data from the service provider
  customsInfo: jsonb("customs_info"), // International shipping customs information
  insuranceAmount: doublePrecision("insurance_amount"),
  deliveryInstructions: text("delivery_instructions"),
  shipmentCost: doublePrecision("shipment_cost"),
  proofOfDeliveryUrl: text("proof_of_delivery_url"),
  metadata: jsonb("metadata"), // Additional provider-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Logistics tracking - Shipment Items
export const shipmentItems = pgTable("shipment_items", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id),
  productId: integer("product_id").references(() => products.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  weight: doublePrecision("weight"), // per item weight in kg
  value: doublePrecision("value"), // per item value
  hsTariffCode: text("hs_tariff_code"), // Harmonized System code for international shipping
  originCountry: text("origin_country"), // For customs purposes
  metadata: jsonb("metadata"), // Additional item-specific data
  createdAt: timestamp("created_at").defaultNow(),
});

// Logistics tracking - Shipment Events
export const shipmentEvents = pgTable("shipment_events", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id),
  eventType: text("event_type").notNull(), // 'label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception'
  location: text("location"),
  timestamp: timestamp("timestamp").notNull(),
  description: text("description"),
  eventData: jsonb("event_data"), // Raw event data from the provider
  createdAt: timestamp("created_at").defaultNow(),
});

// Logistics tracking - Documents
export const shipmentDocuments = pgTable("shipment_documents", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id),
  documentType: text("document_type").notNull(), // 'label', 'commercial_invoice', 'customs_declaration', 'proof_of_delivery'
  fileUrl: text("file_url").notNull(),
  mimeType: text("mime_type").notNull(),
  filename: text("filename").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertRfqSchema = createInsertSchema(rfqs).omit({ id: true, createdAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({ id: true, createdAt: true, updatedAt: true });
export const insertThreadParticipantSchema = createInsertSchema(threadParticipants).omit({ id: true, joinedAt: true, lastReadAt: true });
export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({ id: true, createdAt: true });
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true });
export const insertMarketDataSchema = createInsertSchema(marketData).omit({ id: true, timestamp: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({ id: true, createdAt: true });
export const insertBlockchainRecordSchema = createInsertSchema(blockchainRecords).omit({ id: true, createdAt: true });
export const insertAnalyticsDataSchema = createInsertSchema(analyticsData).omit({ id: true, timestamp: true });
export const insertProductAnalyticsSchema = createInsertSchema(productAnalytics).omit({ id: true, timestamp: true });
export const insertRfqAnalyticsSchema = createInsertSchema(rfqAnalytics).omit({ id: true, timestamp: true });
export const insertMarketTrendsSchema = createInsertSchema(marketTrends).omit({ id: true, timestamp: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertKredxTransactionSchema = createInsertSchema(kredxTransactions).omit({ id: true, createdAt: true });
export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShipmentItemSchema = createInsertSchema(shipmentItems).omit({ id: true, createdAt: true });
export const insertShipmentEventSchema = createInsertSchema(shipmentEvents).omit({ id: true, createdAt: true });
export const insertShipmentDocumentSchema = createInsertSchema(shipmentDocuments).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;
export type InsertThreadParticipant = z.infer<typeof insertThreadParticipantSchema>;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type InsertBlockchainRecord = z.infer<typeof insertBlockchainRecordSchema>;
export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;
export type InsertProductAnalytics = z.infer<typeof insertProductAnalyticsSchema>;
export type InsertRfqAnalytics = z.infer<typeof insertRfqAnalyticsSchema>;
export type InsertMarketTrends = z.infer<typeof insertMarketTrendsSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertKredxTransaction = z.infer<typeof insertKredxTransactionSchema>;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type InsertShipmentItem = z.infer<typeof insertShipmentItemSchema>;
export type InsertShipmentEvent = z.infer<typeof insertShipmentEventSchema>;
export type InsertShipmentDocument = z.infer<typeof insertShipmentDocumentSchema>;

export type User = typeof users.$inferSelect;
export type Rfq = typeof rfqs.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Bid = typeof bids.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageThread = typeof messageThreads.$inferSelect;
export type ThreadParticipant = typeof threadParticipants.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type MarketData = typeof marketData.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type BlockchainRecord = typeof blockchainRecords.$inferSelect;
export type AnalyticsData = typeof analyticsData.$inferSelect;
export type ProductAnalytics = typeof productAnalytics.$inferSelect;
export type RfqAnalytics = typeof rfqAnalytics.$inferSelect;
export type MarketTrends = typeof marketTrends.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type KredxTransaction = typeof kredxTransactions.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type Shipment = typeof shipments.$inferSelect;
export type ShipmentItem = typeof shipmentItems.$inferSelect;
export type ShipmentEvent = typeof shipmentEvents.$inferSelect;
export type ShipmentDocument = typeof shipmentDocuments.$inferSelect;

// AI Model Explanation system
export const modelExplanations = pgTable("model_explanations", {
  id: serial("id").primaryKey(),
  modelType: text("model_type").notNull(), // 'supplier_risk', 'rfq_matching', 'price_prediction'
  instanceId: integer("instance_id").notNull(), // ID of the supplier, RFQ, or product
  prediction: jsonb("prediction").notNull(), // Model prediction output
  confidence: doublePrecision("confidence"), // Confidence score (0-1)
  featureImportances: jsonb("feature_importances").notNull(), // Array of feature importance objects
  interpretationMethod: text("interpretation_method").notNull(), // 'shap', 'lime', 'both'
  visualizationUrl: text("visualization_url"), // URL to the visualization image
  userId: integer("user_id").notNull().references(() => users.id), // User who requested the explanation
  data: jsonb("data"), // Additional data used for the explanation
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertModelExplanationSchema = createInsertSchema(modelExplanations).omit({ id: true, createdAt: true });
export type InsertModelExplanation = z.infer<typeof insertModelExplanationSchema>;
export type ModelExplanation = typeof modelExplanations.$inferSelect;