/**
 * Schema definitions for Bell24H Dashboard server models
 * This replicates the main schema structure with necessary types for authentication
 */
import { pgTable, serial, text, timestamp, integer, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';

// User schema with authentication fields
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  resetToken: text('reset_token'),
  resetTokenExpiry: text('reset_token_expiry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Buyer profile schema
export const buyerProfiles = pgTable('buyer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  companyName: text('company_name'),
  industry: text('industry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Supplier schema
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  companyName: text('company_name'),
  industry: text('industry'),
  rating: decimal('rating'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// RFQ schema
export const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(), // User who created the RFQ
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  budget: decimal('budget'), // Optional budget
  deadline: timestamp('deadline', { mode: 'string' }), // Optional deadline
  status: text('status').notNull().default('open'), // e.g., 'open', 'closed', 'awarded', 'cancelled'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Rfq = {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  budget?: string | null; // Drizzle decimal type maps to string in TS
  deadline?: string | null;
  status: 'open' | 'closed' | 'awarded' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
};

// Define TypeScript types for authentication
export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'buyer' | 'supplier' | 'user';
  resetToken?: string | null;
  resetTokenExpiry?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TokenPayload = {
  id: number;
  username: string; // Maps to email for compatibility
  role: string;
};

/**
 * Check if user has a specific role
 */
export function hasRole(user: User, role: string): boolean {
  return user.role === role;
}

/**
 * Create JWT payload from user object
 */
export function createTokenPayload(user: User): TokenPayload {
  return {
    id: user.id,
    username: user.email, // Use email as username for consistency
    role: user.role,
  };
}
