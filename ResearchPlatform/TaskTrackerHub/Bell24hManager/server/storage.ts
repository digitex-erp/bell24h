import { 
  users, type User, type InsertUser,
  suppliers, type Supplier, type InsertSupplier,
  rfqs, type Rfq, type InsertRfq,
  rfqSuppliers, type RfqSupplier, type InsertRfqSupplier,
  quotes, type Quote, type InsertQuote,
  analytics, type Analytics
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, InferSelectModel } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSuppliersByIndustry(industry: string): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  
  // RFQ operations
  getRfq(id: number): Promise<Rfq | undefined>;
  getAllRfqs(): Promise<Rfq[]>;
  getRfqsByUserId(userId: number): Promise<Rfq[]>;
  getRfqsByStatus(status: string): Promise<Rfq[]>;
  createRfq(rfq: InsertRfq): Promise<Rfq>;
  updateRfq(id: number, data: Partial<Rfq>): Promise<Rfq>;
  
  // RFQ-Supplier operations
  getRfqSupplier(rfqId: number, supplierId: number): Promise<RfqSupplier | undefined>;
  getRfqSuppliersByRfqId(rfqId: number): Promise<RfqSupplier[]>;
  createRfqSupplier(rfqSupplier: InsertRfqSupplier): Promise<RfqSupplier>;
  updateRfqSupplier(rfqId: number, supplierId: number, data: Partial<RfqSupplier>): Promise<RfqSupplier>;
  
  // Quote operations
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByRfqId(rfqId: number): Promise<Quote[]>;
  getQuotesBySupplierId(supplierId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, data: Partial<Quote>): Promise<Quote>;
  
  // Analytics operations
  getAnalytics(days: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async getSuppliersByIndustry(industry: string): Promise<Supplier[]> {
    return await db.select().from(suppliers).where(eq(suppliers.industry, industry));
  }

  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(supplierData).returning();
    return supplier;
  }
  
  // RFQ operations
  async getRfq(id: number): Promise<Rfq | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq;
  }

  async getAllRfqs(): Promise<Rfq[]> {
    return await db.select().from(rfqs).orderBy(desc(rfqs.createdAt));
  }

  async getRfqsByUserId(userId: number): Promise<Rfq[]> {
    return await db.select().from(rfqs).where(eq(rfqs.userId, userId)).orderBy(desc(rfqs.createdAt));
  }

  async getRfqsByStatus(status: string): Promise<Rfq[]> {
    return await db.select().from(rfqs).where(eq(rfqs.status, status)).orderBy(desc(rfqs.createdAt));
  }

  async createRfq(rfqData: InsertRfq): Promise<Rfq> {
    const [rfq] = await db.insert(rfqs).values(rfqData).returning();
    return rfq;
  }

  async updateRfq(id: number, data: Partial<Rfq>): Promise<Rfq> {
    const [updatedRfq] = await db
      .update(rfqs)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(rfqs.id, id))
      .returning();
    return updatedRfq;
  }
  
  // RFQ-Supplier operations
  async getRfqSupplier(rfqId: number, supplierId: number): Promise<RfqSupplier | undefined> {
    const [rfqSupplier] = await db
      .select()
      .from(rfqSuppliers)
      .where(
        and(
          eq(rfqSuppliers.rfqId, rfqId),
          eq(rfqSuppliers.supplierId, supplierId)
        )
      );
    return rfqSupplier;
  }

  async getRfqSuppliersByRfqId(rfqId: number): Promise<RfqSupplier[]> {
    return await db
      .select()
      .from(rfqSuppliers)
      .where(eq(rfqSuppliers.rfqId, rfqId))
      .orderBy(desc(rfqSuppliers.matchScore));
  }

  async createRfqSupplier(rfqSupplierData: InsertRfqSupplier): Promise<RfqSupplier> {
    const [rfqSupplier] = await db.insert(rfqSuppliers).values(rfqSupplierData).returning();
    return rfqSupplier;
  }

  async updateRfqSupplier(rfqId: number, supplierId: number, data: Partial<RfqSupplier>): Promise<RfqSupplier> {
    const [updatedRfqSupplier] = await db
      .update(rfqSuppliers)
      .set(data)
      .where(
        and(
          eq(rfqSuppliers.rfqId, rfqId),
          eq(rfqSuppliers.supplierId, supplierId)
        )
      )
      .returning();
    return updatedRfqSupplier;
  }
  
  // Quote operations
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async getQuotesByRfqId(rfqId: number): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.rfqId, rfqId))
      .orderBy(desc(quotes.createdAt));
  }

  async getQuotesBySupplierId(supplierId: number): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.supplierId, supplierId))
      .orderBy(desc(quotes.createdAt));
  }

  async createQuote(quoteData: InsertQuote): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(quoteData).returning();
    return quote;
  }

  async updateQuote(id: number, data: Partial<Quote>): Promise<Quote> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }
  
  // Analytics operations
  async getAnalytics(days: number): Promise<any> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    // Get all RFQs created in the last 'days'
    const recentRfqs = await db
      .select()
      .from(rfqs)
      .where(gte(rfqs.createdAt, date));
    
    // Get all quotes created in the last 'days'
    const recentQuotes = await db
      .select()
      .from(quotes)
      .where(gte(quotes.createdAt, date));
    
    // Calculate industry breakdown
    const industryBreakdown: Record<string, number> = {};
    recentRfqs.forEach(rfq => {
      const industry = rfq.industry;
      industryBreakdown[industry] = (industryBreakdown[industry] || 0) + 1;
    });
    
    // Calculate average response time in hours
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (const quote of recentQuotes) {
      const rfq = recentRfqs.find(r => r.id === quote.rfqId);
      if (rfq) {
        const rfqCreationTime = new Date(rfq.createdAt).getTime();
        const quoteCreationTime = new Date(quote.createdAt).getTime();
        const responseTimeHours = (quoteCreationTime - rfqCreationTime) / (1000 * 60 * 60);
        totalResponseTime += responseTimeHours;
        responseCount++;
      }
    }
    
    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
    
    // Create daily counts for chart data
    const rfqByDay: Record<string, number> = {};
    const quotesByDay: Record<string, number> = {};
    
    for (let i = 0; i < days; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dateStr = day.toISOString().split('T')[0];
      rfqByDay[dateStr] = 0;
      quotesByDay[dateStr] = 0;
    }
    
    recentRfqs.forEach(rfq => {
      const dateStr = new Date(rfq.createdAt).toISOString().split('T')[0];
      rfqByDay[dateStr] = (rfqByDay[dateStr] || 0) + 1;
    });
    
    recentQuotes.forEach(quote => {
      const dateStr = new Date(quote.createdAt).toISOString().split('T')[0];
      quotesByDay[dateStr] = (quotesByDay[dateStr] || 0) + 1;
    });
    
    // Format for chart data
    const chartData = Object.keys(rfqByDay).map(date => ({
      date,
      rfqs: rfqByDay[date],
      quotes: quotesByDay[date] || 0
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      summary: {
        rfqCount: recentRfqs.length,
        quoteCount: recentQuotes.length,
        avgResponseTime: avgResponseTime.toFixed(1),
        responseRate: recentRfqs.length > 0 ? (recentQuotes.length / recentRfqs.length * 100).toFixed(1) : 0
      },
      industryBreakdown,
      chartData
    };
  }
}

export const storage = new DatabaseStorage();
