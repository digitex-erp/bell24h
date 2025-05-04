import { 
  User, InsertUser, RFQ, InsertRFQ, Quote, InsertQuote, 
  Message, InsertMessage, SupplierProfile, InsertSupplierProfile,
  MarketData, InsertMarketData, AIMatch, InsertAIMatch, 
  Payment, InsertPayment, Category
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, like, lt, or, asc, inArray } from "drizzle-orm";
import * as schema from "@shared/schema";

export interface IStorage {
  // Showcase operations
  getShowcaseProducts(supplierId: number): Promise<any[]>;
  getShowcaseProduct(productId: number): Promise<any>;
  createShowcaseProduct(product: any): Promise<any>;
  updateShowcaseProduct(productId: number, data: any): Promise<any>;
  deleteShowcaseProduct(productId: number): Promise<void>;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  
  // RFQ operations
  getRFQ(id: number): Promise<RFQ | undefined>;
  getRFQs(filters?: Partial<RFQ>): Promise<RFQ[]>;
  getRFQsByUserId(userId: number): Promise<RFQ[]>;
  createRFQ(rfq: InsertRFQ): Promise<RFQ>;
  updateRFQ(id: number, data: Partial<InsertRFQ>): Promise<RFQ>;
  
  // Quote operations
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByRFQId(rfqId: number): Promise<Quote[]>;
  getQuotesByUserId(userId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, data: Partial<InsertQuote>): Promise<Quote>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  
  // Message operations
  getMessages(userId: number, otherId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: 'sent' | 'delivered' | 'read'): Promise<void>;
  
  // Supplier operations
  getSupplierProfile(userId: number): Promise<SupplierProfile | undefined>;
  createSupplierProfile(profile: InsertSupplierProfile): Promise<SupplierProfile>;
  updateSupplierProfile(userId: number, data: Partial<InsertSupplierProfile>): Promise<SupplierProfile>;
  getSuppliersByCategory(categoryId: number): Promise<User[]>;
  
  // Market data operations
  getMarketData(symbol: string): Promise<MarketData | undefined>;
  getAllMarketData(): Promise<MarketData[]>;
  updateMarketData(data: InsertMarketData): Promise<MarketData>;
  
  // AI Match operations
  getAIMatchesByRFQ(rfqId: number): Promise<AIMatch[]>;
  createAIMatch(match: InsertAIMatch): Promise<AIMatch>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: 'pending' | 'processing' | 'completed' | 'failed'): Promise<Payment>;
}

export class DatabaseStorage implements IStorage {
  // Showcase operations
  async getShowcaseProducts(supplierId: number): Promise<any[]> {
    return await db
      .select()
      .from(schema.showcaseProducts)
      .where(eq(schema.showcaseProducts.supplierId, supplierId))
      .orderBy(asc(schema.showcaseProducts.name));
  }

  async getShowcaseProduct(productId: number): Promise<any> {
    const [product] = await db
      .select()
      .from(schema.showcaseProducts)
      .where(eq(schema.showcaseProducts.id, productId));
    return product;
  }

