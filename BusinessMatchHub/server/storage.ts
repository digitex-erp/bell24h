import { 
  users, type User, type InsertUser, 
  rfqs, type Rfq, type InsertRfq,
  bids, type Bid, type InsertBid,
  suppliers, type Supplier, type InsertSupplier,
  messages, type Message, type InsertMessage,
  walletTransactions, type WalletTransaction, type InsertWalletTransaction,
  contracts, type Contract, type InsertContract,
  marketData, type MarketData, type InsertMarketData,
  products, type Product, type InsertProduct,
  portfolioItems, type PortfolioItem, type InsertPortfolioItem,
  invoices, type Invoice, type InsertInvoice,
  kredxTransactions, type KredxTransaction, type InsertKredxTransaction,
  blockchainRecords, type BlockchainRecord, type InsertBlockchainRecord,
  milestones, type Milestone, type InsertMilestone,
  shipments, type Shipment, type InsertShipment,
  shipmentItems, type ShipmentItem, type InsertShipmentItem,
  shipmentEvents, type ShipmentEvent, type InsertShipmentEvent,
  shipmentDocuments, type ShipmentDocument, type InsertShipmentDocument,
  razorpayContacts, type RazorpayContact, type InsertRazorpayContact,
  razorpayFundAccounts, type RazorpayFundAccount, type InsertRazorpayFundAccount,
  razorpayVirtualAccounts, type RazorpayVirtualAccount, type InsertRazorpayVirtualAccount,
  razorpayPayments, type RazorpayPayment, type InsertRazorpayPayment,
  razorpayPayouts, type RazorpayPayout, type InsertRazorpayPayout,
  escrowTransactions, type EscrowTransaction, type InsertEscrowTransaction,
  webhookEvents, type WebhookEvent, type InsertWebhookEvent,
  analyticsData, type AnalyticsData, type InsertAnalyticsData,
  productAnalytics, type ProductAnalytics, type InsertProductAnalytics,
  rfqAnalytics, type RfqAnalytics, type InsertRfqAnalytics,
  marketTrends, type MarketTrends, type InsertMarketTrends
} from "../shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, count } from "drizzle-orm";

export interface IStorage {
  // RazorpayX integration methods
  createRazorpayContact(contact: InsertRazorpayContact): Promise<RazorpayContact>;
  getRazorpayContactByUserId(userId: number): Promise<RazorpayContact | undefined>;
  getRazorpayContactByRazorpayId(razorpayContactId: string): Promise<RazorpayContact | undefined>;
  createRazorpayFundAccount(fundAccount: InsertRazorpayFundAccount): Promise<RazorpayFundAccount>;
  getRazorpayFundAccountByUserId(userId: number): Promise<RazorpayFundAccount | undefined>;
  getRazorpayFundAccountByRazorpayId(razorpayFundAccountId: string): Promise<RazorpayFundAccount | undefined>;
  createRazorpayVirtualAccount(virtualAccount: InsertRazorpayVirtualAccount): Promise<RazorpayVirtualAccount>;
  getRazorpayVirtualAccount(id: number): Promise<RazorpayVirtualAccount | undefined>;
  getRazorpayVirtualAccountByRazorpayId(razorpayVirtualAccountId: string): Promise<RazorpayVirtualAccount | undefined>;
  getRazorpayVirtualAccountsByUserId(userId: number): Promise<RazorpayVirtualAccount[]>;
  updateRazorpayVirtualAccount(id: number, data: Partial<InsertRazorpayVirtualAccount>): Promise<RazorpayVirtualAccount | undefined>;
  createRazorpayPayment(payment: InsertRazorpayPayment): Promise<RazorpayPayment>;
  getRazorpayPayment(id: number): Promise<RazorpayPayment | undefined>;
  getRazorpayPaymentsByVirtualAccountId(virtualAccountId: number): Promise<RazorpayPayment[]>;
  createRazorpayPayout(payout: InsertRazorpayPayout): Promise<RazorpayPayout>;
  getRazorpayPayout(id: number): Promise<RazorpayPayout | undefined>;
  getRazorpayPayoutsByVirtualAccountId(virtualAccountId: number): Promise<RazorpayPayout[]>;
  createEscrowTransaction(transaction: InsertEscrowTransaction): Promise<EscrowTransaction>;
  getEscrowTransaction(id: number): Promise<EscrowTransaction | undefined>;
  updateEscrowTransaction(id: number, data: Partial<InsertEscrowTransaction>): Promise<EscrowTransaction | undefined>;
  getEscrowTransactionsByVirtualAccountId(virtualAccountId: number): Promise<EscrowTransaction[]>;
  getEscrowTransactionsByContractId(contractId: number): Promise<EscrowTransaction[]>;
  getEscrowTransactionsByMilestoneId(milestoneId: number): Promise<EscrowTransaction[]>;
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;
  getWebhookEvent(id: number): Promise<WebhookEvent | undefined>;
  updateWebhookEvent(id: number, data: Partial<InsertWebhookEvent>): Promise<WebhookEvent | undefined>;
  
