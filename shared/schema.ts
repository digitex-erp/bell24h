import { pgEnum, pgTable, serial, text, timestamp, integer, doublePrecision, boolean } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const userTypeEnum = pgEnum('user_type', ['buyer', 'supplier', 'admin', 'both']);
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'manager', 'member', 'viewer']);
export const rfqStatusEnum = pgEnum('rfq_status', ['draft', 'open', 'in_review', 'awarded', 'closed', 'cancelled']);
export const bidStatusEnum = pgEnum('bid_status', ['pending', 'under_review', 'accepted', 'rejected', 'withdrawn']);
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'pending_approval', 'active', 'completed', 'terminated']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'payment', 'refund', 'escrow', 'fee']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);
export const permissionTypeEnum = pgEnum('permission_type', ['full', 'create', 'read', 'update', 'delete', 'none']);

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
  transactions: many(transactions),
  ownedOrganizations: many(organizations, { relationName: 'owner' }),
  organizationMemberships: many(organizationMembers, { relationName: 'user' }),
  teamMemberships: many(teamMembers, { relationName: 'user' }),
  teamLeaderships: many(teams, { relationName: 'lead' })
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

// Organizations table
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  logo_url: text('logo_url'),
  owner_id: integer('owner_id').references(() => users.id).notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.owner_id],
    references: [users.id],
  }),
  teams: many(teams),
  members: many(organizationMembers)
}));

// Teams table
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  organization_id: integer('organization_id').references(() => organizations.id).notNull(),
  lead_id: integer('lead_id').references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.organization_id],
    references: [organizations.id],
  }),
  lead: one(users, {
    fields: [teams.lead_id],
    references: [users.id],
  }),
  members: many(teamMembers)
}));

// Organization Members table (for user-organization relationship)
export const organizationMembers = pgTable('organization_members', {
  id: serial('id').primaryKey(),
  organization_id: integer('organization_id').references(() => organizations.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  role: userRoleEnum('role').notNull().default('member'),
  invited_by: integer('invited_by').references(() => users.id),
  joined_at: timestamp('joined_at').notNull().defaultNow()
});

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organization_id],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.user_id],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [organizationMembers.invited_by],
    references: [users.id],
  })
}));

// Team Members table (for user-team relationship)
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  team_id: integer('team_id').references(() => teams.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  role: userRoleEnum('role').notNull().default('member'),
  added_by: integer('added_by').references(() => users.id),
  joined_at: timestamp('joined_at').notNull().defaultNow()
});

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.team_id],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.user_id],
    references: [users.id],
  }),
  adder: one(users, {
    fields: [teamMembers.added_by],
    references: [users.id],
  })
}));

// Access Control Lists
export const accessControlLists = pgTable('access_control_lists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  created_by: integer('created_by').references(() => users.id).notNull(),
  organization_id: integer('organization_id').references(() => organizations.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const aclRules = pgTable('acl_rules', {
  id: serial('id').primaryKey(),
  acl_id: integer('acl_id').references(() => accessControlLists.id).notNull(),
  resource_type: text('resource_type').notNull(), // e.g. 'rfq', 'contract', etc.
  permission: permissionTypeEnum('permission').notNull().default('read'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const accessControlListsRelations = relations(accessControlLists, ({ one, many }) => ({
  creator: one(users, {
    fields: [accessControlLists.created_by],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [accessControlLists.organization_id],
    references: [organizations.id],
  }),
  rules: many(aclRules),
  assignments: many(aclAssignments)
}));

export const aclRulesRelations = relations(aclRules, ({ one }) => ({
  acl: one(accessControlLists, {
    fields: [aclRules.acl_id],
    references: [accessControlLists.id],
  })
}));

export const aclAssignments = pgTable('acl_assignments', {
  id: serial('id').primaryKey(),
  acl_id: integer('acl_id').references(() => accessControlLists.id).notNull(),
  user_id: integer('user_id').references(() => users.id),
  team_id: integer('team_id').references(() => teams.id),
  organization_id: integer('organization_id').references(() => organizations.id),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const aclAssignmentsRelations = relations(aclAssignments, ({ one }) => ({
  acl: one(accessControlLists, {
    fields: [aclAssignments.acl_id],
    references: [accessControlLists.id],
  }),
  user: one(users, {
    fields: [aclAssignments.user_id],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [aclAssignments.team_id],
    references: [teams.id],
  }),
  organization: one(organizations, {
    fields: [aclAssignments.organization_id],
    references: [organizations.id],
  })
}));

// Resource Permissions table
export const resourcePermissions = pgTable('resource_permissions', {
  id: serial('id').primaryKey(),
  resource_type: text('resource_type').notNull(), // e.g. 'rfq', 'contract', etc.
  resource_id: integer('resource_id').notNull(),
  user_id: integer('user_id').references(() => users.id),
  team_id: integer('team_id').references(() => teams.id),
  organization_id: integer('organization_id').references(() => organizations.id),
  permission: permissionTypeEnum('permission').notNull().default('read'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export const resourcePermissionsRelations = relations(resourcePermissions, ({ one }) => ({
  user: one(users, {
    fields: [resourcePermissions.user_id],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [resourcePermissions.team_id],
    references: [teams.id],
  }),
  organization: one(organizations, {
    fields: [resourcePermissions.organization_id],
    references: [organizations.id],
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

export const insertOrganizationSchema = createInsertSchema(organizations)
  .omit({ id: true, created_at: true, updated_at: true });

export const insertTeamSchema = createInsertSchema(teams)
  .omit({ id: true, created_at: true, updated_at: true });

export const insertOrganizationMemberSchema = createInsertSchema(organizationMembers)
  .omit({ id: true, joined_at: true });

export const insertTeamMemberSchema = createInsertSchema(teamMembers)
  .omit({ id: true, joined_at: true });

export const insertAccessControlListSchema = createInsertSchema(accessControlLists)
  .omit({ id: true, created_at: true, updated_at: true });

export const insertAclRuleSchema = createInsertSchema(aclRules)
  .omit({ id: true, created_at: true, updated_at: true });

export const insertAclAssignmentSchema = createInsertSchema(aclAssignments)
  .omit({ id: true, created_at: true });

export const insertResourcePermissionSchema = createInsertSchema(resourcePermissions)
  .omit({ id: true, created_at: true, updated_at: true });

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

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = z.infer<typeof insertOrganizationMemberSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type AccessControlList = typeof accessControlLists.$inferSelect;
export type InsertAccessControlList = z.infer<typeof insertAccessControlListSchema>;

export type AclRule = typeof aclRules.$inferSelect;
export type InsertAclRule = z.infer<typeof insertAclRuleSchema>;

export type AclAssignment = typeof aclAssignments.$inferSelect;
export type InsertAclAssignment = z.infer<typeof insertAclAssignmentSchema>;

export type ResourcePermission = typeof resourcePermissions.$inferSelect;
export type InsertResourcePermission = z.infer<typeof insertResourcePermissionSchema>;