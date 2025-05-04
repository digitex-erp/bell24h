import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  completion: integer("completion").default(0),
  status: text("status").default("pending"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("online"),
  lastChecked: timestamp("last_checked").defaultNow(),
  uptime: integer("uptime").default(100),
});

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("active"),
  startedAt: timestamp("started_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  duration: integer("duration"),
});

export const gstInvoices = pgTable("gst_invoices", {
  id: serial("id").primaryKey(),
  gstin: text("gstin").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  invoiceDate: text("invoice_date").notNull(),
  amount: text("amount"),
  verificationStatus: text("verification_status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const voiceRfqs = pgTable("voice_rfqs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  audioData: text("audio_data"),
  transcription: text("transcription"),
  extractedRfq: json("extracted_rfq"),
  language: text("language").default("en"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const kredxInvoices = pgTable("kredx_invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  invoiceNumber: text("invoice_number").notNull(),
  amount: text("amount").notNull(),
  dueDate: text("due_date"),
  discountedAmount: text("discounted_amount"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  transactionHash: text("transaction_hash"),
  amount: text("amount"),
  status: text("status").default("pending"),
  type: text("type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  budget: doublePrecision("budget"),
  deliveryTimeframe: text("delivery_timeframe"),
  industryId: integer("industry_id"),
  categoryId: integer("category_id"),
  status: text("status").default("open"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const industryTrendSnapshots = pgTable("industry_trend_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  industry: text("industry").notNull(),
  region: text("region"),
  timeframe: text("timeframe"),
  snapshotData: jsonb("snapshot_data").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  sharedCount: integer("shared_count").default(0),
  lastSharedAt: timestamp("last_shared_at"),
  // New fields for enhanced features
  templateId: integer("template_id"),
  customBranding: text("custom_branding"),
  format: text("format").default("standard"),
  isFavorite: boolean("is_favorite").default(false),
  visibility: text("visibility").default("private"),
  tags: jsonb("tags"),
  commentCount: integer("comment_count").default(0),
  lastEditedAt: timestamp("last_edited_at"),
  lastEditedBy: integer("last_edited_by").references(() => users.id),
  version: integer("version").default(1),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  lastChecked: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  startedAt: true,
  resolvedAt: true,
  duration: true,
});

export const insertGstInvoiceSchema = createInsertSchema(gstInvoices).omit({
  id: true,
  createdAt: true,
});

export const insertVoiceRfqSchema = createInsertSchema(voiceRfqs).omit({
  id: true,
  createdAt: true,
});

export const insertKredxInvoiceSchema = createInsertSchema(kredxInvoices).omit({
  id: true,
  createdAt: true,
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertRfqSchema = createInsertSchema(rfqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIndustryTrendSnapshotSchema = createInsertSchema(industryTrendSnapshots).omit({
  id: true,
  generatedAt: true,
  sharedCount: true,
  lastSharedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

export type InsertGstInvoice = z.infer<typeof insertGstInvoiceSchema>;
export type GstInvoice = typeof gstInvoices.$inferSelect;

export type InsertVoiceRfq = z.infer<typeof insertVoiceRfqSchema>;
export type VoiceRfq = typeof voiceRfqs.$inferSelect;

export type InsertKredxInvoice = z.infer<typeof insertKredxInvoiceSchema>;
export type KredxInvoice = typeof kredxInvoices.$inferSelect;

export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;

export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type Rfq = typeof rfqs.$inferSelect;

// Report template table
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  configuration: jsonb("configuration").notNull(),
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Snapshot comment table
export const snapshotComments = pgTable("snapshot_comments", {
  id: serial("id").primaryKey(),
  snapshotId: integer("snapshot_id").references(() => industryTrendSnapshots.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  parentCommentId: integer("parent_comment_id"), // Will be updated with a foreign key constraint via database migration
});

// Industry comparison table
export const industryComparisons = pgTable("industry_comparisons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  industries: jsonb("industries").notNull(),
  comparisonData: jsonb("comparison_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User saved filters
export const savedFilters = pgTable("saved_filters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  filters: jsonb("filters").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas for new tables
export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSnapshotCommentSchema = createInsertSchema(snapshotComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIndustryComparisonSchema = createInsertSchema(industryComparisons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavedFilterSchema = createInsertSchema(savedFilters).omit({
  id: true,
  createdAt: true,
});

export type InsertIndustryTrendSnapshot = z.infer<typeof insertIndustryTrendSnapshotSchema>;
export type IndustryTrendSnapshot = typeof industryTrendSnapshots.$inferSelect;

export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;
export type ReportTemplate = typeof reportTemplates.$inferSelect;

export type InsertSnapshotComment = z.infer<typeof insertSnapshotCommentSchema>;
export type SnapshotComment = typeof snapshotComments.$inferSelect;

export type InsertIndustryComparison = z.infer<typeof insertIndustryComparisonSchema>;
export type IndustryComparison = typeof industryComparisons.$inferSelect;

export type InsertSavedFilter = z.infer<typeof insertSavedFilterSchema>;
export type SavedFilter = typeof savedFilters.$inferSelect;

// Global Trade Insights tables
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradeData = pgTable("trade_data", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  year: integer("year").notNull(),
  exports: doublePrecision("exports").notNull(),
  imports: doublePrecision("imports").notNull(),
  gdp: doublePrecision("gdp").notNull(),
  growthRate: doublePrecision("growth_rate"),
  topExportCategories: text("top_export_categories").notNull(), // JSON string
  topImportCategories: text("top_import_categories").notNull(), // JSON string
  tradePartners: text("trade_partners").notNull(), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradeInsights = pgTable("trade_insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  impact: text("impact").notNull(), // low, medium, high
  date: timestamp("date").defaultNow(),
  regions: text("regions").notNull(), // JSON string array of regions
  industries: text("industries").notNull(), // JSON string array of industries
  sources: text("sources"), // JSON string array of sources
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const smeTradeData = pgTable("sme_trade_data", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").references(() => countries.id).notNull(),
  industryId: integer("industry_id").references(() => industries.id).notNull(),
  year: integer("year").notNull(),
  exportValue: doublePrecision("export_value").notNull(),
  importValue: doublePrecision("import_value").notNull(),
  marketSize: doublePrecision("market_size"),
  growthRate: doublePrecision("growth_rate"),
  exportBarriers: text("export_barriers"), // JSON string array of barriers
  importBarriers: text("import_barriers"), // JSON string array of barriers
  topMarkets: text("top_markets").notNull(), // JSON string of top markets
  competitivePosition: text("competitive_position"), // JSON string of competitive analysis
  regulatoryInfo: text("regulatory_info"), // JSON string of regulatory information
  businessSizeApplicability: text("business_size_applicability").notNull(), // JSON string array (micro, small, medium)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradeOpportunities = pgTable("trade_opportunities", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").references(() => countries.id),
  industryId: integer("industry_id").references(() => industries.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  opportunityType: text("opportunity_type").notNull(), // export, import, partnership
  potentialValue: doublePrecision("potential_value"),
  growthPotential: text("growth_potential").notNull(), // high, medium, low
  entryBarriers: text("entry_barriers"), // JSON string array of barriers
  competitiveAdvantage: text("competitive_advantage"),
  recommendedApproach: text("recommended_approach"),
  businessSize: text("business_size").notNull(), // micro, small, medium
  timeframe: text("timeframe"), // short, medium, long
  riskLevel: text("risk_level"), // high, medium, low
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradeReports = pgTable("trade_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  countries: text("countries").notNull(), // JSON string array of country names
  industries: text("industries").notNull(), // JSON string array of industry names
  insights: text("insights").notNull(), // JSON string of insights
  tradeData: text("trade_data").notNull(), // JSON string of trade data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas for Global Trade Insights tables
export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIndustrySchema = createInsertSchema(industries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeDataSchema = createInsertSchema(tradeData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeInsightSchema = createInsertSchema(tradeInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSmeTradeDataSchema = createInsertSchema(smeTradeData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeOpportunitySchema = createInsertSchema(tradeOpportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeReportSchema = createInsertSchema(tradeReports).omit({
  id: true,
  updatedAt: true,
});

// Export types for Global Trade Insights
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect;

export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = typeof industries.$inferSelect;

export type InsertTradeData = z.infer<typeof insertTradeDataSchema>;
export type TradeData = typeof tradeData.$inferSelect;

export type InsertSmeTradeData = z.infer<typeof insertSmeTradeDataSchema>;
export type SmeTradeData = typeof smeTradeData.$inferSelect;

export type InsertTradeOpportunity = z.infer<typeof insertTradeOpportunitySchema>;
export type TradeOpportunity = typeof tradeOpportunities.$inferSelect;

export type InsertTradeInsight = z.infer<typeof insertTradeInsightSchema>;
export type TradeInsight = typeof tradeInsights.$inferSelect;

export type InsertTradeReport = z.infer<typeof insertTradeReportSchema>;
export type TradeReport = typeof tradeReports.$inferSelect;

// Featured Industries for One-Click Generator
export const featuredIndustries = pgTable("featured_industries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon"), // Icon name or URL
  marketSize: text("market_size"), // Current market size estimate
  growth: text("growth"), // Growth percentage or description
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Newsletter subscriptions for industry trends
export const trendSubscriptions = pgTable("trend_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  email: text("email").notNull(),
  industryId: integer("industry_id").references(() => industries.id),
  frequency: text("frequency").default("weekly").notNull(), // weekly, monthly
  format: text("format").default("html").notNull(), // html, pdf, text
  isActive: boolean("is_active").default(true),
  lastSentAt: timestamp("last_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas for new tables
export const insertFeaturedIndustrySchema = createInsertSchema(featuredIndustries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrendSubscriptionSchema = createInsertSchema(trendSubscriptions).omit({
  id: true,
  lastSentAt: true,
  createdAt: true,
  updatedAt: true,
});

// Export types for new tables
export type InsertFeaturedIndustry = z.infer<typeof insertFeaturedIndustrySchema>;
export type FeaturedIndustry = typeof featuredIndustries.$inferSelect;

export type InsertTrendSubscription = z.infer<typeof insertTrendSubscriptionSchema>;
export type TrendSubscription = typeof trendSubscriptions.$inferSelect;

// Advanced Alert System tables
export const alertConfigurations = pgTable("alert_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  alertType: text("alert_type").notNull(), // price, rfq, market-change, compliance, etc.
  conditions: jsonb("conditions").notNull(), // JSON object with alert conditions
  actions: jsonb("actions").notNull(), // JSON object with actions to take (notify, email, sms, etc.)
  frequency: text("frequency").default("realtime"), // realtime, hourly, daily, weekly
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alertLogs = pgTable("alert_logs", {
  id: serial("id").primaryKey(),
  alertConfigurationId: integer("alert_configuration_id").references(() => alertConfigurations.id).notNull(),
  triggered: timestamp("triggered").defaultNow(),
  data: jsonb("data").notNull(), // The data that triggered the alert
  actions: jsonb("actions").notNull(), // Actions that were taken
  status: text("status").default("pending"), // pending, delivered, failed
  deliveredAt: timestamp("delivered_at"),
  errorDetails: text("error_details"),
});

export const alertPreferences = pgTable("alert_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  inAppEnabled: boolean("in_app_enabled").default(true),
  doNotDisturbStart: text("do_not_disturb_start"), // Time in 24h format (e.g., "22:00")
  doNotDisturbEnd: text("do_not_disturb_end"), // Time in 24h format (e.g., "07:00")
  doNotDisturbEnabled: boolean("do_not_disturb_enabled").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alertNotifications = pgTable("alert_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  alertLogId: integer("alert_log_id").references(() => alertLogs.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, critical
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas for Alert System tables
export const insertAlertConfigurationSchema = createInsertSchema(alertConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertLogSchema = createInsertSchema(alertLogs).omit({
  id: true,
  triggered: true,
  deliveredAt: true,
});

export const insertAlertPreferenceSchema = createInsertSchema(alertPreferences).omit({
  id: true,
  updatedAt: true,
});

export const insertAlertNotificationSchema = createInsertSchema(alertNotifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Export types for Alert System
export type InsertAlertConfiguration = z.infer<typeof insertAlertConfigurationSchema>;
export type AlertConfiguration = typeof alertConfigurations.$inferSelect;

export type InsertAlertLog = z.infer<typeof insertAlertLogSchema>;
export type AlertLog = typeof alertLogs.$inferSelect;

export type InsertAlertPreference = z.infer<typeof insertAlertPreferenceSchema>;
export type AlertPreference = typeof alertPreferences.$inferSelect;

export type InsertAlertNotification = z.infer<typeof insertAlertNotificationSchema>;
export type AlertNotification = typeof alertNotifications.$inferSelect;
