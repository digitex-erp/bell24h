import { users, suppliers, rfqs, bids, contracts, messages, transactions } from '@shared/schema';
import { type User, type InsertUser, type Supplier, type RFQ, type Bid, type Contract, type Message, type InsertMessage, type Transaction } from '@shared/schema';
import { db } from './db';
import { eq, and, or } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserWalletBalance(userId: number, balance: number): Promise<User>;
  
  // Supplier methods
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSupplierByUserId(userId: number): Promise<Supplier | undefined>;
  createSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier>;
  updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier>;
  
  // RFQ methods
  getRFQ(id: number): Promise<RFQ | undefined>;
  getAllRFQs(): Promise<RFQ[]>;
  getUserRFQs(userId: number): Promise<RFQ[]>;
  createRFQ(rfq: Omit<RFQ, 'id' | 'created_at' | 'updated_at'>): Promise<RFQ>;
  updateRFQ(id: number, data: Partial<RFQ>): Promise<RFQ>;
  
  // Bid methods
  getBid(id: number): Promise<Bid | undefined>;
  getBids(rfqId?: number, supplierId?: number): Promise<Bid[]>;
  getSupplierBids(supplierId: number): Promise<Bid[]>;
  createBid(bid: Omit<Bid, 'id' | 'created_at' | 'updated_at'>): Promise<Bid>;
  updateBid(id: number, data: Partial<Bid>): Promise<Bid>;
  updateBidStatus(id: number, status: string): Promise<Bid>;
  
  // Contract methods
  getContract(id: number): Promise<Contract | undefined>;
  getUserContracts(userId: number): Promise<Contract[]>;
  getSupplierContracts(supplierId: number): Promise<Contract[]>;
  createContract(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract>;
  updateContractStatus(id: number, status: string): Promise<Contract>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getUserMessages(userId: number, otherUserId?: number, rfqId?: number, bidId?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserWalletBalance(userId: number, balance: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ wallet_balance: balance })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Supplier methods
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async getSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.user_id, userId));
    return supplier;
  }

  async createSupplier(supplierData: Omit<Supplier, 'id'>): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(supplierData).returning();
    return supplier;
  }

  async updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ risk_score: riskScore })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  // RFQ methods
  async getRFQ(id: number): Promise<RFQ | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq;
  }

  async getAllRFQs(): Promise<RFQ[]> {
    return await db.select().from(rfqs);
  }

  async getUserRFQs(userId: number): Promise<RFQ[]> {
    return await db.select().from(rfqs).where(eq(rfqs.user_id, userId));
  }

  async createRFQ(rfqData: Omit<RFQ, 'id' | 'created_at' | 'updated_at'>): Promise<RFQ> {
    const [rfq] = await db.insert(rfqs).values(rfqData).returning();
    return rfq;
  }

  async updateRFQ(id: number, data: Partial<RFQ>): Promise<RFQ> {
    const [updatedRFQ] = await db
      .update(rfqs)
      .set({ ...data, updated_at: new Date() })
      .where(eq(rfqs.id, id))
      .returning();
    return updatedRFQ;
  }

  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }

  async getBids(rfqId?: number, supplierId?: number): Promise<Bid[]> {
    let query = db.select().from(bids);
    
    if (rfqId && supplierId) {
      query = query.where(and(eq(bids.rfq_id, rfqId), eq(bids.supplier_id, supplierId)));
    } else if (rfqId) {
      query = query.where(eq(bids.rfq_id, rfqId));
    } else if (supplierId) {
      query = query.where(eq(bids.supplier_id, supplierId));
    }
    
    return await query;
  }

  async getSupplierBids(supplierId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.supplier_id, supplierId));
  }

  async createBid(bidData: Omit<Bid, 'id' | 'created_at' | 'updated_at'>): Promise<Bid> {
    const [bid] = await db.insert(bids).values(bidData).returning();
    return bid;
  }

  async updateBid(id: number, data: Partial<Bid>): Promise<Bid> {
    const [updatedBid] = await db
      .update(bids)
      .set({ ...data, updated_at: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }

  async updateBidStatus(id: number, status: string): Promise<Bid> {
    const [updatedBid] = await db
      .update(bids)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }

  // Contract methods
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getUserContracts(userId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(or(eq(contracts.buyer_id, userId), eq(contracts.supplier_id, userId)));
  }

  async getSupplierContracts(supplierId: number): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.supplier_id, supplierId));
  }

  async createContract(contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    const [contract] = await db.insert(contracts).values(contractData).returning();
    return contract;
  }

  async updateContractStatus(id: number, status: string): Promise<Contract> {
    const [updatedContract] = await db
      .update(contracts)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getUserMessages(userId: number, otherUserId?: number, rfqId?: number, bidId?: number): Promise<Message[]> {
    let query = db
      .select()
      .from(messages)
      .where(or(eq(messages.sender_id, userId), eq(messages.recipient_id, userId)));
    
    if (otherUserId) {
      query = query.where(
        or(
          and(eq(messages.sender_id, userId), eq(messages.recipient_id, otherUserId)),
          and(eq(messages.sender_id, otherUserId), eq(messages.recipient_id, userId))
        )
      );
    }
    
    if (rfqId) {
      query = query.where(eq(messages.rfq_id, rfqId));
    }
    
    if (bidId) {
      query = query.where(eq(messages.bid_id, bidId));
    }
    
    return await query;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async updateMessageStatus(id: number, status: string): Promise<Message> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ status: status as any })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.user_id, userId));
  }

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  }
}

// Import pool from db.ts
import { pool } from './db';

export const storage = new DatabaseStorage();