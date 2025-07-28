import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './schema';

// Organizations table (if it doesn't exist already in schema.ts)
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Teams table (if it doesn't exist already in schema.ts)
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  organizationId: integer('organization_id').references(() => organizations.id),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Team Members
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  role: text('role').default('member'), // member, manager, admin
  createdAt: timestamp('created_at').defaultNow(),
});

// Organization Members
export const organizationMembers = pgTable('organization_members', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id),
  userId: integer('user_id').references(() => users.id),
  role: text('role').default('member'), // member, manager, admin, owner
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Access Control Lists
export const accessControlLists = pgTable('access_control_lists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  organizationId: integer('organization_id').references(() => organizations.id), // If null, it's a global ACL
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ACL Rules
export const aclRules = pgTable('acl_rules', {
  id: serial('id').primaryKey(),
  aclId: integer('acl_id').references(() => accessControlLists.id).notNull(),
  resourceType: text('resource_type').notNull(), // 'rfq', 'bid', 'product', 'contract', etc.
  resourceId: integer('resource_id'), // If null, applies to all resources of the given type
  permission: text('permission').notNull(), // 'full', 'create', 'read', 'update', 'delete', 'none'
  conditions: text('conditions'), // Optional JSON string for advanced conditions
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ACL Assignments
export const aclAssignments = pgTable('acl_assignments', {
  id: serial('id').primaryKey(),
  aclId: integer('acl_id').references(() => accessControlLists.id).notNull(),
  userId: integer('user_id').references(() => users.id), // If null, must have team_id or organization_id
  teamId: integer('team_id').references(() => teams.id), // If null, must have user_id or organization_id
  organizationId: integer('organization_id').references(() => organizations.id), // If null, must have user_id or team_id
  createdAt: timestamp('created_at').defaultNow(),
});
