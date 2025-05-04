import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  integrations, type Integration, type InsertIntegration,
  incidents, type Incident, type InsertIncident,
  gstInvoices, type GstInvoice, type InsertGstInvoice,
  voiceRfqs, type VoiceRfq, type InsertVoiceRfq,
  kredxInvoices, type KredxInvoice, type InsertKredxInvoice,
  blockchainTransactions, type BlockchainTransaction, type InsertBlockchainTransaction,
  rfqs, type Rfq, type InsertRfq
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Expanded interface with CRUD methods for all our entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  
  // Integration operations
  getIntegration(id: number): Promise<Integration | undefined>;
  getAllIntegrations(): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<InsertIntegration>): Promise<Integration>;
  
  // Incident operations
  getIncident(id: number): Promise<Incident | undefined>;
  getAllIncidents(): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident>;
  
  // GST Invoice operations
  getGstInvoice(id: number): Promise<GstInvoice | undefined>;
  getAllGstInvoices(): Promise<GstInvoice[]>;
  createGstInvoice(invoice: InsertGstInvoice): Promise<GstInvoice>;
  
  // Voice RFQ operations
  getVoiceRfq(id: number): Promise<VoiceRfq | undefined>;
  getAllVoiceRfqs(): Promise<VoiceRfq[]>;
  createVoiceRfq(rfq: InsertVoiceRfq): Promise<VoiceRfq>;
  updateVoiceRfq(id: number, rfq: Partial<InsertVoiceRfq>): Promise<VoiceRfq>;
  
  // KredX Invoice operations
  getKredxInvoice(id: number): Promise<KredxInvoice | undefined>;
  getAllKredxInvoices(): Promise<KredxInvoice[]>;
  createKredxInvoice(invoice: InsertKredxInvoice): Promise<KredxInvoice>;
  updateKredxInvoice(id: number, invoice: Partial<InsertKredxInvoice>): Promise<KredxInvoice>;
  
  // Blockchain Transaction operations
  getBlockchainTransaction(id: number): Promise<BlockchainTransaction | undefined>;
  getAllBlockchainTransactions(): Promise<BlockchainTransaction[]>;
  createBlockchainTransaction(transaction: InsertBlockchainTransaction): Promise<BlockchainTransaction>;
  updateBlockchainTransaction(id: number, transaction: Partial<InsertBlockchainTransaction>): Promise<BlockchainTransaction>;
  
  // RFQ operations
  getRfq(id: number): Promise<Rfq | undefined>;
  getAllRfqs(): Promise<Rfq[]>;
  createRfq(rfq: InsertRfq): Promise<Rfq>;
  updateRfq(id: number, rfq: Partial<InsertRfq>): Promise<Rfq>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }
  
  // Integration operations
  async getIntegration(id: number): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id));
    return integration;
  }
  
  async getAllIntegrations(): Promise<Integration[]> {
    return db.select().from(integrations);
  }
  
  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const [integration] = await db
      .insert(integrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }
  
  async updateIntegration(id: number, integrationUpdate: Partial<InsertIntegration>): Promise<Integration> {
    const [integration] = await db
      .update(integrations)
      .set(integrationUpdate)
      .where(eq(integrations.id, id))
      .returning();
    return integration;
  }
  
  // Incident operations
  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }
  
  async getAllIncidents(): Promise<Incident[]> {
    return db.select().from(incidents);
  }
  
  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const [incident] = await db
      .insert(incidents)
      .values(insertIncident)
      .returning();
    return incident;
  }
  
  async updateIncident(id: number, incidentUpdate: Partial<InsertIncident>): Promise<Incident> {
    const [incident] = await db
      .update(incidents)
      .set(incidentUpdate)
      .where(eq(incidents.id, id))
      .returning();
    return incident;
  }
  
  // GST Invoice operations
  async getGstInvoice(id: number): Promise<GstInvoice | undefined> {
    const [invoice] = await db.select().from(gstInvoices).where(eq(gstInvoices.id, id));
    return invoice;
  }
  
  async getAllGstInvoices(): Promise<GstInvoice[]> {
    return db.select().from(gstInvoices);
  }
  
  async createGstInvoice(insertInvoice: InsertGstInvoice): Promise<GstInvoice> {
    const [invoice] = await db
      .insert(gstInvoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }
  
  // Voice RFQ operations
  async getVoiceRfq(id: number): Promise<VoiceRfq | undefined> {
    const [rfq] = await db.select().from(voiceRfqs).where(eq(voiceRfqs.id, id));
    return rfq;
  }
  
  async getAllVoiceRfqs(): Promise<VoiceRfq[]> {
    return db.select().from(voiceRfqs);
  }
  
  async createVoiceRfq(insertRfq: InsertVoiceRfq): Promise<VoiceRfq> {
    const [rfq] = await db
      .insert(voiceRfqs)
      .values(insertRfq)
      .returning();
    return rfq;
  }
  
  async updateVoiceRfq(id: number, rfqUpdate: Partial<InsertVoiceRfq>): Promise<VoiceRfq> {
    const [rfq] = await db
      .update(voiceRfqs)
      .set(rfqUpdate)
      .where(eq(voiceRfqs.id, id))
      .returning();
    return rfq;
  }
  
  // KredX Invoice operations
  async getKredxInvoice(id: number): Promise<KredxInvoice | undefined> {
    const [invoice] = await db.select().from(kredxInvoices).where(eq(kredxInvoices.id, id));
    return invoice;
  }
  
  async getAllKredxInvoices(): Promise<KredxInvoice[]> {
    return db.select().from(kredxInvoices);
  }
  
  async createKredxInvoice(insertInvoice: InsertKredxInvoice): Promise<KredxInvoice> {
    const [invoice] = await db
      .insert(kredxInvoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }
  
  async updateKredxInvoice(id: number, invoiceUpdate: Partial<InsertKredxInvoice>): Promise<KredxInvoice> {
    const [invoice] = await db
      .update(kredxInvoices)
      .set(invoiceUpdate)
      .where(eq(kredxInvoices.id, id))
      .returning();
    return invoice;
  }
  
  // Blockchain Transaction operations
  async getBlockchainTransaction(id: number): Promise<BlockchainTransaction | undefined> {
    const [transaction] = await db.select().from(blockchainTransactions).where(eq(blockchainTransactions.id, id));
    return transaction;
  }
  
  async getAllBlockchainTransactions(): Promise<BlockchainTransaction[]> {
    return db.select().from(blockchainTransactions);
  }
  
  async createBlockchainTransaction(insertTransaction: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    const [transaction] = await db
      .insert(blockchainTransactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }
  
  async updateBlockchainTransaction(id: number, transactionUpdate: Partial<InsertBlockchainTransaction>): Promise<BlockchainTransaction> {
    const [transaction] = await db
      .update(blockchainTransactions)
      .set(transactionUpdate)
      .where(eq(blockchainTransactions.id, id))
      .returning();
    return transaction;
  }
  
  // RFQ operations
  async getRfq(id: number): Promise<Rfq | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq;
  }
  
  async getAllRfqs(): Promise<Rfq[]> {
    return db.select().from(rfqs);
  }
  
  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    const [rfq] = await db
      .insert(rfqs)
      .values(insertRfq)
      .returning();
    return rfq;
  }
  
  async updateRfq(id: number, rfqUpdate: Partial<InsertRfq>): Promise<Rfq> {
    const [rfq] = await db
      .update(rfqs)
      .set(rfqUpdate)
      .where(eq(rfqs.id, id))
      .returning();
    return rfq;
  }
}

export const storage = new DatabaseStorage();
