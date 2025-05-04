import { pgTable, text, serial, integer, timestamp, json, real, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
// Define enums
export const userRoleEnum = pgEnum('user_role', ['buyer', 'supplier', 'admin']);
export const rfqStatusEnum = pgEnum('rfq_status', ['draft', 'published', 'closed', 'awarded']);
export const quoteStatusEnum = pgEnum('quote_status', ['submitted', 'reviewed', 'accepted', 'rejected']);
// Users table
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    email: text("email").notNull().unique(),
    fullName: text("full_name"),
    companyName: text("company_name"),
    role: userRoleEnum("role").notNull().default('buyer'),
    gstin: text("gstin"),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    country: text("country"),
    pincode: text("pincode"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Industry categories
export const industries = pgTable("industries", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
});
// Product categories
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    industryId: integer("industry_id").references(() => industries.id),
});
// Request for Quote (RFQ)
export const rfqs = pgTable("rfqs", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    buyerId: integer("buyer_id").references(() => users.id).notNull(),
    categoryId: integer("category_id").references(() => categories.id),
    quantity: integer("quantity"),
    budget: real("budget"),
    deadline: date("deadline"),
    deliveryLocation: text("delivery_location"),
    status: rfqStatusEnum("status").notNull().default('draft'),
    requirements: json("requirements"),
    attachments: json("attachments"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Supplier quotes
export const quotes = pgTable("quotes", {
    id: serial("id").primaryKey(),
    rfqId: integer("rfq_id").references(() => rfqs.id).notNull(),
    supplierId: integer("supplier_id").references(() => users.id).notNull(),
    price: real("price").notNull(),
    deliveryDays: integer("delivery_days"),
    message: text("message"),
    attachments: json("attachments"),
    status: quoteStatusEnum("status").notNull().default('submitted'),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Supplier metrics
export const supplierMetrics = pgTable("supplier_metrics", {
    id: serial("id").primaryKey(),
    supplierId: integer("supplier_id").references(() => users.id).notNull(),
    responseRate: real("response_rate"),
    deliveryTimeAdherence: real("delivery_time_adherence"),
    qualityRating: real("quality_rating"),
    communicationRating: real("communication_rating"),
    overallRating: real("overall_rating"),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertRfqSchema = createInsertSchema(rfqs).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertQuoteSchema = createInsertSchema(quotes).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
