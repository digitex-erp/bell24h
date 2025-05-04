import { pgEnum, pgTable, serial, text, timestamp, integer, doublePrecision, boolean } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const userTypeEnum = pgEnum('user_type', ['buyer', 'supplier', 'admin', 'both']);
export const rfqStatusEnum = pgEnum('rfq_status', ['draft', 'open', 'in_review', 'awarded', 'closed', 'cancelled']);
export const bidStatusEnum = pgEnum('bid_status', ['pending', 'under_review', 'accepted', 'rejected', 'withdrawn']);
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'pending_approval', 'active', 'completed', 'terminated']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'payment', 'refund', 'escrow', 'fee']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  user_type: userTypeEnum('user_type').notNull().default('buyer'),
  company_name: text('company_name'),
  company_address: text('company_address'),
  tax_id: text('tax_id'),
  wallet_balance: doublePrecision('wallet_balance').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
  rfqs: many(rfqs),
  bids: many(bids),
  supplierInfo: many(suppliers),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'recipient' }),
  transactions: many(transactions)
}));

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  industry: text('industry').notNull(),
  product_categories: text('product_categories').array().notNull(),
  risk_score: integer('risk_score').notNull().default(50),
  verification_status: boolean('verification_status').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  user: one(users, {
    fields: [suppliers.user_id],
    references: [users.id],
  })
}));

// RFQs table
export const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  quantity: integer('quantity').notNull(),
  budget: doublePrecision('budget'),
  delivery_deadline: timestamp('delivery_deadline'),
  status: rfqStatusEnum('status').notNull().default('draft'),
  user_id: integer('user_id').references(() => users.id).notNull(),
  blockchain_hash: text('blockchain_hash'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  user: one(users, {
    fields: [rfqs.user_id],
    references: [users.id],
  }),
  bids: many(bids)
}));

// Bids table
export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  rfq_id: integer('rfq_id').references(() => rfqs.id).notNull(),
  supplier_id: integer('supplier_id').references(() => users.id).notNull(),
  price: doublePrecision('price').notNull(),
  delivery_time: text('delivery_time').notNull(),
  notes: text('notes'),
  status: bidStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const bidsRelations = relations(bids, ({ one }) => ({
  rfq: one(rfqs, {
    fields: [bids.rfq_id],
    references: [rfqs.id],
  }),
  supplier: one(users, {
    fields: [bids.supplier_id],
    references: [users.id],
  })
}));

// Contracts table
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  rfq_id: integer('rfq_id').references(() => rfqs.id),
  bid_id: integer('bid_id').references(() => bids.id),
  buyer_id: integer('buyer_id').references(() => users.id).notNull(),
  supplier_id: integer('supplier_id').references(() => users.id).notNull(),
  value: doublePrecision('value').notNull(),
  terms: text('terms').notNull(),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  status: contractStatusEnum('status').notNull().default('draft'),
  blockchain_hash: text('blockchain_hash'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  rfq: one(rfqs, {
    fields: [contracts.rfq_id],
    references: [rfqs.id],
  }),
  bid: one(bids, {
    fields: [contracts.bid_id],
    references: [bids.id],
  }),
  buyer: one(users, {
    fields: [contracts.buyer_id],
    references: [users.id],
  }),
  supplier: one(users, {
    fields: [contracts.supplier_id],
    references: [users.id],
  })
}));

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  sender_id: integer('sender_id').references(() => users.id).notNull(),
  recipient_id: integer('recipient_id').references(() => users.id).notNull(),
  rfq_id: integer('rfq_id').references(() => rfqs.id),
  bid_id: integer('bid_id').references(() => bids.id),
  content: text('content').notNull(),
  status: messageStatusEnum('status').notNull().default('sent'),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.sender_id],
    references: [users.id],
    relationName: 'sender'
  }),
  recipient: one(users, {
    fields: [messages.recipient_id],
    references: [users.id],
    relationName: 'recipient'
  }),
  rfq: one(rfqs, {
    fields: [messages.rfq_id],
    references: [rfqs.id],
  }),
  bid: one(bids, {
    fields: [messages.bid_id],
    references: [bids.id],
  })
}));

// Transactions table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: doublePrecision('amount').notNull(),
  description: text('description').notNull(),
  reference_number: text('reference_number'),
  blockchain_hash: text('blockchain_hash'),
  status: text('status').notNull().default('completed'),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.user_id],
    references: [users.id],
  })
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, created_at: true, updated_at: true });

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertRfqSchema = createInsertSchema(rfqs)
  .omit({ id: true, created_at: true, updated_at: true, blockchain_hash: true });

export const insertBidSchema = createInsertSchema(bids)
  .omit({ id: true, created_at: true, updated_at: true });

export const insertContractSchema = createInsertSchema(contracts)
  .omit({ id: true, created_at: true, updated_at: true, blockchain_hash: true });

export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, created_at: true });

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ id: true, created_at: true, blockchain_hash: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Supplier = typeof suppliers.$inferSelect;

export type RFQ = typeof rfqs.$inferSelect;
export type InsertRFQ = z.infer<typeof insertRfqSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;