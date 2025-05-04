import { pgTable, serial, text, varchar, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  companyName: varchar('company_name', { length: 255 }),
  gstNumber: varchar('gst_number', { length: 15 }),
  gstVerified: boolean('gst_verified').default(false),
  walletBalance: integer('wallet_balance').default(0),
  role: varchar('role', { length: 50 }).default('buyer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// RFQs table
export const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  quantity: varchar('quantity', { length: 100 }).notNull(),
  deadline: timestamp('deadline').notNull(),
  specifications: jsonb('specifications').default({}),
  referenceNumber: varchar('reference_number', { length: 255 }),
  rfqType: varchar('rfq_type', { length: 50 }).default('text'),
  status: varchar('status', { length: 50 }).default('open'),
  detectedLanguage: varchar('detected_language', { length: 10 }),
  originalTranscript: text('original_transcript'),
  matchSuccessRate: integer('match_success_rate'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Bids table
export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  rfqId: integer('rfq_id').references(() => rfqs.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  price: integer('price').notNull(),
  notes: text('notes'),
  attachments: jsonb('attachments').default([]),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  rfqs: many(rfqs),
  bids: many(bids)
}));

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  user: one(users, { fields: [rfqs.userId], references: [users.id] }),
  bids: many(bids)
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  rfq: one(rfqs, { fields: [bids.rfqId], references: [rfqs.id] }),
  user: one(users, { fields: [bids.userId], references: [users.id] })
}));

// Schema validation
export const usersInsertSchema = createInsertSchema(users, {
  username: (schema) => schema.username.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email.email("Must provide a valid email"),
  password: (schema) => schema.password.min(8, "Password must be at least 8 characters")
});

export const rfqsInsertSchema = createInsertSchema(rfqs, {
  title: (schema) => schema.title.min(5, "Title must be at least 5 characters"),
  description: (schema) => schema.description.min(10, "Description must be at least 10 characters")
});

export const bidsInsertSchema = createInsertSchema(bids, {
  price: (schema) => schema.price.positive("Price must be positive")
});

// Export types
export type User = z.infer<typeof createSelectSchema(users)>;
export type UserInsert = z.infer<typeof usersInsertSchema>;

export type Rfq = z.infer<typeof createSelectSchema(rfqs)>;
export type RfqInsert = z.infer<typeof rfqsInsertSchema>;

export type Bid = z.infer<typeof createSelectSchema(bids)>;
export type BidInsert = z.infer<typeof bidsInsertSchema>;
