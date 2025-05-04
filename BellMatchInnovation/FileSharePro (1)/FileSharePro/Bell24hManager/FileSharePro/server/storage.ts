import { 
  users, type User, type InsertUser,
  rfqs, type Rfq, type InsertRfq,
  quotes, type Quote, type InsertQuote,
  industries, type Industry,
  categories, type Category,
  supplierMetrics, type SupplierMetric
} from "../shared/schema.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Define the interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // RFQ methods
  getRfq(id: number): Promise<Rfq | undefined>;
  getRfqsByBuyer(buyerId: number): Promise<Rfq[]>;
  getRfqsByCategory(categoryId: number): Promise<Rfq[]>;
  getPublishedRfqs(): Promise<Rfq[]>;
  createRfq(rfq: InsertRfq): Promise<Rfq>;
  updateRfq(id: number, rfq: Partial<InsertRfq>): Promise<Rfq | undefined>;
  
  // Quote methods
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByRfq(rfqId: number): Promise<Quote[]>;
  getQuotesBySupplier(supplierId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  
  // Industry and Category methods
  getIndustries(): Promise<Industry[]>;
  getCategories(industryId?: number): Promise<Category[]>;
  
  // Supplier metrics methods
  getSupplierMetrics(supplierId: number): Promise<SupplierMetric | undefined>;
  updateSupplierMetrics(supplierId: number, metrics: Partial<SupplierMetric>): Promise<SupplierMetric | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rfqs: Map<number, Rfq>;
  private quotes: Map<number, Quote>;
  private industriesList: Map<number, Industry>;
  private categoriesList: Map<number, Category>;
  private supplierMetricsList: Map<number, SupplierMetric>;
  private userIdCounter: number;
  private rfqIdCounter: number;
  private quoteIdCounter: number;
  private industryIdCounter: number;
  private categoryIdCounter: number;
  private metricsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.rfqs = new Map();
    this.quotes = new Map();
    this.industriesList = new Map();
    this.categoriesList = new Map();
    this.supplierMetricsList = new Map();
    this.userIdCounter = 1;
    this.rfqIdCounter = 1;
    this.quoteIdCounter = 1;
    this.industryIdCounter = 1;
    this.categoryIdCounter = 1;
    this.metricsIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...userData, 
      updatedAt: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // RFQ methods
  async getRfq(id: number): Promise<Rfq | undefined> {
    return this.rfqs.get(id);
  }

  async getRfqsByBuyer(buyerId: number): Promise<Rfq[]> {
    return Array.from(this.rfqs.values()).filter(
      (rfq) => rfq.buyerId === buyerId
    );
  }

  async getRfqsByCategory(categoryId: number): Promise<Rfq[]> {
    return Array.from(this.rfqs.values()).filter(
      (rfq) => rfq.categoryId === categoryId
    );
  }

  async getPublishedRfqs(): Promise<Rfq[]> {
    return Array.from(this.rfqs.values()).filter(
      (rfq) => rfq.status === 'published'
    );
  }

  async createRfq(rfqData: InsertRfq): Promise<Rfq> {
    const id = this.rfqIdCounter++;
    const now = new Date();
    const rfq: Rfq = { 
      ...rfqData, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.rfqs.set(id, rfq);
    return rfq;
  }

  async updateRfq(id: number, rfqData: Partial<InsertRfq>): Promise<Rfq | undefined> {
    const rfq = this.rfqs.get(id);
    if (!rfq) return undefined;
    
    const updatedRfq = { 
      ...rfq, 
      ...rfqData, 
      updatedAt: new Date() 
    };
    this.rfqs.set(id, updatedRfq);
    return updatedRfq;
  }

  // Quote methods
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async getQuotesByRfq(rfqId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.rfqId === rfqId
    );
  }

  async getQuotesBySupplier(supplierId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.supplierId === supplierId
    );
  }

  async createQuote(quoteData: InsertQuote): Promise<Quote> {
    const id = this.quoteIdCounter++;
    const now = new Date();
    const quote: Quote = { 
      ...quoteData, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    const updatedQuote = { 
      ...quote, 
      ...quoteData, 
      updatedAt: new Date() 
    };
    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }

  // Industry and Category methods
  async getIndustries(): Promise<Industry[]> {
    return Array.from(this.industriesList.values());
  }

  async getCategories(industryId?: number): Promise<Category[]> {
    if (industryId) {
      return Array.from(this.categoriesList.values()).filter(
        (category) => category.industryId === industryId
      );
    }
    return Array.from(this.categoriesList.values());
  }

  // Supplier metrics methods
  async getSupplierMetrics(supplierId: number): Promise<SupplierMetric | undefined> {
    return Array.from(this.supplierMetricsList.values()).find(
      (metrics) => metrics.supplierId === supplierId
    );
  }

  async updateSupplierMetrics(supplierId: number, metricsData: Partial<SupplierMetric>): Promise<SupplierMetric | undefined> {
    const metrics = Array.from(this.supplierMetricsList.values()).find(
      (m) => m.supplierId === supplierId
    );
    
    if (metrics) {
      // Update existing metrics
      const updatedMetrics = { 
        ...metrics, 
        ...metricsData, 
        updatedAt: new Date() 
      };
      this.supplierMetricsList.set(metrics.id, updatedMetrics);
      return updatedMetrics;
    } else {
      // Create new metrics
      const id = this.metricsIdCounter++;
      const now = new Date();
      const newMetrics: SupplierMetric = {
        id,
        supplierId,
        responseRate: metricsData.responseRate || 0,
        deliveryTimeAdherence: metricsData.deliveryTimeAdherence || 0,
        qualityRating: metricsData.qualityRating || 0,
        communicationRating: metricsData.communicationRating || 0,
        overallRating: metricsData.overallRating || 0,
        updatedAt: now
      };
      this.supplierMetricsList.set(id, newMetrics);
      return newMetrics;
    }
  }
}

