import { 
  users, User, InsertUser, 
  rfqs, Rfq, InsertRfq,
  quotes, Quote, InsertQuote,
  messages, Message, InsertMessage,
  transactions, Transaction, InsertTransaction,
  rfqStatusEnum
} from "@shared/schema";
import { db, pool } from "./db";
import createMemoryStore from "memorystore";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq, and, or, desc } from "drizzle-orm";

export interface IStorage {
  // Session store
  sessionStore: any;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // RFQ methods
  createRfq(rfq: InsertRfq, userId: number): Promise<Rfq>;
  getRfq(id: number): Promise<Rfq | undefined>;
  getRfqsByUser(userId: number): Promise<Rfq[]>;
  getAllRfqs(): Promise<Rfq[]>;
  updateRfqStatus(id: number, status: string): Promise<Rfq | undefined>;
  
  // Quote methods
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuotesByRfq(rfqId: number): Promise<Quote[]>;
  getQuotesBySupplier(supplierId: number): Promise<Quote[]>;
  updateQuoteStatus(id: number, status: string): Promise<Quote | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  updateUserWalletBalance(userId: number, amount: number): Promise<User | undefined>;
  
  // Supplier methods
  getSuppliers(): Promise<User[]>;
  getVerifiedSuppliers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...insertUser,
          role: insertUser.role || 'buyer', // Set default role
          company: insertUser.company || null, 
          address: insertUser.address || null,
          phone: insertUser.phone || null,
          gstNumber: insertUser.gstNumber || null,
          gstVerified: insertUser.gstVerified || false,
          walletBalance: insertUser.walletBalance || "0",
          profileComplete: insertUser.profileComplete || false
        })
        .returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return updatedUser || undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }
  
  async createRfq(rfq: InsertRfq, userId: number): Promise<Rfq> {
    try {
      const [newRfq] = await db
        .insert(rfqs)
        .values({
          ...rfq,
          userId,
          status: 'open',
          budget: rfq.budget || null,
          gstRequired: rfq.gstRequired || false,
          createdAt: new Date()
        })
        .returning();
      return newRfq;
    } catch (error) {
      console.error("Error creating RFQ:", error);
      throw new Error("Failed to create RFQ");
    }
  }

  async getRfq(id: number): Promise<Rfq | undefined> {
    try {
      const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
      return rfq || undefined;
    } catch (error) {
      console.error("Error getting RFQ:", error);
      return undefined;
    }
  }

  async getRfqsByUser(userId: number): Promise<Rfq[]> {
    try {
      return await db
        .select()
        .from(rfqs)
        .where(eq(rfqs.userId, userId))
        .orderBy(desc(rfqs.createdAt));
    } catch (error) {
      console.error("Error getting RFQs by user:", error);
      return [];
    }
  }

  async getAllRfqs(): Promise<Rfq[]> {
    try {
      return await db
        .select()
        .from(rfqs)
        .orderBy(desc(rfqs.createdAt));
    } catch (error) {
      console.error("Error getting all RFQs:", error);
      return [];
    }
  }

  async updateRfqStatus(id: number, status: string): Promise<Rfq | undefined> {
    try {
      const [updatedRfq] = await db
        .update(rfqs)
        .set({ status: status as any })
        .where(eq(rfqs.id, id))
        .returning();
      return updatedRfq || undefined;
    } catch (error) {
      console.error("Error updating RFQ status:", error);
      return undefined;
    }
  }
  
  async createQuote(quote: InsertQuote): Promise<Quote> {
    try {
      const [newQuote] = await db
        .insert(quotes)
        .values({
          ...quote,
          message: quote.message || null,
          status: "pending",
          createdAt: new Date()
        })
        .returning();
      return newQuote;
    } catch (error) {
      console.error("Error creating quote:", error);
      throw new Error("Failed to create quote");
    }
  }

  async getQuotesByRfq(rfqId: number): Promise<Quote[]> {
    try {
      return await db
        .select()
        .from(quotes)
        .where(eq(quotes.rfqId, rfqId))
        .orderBy(desc(quotes.createdAt));
    } catch (error) {
      console.error("Error getting quotes by RFQ:", error);
      return [];
    }
  }

  async getQuotesBySupplier(supplierId: number): Promise<Quote[]> {
    try {
      return await db
        .select()
        .from(quotes)
        .where(eq(quotes.supplierId, supplierId))
        .orderBy(desc(quotes.createdAt));
    } catch (error) {
      console.error("Error getting quotes by supplier:", error);
      return [];
    }
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    try {
      const [updatedQuote] = await db
        .update(quotes)
        .set({ status })
        .where(eq(quotes.id, id))
        .returning();
      return updatedQuote || undefined;
    } catch (error) {
      console.error("Error updating quote status:", error);
      return undefined;
    }
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      const [newMessage] = await db
        .insert(messages)
        .values({
          ...message,
          read: false,
          createdAt: new Date()
        })
        .returning();
      return newMessage;
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Failed to create message");
    }
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    try {
      return await db
        .select()
        .from(messages)
        .where(
          or(
            and(
              eq(messages.senderId, user1Id),
              eq(messages.receiverId, user2Id)
            ),
            and(
              eq(messages.senderId, user2Id),
              eq(messages.receiverId, user1Id)
            )
          )
        )
        .orderBy(messages.createdAt);
    } catch (error) {
      console.error("Error getting messages between users:", error);
      return [];
    }
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    try {
      const [updatedMessage] = await db
        .update(messages)
        .set({ read: true })
        .where(eq(messages.id, id))
        .returning();
      return updatedMessage || undefined;
    } catch (error) {
      console.error("Error marking message as read:", error);
      return undefined;
    }
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    try {
      const [newTransaction] = await db
        .insert(transactions)
        .values({
          ...transaction,
          reference: transaction.reference || null,
          createdAt: new Date()
        })
        .returning();
      
      // Update user wallet balance
      if (transaction.userId && transaction.status === 'completed') {
        const user = await this.getUser(transaction.userId);
        if (user) {
          const currentBalance = parseFloat(user.walletBalance || '0');
          let newBalance = currentBalance;
          
          if (transaction.type === 'deposit') {
            newBalance += parseFloat(transaction.amount.toString());
          } else if (transaction.type === 'withdrawal') {
            newBalance -= parseFloat(transaction.amount.toString());
          }
          
          await this.updateUserWalletBalance(transaction.userId, newBalance);
        }
      }
      
      return newTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw new Error("Failed to create transaction");
    }
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    try {
      return await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt));
    } catch (error) {
      console.error("Error getting transactions by user:", error);
      return [];
    }
  }

  async updateUserWalletBalance(userId: number, amount: number): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ walletBalance: amount.toString() })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser || undefined;
    } catch (error) {
      console.error("Error updating user wallet balance:", error);
      return undefined;
    }
  }
  
  async getSuppliers(): Promise<User[]> {
    try {
      return await db
        .select()
        .from(users)
        .where(eq(users.role, 'supplier'))
        .orderBy(users.name);
    } catch (error) {
      console.error("Error getting suppliers:", error);
      return [];
    }
  }

  async getVerifiedSuppliers(): Promise<User[]> {
    try {
      return await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, 'supplier'),
            eq(users.gstVerified, true)
          )
        )
        .orderBy(users.name);
    } catch (error) {
      console.error("Error getting verified suppliers:", error);
      return [];
    }
  }
}

