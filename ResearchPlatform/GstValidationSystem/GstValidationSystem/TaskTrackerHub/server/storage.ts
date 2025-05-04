import {
  users, type User, type InsertUser,
  suppliers, type Supplier, type InsertSupplier,
  rfqs, type Rfq, type InsertRfq,
  quotes, type Quote, type InsertQuote,
  shipments, type Shipment, type InsertShipment,
  payments, type Payment, type InsertPayment,
  activities, type Activity, type InsertActivity,
  supplierRecommendations, type SupplierRecommendation, type InsertSupplierRecommendation,
  marketTrends, type MarketTrend, type InsertMarketTrend,
  documents, type Document, type InsertDocument,
  blockchainTransactions, type BlockchainTransaction, type InsertBlockchainTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletAddress(id: number, walletAddress: string): Promise<User>;
  
  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier | undefined>;
  
  // RFQ operations
  getRfq(id: number): Promise<Rfq | undefined>;
  getRfqs(): Promise<Rfq[]>;
  getRfqsByUserId(userId: number): Promise<Rfq[]>;
  createRfq(rfq: InsertRfq): Promise<Rfq>;
  updateRfqSuccessRate(id: number, successRate: number): Promise<Rfq | undefined>;
  
  // Quote operations
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByRfqId(rfqId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  
  // Shipment operations
  getShipment(id: number): Promise<Shipment | undefined>;
  getShipmentsByUserId(userId: number): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipmentStatus(id: number, status: string, progress: number): Promise<Shipment | undefined>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Activity operations
  getActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Supplier recommendations
  getSupplierRecommendations(rfqId: number): Promise<SupplierRecommendation[]>;
  createSupplierRecommendation(recommendation: InsertSupplierRecommendation): Promise<SupplierRecommendation>;
  
  // Market trends
  getMarketTrends(sector: string): Promise<MarketTrend | undefined>;
  getAllMarketTrends(): Promise<MarketTrend[]>;
  createOrUpdateMarketTrend(trend: InsertMarketTrend): Promise<MarketTrend>;
  
  // Blockchain document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByContentHash(contentHash: string): Promise<Document | undefined>;
  getDocumentsByReferenceId(referenceId: number, documentType: string): Promise<Document[]>;
  getDocumentsByUserId(userId: number, limit?: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentVerified(contentHash: string, verified: boolean): Promise<Document | undefined>;
  
  // Blockchain transaction operations
  getBlockchainTransaction(id: number): Promise<BlockchainTransaction | undefined>;
  getBlockchainTransactionByTxHash(txHash: string): Promise<BlockchainTransaction | undefined>;
  getBlockchainTransactionsByReferenceId(referenceId: number, referenceType: string): Promise<BlockchainTransaction[]>;
  getBlockchainTransactionsByUserId(userId: number, limit?: number): Promise<BlockchainTransaction[]>;
  createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction>;
  updateBlockchainTransactionStatus(txHash: string, status: string, confirmedAt?: Date): Promise<BlockchainTransaction | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Import db from server/db.ts
  private db;
  
  constructor(db: any) {
    this.db = db;
    
    // Initialize with a demo user if it doesn't exist
    this.initializeDemoUser();
  }
  
  private async initializeDemoUser() {
    try {
      // Check if demo user exists
      const demoUser = await this.getUserByUsername("demo");
      
      if (!demoUser) {
        // Create demo user
        await this.createUser({
          username: "demo",
          password: "password123", 
          fullName: "Demo User",
          email: "demo@bell24h.com",
          company: "Bell24h Demo",
          role: "buyer"
        });
        
        // Update wallet balance
        await this.db.update(users)
          .set({ walletBalance: "250000" })
          .where(eq(users.username, "demo"));
      }
    } catch (error) {
      console.error("Error initializing demo user:", error);
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await this.db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await this.db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async updateUserWalletAddress(id: number, walletAddress: string): Promise<User> {
    try {
      const [user] = await this.db
        .update(users)
        .set({ walletAddress })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error("Error updating user wallet address:", error);
      throw error;
    }
  }
  
  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    try {
      const [supplier] = await this.db.select().from(suppliers).where(eq(suppliers.id, id));
      return supplier;
    } catch (error) {
      console.error("Error getting supplier:", error);
      return undefined;
    }
  }
  
  async getSuppliers(): Promise<Supplier[]> {
    try {
      return await this.db.select().from(suppliers);
    } catch (error) {
      console.error("Error getting suppliers:", error);
      return [];
    }
  }
  
  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    try {
      const [supplier] = await this.db.insert(suppliers).values(insertSupplier).returning();
      return supplier;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  }
  
  async updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier | undefined> {
    try {
      const [updatedSupplier] = await this.db
        .update(suppliers)
        .set({ riskScore })
        .where(eq(suppliers.id, id))
        .returning();
      return updatedSupplier;
    } catch (error) {
      console.error("Error updating supplier risk score:", error);
      return undefined;
    }
  }
  
  // RFQ operations
  async getRfq(id: number): Promise<Rfq | undefined> {
    try {
      const [rfq] = await this.db.select().from(rfqs).where(eq(rfqs.id, id));
      return rfq;
    } catch (error) {
      console.error("Error getting RFQ:", error);
      return undefined;
    }
  }
  
  async getRfqs(): Promise<Rfq[]> {
    try {
      return await this.db.select().from(rfqs);
    } catch (error) {
      console.error("Error getting RFQs:", error);
      return [];
    }
  }
  
  async getRfqsByUserId(userId: number): Promise<Rfq[]> {
    try {
      return await this.db.select().from(rfqs).where(eq(rfqs.userId, userId));
    } catch (error) {
      console.error("Error getting RFQs by user ID:", error);
      return [];
    }
  }
  
  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    try {
      const [rfq] = await this.db.insert(rfqs).values(insertRfq).returning();
      return rfq;
    } catch (error) {
      console.error("Error creating RFQ:", error);
      throw error;
    }
  }
  
  async updateRfqSuccessRate(id: number, successRate: number): Promise<Rfq | undefined> {
    try {
      const [updatedRfq] = await this.db
        .update(rfqs)
        .set({ successRate })
        .where(eq(rfqs.id, id))
        .returning();
      return updatedRfq;
    } catch (error) {
      console.error("Error updating RFQ success rate:", error);
      return undefined;
    }
  }
  
  // Quote operations
  async getQuote(id: number): Promise<Quote | undefined> {
    try {
      const [quote] = await this.db.select().from(quotes).where(eq(quotes.id, id));
      return quote;
    } catch (error) {
      console.error("Error getting quote:", error);
      return undefined;
    }
  }
  
  async getQuotesByRfqId(rfqId: number): Promise<Quote[]> {
    try {
      return await this.db.select().from(quotes).where(eq(quotes.rfqId, rfqId));
    } catch (error) {
      console.error("Error getting quotes by RFQ ID:", error);
      return [];
    }
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    try {
      const [quote] = await this.db.insert(quotes).values(insertQuote).returning();
      return quote;
    } catch (error) {
      console.error("Error creating quote:", error);
      throw error;
    }
  }
  
  // Shipment operations
  async getShipment(id: number): Promise<Shipment | undefined> {
    try {
      const [shipment] = await this.db.select().from(shipments).where(eq(shipments.id, id));
      return shipment;
    } catch (error) {
      console.error("Error getting shipment:", error);
      return undefined;
    }
  }
  
  async getShipmentsByUserId(userId: number): Promise<Shipment[]> {
    try {
      return await this.db.select().from(shipments).where(eq(shipments.userId, userId));
    } catch (error) {
      console.error("Error getting shipments by user ID:", error);
      return [];
    }
  }
  
  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    try {
      const [shipment] = await this.db.insert(shipments).values(insertShipment).returning();
      return shipment;
    } catch (error) {
      console.error("Error creating shipment:", error);
      throw error;
    }
  }
  
  async updateShipmentStatus(id: number, status: string, progress: number): Promise<Shipment | undefined> {
    try {
      const [updatedShipment] = await this.db
        .update(shipments)
        .set({ status, trackingProgress: progress })
        .where(eq(shipments.id, id))
        .returning();
      return updatedShipment;
    } catch (error) {
      console.error("Error updating shipment status:", error);
      return undefined;
    }
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    try {
      const [payment] = await this.db.select().from(payments).where(eq(payments.id, id));
      return payment;
    } catch (error) {
      console.error("Error getting payment:", error);
      return undefined;
    }
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    try {
      return await this.db.select().from(payments).where(eq(payments.userId, userId));
    } catch (error) {
      console.error("Error getting payments by user ID:", error);
      return [];
    }
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    try {
      const [payment] = await this.db.insert(payments).values(insertPayment).returning();
      return payment;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    try {
      const [updatedPayment] = await this.db
        .update(payments)
        .set({ status })
        .where(eq(payments.id, id))
        .returning();
      return updatedPayment;
    } catch (error) {
      console.error("Error updating payment status:", error);
      return undefined;
    }
  }
  
  // Activity operations
  async getActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]> {
    try {
      let query = this.db.select().from(activities).where(eq(activities.userId, userId))
        .orderBy(desc(activities.createdAt));
      
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query;
    } catch (error) {
      console.error("Error getting activities by user ID:", error);
      return [];
    }
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    try {
      const [activity] = await this.db.insert(activities).values(insertActivity).returning();
      return activity;
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  }
  
  // Supplier recommendations
  async getSupplierRecommendations(rfqId: number): Promise<SupplierRecommendation[]> {
    try {
      return await this.db
        .select()
        .from(supplierRecommendations)
        .where(eq(supplierRecommendations.rfqId, rfqId))
        .orderBy(desc(supplierRecommendations.matchScore));
    } catch (error) {
      console.error("Error getting supplier recommendations:", error);
      return [];
    }
  }
  
  async createSupplierRecommendation(insertRecommendation: InsertSupplierRecommendation): Promise<SupplierRecommendation> {
    try {
      const [recommendation] = await this.db
        .insert(supplierRecommendations)
        .values(insertRecommendation)
        .returning();
      return recommendation;
    } catch (error) {
      console.error("Error creating supplier recommendation:", error);
      throw error;
    }
  }
  
  // Market trends
  async getMarketTrends(sector: string): Promise<MarketTrend | undefined> {
    try {
      const [trend] = await this.db
        .select()
        .from(marketTrends)
        .where(eq(marketTrends.sector, sector));
      return trend;
    } catch (error) {
      console.error("Error getting market trends:", error);
      return undefined;
    }
  }
  
  async getAllMarketTrends(): Promise<MarketTrend[]> {
    try {
      return await this.db.select().from(marketTrends);
    } catch (error) {
      console.error("Error getting all market trends:", error);
      return [];
    }
  }
  
  async createOrUpdateMarketTrend(insertTrend: InsertMarketTrend): Promise<MarketTrend> {
    try {
      // Check if the trend exists
      const [existingTrend] = await this.db
        .select()
        .from(marketTrends)
        .where(eq(marketTrends.sector, insertTrend.sector));
      
      if (existingTrend) {
        // Update existing trend
        const [updatedTrend] = await this.db
          .update(marketTrends)
          .set({
            data: insertTrend.data,
            insights: insertTrend.insights,
            lastUpdated: new Date()
          })
          .where(eq(marketTrends.id, existingTrend.id))
          .returning();
        return updatedTrend;
      } else {
        // Create new trend
        const [newTrend] = await this.db
          .insert(marketTrends)
          .values(insertTrend)
          .returning();
        return newTrend;
      }
    } catch (error) {
      console.error("Error creating/updating market trend:", error);
      throw error;
    }
  }
  
  // Blockchain document operations
  async getDocument(id: number): Promise<Document | undefined> {
    try {
      const [document] = await this.db.select().from(documents).where(eq(documents.id, id));
      return document;
    } catch (error) {
      console.error("Error getting document:", error);
      return undefined;
    }
  }
  
  async getDocumentByContentHash(contentHash: string): Promise<Document | undefined> {
    try {
      const [document] = await this.db.select().from(documents).where(eq(documents.contentHash, contentHash));
      return document;
    } catch (error) {
      console.error("Error getting document by content hash:", error);
      return undefined;
    }
  }
  
  async getDocumentsByReferenceId(referenceId: number, documentType: string): Promise<Document[]> {
    try {
      return await this.db.select()
        .from(documents)
        .where(and(
          eq(documents.referenceId, referenceId),
          eq(documents.documentType, documentType)
        ));
    } catch (error) {
      console.error("Error getting documents by reference ID:", error);
      return [];
    }
  }
  
  async getDocumentsByUserId(userId: number, limit?: number): Promise<Document[]> {
    try {
      let query = this.db.select()
        .from(documents)
        .where(eq(documents.userId, userId))
        .orderBy(desc(documents.createdAt));
        
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query;
    } catch (error) {
      console.error("Error getting documents by user ID:", error);
      return [];
    }
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    try {
      const [document] = await this.db
        .insert(documents)
        .values(insertDocument)
        .returning();
      return document;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  }
  
  async updateDocumentVerified(contentHash: string, verified: boolean): Promise<Document | undefined> {
    try {
      const [document] = await this.db
        .update(documents)
        .set({ verified })
        .where(eq(documents.contentHash, contentHash))
        .returning();
      return document;
    } catch (error) {
      console.error("Error updating document verified status:", error);
      return undefined;
    }
  }
  
  // Blockchain transaction operations
  async getBlockchainTransaction(id: number): Promise<BlockchainTransaction | undefined> {
    try {
      const [transaction] = await this.db.select().from(blockchainTransactions).where(eq(blockchainTransactions.id, id));
      return transaction;
    } catch (error) {
      console.error("Error getting blockchain transaction:", error);
      return undefined;
    }
  }
  
  async getBlockchainTransactionByTxHash(txHash: string): Promise<BlockchainTransaction | undefined> {
    try {
      const [transaction] = await this.db.select().from(blockchainTransactions).where(eq(blockchainTransactions.txHash, txHash));
      return transaction;
    } catch (error) {
      console.error("Error getting blockchain transaction by tx hash:", error);
      return undefined;
    }
  }
  
  async getBlockchainTransactionsByReferenceId(referenceId: number, referenceType: string): Promise<BlockchainTransaction[]> {
    try {
      return await this.db.select()
        .from(blockchainTransactions)
        .where(and(
          eq(blockchainTransactions.referenceId, referenceId),
          eq(blockchainTransactions.referenceType, referenceType)
        ));
    } catch (error) {
      console.error("Error getting blockchain transactions by reference ID:", error);
      return [];
    }
  }
  
  async getBlockchainTransactionsByUserId(userId: number, limit?: number): Promise<BlockchainTransaction[]> {
    try {
      let query = this.db.select()
        .from(blockchainTransactions)
        .where(eq(blockchainTransactions.userId, userId))
        .orderBy(desc(blockchainTransactions.createdAt));
        
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query;
    } catch (error) {
      console.error("Error getting blockchain transactions by user ID:", error);
      return [];
    }
  }
  
  async createBlockchainTransaction(insertTransaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    try {
      const [transaction] = await this.db
        .insert(blockchainTransactions)
        .values(insertTransaction)
        .returning();
      return transaction;
    } catch (error) {
      console.error("Error creating blockchain transaction:", error);
      throw error;
    }
  }
  
  async updateBlockchainTransactionStatus(txHash: string, status: string, confirmedAt?: Date): Promise<BlockchainTransaction | undefined> {
    try {
      const updateData: Partial<BlockchainTransaction> = { status };
      
      if (confirmedAt) {
        updateData.confirmedAt = confirmedAt;
      }
      
      const [transaction] = await this.db
        .update(blockchainTransactions)
        .set(updateData)
        .where(eq(blockchainTransactions.txHash, txHash))
        .returning();
      return transaction;
    } catch (error) {
      console.error("Error updating blockchain transaction status:", error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage(db);