  // AI Model Explanation methods
  createModelExplanation(explanation: InsertModelExplanation): Promise<ModelExplanation>;
  getModelExplanation(id: number): Promise<ModelExplanation | undefined>;
  getModelExplanationsByInstanceId(modelType: string, instanceId: number): Promise<ModelExplanation[]>;
  getModelExplanationsByUserId(userId: number): Promise<ModelExplanation[]>;
  updateModelExplanation(id: number, data: Partial<InsertModelExplanation>): Promise<ModelExplanation | undefined>;
  deleteModelExplanation(id: number): Promise<boolean>;
  
  // Analytics methods
  saveAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData>;
  getAnalyticsDataByType(userId: number, dataType: string): Promise<AnalyticsData[]>;
  saveProductAnalytics(data: InsertProductAnalytics): Promise<ProductAnalytics>;
  getProductAnalyticsByProductId(productId: number): Promise<ProductAnalytics[]>;
  saveRfqAnalytics(data: InsertRfqAnalytics): Promise<RfqAnalytics>;
  getRfqAnalyticsByRfqId(rfqId: number): Promise<RfqAnalytics[]>;
  saveMarketTrends(data: InsertMarketTrends): Promise<MarketTrends>;
  getMarketTrendsByCategory(category: string): Promise<MarketTrends[]>;
  getAllMarketTrends(): Promise<MarketTrends[]>;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserGstVerification(userId: number, verified: boolean): Promise<User | undefined>;
  updateUserWalletBalance(userId: number, amount: number): Promise<User | undefined>;
  getUserWalletBalance(userId: number): Promise<number>;
  updateUserProfile(userId: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // RFQ methods
  createRfq(rfq: InsertRfq): Promise<Rfq>;
  getRfq(id: number): Promise<Rfq | undefined>;
  getRfqsByUserId(userId: number): Promise<Rfq[]>;
  getActiveRfqsCount(userId: number): Promise<number>;
  
  // Bid methods
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsByRfqId(rfqId: number): Promise<Bid[]>;
  getReceivedBidsCount(userId: number): Promise<number>;
  
  // Supplier methods
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  getAllSuppliers(): Promise<Supplier[]>;
  getTopSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSupplierByUserId(userId: number): Promise<Supplier | undefined>;
  updateSupplierProfile(supplierId: number, data: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  
  // Product catalog methods
  createProduct(product: InsertProduct): Promise<Product>;
  getProductsBySupplierId(supplierId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getProductsByCategory(category: string): Promise<Product[]>;
  
  // Portfolio methods
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  getPortfolioItemsBySupplierId(supplierId: number): Promise<PortfolioItem[]>;
  getPortfolioItem(id: number): Promise<PortfolioItem | undefined>;
  updatePortfolioItem(id: number, data: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined>;
  deletePortfolioItem(id: number): Promise<boolean>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  getMessagesBetweenUsers(senderId: number, receiverId: number): Promise<Message[]>;
  getMessagesByRfqId(rfqId: number): Promise<Message[]>;
  getUnreadMessagesCount(userId: number): Promise<number>;
  markMessageAsRead(messageId: number): Promise<Message | undefined>;
  
  // Wallet transaction methods
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getWalletTransactionsByUserId(userId: number): Promise<WalletTransaction[]>;
  
  // Contract methods
  createContract(contract: InsertContract): Promise<Contract>;
  getContractsByUserId(userId: number): Promise<Contract[]>;
  getAwardedContractsCount(userId: number): Promise<number>;
  
  // Market data methods
  saveMarketData(data: InsertMarketData): Promise<MarketData>;
  getMarketDataByIndustry(industry: string): Promise<MarketData[]>;
  
  // Invoice methods
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesBySellerId(sellerId: number): Promise<Invoice[]>;
  getInvoicesByBuyerId(buyerId: number): Promise<Invoice[]>;
  updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  
  // KredX transaction methods
  createKredxTransaction(transaction: InsertKredxTransaction): Promise<KredxTransaction>;
  getKredxTransactionsByInvoiceId(invoiceId: number): Promise<KredxTransaction[]>;
  
  // Blockchain record methods
  createBlockchainRecord(record: InsertBlockchainRecord): Promise<BlockchainRecord>;
  getBlockchainRecordByRfqId(rfqId: number): Promise<BlockchainRecord | undefined>;
  getAllBlockchainRecords(): Promise<BlockchainRecord[]>;
  
  // Contract methods (extended)
  getContract(id: number): Promise<Contract | undefined>;
  updateContract(id: number, data: Partial<InsertContract>): Promise<Contract | undefined>;
  
  // Milestone methods
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  getMilestone(id: number): Promise<Milestone | undefined>;
  getMilestoneByNumber(contractId: number, milestoneNumber: number): Promise<Milestone | undefined>;
  getMilestonesByContractId(contractId: number): Promise<Milestone[]>;
  getMilestonesByContract(contractId: number): Promise<Milestone[]>;
  updateMilestone(id: number, data: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  
  // Logistics tracking methods
  createShipment(shipmentData: InsertShipment): Promise<Shipment>;
  getShipment(id: number): Promise<Shipment | undefined>;
  getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined>;
  updateShipment(id: number, data: Partial<InsertShipment>): Promise<Shipment | undefined>;
  getShipmentsByUser(userId: number, role: 'sender' | 'recipient'): Promise<Shipment[]>;
  getShipmentsByContract(contractId: number): Promise<Shipment[]>;
  getShipmentItems(shipmentId: number): Promise<ShipmentItem[]>;
  createShipmentItem(itemData: InsertShipmentItem): Promise<ShipmentItem>;
  getShipmentEvents(shipmentId: number): Promise<ShipmentEvent[]>;
  createShipmentEvent(eventData: InsertShipmentEvent): Promise<ShipmentEvent>;
  getShipmentDocuments(shipmentId: number): Promise<ShipmentDocument[]>;
  createShipmentDocument(documentData: InsertShipmentDocument): Promise<ShipmentDocument>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rfqs: Map<number, Rfq>;
  private bids: Map<number, Bid>;
  private suppliers: Map<number, Supplier>;
  private messages: Map<number, Message>;
  private walletTransactions: Map<number, WalletTransaction>;
  private contracts: Map<number, Contract>;
  private marketData: Map<number, MarketData>;
  private products: Map<number, Product>;
  private portfolioItems: Map<number, PortfolioItem>;
  private invoices: Map<number, Invoice>;
  private kredxTransactions: Map<number, KredxTransaction>;
  private blockchainRecords: Map<number, BlockchainRecord>;
  private milestones: Map<number, Milestone>;
  
  private currentUserId: number;
  private currentRfqId: number;
  private currentBidId: number;
  private currentSupplierId: number;
  private currentMessageId: number;
  private currentTransactionId: number;
  private currentContractId: number;
  private currentMarketDataId: number;
  private currentProductId: number;
  private currentPortfolioItemId: number;
  private currentInvoiceId: number;
  private currentKredxTransactionId: number;
  private currentBlockchainRecordId: number;
  private currentMilestoneId: number;
  private modelExplanations: Map<number, ModelExplanation>;
  private currentModelExplanationId: number;

  constructor() {
    this.users = new Map();
    this.rfqs = new Map();
    this.bids = new Map();
    this.suppliers = new Map();
    this.messages = new Map();
    this.walletTransactions = new Map();
    this.contracts = new Map();
    this.marketData = new Map();
    this.products = new Map();
    this.portfolioItems = new Map();
    this.invoices = new Map();
    this.kredxTransactions = new Map();
    this.blockchainRecords = new Map();
    this.milestones = new Map();
    this.modelExplanations = new Map();
    
    this.currentUserId = 1;
    this.currentRfqId = 1;
    this.currentBidId = 1;
    this.currentSupplierId = 1;
    this.currentMessageId = 1;
    this.currentTransactionId = 1;
    this.currentContractId = 1;
    this.currentMarketDataId = 1;
    this.currentProductId = 1;
    this.currentPortfolioItemId = 1;
    this.currentInvoiceId = 1;
    this.currentKredxTransactionId = 1;
    this.currentBlockchainRecordId = 1;
    this.currentMilestoneId = 1;
    this.currentModelExplanationId = 1;
    
    // Add some sample data for development
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUserGstVerification(userId: number, verified: boolean): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      gstVerified: verified
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserWalletBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      walletBalance: (user.walletBalance || 0) + amount
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserWalletBalance(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user?.walletBalance || 0;
  }
  
  async updateUserProfile(userId: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // RFQ methods
  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    const id = this.currentRfqId++;
    const now = new Date();
    const rfq: Rfq = { ...insertRfq, id, createdAt: now };
    this.rfqs.set(id, rfq);
    return rfq;
  }

  async getRfq(id: number): Promise<Rfq | undefined> {
    return this.rfqs.get(id);
  }

  async getRfqsByUserId(userId: number): Promise<Rfq[]> {
    return Array.from(this.rfqs.values()).filter(
      (rfq) => rfq.userId === userId
    );
  }

  async getActiveRfqsCount(userId: number): Promise<number> {
    return Array.from(this.rfqs.values()).filter(
      (rfq) => rfq.userId === userId && rfq.status === "open"
    ).length;
  }

  // Bid methods
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.currentBidId++;
    const now = new Date();
    const bid: Bid = { ...insertBid, id, createdAt: now };
    this.bids.set(id, bid);
    return bid;
  }

  async getBidsByRfqId(rfqId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      (bid) => bid.rfqId === rfqId
    );
  }

  async getReceivedBidsCount(userId: number): Promise<number> {
    // Get all RFQs by user
    const userRfqs = await this.getRfqsByUserId(userId);
    
    // Get all bids for these RFQs
    let count = 0;
    for (const rfq of userRfqs) {
      const bids = await this.getBidsByRfqId(rfq.id);
      count += bids.length;
    }
    
    return count;
  }

  // Supplier methods
  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentSupplierId++;
    const now = new Date();
    const supplier: Supplier = { ...insertSupplier, id, createdAt: now };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getTopSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values())
      .sort((a, b) => (a.riskScore || 0) - (b.riskScore || 0))
      .slice(0, 5);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }
  
  async getSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    return Array.from(this.suppliers.values()).find(
      (supplier) => supplier.userId === userId
    );
  }
  
  async updateSupplierProfile(supplierId: number, data: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = await this.getSupplier(supplierId);
    if (!supplier) return undefined;
    
    const updatedSupplier: Supplier = {
      ...supplier,
      ...data
    };
    
    this.suppliers.set(supplierId, updatedSupplier);
    return updatedSupplier;
  }
  
  // Product catalog methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const now = new Date();
    const newProduct: Product = { ...product, id, createdAt: now, updatedAt: now };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async getProductsBySupplierId(supplierId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.supplierId === supplierId
    );
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = {
      ...product,
      ...data,
      updatedAt: new Date()
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const exists = this.products.has(id);
    if (exists) {
      this.products.delete(id);
      return true;
    }
    return false;
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }
  
  // Portfolio methods
  async createPortfolioItem(portfolioItem: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = this.currentPortfolioItemId++;
    const now = new Date();
    const newItem: PortfolioItem = { ...portfolioItem, id, createdAt: now };
    this.portfolioItems.set(id, newItem);
    return newItem;
  }
  
  async getPortfolioItemsBySupplierId(supplierId: number): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).filter(
      (item) => item.supplierId === supplierId
    );
  }
  
  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    return this.portfolioItems.get(id);
  }
  
  async updatePortfolioItem(id: number, data: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const item = await this.getPortfolioItem(id);
    if (!item) return undefined;
    
    const updatedItem: PortfolioItem = {
      ...item,
      ...data
    };
    
    this.portfolioItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deletePortfolioItem(id: number): Promise<boolean> {
    const exists = this.portfolioItems.has(id);
    if (exists) {
      this.portfolioItems.delete(id);
      return true;
    }
    return false;
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, createdAt: now };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }
  
  async getMessagesBetweenUsers(senderId: number, receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.senderId === senderId && message.receiverId === receiverId) ||
        (message.senderId === receiverId && message.receiverId === senderId)
    );
  }
  
  async getMessagesByRfqId(rfqId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.rfqId === rfqId
    );
  }
  
  async getUnreadMessagesCount(userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (message) => message.receiverId === userId && message.isRead === false
    ).length;
  }
  
  async markMessageAsRead(messageId: number): Promise<Message | undefined> {
    const message = this.messages.get(messageId);
    if (!message) return undefined;
    
    const updatedMessage: Message = {
      ...message,
      isRead: true
    };
    
    this.messages.set(messageId, updatedMessage);
    return updatedMessage;
  }

  // Wallet transaction methods
  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: WalletTransaction = { ...insertTransaction, id, createdAt: now };
    this.walletTransactions.set(id, transaction);
    return transaction;
  }

  async getWalletTransactionsByUserId(userId: number): Promise<WalletTransaction[]> {
    return Array.from(this.walletTransactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  // Contract methods
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.currentContractId++;
    const now = new Date();
    const contract: Contract = { ...insertContract, id, createdAt: now };
    this.contracts.set(id, contract);
    return contract;
  }

  async getContractsByUserId(userId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.buyerId === userId || contract.supplierId === userId
    );
  }

  async getAwardedContractsCount(userId: number): Promise<number> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.buyerId === userId
    ).length;
  }

  // Market data methods
  async saveMarketData(insertMarketData: InsertMarketData): Promise<MarketData> {
    const id = this.currentMarketDataId++;
    const now = new Date();
    const marketData: MarketData = { ...insertMarketData, id, timestamp: now };
    this.marketData.set(id, marketData);
    return marketData;
  }

  async getMarketDataByIndustry(industry: string): Promise<MarketData[]> {
    return Array.from(this.marketData.values()).filter(
      (data) => data.industry === industry
    );
  }
  
  // Invoice methods
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const now = new Date();
    const invoice: Invoice = { 
      ...insertInvoice, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesBySellerId(sellerId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.sellerId === sellerId
    );
  }

  async getInvoicesByBuyerId(buyerId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.buyerId === buyerId
    );
  }

  async updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = await this.getInvoice(id);
    if (!invoice) return undefined;
    
    const updatedInvoice: Invoice = {
      ...invoice,
      ...data,
      updatedAt: new Date()
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  // KredX transaction methods
  async createKredxTransaction(insertTransaction: InsertKredxTransaction): Promise<KredxTransaction> {
    const id = this.currentKredxTransactionId++;
    const now = new Date();
    const transaction: KredxTransaction = { 
      ...insertTransaction, 
      id, 
      createdAt: now 
    };
    this.kredxTransactions.set(id, transaction);
    return transaction;
  }

  async getKredxTransactionsByInvoiceId(invoiceId: number): Promise<KredxTransaction[]> {
    return Array.from(this.kredxTransactions.values()).filter(
      (transaction) => transaction.invoiceId === invoiceId
    );
  }
  
  // Blockchain record methods
  async createBlockchainRecord(insertRecord: InsertBlockchainRecord): Promise<BlockchainRecord> {
    const id = this.currentBlockchainRecordId++;
    const now = new Date();
    const record: BlockchainRecord = { 
      ...insertRecord, 
      id, 
      createdAt: now,
      timestamp: insertRecord.timestamp || now
    };
    this.blockchainRecords.set(id, record);
    return record;
  }

  async getBlockchainRecordByRfqId(rfqId: number): Promise<BlockchainRecord | undefined> {
    return Array.from(this.blockchainRecords.values()).find(
      (record) => record.rfqId === rfqId
    );
  }

  async getAllBlockchainRecords(): Promise<BlockchainRecord[]> {
    return Array.from(this.blockchainRecords.values());
  }

  // Seed method for development data
  private seedData() {
    // Add sample users
    const user1: User = {
      id: this.currentUserId++,
      username: "johndoe",
      password: "$2b$10$m6WJrKMu4wRIB7QZXf1Nw.e/gDJKL0XoX/h2XGbv1l8Aq2KOq3GQy", // "password"
      email: "john@example.com",
      companyName: "Acme Corp",
      location: "Mumbai, Maharashtra",
      industry: "Manufacturing",
      gstNumber: "27AAPFU0939F1ZV",
      gstVerified: true,
      walletBalance: 25000,
      userType: "buyer",
      createdAt: new Date(),
    };
    this.users.set(user1.id, user1);

    // Add sample RFQs
    const rfq1: Rfq = {
      id: this.currentRfqId++,
      referenceNumber: "RFQ-2023-09-001",
      userId: user1.id,
      title: "Supply of Industrial Pumps",
      description: "We need industrial pumps for our manufacturing plant. The specifications are as follows...",
      quantity: "10 units",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      category: "Industrial Equipment",
      specifications: {
        type: "Centrifugal",
        capacity: "500 GPM",
        pressure: "50 PSI",
      },
      rfqType: "text",
      status: "open",
      matchSuccessRate: 87,
      createdAt: new Date(),
    };
    this.rfqs.set(rfq1.id, rfq1);

    const rfq2: Rfq = {
      id: this.currentRfqId++,
      referenceNumber: "RFQ-2023-08-045",
      userId: user1.id,
      title: "Electronic Components",
      description: "Need electronic components for our new product line...",
      quantity: "5000 units",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      category: "Electronics",
      specifications: {
        type: "Resistors",
        value: "10k Ohm",
        tolerance: "5%",
      },
      rfqType: "voice",
      mediaUrl: "sample-voice-rfq.mp3",
      status: "open",
      matchSuccessRate: 92,
      createdAt: new Date(),
    };
    this.rfqs.set(rfq2.id, rfq2);

    // Add sample suppliers
    const supplier1: Supplier = {
      id: this.currentSupplierId++,
      userId: this.currentUserId++,
      industry: "Manufacturing",
      products: { categories: ["Pumps", "Valves", "Pipes"] },
      description: "Leading supplier of industrial pumps and related equipment",
      lateDeliveryRate: 5,
      complianceScore: 95,
      financialStability: 90,
      userFeedback: 92,
      riskScore: 8.5, // Lower score = lower risk
      createdAt: new Date(),
    };
    this.suppliers.set(supplier1.id, supplier1);

    const supplier2: Supplier = {
      id: this.currentSupplierId++,
      userId: this.currentUserId++,
      industry: "Electronics",
      products: { categories: ["Resistors", "Capacitors", "Transistors"] },
      description: "Electronic components supplier with global sourcing",
      lateDeliveryRate: 3,
      complianceScore: 98,
      financialStability: 85,
      userFeedback: 95,
      riskScore: 6.0, // Lower score = lower risk
      createdAt: new Date(),
    };
    this.suppliers.set(supplier2.id, supplier2);

    // Add sample market data
    const marketData1: MarketData = {
      id: this.currentMarketDataId++,
      industry: "Electronics",
      symbol: "ELEC",
      data: {
        dates: ["2023-05-01", "2023-06-01", "2023-07-01", "2023-08-01", "2023-09-01"],
        values: [65, 59, 80, 81, 92],
      },
      timestamp: new Date(),
    };
    this.marketData.set(marketData1.id, marketData1);

    const marketData2: MarketData = {
      id: this.currentMarketDataId++,
      industry: "Industrial",
      symbol: "INDL",
      data: {
        dates: ["2023-05-01", "2023-06-01", "2023-07-01", "2023-08-01", "2023-09-01"],
        values: [28, 48, 40, 45, 56],
      },
      timestamp: new Date(),
    };
    this.marketData.set(marketData2.id, marketData2);
    
    // Add sample products
    const product1: Product = {
      id: this.currentProductId++,
      name: "Industrial Centrifugal Pump",
      description: "High-quality industrial centrifugal pump with excellent efficiency and durability.",
      category: "Pumps",
      supplierId: supplier1.id,
      price: 5000,
      currency: "INR",
      minimumOrderQuantity: "2 units",
      specifications: {
        type: "Centrifugal",
        capacity: "500 GPM",
        pressure: "50 PSI",
        powerConsumption: "5.5 kW"
      },
      images: {
        main: "pump-main.jpg",
        gallery: ["pump-angle1.jpg", "pump-angle2.jpg", "pump-specs.jpg"]
      },
      availability: "In Stock",
      leadTime: "2-3 weeks",
      certifications: {
        list: ["ISO 9001", "CE", "UL Listed"]
      },
      warranty: "2 years",
      origin: "India",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(product1.id, product1);
    
    const product2: Product = {
      id: this.currentProductId++,
      name: "Precision Resistor Set",
      description: "High-precision resistor set with various values and excellent tolerance levels.",
      category: "Electronic Components",
      supplierId: supplier2.id,
      price: 1200,
      currency: "INR",
      minimumOrderQuantity: "100 units",
      specifications: {
        type: "Metal Film",
        tolerance: "1%",
        values: "10Ω to 1MΩ",
        powerRating: "0.25W"
      },
      images: {
        main: "resistors-main.jpg",
        gallery: ["resistors-set.jpg", "resistor-closeup.jpg"]
      },
      availability: "In Stock",
      leadTime: "1 week",
      certifications: {
        list: ["RoHS", "REACH"]
      },
      warranty: "1 year",
      origin: "Taiwan",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(product2.id, product2);
    
    // Add sample portfolio items
    const portfolioItem1: PortfolioItem = {
      id: this.currentPortfolioItemId++,
      title: "Water Pumping Station Upgrade",
      description: "Supplied and installed 10 high-capacity industrial pumps for a municipal water treatment facility.",
      category: "Infrastructure",
      supplierId: supplier1.id,
      images: {
        main: "waterplant-main.jpg",
        gallery: ["waterplant-installation.jpg", "waterplant-final.jpg"]
      },
      clientName: "Mumbai Municipal Corporation",
      clientLocation: "Mumbai, India",
      projectValue: 5000000,
      completionDate: new Date(2023, 5, 15),
      challenge: "The installation needed to be completed without disrupting the water supply to the city.",
      solution: "We implemented a phased approach with temporary bypass systems to ensure continuous water supply during the upgrade.",
      results: "25% increase in pumping efficiency and 30% reduction in power consumption.",
      createdAt: new Date()
    };
    this.portfolioItems.set(portfolioItem1.id, portfolioItem1);
    
    const portfolioItem2: PortfolioItem = {
      id: this.currentPortfolioItemId++,
      title: "Smart Factory Automation",
      description: "Designed and implemented an electronic control system for an automotive parts manufacturing factory.",
      category: "Manufacturing",
      supplierId: supplier2.id,
      images: {
        main: "factory-main.jpg",
        gallery: ["factory-control-panel.jpg", "factory-sensors.jpg"]
      },
      clientName: "AutoParts India Ltd.",
      clientLocation: "Pune, India",
      projectValue: 3500000,
      completionDate: new Date(2023, 3, 20),
      challenge: "Integrating modern control systems with legacy manufacturing equipment.",
      solution: "Custom-designed interface modules and comprehensive control software with backward compatibility.",
      results: "40% reduction in production errors and 20% increase in overall throughput.",
      createdAt: new Date()
    };
    this.portfolioItems.set(portfolioItem2.id, portfolioItem2);
  }
  
  // Model Explanation methods
  async createModelExplanation(explanation: InsertModelExplanation): Promise<ModelExplanation> {
    const id = this.currentModelExplanationId++;
    const now = new Date();
    const newExplanation: ModelExplanation = { ...explanation, id, createdAt: now };
    this.modelExplanations.set(id, newExplanation);
    return newExplanation;
  }
  
  async getModelExplanation(id: number): Promise<ModelExplanation | undefined> {
    return this.modelExplanations.get(id);
  }
  
  async getModelExplanationsByInstanceId(modelType: string, instanceId: number): Promise<ModelExplanation[]> {
    return Array.from(this.modelExplanations.values()).filter(
      explanation => explanation.modelType === modelType && explanation.instanceId === instanceId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getModelExplanationsByUserId(userId: number): Promise<ModelExplanation[]> {
    return Array.from(this.modelExplanations.values()).filter(
      explanation => explanation.userId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async updateModelExplanation(id: number, data: Partial<InsertModelExplanation>): Promise<ModelExplanation | undefined> {
    const explanation = this.modelExplanations.get(id);
    if (!explanation) return undefined;
    
    const updatedExplanation: ModelExplanation = {
      ...explanation,
      ...data
    };
    
    this.modelExplanations.set(id, updatedExplanation);
    return updatedExplanation;
  }
  
  async deleteModelExplanation(id: number): Promise<boolean> {
    const exists = this.modelExplanations.has(id);
    if (exists) {
      this.modelExplanations.delete(id);
      return true;
    }
    return false;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserGstVerification(userId: number, verified: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ gstVerified: verified })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserWalletBalance(userId: number, amount: number): Promise<User | undefined> {
    // Get current user to access current balance
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!existingUser) return undefined;
    
    const newBalance = (existingUser.walletBalance || 0) + amount;
    
    const [user] = await db
      .update(users)
      .set({ walletBalance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserWalletBalance(userId: number): Promise<number> {
    const [user] = await db
      .select({ walletBalance: users.walletBalance })
      .from(users)
      .where(eq(users.id, userId));
    return user?.walletBalance || 0;
  }

  // RFQ methods
  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    const [rfq] = await db
      .insert(rfqs)
      .values(insertRfq)
      .returning();
    return rfq;
  }

  async getRfq(id: number): Promise<Rfq | undefined> {
    const [rfq] = await db
      .select()
      .from(rfqs)
      .where(eq(rfqs.id, id));
    return rfq || undefined;
  }

  async getRfqsByUserId(userId: number): Promise<Rfq[]> {
    return await db
      .select()
      .from(rfqs)
      .where(eq(rfqs.userId, userId));
  }

  async getActiveRfqsCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: { value: rfqs.id } })
      .from(rfqs)
      .where(and(
        eq(rfqs.userId, userId),
        eq(rfqs.status, "open")
      ));
    return result[0]?.count?.value || 0;
  }

  // Bid methods
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db
      .insert(bids)
      .values(insertBid)
      .returning();
    return bid;
  }

  async getBidsByRfqId(rfqId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.rfqId, rfqId));
  }

  async getReceivedBidsCount(userId: number): Promise<number> {
    const userRfqs = await this.getRfqsByUserId(userId);
    const rfqIds = userRfqs.map(rfq => rfq.id);
    
    if (rfqIds.length === 0) return 0;
    
    const result = await db
      .select({ count: { value: bids.id } })
      .from(bids)
      .where(
        eq(bids.rfqId, userId) // This is a simplification; in reality we'd need a more complex query
      );
    
    return result[0]?.count?.value || 0;
  }

  // Supplier methods
  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db
      .insert(suppliers)
      .values(insertSupplier)
      .returning();
    return supplier;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers);
  }

  async getTopSuppliers(): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .orderBy(asc(suppliers.riskScore))
      .limit(5);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      );
  }

  // Wallet transaction methods
  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [transaction] = await db
      .insert(walletTransactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getWalletTransactionsByUserId(userId: number): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId));
  }

  // Contract methods
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db
      .insert(contracts)
      .values(insertContract)
      .returning();
    return contract;
  }

  async getContractsByUserId(userId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(
        or(
          eq(contracts.buyerId, userId),
          eq(contracts.supplierId, userId)
        )
      );
  }

  async getAwardedContractsCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: { value: contracts.id } })
      .from(contracts)
      .where(eq(contracts.buyerId, userId));
    
    return result[0]?.count?.value || 0;
  }

  // Market data methods
  async saveMarketData(insertMarketData: InsertMarketData): Promise<MarketData> {
    const [marketDataRecord] = await db
      .insert(marketData)
      .values(insertMarketData)
      .returning();
    return marketDataRecord;
  }

  async getMarketDataByIndustry(industry: string): Promise<MarketData[]> {
    return await db
      .select()
      .from(marketData)
      .where(eq(marketData.industry, industry));
  }
  
  // Invoice methods
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoicesBySellerId(sellerId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.sellerId, sellerId));
  }

  async getInvoicesByBuyerId(buyerId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.buyerId, buyerId));
  }

  async updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const now = new Date();
    const [invoice] = await db
      .update(invoices)
      .set({
        ...data,
        updatedAt: now
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice || undefined;
  }
  
  // KredX transaction methods
  async createKredxTransaction(insertTransaction: InsertKredxTransaction): Promise<KredxTransaction> {
    const [transaction] = await db
      .insert(kredxTransactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getKredxTransactionsByInvoiceId(invoiceId: number): Promise<KredxTransaction[]> {
    return await db
      .select()
      .from(kredxTransactions)
      .where(eq(kredxTransactions.invoiceId, invoiceId));
  }
  
  // Blockchain record methods
  async createBlockchainRecord(insertRecord: InsertBlockchainRecord): Promise<BlockchainRecord> {
    const [record] = await db
      .insert(blockchainRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async getBlockchainRecordByRfqId(rfqId: number): Promise<BlockchainRecord | undefined> {
    const [record] = await db
      .select()
      .from(blockchainRecords)
      .where(eq(blockchainRecords.rfqId, rfqId));
    return record || undefined;
  }

  async getAllBlockchainRecords(): Promise<BlockchainRecord[]> {
    return await db
      .select()
      .from(blockchainRecords);
  }
  
  // Contract methods (extended)
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));
    return contract;
  }
  
  async updateContract(id: number, data: Partial<InsertContract>): Promise<Contract | undefined> {
    const [contract] = await db
      .update(contracts)
      .set(data)
      .where(eq(contracts.id, id))
      .returning();
    return contract;
  }
  
  // Milestone methods
  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db
      .insert(milestones)
      .values(insertMilestone)
      .returning();
    return milestone;
  }
  
  async getMilestone(id: number): Promise<Milestone | undefined> {
    const [milestone] = await db
      .select()
      .from(milestones)
      .where(eq(milestones.id, id));
    return milestone;
  }

  async getMilestoneByNumber(contractId: number, milestoneNumber: number): Promise<Milestone | undefined> {
    const [milestone] = await db
      .select()
      .from(milestones)
      .where(
        and(
          eq(milestones.contractId, contractId),
          eq(milestones.milestoneNumber, milestoneNumber)
        )
      );
    return milestone;
  }
  
  async getMilestonesByContractId(contractId: number): Promise<Milestone[]> {
    return await db
      .select()
      .from(milestones)
      .where(eq(milestones.contractId, contractId))
      .orderBy(milestones.milestoneNumber);
  }
  
  async getMilestonesByContract(contractId: number): Promise<Milestone[]> {
    return this.getMilestonesByContractId(contractId);
  }
  
  async updateMilestone(id: number, data: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const [milestone] = await db
      .update(milestones)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(milestones.id, id))
      .returning();
    return milestone;
  }

  // User profile methods
  async updateUserProfile(userId: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Supplier methods
  async getSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, userId));
    return supplier;
  }

  async updateSupplierProfile(supplierId: number, data: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [supplier] = await db
      .update(suppliers)
      .set(data)
      .where(eq(suppliers.id, supplierId))
      .returning();
    return supplier;
  }

  // Product catalog methods
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async getProductsBySupplierId(supplierId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.supplierId, supplierId));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    return !!result;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.category, category));
  }

  // Portfolio methods
  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [portfolioItem] = await db
      .insert(portfolioItems)
      .values(item)
      .returning();
    return portfolioItem;
  }

  async getPortfolioItemsBySupplierId(supplierId: number): Promise<PortfolioItem[]> {
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.supplierId, supplierId));
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    const [portfolioItem] = await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.id, id));
    return portfolioItem;
  }

  async updatePortfolioItem(id: number, data: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const [portfolioItem] = await db
      .update(portfolioItems)
      .set(data)
      .where(eq(portfolioItems.id, id))
      .returning();
    return portfolioItem;
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    const result = await db
      .delete(portfolioItems)
      .where(eq(portfolioItems.id, id));
    return !!result;
  }

  // Enhanced messaging methods
  async getMessagesBetweenUsers(senderId: number, receiverId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, senderId),
            eq(messages.receiverId, receiverId)
          ),
          and(
            eq(messages.senderId, receiverId),
            eq(messages.receiverId, senderId)
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async getMessagesByRfqId(rfqId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.rfqId, rfqId))
      .orderBy(messages.createdAt);
  }

  async getUnreadMessagesCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );
    return result[0]?.count || 0;
  }

  async markMessageAsRead(messageId: number): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId))
      .returning();
    return message;
  }

  // Logistics tracking methods
  async createShipment(shipmentData: InsertShipment): Promise<Shipment> {
    const [shipment] = await db
      .insert(shipments)
      .values(shipmentData)
      .returning();
    return shipment;
  }

  async getShipment(id: number): Promise<Shipment | undefined> {
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | undefined> {
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.trackingNumber, trackingNumber));
    return shipment || undefined;
  }

  async updateShipment(id: number, data: Partial<InsertShipment>): Promise<Shipment | undefined> {
    const now = new Date();
    const [shipment] = await db
      .update(shipments)
      .set({
        ...data,
        updatedAt: now
      })
      .where(eq(shipments.id, id))
      .returning();
    return shipment || undefined;
  }

  async getShipmentsByUser(userId: number, role: 'sender' | 'recipient'): Promise<Shipment[]> {
    if (role === 'sender') {
      return await db
        .select()
        .from(shipments)
        .where(eq(shipments.senderId, userId))
        .orderBy(desc(shipments.createdAt));
    } else {
      return await db
        .select()
        .from(shipments)
        .where(eq(shipments.recipientId, userId))
        .orderBy(desc(shipments.createdAt));
    }
  }

  async getShipmentsByContract(contractId: number): Promise<Shipment[]> {
    return await db
      .select()
      .from(shipments)
      .where(eq(shipments.contractId, contractId))
      .orderBy(desc(shipments.createdAt));
  }

  async getShipmentItems(shipmentId: number): Promise<ShipmentItem[]> {
    return await db
      .select()
      .from(shipmentItems)
      .where(eq(shipmentItems.shipmentId, shipmentId));
  }

  async createShipmentItem(itemData: InsertShipmentItem): Promise<ShipmentItem> {
    const [item] = await db
      .insert(shipmentItems)
      .values(itemData)
      .returning();
    return item;
  }

  async getShipmentEvents(shipmentId: number): Promise<ShipmentEvent[]> {
    return await db
      .select()
      .from(shipmentEvents)
      .where(eq(shipmentEvents.shipmentId, shipmentId))
      .orderBy(desc(shipmentEvents.timestamp));
  }

  async createShipmentEvent(eventData: InsertShipmentEvent): Promise<ShipmentEvent> {
    const [event] = await db
      .insert(shipmentEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async getShipmentDocuments(shipmentId: number): Promise<ShipmentDocument[]> {
    return await db
      .select()
      .from(shipmentDocuments)
      .where(eq(shipmentDocuments.shipmentId, shipmentId));
  }

  async createShipmentDocument(documentData: InsertShipmentDocument): Promise<ShipmentDocument> {
    const [document] = await db
      .insert(shipmentDocuments)
      .values(documentData)
      .returning();
    return document;
  }
  
  // Model Explanation methods
  async createModelExplanation(explanation: InsertModelExplanation): Promise<ModelExplanation> {
    const [newExplanation] = await db
      .insert(modelExplanations)
      .values(explanation)
      .returning();
    return newExplanation;
  }
  
  async getModelExplanation(id: number): Promise<ModelExplanation | undefined> {
    const [explanation] = await db
      .select()
      .from(modelExplanations)
      .where(eq(modelExplanations.id, id));
    return explanation || undefined;
  }
  
  async getModelExplanationsByInstanceId(modelType: string, instanceId: number): Promise<ModelExplanation[]> {
    return await db
      .select()
      .from(modelExplanations)
      .where(
        and(
          eq(modelExplanations.modelType, modelType),
          eq(modelExplanations.instanceId, instanceId)
        )
      )
      .orderBy(desc(modelExplanations.createdAt));
  }
  
  async getModelExplanationsByUserId(userId: number): Promise<ModelExplanation[]> {
    return await db
      .select()
      .from(modelExplanations)
      .where(eq(modelExplanations.userId, userId))
      .orderBy(desc(modelExplanations.createdAt));
  }
  
  async updateModelExplanation(id: number, data: Partial<InsertModelExplanation>): Promise<ModelExplanation | undefined> {
    const [explanation] = await db
      .update(modelExplanations)
      .set(data)
      .where(eq(modelExplanations.id, id))
      .returning();
    return explanation || undefined;
  }
  
  async deleteModelExplanation(id: number): Promise<boolean> {
    const result = await db
      .delete(modelExplanations)
      .where(eq(modelExplanations.id, id));
    return result.rowCount > 0;
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