// Define an in-memory implementation for completeness
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rfqs: Map<number, Rfq>;
  private quotes: Map<number, Quote>;
  private messages: Map<number, Message>;
  private transactions: Map<number, Transaction>;
  
  userCurrentId: number;
  rfqCurrentId: number;
  quoteCurrentId: number;
  messageCurrentId: number;
  transactionCurrentId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.rfqs = new Map();
    this.quotes = new Map();
    this.messages = new Map();
    this.transactions = new Map();
    
    this.userCurrentId = 1;
    this.rfqCurrentId = 1;
    this.quoteCurrentId = 1;
    this.messageCurrentId = 1;
    this.transactionCurrentId = 1;
    
    // Create memory-based session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'buyer', // Default to buyer
      company: insertUser.company || null,
      address: insertUser.address || null,
      phone: insertUser.phone || null,
      gstNumber: insertUser.gstNumber || null,
      gstVerified: insertUser.gstVerified || false,
      walletBalance: insertUser.walletBalance || "0",
      profileComplete: insertUser.profileComplete || false
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // RFQ methods
  async createRfq(rfq: InsertRfq, userId: number): Promise<Rfq> {
    const id = this.rfqCurrentId++;
    const newRfq: Rfq = {
      ...rfq,
      id,
      userId,
      status: 'open',
      budget: rfq.budget || null,
      gstRequired: rfq.gstRequired || null,
      createdAt: new Date()
    };
    
    this.rfqs.set(id, newRfq);
    return newRfq;
  }

  async getRfq(id: number): Promise<Rfq | undefined> {
    return this.rfqs.get(id);
  }

  async getRfqsByUser(userId: number): Promise<Rfq[]> {
    return Array.from(this.rfqs.values())
      .filter(rfq => rfq.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }

  async getAllRfqs(): Promise<Rfq[]> {
    return Array.from(this.rfqs.values())
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }

  async updateRfqStatus(id: number, status: string): Promise<Rfq | undefined> {
    const rfq = await this.getRfq(id);
    if (!rfq) return undefined;
    
    const updatedRfq = { ...rfq, status: status as any };
    this.rfqs.set(id, updatedRfq);
    return updatedRfq;
  }

  // Quote methods
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const id = this.quoteCurrentId++;
    const newQuote: Quote = {
      ...quote,
      id,
      message: quote.message || null,
      status: "pending",
      createdAt: new Date()
    };
    
    this.quotes.set(id, newQuote);
    return newQuote;
  }

  async getQuotesByRfq(rfqId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values())
      .filter(quote => quote.rfqId === rfqId)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }

  async getQuotesBySupplier(supplierId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values())
      .filter(quote => quote.supplierId === supplierId)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }

  async updateQuoteStatus(id: number, status: string): Promise<Quote | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    const updatedQuote = { ...quote, status };
    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const newMessage: Message = {
      ...message,
      id,
      read: false,
      createdAt: new Date()
    };
    
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateA - dateB;
      });
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      reference: transaction.reference || null,
      createdAt: new Date()
    };
    
    this.transactions.set(id, newTransaction);
    
    // Update user's wallet balance
    if (transaction.userId && transaction.status === 'completed') {
      const user = await this.getUser(transaction.userId);
      if (user) {
        const amount = parseFloat(transaction.amount.toString());
        const currentBalance = parseFloat(user.walletBalance || '0');
        
        let newBalance: number;
        if (transaction.type === 'deposit') {
          newBalance = currentBalance + amount;
        } else {
          newBalance = currentBalance - amount;
        }
        
        await this.updateUser(user.id, { walletBalance: newBalance.toString() });
      }
    }
    
    return newTransaction;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });
  }

  async updateUserWalletBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const currentBalance = parseFloat(user.walletBalance || '0');
    const newBalance = currentBalance + amount;
    
    return this.updateUser(userId, { walletBalance: newBalance.toString() });
  }

  // Supplier methods
  async getSuppliers(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === 'supplier')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  async getVerifiedSuppliers(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === 'supplier' && user.gstVerified)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }
}

export const storage = new DatabaseStorage();