// For production use with PostgreSQL database
export class DbStorage implements IStorage {
  private db;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const client = postgres(connectionString);
    this.db = drizzle(client);
  }

  // Implement all methods using Drizzle ORM
  // These will be actual database operations
  // Implementation is omitted for brevity
  
  async getUser(id: number): Promise<User | undefined> {
    // This would use Drizzle with actual SQL in production
    throw new Error("Not implemented");
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    throw new Error("Not implemented");
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    throw new Error("Not implemented");
  }

  async createUser(user: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    throw new Error("Not implemented");
  }
  
  async getRfq(id: number): Promise<Rfq | undefined> {
    throw new Error("Not implemented");
  }

  async getRfqsByBuyer(buyerId: number): Promise<Rfq[]> {
    throw new Error("Not implemented");
  }

  async getRfqsByCategory(categoryId: number): Promise<Rfq[]> {
    throw new Error("Not implemented");
  }

  async getPublishedRfqs(): Promise<Rfq[]> {
    throw new Error("Not implemented");
  }

  async createRfq(rfq: InsertRfq): Promise<Rfq> {
    throw new Error("Not implemented");
  }

  async updateRfq(id: number, rfq: Partial<InsertRfq>): Promise<Rfq | undefined> {
    throw new Error("Not implemented");
  }
  
  async getQuote(id: number): Promise<Quote | undefined> {
    throw new Error("Not implemented");
  }

  async getQuotesByRfq(rfqId: number): Promise<Quote[]> {
    throw new Error("Not implemented");
  }

  async getQuotesBySupplier(supplierId: number): Promise<Quote[]> {
    throw new Error("Not implemented");
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    throw new Error("Not implemented");
  }

  async updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    throw new Error("Not implemented");
  }
  
  async getIndustries(): Promise<Industry[]> {
    throw new Error("Not implemented");
  }

  async getCategories(industryId?: number): Promise<Category[]> {
    throw new Error("Not implemented");
  }
  
  async getSupplierMetrics(supplierId: number): Promise<SupplierMetric | undefined> {
    throw new Error("Not implemented");
  }

  async updateSupplierMetrics(supplierId: number, metrics: Partial<SupplierMetric>): Promise<SupplierMetric | undefined> {
    throw new Error("Not implemented");
  }
}

// Use in-memory storage for now
export const storage = new MemStorage();
