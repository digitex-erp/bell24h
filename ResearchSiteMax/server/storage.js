const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { eq, and, or, desc, asc, count } = require('drizzle-orm');
const ws = require('ws');
const schema = require('../shared/schema');

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

class DatabaseStorage {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user || undefined;
  }

  async createUser(insertUser) {
    const [user] = await db
      .insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserGstVerification(userId, verified) {
    const [user] = await db
      .update(schema.users)
      .set({ gstVerified: verified })
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  async updateUserWalletBalance(userId, amount) {
    // Get current user to access current balance
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!existingUser) return undefined;
    
    const newBalance = (existingUser.walletBalance || 0) + amount;
    
    const [user] = await db
      .update(schema.users)
      .set({ walletBalance: newBalance })
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  async getUserWalletBalance(userId) {
    const [user] = await db
      .select({ walletBalance: schema.users.walletBalance })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    return user?.walletBalance || 0;
  }

  // RFQ methods
  async createRfq(insertRfq) {
    const [rfq] = await db
      .insert(schema.rfqs)
      .values(insertRfq)
      .returning();
    return rfq;
  }

  async getRfq(id) {
    const [rfq] = await db.select().from(schema.rfqs).where(eq(schema.rfqs.id, id));
    return rfq || undefined;
  }

  async getRfqsByUserId(userId) {
    return await db
      .select()
      .from(schema.rfqs)
      .where(eq(schema.rfqs.userId, userId));
  }

  async getActiveRfqsCount(userId) {
    const result = await db
      .select({ count: count() })
      .from(schema.rfqs)
      .where(
        and(
          eq(schema.rfqs.userId, userId),
          eq(schema.rfqs.status, "open")
        )
      );
    return result[0]?.count || 0;
  }

  // Bid methods
  async createBid(insertBid) {
    const [bid] = await db
      .insert(schema.bids)
      .values(insertBid)
      .returning();
    return bid;
  }

  async getBidsByRfqId(rfqId) {
    return await db
      .select()
      .from(schema.bids)
      .where(eq(schema.bids.rfqId, rfqId));
  }

  async getReceivedBidsCount(userId) {
    const userRfqs = await this.getRfqsByUserId(userId);
    if (userRfqs.length === 0) return 0;
    
    const rfqIds = userRfqs.map(rfq => rfq.id);
    
    const result = await db
      .select({ count: count() })
      .from(schema.bids)
      .where(
        schema.bids.rfqId.in(rfqIds)
      );
    
    return result[0]?.count || 0;
  }

  // Supplier methods
  async createSupplier(insertSupplier) {
    const [supplier] = await db
      .insert(schema.suppliers)
      .values(insertSupplier)
      .returning();
    return supplier;
  }

  async getAllSuppliers() {
    return await db
      .select()
      .from(schema.suppliers);
  }

  async getTopSuppliers() {
    return await db
      .select()
      .from(schema.suppliers)
      .orderBy(asc(schema.suppliers.riskScore))
      .limit(5);
  }

  async getSupplier(id) {
    const [supplier] = await db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.id, id));
    return supplier || undefined;
  }

  // Contract methods
  async createContract(insertContract) {
    const [contract] = await db
      .insert(schema.contracts)
      .values(insertContract)
      .returning();
    return contract;
  }

  async getContractsByUserId(userId) {
    return await db
      .select()
      .from(schema.contracts)
      .where(
        or(
          eq(schema.contracts.buyerId, userId),
          eq(schema.contracts.supplierId, userId)
        )
      );
  }

  async getAwardedContractsCount(userId) {
    const result = await db
      .select({ count: count() })
      .from(schema.contracts)
      .where(eq(schema.contracts.supplierId, userId));
    return result[0]?.count || 0;
  }

  // Market data methods
  async saveMarketData(insertMarketData) {
    const [marketDataRecord] = await db
      .insert(schema.marketData)
      .values(insertMarketData)
      .returning();
    return marketDataRecord;
  }

  async getMarketDataByIndustry(industry) {
    return await db
      .select()
      .from(schema.marketData)
      .where(eq(schema.marketData.industry, industry));
  }

  // User profile methods
  async updateUserProfile(userId, userData) {
    const [user] = await db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, userId))
      .returning();
    return user;
  }

  // Supplier methods
  async getSupplierByUserId(userId) {
    const [supplier] = await db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.userId, userId));
    return supplier;
  }

  async updateSupplierProfile(supplierId, data) {
    const [supplier] = await db
      .update(schema.suppliers)
      .set(data)
      .where(eq(schema.suppliers.id, supplierId))
      .returning();
    return supplier;
  }

  // Product catalog methods
  async createProduct(product) {
    const [newProduct] = await db
      .insert(schema.products)
      .values(product)
      .returning();
    return newProduct;
  }

  async getProductsBySupplierId(supplierId) {
    return await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.supplierId, supplierId));
  }

  async getProduct(id) {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id));
    return product;
  }

  async updateProduct(id, data) {
    const [product] = await db
      .update(schema.products)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id) {
    try {
      await db
        .delete(schema.products)
        .where(eq(schema.products.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  async getProductsByCategory(category) {
    return await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.category, category));
  }

  // Portfolio methods
  async createPortfolioItem(item) {
    const [portfolioItem] = await db
      .insert(schema.portfolioItems)
      .values(item)
      .returning();
    return portfolioItem;
  }

  async getPortfolioItemsBySupplierId(supplierId) {
    return await db
      .select()
      .from(schema.portfolioItems)
      .where(eq(schema.portfolioItems.supplierId, supplierId));
  }

  async getPortfolioItem(id) {
    const [portfolioItem] = await db
      .select()
      .from(schema.portfolioItems)
      .where(eq(schema.portfolioItems.id, id));
    return portfolioItem;
  }

  async updatePortfolioItem(id, data) {
    const [portfolioItem] = await db
      .update(schema.portfolioItems)
      .set(data)
      .where(eq(schema.portfolioItems.id, id))
      .returning();
    return portfolioItem;
  }

  async deletePortfolioItem(id) {
    try {
      await db
        .delete(schema.portfolioItems)
        .where(eq(schema.portfolioItems.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      return false;
    }
  }

  // Enhanced messaging methods
  async createMessage(message) {
    try {
      // Use raw pool for more complex queries
      const result = await pool.query(
        'INSERT INTO messages (sender_id, recipient_id, thread_id, content, attachment_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [message.sender_id, message.recipient_id, message.thread_id, message.content, message.attachment_url || null]
      );
      
      // Update thread's last_updated timestamp
      if (message.thread_id) {
        await pool.query(
          'UPDATE message_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [message.thread_id]
        );
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessagesByUserId(userId) {
    try {
      const result = await pool.query(
        `SELECT m.*, u.username, u.profile_picture 
         FROM messages m
         LEFT JOIN users u ON m.sender_id = u.id
         WHERE m.sender_id = $1 OR m.recipient_id = $1
         ORDER BY m.created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching messages by user ID:', error);
      throw error;
    }
  }

  async getMessagesBetweenUsers(senderId, receiverId) {
    try {
      const result = await pool.query(
        `SELECT m.*, u.username, u.profile_picture 
         FROM messages m
         LEFT JOIN users u ON m.sender_id = u.id
         WHERE (m.sender_id = $1 AND m.recipient_id = $2) OR (m.sender_id = $2 AND m.recipient_id = $1)
         ORDER BY m.created_at ASC`,
        [senderId, receiverId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching messages between users:', error);
      throw error;
    }
  }

  async getMessagesByRfqId(rfqId) {
    try {
      const result = await pool.query(
        `SELECT m.*, u.username, u.profile_picture 
         FROM messages m
         LEFT JOIN users u ON m.sender_id = u.id
         LEFT JOIN message_threads mt ON m.thread_id = mt.id
         WHERE mt.rfq_id = $1
         ORDER BY m.created_at ASC`,
        [rfqId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching messages by RFQ ID:', error);
      throw error;
    }
  }

  async getUnreadMessagesCount(userId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as unread_count
         FROM messages m
         JOIN thread_participants tp ON tp.thread_id = m.thread_id
         WHERE tp.user_id = $1 
         AND m.created_at > tp.last_read_at 
         AND m.sender_id != $1`,
        [userId]
      );
      
      return parseInt(result.rows[0].unread_count);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      // Fallback value if query fails
      return 0;
    }
  }

  async markMessagesAsRead(threadId, userId) {
    try {
      const result = await pool.query(
        'UPDATE thread_participants SET last_read_at = CURRENT_TIMESTAMP WHERE thread_id = $1 AND user_id = $2 RETURNING *',
        [threadId, userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
  
  // Message thread methods
  async createMessageThread(threadData) {
    try {
      const { title, rfq_id, created_by } = threadData;
      
      const result = await pool.query(
        'INSERT INTO message_threads (title, rfq_id, created_by) VALUES ($1, $2, $3) RETURNING *',
        [title, rfq_id || null, created_by]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating message thread:', error);
      throw error;
    }
  }
  
  async getMessageThreadById(threadId) {
    try {
      const result = await pool.query(
        'SELECT * FROM message_threads WHERE id = $1',
        [threadId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching message thread:', error);
      throw error;
    }
  }
  
  async getMessageThreadsByUserId(userId) {
    try {
      const result = await pool.query(
        `SELECT mt.*, 
                (SELECT COUNT(*) FROM messages m 
                 JOIN thread_participants tp ON tp.thread_id = m.thread_id 
                 WHERE m.thread_id = mt.id 
                 AND tp.user_id = $1 
                 AND m.created_at > tp.last_read_at
                 AND m.sender_id != $1) as unread_count,
                (SELECT m.created_at 
                 FROM messages m 
                 WHERE m.thread_id = mt.id 
                 ORDER BY m.created_at DESC 
                 LIMIT 1) as last_activity,
                (SELECT m.content 
                 FROM messages m 
                 WHERE m.thread_id = mt.id 
                 ORDER BY m.created_at DESC 
                 LIMIT 1) as last_message
         FROM message_threads mt
         JOIN thread_participants tp ON mt.id = tp.thread_id
         WHERE tp.user_id = $1
         ORDER BY last_activity DESC NULLS LAST`,
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching user message threads:', error);
      throw error;
    }
  }
  
  // Thread participant methods
  async addThreadParticipant(threadId, userId, isAdmin = false) {
    try {
      const result = await pool.query(
        'INSERT INTO thread_participants (thread_id, user_id, is_admin) VALUES ($1, $2, $3) RETURNING *',
        [threadId, userId, isAdmin]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding thread participant:', error);
      throw error;
    }
  }
  
  async removeThreadParticipant(threadId, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM thread_participants WHERE thread_id = $1 AND user_id = $2 RETURNING *',
        [threadId, userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error removing thread participant:', error);
      throw error;
    }
  }
  
  async getThreadParticipants(threadId) {
    try {
      const result = await pool.query(
        `SELECT tp.*, u.username, u.email, u.first_name, u.last_name, u.profile_picture 
         FROM thread_participants tp
         JOIN users u ON tp.user_id = u.id
         WHERE tp.thread_id = $1`,
        [threadId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching thread participants:', error);
      throw error;
    }
  }
  
  async getMessagesByThreadId(threadId, limit = 50, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT m.*, u.username, u.profile_picture 
         FROM messages m
         LEFT JOIN users u ON m.sender_id = u.id
         WHERE m.thread_id = $1
         ORDER BY m.created_at ASC
         LIMIT $2 OFFSET $3`,
        [threadId, limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching messages by thread:', error);
      throw error;
    }
  }
  
  async searchUsers(query) {
    try {
      const result = await pool.query(
        `SELECT id, username, email, first_name, last_name, profile_picture
         FROM users
         WHERE username ILIKE $1 OR 
               email ILIKE $1 OR 
               first_name ILIKE $1 OR 
               last_name ILIKE $1
         LIMIT 10`,
        [`%${query}%`]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Wallet transaction methods
  async createWalletTransaction(transaction) {
    const [newTransaction] = await db
      .insert(schema.walletTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getWalletTransactionsByUserId(userId) {
    return await db
      .select()
      .from(schema.walletTransactions)
      .where(eq(schema.walletTransactions.userId, userId))
      .orderBy(desc(schema.walletTransactions.createdAt));
  }

  // Blockchain record methods
  async createBlockchainRecord(blockchainRecord) {
    const [record] = await db
      .insert(schema.blockchainRecords)
      .values(blockchainRecord)
      .returning();
    return record;
  }

  async getBlockchainRecordByRfqId(rfqId) {
    const [record] = await db
      .select()
      .from(schema.blockchainRecords)
      .where(eq(schema.blockchainRecords.rfqId, rfqId))
      .orderBy(desc(schema.blockchainRecords.createdAt))
      .limit(1);
    return record || undefined;
  }

  async updateBlockchainRecordStatus(id, status, blockNumber = null) {
    const updateData = { status };
    if (blockNumber) {
      updateData.blockNumber = blockNumber;
    }

    const [record] = await db
      .update(schema.blockchainRecords)
      .set(updateData)
      .where(eq(schema.blockchainRecords.id, id))
      .returning();
    return record;
  }

  async getAllBlockchainRecords() {
    return await db
      .select()
      .from(schema.blockchainRecords)
      .orderBy(desc(schema.blockchainRecords.createdAt));
  }
}

// Use the database storage implementation
const storage = new DatabaseStorage();

module.exports = { storage, db };