  async createShowcaseProduct(product: any): Promise<any> {
    const [newProduct] = await db
      .insert(schema.showcaseProducts)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateShowcaseProduct(productId: number, data: any): Promise<any> {
    const [updatedProduct] = await db
      .update(schema.showcaseProducts)
      .set(data)
      .where(eq(schema.showcaseProducts.id, productId))
      .returning();
    return updatedProduct;
  }

  async deleteShowcaseProduct(productId: number): Promise<void> {
    await db
      .delete(schema.showcaseProducts)
      .where(eq(schema.showcaseProducts.id, productId));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  // RFQ operations
  async getRFQ(id: number): Promise<RFQ | undefined> {
    const [rfq] = await db.select().from(schema.rfqs).where(eq(schema.rfqs.id, id));
    return rfq;
  }

  async getRFQs(filters?: Partial<RFQ>): Promise<RFQ[]> {
    let query = db.select().from(schema.rfqs).orderBy(desc(schema.rfqs.createdAt));
    
    if (filters) {
      if (filters.status) {
        query = query.where(eq(schema.rfqs.status, filters.status));
      }
      if (filters.categoryId) {
        query = query.where(eq(schema.rfqs.categoryId, filters.categoryId));
      }
    }
    
    return await query;
  }

  async getRFQsByUserId(userId: number): Promise<RFQ[]> {
    return await db
      .select()
      .from(schema.rfqs)
      .where(eq(schema.rfqs.userId, userId))
      .orderBy(desc(schema.rfqs.createdAt));
  }

  async createRFQ(rfq: InsertRFQ): Promise<RFQ> {
    const [newRfq] = await db
      .insert(schema.rfqs)
      .values(rfq)
      .returning();
    return newRfq;
  }

  async updateRFQ(id: number, data: Partial<InsertRFQ>): Promise<RFQ> {
    const [updatedRfq] = await db
      .update(schema.rfqs)
      .set(data)
      .where(eq(schema.rfqs.id, id))
      .returning();
    return updatedRfq;
  }

  // Quote operations
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(schema.quotes).where(eq(schema.quotes.id, id));
    return quote;
  }

  async getQuotesByRFQId(rfqId: number): Promise<Quote[]> {
    return await db
      .select()
      .from(schema.quotes)
      .where(eq(schema.quotes.rfqId, rfqId))
      .orderBy(desc(schema.quotes.createdAt));
  }

  async getQuotesByUserId(userId: number): Promise<Quote[]> {
    return await db
      .select()
      .from(schema.quotes)
      .where(eq(schema.quotes.userId, userId))
      .orderBy(desc(schema.quotes.createdAt));
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db
      .insert(schema.quotes)
      .values(quote)
      .returning();
    return newQuote;
  }

  async updateQuote(id: number, data: Partial<InsertQuote>): Promise<Quote> {
    const [updatedQuote] = await db
      .update(schema.quotes)
      .set(data)
      .where(eq(schema.quotes.id, id))
      .returning();
    return updatedQuote;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(schema.categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return category;
  }

  // Message operations
  async getMessages(userId: number, otherId: number): Promise<Message[]> {
    return await db
      .select()
      .from(schema.messages)
      .where(
        or(
          and(
            eq(schema.messages.senderId, userId),
            eq(schema.messages.receiverId, otherId)
          ),
          and(
            eq(schema.messages.senderId, otherId),
            eq(schema.messages.receiverId, userId)
          )
        )
      )
      .orderBy(asc(schema.messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(schema.messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async updateMessageStatus(id: number, status: 'sent' | 'delivered' | 'read'): Promise<void> {
    await db
      .update(schema.messages)
      .set({ status })
      .where(eq(schema.messages.id, id));
  }

  // Supplier operations
  async getSupplierProfile(userId: number): Promise<SupplierProfile | undefined> {
    const [profile] = await db
      .select()
      .from(schema.supplierProfiles)
      .where(eq(schema.supplierProfiles.userId, userId));
    return profile;
  }

  async createSupplierProfile(profile: InsertSupplierProfile): Promise<SupplierProfile> {
    const [newProfile] = await db
      .insert(schema.supplierProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateSupplierProfile(userId: number, data: Partial<InsertSupplierProfile>): Promise<SupplierProfile> {
    const [updatedProfile] = await db
      .update(schema.supplierProfiles)
      .set(data)
      .where(eq(schema.supplierProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getSuppliersByCategory(categoryId: number): Promise<User[]> {
    // Get suppliers that have created quotes for RFQs with this category
    const suppliers = await db
      .select()
      .from(schema.users)
      .innerJoin(schema.quotes, eq(schema.users.id, schema.quotes.userId))
      .innerJoin(schema.rfqs, eq(schema.quotes.rfqId, schema.rfqs.id))
      .where(and(
        eq(schema.rfqs.categoryId, categoryId),
        eq(schema.users.role, 'supplier')
      ))
      .orderBy(desc(schema.quotes.createdAt));
    
    // Remove duplicates and return unique suppliers
    const uniqueSuppliers = suppliers.filter((supplier, index, self) =>
      index === self.findIndex((s) => s.users.id === supplier.users.id)
    ).map(s => s.users);
    
    return uniqueSuppliers;
  }

  // Market data operations
  async getMarketData(symbol: string): Promise<MarketData | undefined> {
    const [data] = await db
      .select()
      .from(schema.marketData)
      .where(eq(schema.marketData.symbol, symbol));
    return data;
  }

  async getAllMarketData(): Promise<MarketData[]> {
    return await db
      .select()
      .from(schema.marketData)
      .orderBy(asc(schema.marketData.symbol));
  }

  async updateMarketData(data: InsertMarketData): Promise<MarketData> {
    const [existingData] = await db
      .select()
      .from(schema.marketData)
      .where(eq(schema.marketData.symbol, data.symbol));
    
    if (existingData) {
      const [updatedData] = await db
        .update(schema.marketData)
        .set(data)
        .where(eq(schema.marketData.symbol, data.symbol))
        .returning();
      return updatedData;
    } else {
      const [newData] = await db
        .insert(schema.marketData)
        .values(data)
        .returning();
      return newData;
    }
  }

  // AI Match operations
  async getAIMatchesByRFQ(rfqId: number): Promise<AIMatch[]> {
    return await db
      .select()
      .from(schema.aiMatches)
      .where(eq(schema.aiMatches.rfqId, rfqId))
      .orderBy(desc(schema.aiMatches.score));
  }

  async createAIMatch(match: InsertAIMatch): Promise<AIMatch> {
    const [newMatch] = await db
      .insert(schema.aiMatches)
      .values(match)
      .returning();
    return newMatch;
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(schema.payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.id, id));
    return payment;
  }

  async updatePaymentStatus(id: number, status: 'pending' | 'processing' | 'completed' | 'failed'): Promise<Payment> {
    const [updatedPayment] = await db
      .update(schema.payments)
      .set({ status })
      .where(eq(schema.payments.id, id))
      .returning();
    return updatedPayment;
  }
}

export const storage = new DatabaseStorage();
