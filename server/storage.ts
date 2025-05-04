import { User, InsertUser, RFQ, InsertRFQ, Bid, InsertBid, Contract, InsertContract, Message, InsertMessage, Transaction, InsertTransaction, Supplier } from '@shared/schema';
import { users, rfqs, bids, contracts, messages, transactions, suppliers } from '@shared/schema';
import { db } from './db';
import { eq, and, or, desc } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from './db';

const PostgresSessionStore = connectPg(session);

// Define a type for creating a supplier
export interface InsertSupplier {
  user_id: number;
  industry: string;
  product_categories: string[];
  risk_score?: number;
  verification_status?: boolean;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWalletBalance(id: number, balance: number): Promise<User | undefined>;
  
  // Supplier operations
  getSupplierByUserId(userId: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier | undefined>;
  
  // RFQ operations
  getAllRFQs(): Promise<RFQ[]>;
  getUserRFQs(userId: number): Promise<RFQ[]>;
  getRFQ(id: number): Promise<RFQ | undefined>;
  createRFQ(rfq: InsertRFQ): Promise<RFQ>;
  updateRFQ(id: number, data: Partial<RFQ>): Promise<RFQ | undefined>;
  
  // Bid operations
  getAllBids(): Promise<Bid[]>;
  getBids(rfqId?: number, supplierId?: number): Promise<Bid[]>;
  getUserBids(userId: number): Promise<Bid[]>;
  getBid(id: number): Promise<Bid | undefined>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBidStatus(id: number, status: string): Promise<Bid | undefined>;
  
  // Contract operations
  getUserContracts(userId: number): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContractStatus(id: number, status: string): Promise<Contract | undefined>;
  
  // Message operations
  getUserMessages(userId: number, otherUserId?: number, rfqId?: number, bidId?: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
  
  // Transaction operations
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUserWalletBalance(id: number, balance: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ wallet_balance: balance })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Supplier operations
  async getSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.user_id, userId));
    return supplier;
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }
  
  async updateSupplierRiskScore(id: number, riskScore: number): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ risk_score: riskScore })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }
  
  // RFQ operations
  async getAllRFQs(): Promise<RFQ[]> {
    return await db.select().from(rfqs).orderBy(desc(rfqs.created_at));
  }
  
  async getUserRFQs(userId: number): Promise<RFQ[]> {
    return await db
      .select()
      .from(rfqs)
      .where(eq(rfqs.user_id, userId))
      .orderBy(desc(rfqs.created_at));
  }
  
  async getRFQ(id: number): Promise<RFQ | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq;
  }
  
  async createRFQ(rfq: InsertRFQ): Promise<RFQ> {
    const [newRfq] = await db.insert(rfqs).values(rfq).returning();
    return newRfq;
  }
  
  async updateRFQ(id: number, data: Partial<RFQ>): Promise<RFQ | undefined> {
    const [updatedRfq] = await db
      .update(rfqs)
      .set(data)
      .where(eq(rfqs.id, id))
      .returning();
    return updatedRfq;
  }
  
  // Bid operations
  async getAllBids(): Promise<Bid[]> {
    return await db.select().from(bids).orderBy(desc(bids.created_at));
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
    
    return await query.orderBy(desc(bids.created_at));
  }
  
  async getUserBids(userId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.supplier_id, userId))
      .orderBy(desc(bids.created_at));
  }
  
  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }
  
  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }
  
  async updateBidStatus(id: number, status: string): Promise<Bid | undefined> {
    const [updatedBid] = await db
      .update(bids)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }
  
  // Contract operations
  async getUserContracts(userId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(or(eq(contracts.buyer_id, userId), eq(contracts.supplier_id, userId)))
      .orderBy(desc(contracts.created_at));
  }
  
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }
  
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }
  
  async updateContractStatus(id: number, status: string): Promise<Contract | undefined> {
    const [updatedContract] = await db
      .update(contracts)
      .set({ status: status as any, updated_at: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updatedContract;
  }
  
  // Message operations
  async getUserMessages(userId: number, otherUserId?: number, rfqId?: number, bidId?: number): Promise<Message[]> {
    let query = db.select().from(messages).where(
      or(
        eq(messages.sender_id, userId),
        eq(messages.recipient_id, userId)
      )
    );
    
    if (otherUserId) {
      query = query.where(
        or(
          and(
            eq(messages.sender_id, userId),
            eq(messages.recipient_id, otherUserId)
          ),
          and(
            eq(messages.sender_id, otherUserId),
            eq(messages.recipient_id, userId)
          )
        )
      );
    }
    
    if (rfqId) {
      query = query.where(eq(messages.rfq_id, rfqId));
    }
    
    if (bidId) {
      query = query.where(eq(messages.bid_id, bidId));
    }
    
    return await query.orderBy(desc(messages.created_at));
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  
  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ status: status as any })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }
  
  // Transaction operations
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.created_at));
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }
}

export const storage = new DatabaseStorage();