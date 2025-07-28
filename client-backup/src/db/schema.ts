import { pgTable, serial, text, timestamp, integer, boolean, jsonb, decimal, date, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const buyerProfiles = pgTable('buyer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  companyName: text('company_name'),
  industry: text('industry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  companyName: text('company_name'),
  industry: text('industry'),
  rating: decimal('rating'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  buyerId: integer('buyer_id').references(() => buyerProfiles.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  budget: decimal('budget'),
  deadline: timestamp('deadline'),
  status: text('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  rfqId: integer('rfq_id').references(() => rfqs.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  amount: decimal('amount').notNull(),
  description: text('description'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  rfqId: integer('rfq_id').references(() => rfqs.id),
  bidId: integer('bid_id').references(() => bids.id),
  buyerId: integer('buyer_id').references(() => buyerProfiles.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  terms: text('terms'),
  status: text('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messageThreads = pgTable('message_threads', {
  id: serial('id').primaryKey(),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const threadParticipants = pgTable('thread_participants', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').references(() => messageThreads.id),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').references(() => messageThreads.id),
  senderId: integer('sender_id').references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const marketData = pgTable('market_data', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  price: decimal('price').notNull(),
  volume: decimal('volume'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const marketTrends = pgTable('market_trends', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(),
  trend: text('trend').notNull(),
  analysis: jsonb('analysis'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  type: text('type').notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  type: text('type').notNull(),
  amount: decimal('amount').notNull(),
  status: text('status').default('pending'),
  metadata: jsonb('metadata'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// KredX Invoice Financing tables
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  buyerId: integer('buyer_id').references(() => buyerProfiles.id),
  contractId: integer('contract_id').references(() => contracts.id),
  amount: decimal('amount').notNull(),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  status: text('status').default('issued'), // issued, submitted, financed, paid, overdue
  description: text('description'),
  attachmentUrl: text('attachment_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const invoiceFinancing = pgTable('invoice_financing', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  transactionId: uuid('transaction_id').notNull(), // KredX transaction ID
  supplierId: integer('supplier_id').references(() => suppliers.id),
  financeAmount: decimal('finance_amount').notNull(), // Amount being financed
  disbursedAmount: decimal('disbursed_amount').notNull(), // Amount after fees
  fee: decimal('fee').notNull(),
  interestRate: decimal('interest_rate').notNull(),
  status: text('status').default('pending'), // pending, approved, rejected, funded, completed
  approvalDate: timestamp('approval_date'),
  fundingDate: timestamp('funding_date'),
  repaymentDate: timestamp('repayment_date'),
  metadata: jsonb('metadata'), // Store KredX specific data
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// M1 Exchange Early Milestone Payments tables
export const milestones = pgTable('milestones', {
  id: serial('id').primaryKey(),
  contractId: integer('contract_id').references(() => contracts.id),
  title: text('title').notNull(),
  description: text('description'),
  amount: decimal('amount').notNull(),
  dueDate: date('due_date'),
  completionDate: timestamp('completion_date'),
  status: text('status').default('pending'), // pending, completed, verified, paid
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const earlyPayments = pgTable('early_payments', {
  id: serial('id').primaryKey(),
  milestoneId: integer('milestone_id').references(() => milestones.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  transactionId: uuid('transaction_id').notNull(), // M1Exchange transaction ID
  requestedAmount: decimal('requested_amount').notNull(),
  approvedAmount: decimal('approved_amount'),
  fee: decimal('fee'),
  discountRate: decimal('discount_rate'),
  originalDueDate: date('original_due_date').notNull(),
  earlyPaymentDate: date('early_payment_date'),
  status: text('status').default('requested'), // requested, approved, processed, completed, rejected
  savingsAmount: decimal('savings_amount'), // How much the supplier saved
  buyerBenefit: decimal('buyer_benefit'), // Any benefit to the buyer
  metadata: jsonb('metadata'), // Store M1Exchange specific data
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Blockchain milestone contracts
export const milestoneContracts = pgTable('milestone_contracts', {
  id: serial('id').primaryKey(),
  contractId: text('contract_id').notNull().unique(),
  buyer: text('buyer').notNull(),
  seller: text('seller').notNull(),
  totalAmount: decimal('total_amount', { precision: 20, scale: 6 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 20, scale: 6 }).notNull().default('0'),
  state: integer('state').notNull().default(0),
  hasDispute: boolean('has_dispute').notNull().default(false),
  termsHash: text('terms_hash').notNull(),
  transactionHash: text('transaction_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contractMilestones = pgTable('contract_milestones', {
  id: serial('id').primaryKey(),
  contractId: text('contract_id').notNull().references(() => milestoneContracts.contractId, { onDelete: 'cascade' }),
  index: integer('index').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 20, scale: 6 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  state: integer('state').notNull().default(0),
  completedAt: timestamp('completed_at'),
  paidAt: timestamp('paid_at'),
  deliverableHash: text('deliverable_hash'),
  feedbackNotes: text('feedback_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contractDisputes = pgTable('contract_disputes', {
  id: serial('id').primaryKey(),
  disputeId: text('dispute_id').notNull().unique(),
  contractId: text('contract_id').notNull().references(() => milestoneContracts.contractId, { onDelete: 'cascade' }),
  milestoneIndex: integer('milestone_index').notNull(),
  initiator: text('initiator').notNull(),
  reason: text('reason').notNull(),
  evidenceHash: text('evidence_hash').notNull(),
  resolution: integer('resolution').notNull().default(0),
  resolutionNotes: text('resolution_notes'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Financial service settings and eligibility
export const financialServiceSettings = pgTable('financial_service_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  service: text('service').notNull(), // kredx, m1exchange
  isEnabled: boolean('is_enabled').default(true),
  autoApproveThreshold: decimal('auto_approve_threshold'),
  maxFinancingPercentage: decimal('max_financing_percentage'),
  paymentDetails: jsonb('payment_details'), // Bank account, UPI, etc.
  riskScore: decimal('risk_score'), // Internal risk score
  preferredInterestRate: decimal('preferred_interest_rate'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notifications for financial services
export const financialNotifications = pgTable('financial_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // invoice_financed, payment_processed, etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedEntityType: text('related_entity_type'), // invoice, milestone, etc.
  relatedEntityId: integer('related_entity_id'),
  isRead: boolean('is_read').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
