// Bell24h - RFQ Marketplace Server
import express from 'express';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';
import crypto from 'crypto';

// Convert ESM-specific variables to CommonJS-like equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

// Track connected clients
const clients = new Map();

// WebSocket connection handling
wss.on('connection', (ws) => {
  const id = crypto.randomUUID();
  const color = Math.floor(Math.random() * 360);
  const metadata = { id, color };
  
  clients.set(ws, metadata);
  
  console.log(`WebSocket client connected: ${id}`);
  
  ws.on('message', (messageAsString) => {
    const message = JSON.parse(messageAsString);
    const metadata = clients.get(ws);
    
    console.log(`WebSocket message from ${metadata.id}: ${message.type}`);
    
    // Handle different message types
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', data: { timestamp: Date.now() } }));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  });
  
  ws.on('close', () => {
    console.log(`WebSocket client disconnected: ${id}`);
    clients.delete(ws);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    data: { id, message: 'Welcome to Bell24h WebSocket Server!' }
  }));
});

// Broadcast to all connected WebSocket clients
function broadcastMessage(type, data) {
  const message = JSON.stringify({ type, data });
  
  [...clients.keys()].forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configure static file serving for frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Security middleware - Rate limiting
const rateLimiter = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Initialize or clean up old requests
  if (!rateLimiter[ip] || now - rateLimiter[ip].windowStart > RATE_LIMIT_WINDOW) {
    rateLimiter[ip] = {
      windowStart: now,
      count: 1
    };
    return next();
  }
  
  // Increment request count
  rateLimiter[ip].count++;
  
  // Check if rate limit exceeded
  if (rateLimiter[ip].count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    });
  }
  
  next();
});

// Security middleware - Basic input validation
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    // Check for empty body
    if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: 'error',
      code: 'EMPTY_REQUEST_BODY',
      message: 'Request body cannot be empty'
    });
  }
    
    // Check for common attack vectors in body
    const bodyString = JSON.stringify(req.body);
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL Injection
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(bodyString)) {
    return res.status(400).json({
      status: 'error',
      code: 'MALICIOUS_INPUT_DETECTED',
      message: 'Potentially malicious input detected'
        });
      }
    }
  }
  }
  
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${req.method} ${req.path} - Started`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} in ${duration}ms`);
  });
  
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bell24h API is operational',
    timestamp: new Date().toISOString()
  });
});

// ===== USERS =====

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid user ID'
    });
  }
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Don't return the password
    const user = result.rows[0];
    delete user.password;
    
    return res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user'
    });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  const { username, password, email, fullName, companyName, role = 'buyer', gstin, phone, address, city, state, country, pincode } = req.body;
  
  // Basic validation
  if (!username || !password || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'Username, password, and email are required'
    });
  }
  
  try {
    // Check if username or email already exists
    const checkUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    
    if (checkUser.rows.length > 0) {
      const existingUser = checkUser.rows[0];
      if (existingUser.username === username) {
        return res.status(409).json({
          status: 'error',
          message: 'Username already taken'
        });
      }
      
      if (existingUser.email === email) {
        return res.status(409).json({
          status: 'error',
          message: 'Email already registered'
        });
      }
    }
    
    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (username, password, email, full_name, company_name, role, gstin, phone, address, city, state, country, pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [username, password, email, fullName, companyName, role, gstin, phone, address, city, state, country, pincode]
    );
    
    const newUser = result.rows[0];
    delete newUser.password;
    
    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create user'
    });
  }
});

// ===== RFQs =====

// Get all published RFQs
app.get('/api/rfqs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rfqs WHERE status = $1', ['published']);
    
    return res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch RFQs'
    });
  }
});

// Get RFQ by ID
app.get('/api/rfqs/:id', async (req, res) => {
  const rfqId = parseInt(req.params.id);
  
  if (isNaN(rfqId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid RFQ ID'
    });
  }
  
  try {
    const result = await pool.query('SELECT * FROM rfqs WHERE id = $1', [rfqId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'RFQ not found'
      });
    }
    
    return res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch RFQ'
    });
  }
});

// Create new RFQ
app.post('/api/rfqs', async (req, res) => {
  const {
    title,
    description,
    buyerId,
    categoryId,
    quantity,
    budget,
    deadline,
    deliveryLocation,
    status = 'draft',
    requirements,
    attachments
  } = req.body;
  
  // Basic validation
  if (!title || !description || !buyerId) {
    return res.status(400).json({
      status: 'error',
      message: 'Title, description, and buyer ID are required'
    });
  }
  
  try {
    // Insert new RFQ
    const result = await pool.query(
      `INSERT INTO rfqs (title, description, buyer_id, category_id, quantity, budget, deadline, delivery_location, status, requirements, attachments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description, buyerId, categoryId, quantity, budget, deadline, deliveryLocation, status, requirements, attachments]
    );
    
    return res.status(201).json({
      status: 'success',
      message: 'RFQ created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create RFQ'
    });
  }
});

// Update RFQ
app.patch('/api/rfqs/:id', async (req, res) => {
  const rfqId = parseInt(req.params.id);
  
  if (isNaN(rfqId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid RFQ ID'
    });
  }
  
  try {
    // Check if RFQ exists
    const checkRfq = await pool.query('SELECT * FROM rfqs WHERE id = $1', [rfqId]);
    
    if (checkRfq.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'RFQ not found'
      });
    }
    
    const existingRfq = checkRfq.rows[0];
    
    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    const fieldsToUpdate = [
      'title', 'description', 'category_id', 'quantity', 
      'budget', 'deadline', 'delivery_location', 'status',
      'requirements', 'attachments'
    ];
    
    // Map request field names to database column names
    const fieldMapping = {
      categoryId: 'category_id',
      deliveryLocation: 'delivery_location'
    };
    
    for (const [field, value] of Object.entries(req.body)) {
      const dbField = fieldMapping[field] || field.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      if (fieldsToUpdate.includes(dbField)) {
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    // No fields to update
    if (updateFields.length === 0) {
      return res.json({
        status: 'success',
        message: 'No fields to update',
        data: existingRfq
      });
    }
    
    // Add updated_at field
    updateFields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;
    
    // Add rfq_id as the last parameter
    values.push(rfqId);
    
    const updateQuery = `
      UPDATE rfqs 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, values);
    
    return res.json({
      status: 'success',
      message: 'RFQ updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating RFQ:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update RFQ'
    });
  }
});

// ===== Quotes =====

// Get quotes for an RFQ
app.get('/api/rfqs/:id/quotes', async (req, res) => {
  const rfqId = parseInt(req.params.id);
  
  if (isNaN(rfqId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid RFQ ID'
    });
  }
  
  try {
    // Check if RFQ exists
    const checkRfq = await pool.query('SELECT * FROM rfqs WHERE id = $1', [rfqId]);
    
    if (checkRfq.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'RFQ not found'
      });
    }
    
    // Get quotes for the RFQ
    const result = await pool.query('SELECT * FROM quotes WHERE rfq_id = $1', [rfqId]);
    
    return res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quotes'
    });
  }
});

// Create a quote for an RFQ
app.post('/api/rfqs/:id/quotes', async (req, res) => {
  const rfqId = parseInt(req.params.id);
  
  if (isNaN(rfqId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid RFQ ID'
    });
  }
  
  const { supplierId, price, deliveryDays, message, attachments, status = 'submitted' } = req.body;
  
  // Basic validation
  if (!supplierId || !price) {
    return res.status(400).json({
      status: 'error',
      message: 'Supplier ID and price are required'
    });
  }
  
  try {
    // Check if RFQ exists
    const checkRfq = await pool.query('SELECT * FROM rfqs WHERE id = $1', [rfqId]);
    
    if (checkRfq.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'RFQ not found'
      });
    }
    
    // Insert new quote
    const result = await pool.query(
      `INSERT INTO quotes (rfq_id, supplier_id, price, delivery_days, message, attachments, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [rfqId, supplierId, price, deliveryDays, message, attachments, status]
    );
    
    return res.status(201).json({
      status: 'success',
      message: 'Quote submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting quote:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit quote'
    });
  }
});

// ===== Industries and Categories =====

// Get all industries
app.get('/api/industries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM industries');
    
    return res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching industries:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch industries'
    });
  }
});

// Get categories (optionally filtered by industry)
app.get('/api/categories', async (req, res) => {
  const industryId = req.query.industryId ? parseInt(req.query.industryId) : null;
  
  try {
    let result;
    
    if (industryId) {
      result = await pool.query('SELECT * FROM categories WHERE industry_id = $1', [industryId]);
    } else {
      result = await pool.query('SELECT * FROM categories');
    }
    
    return res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories'
    });
  }
});

// ===== Supplier Metrics =====

// Get metrics for a supplier
app.get('/api/suppliers/:id/metrics', async (req, res) => {
  const supplierId = parseInt(req.params.id);
  
  if (isNaN(supplierId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid supplier ID'
    });
  }
  
  try {
    const result = await pool.query('SELECT * FROM supplier_metrics WHERE supplier_id = $1', [supplierId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Supplier metrics not found'
      });
    }
    
    return res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching supplier metrics:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch supplier metrics'
    });
  }
});

// Setup wizard endpoints

// Project setup status
app.get('/api/setup/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'Setup API is operational',
    steps: [
      { id: 1, name: 'Create Project', status: 'completed' },
      { id: 2, name: 'Upload ZIP', status: 'completed' },
      { id: 3, name: 'GitHub Integration', status: 'completed' },
      { id: 4, name: 'Environment Variables', status: 'completed' },
      { id: 5, name: 'Install Dependencies', status: 'completed' },
      { id: 6, name: 'Run Application', status: 'completed' }
    ]
  });
});

// ===== Trading Features =====

// Get RFQ matches (suppliers that match the RFQ requirements)
app.get('/api/rfqs/:id/matches', async (req, res) => {
  const rfqId = parseInt(req.params.id);
  
  if (isNaN(rfqId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid RFQ ID'
    });
  }
  
  try {
    // Get RFQ details
    const rfqResult = await pool.query('SELECT * FROM rfqs WHERE id = $1', [rfqId]);
    
    if (rfqResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'RFQ not found'
      });
    }
    
    const rfq = rfqResult.rows[0];
    
    // Get category
    const categoryResult = await pool.query('SELECT * FROM categories WHERE id = $1', [rfq.category_id]);
    const category = categoryResult.rows[0] || { industry_id: null };
    
    // Find suppliers with matching industry/category and good metrics
    const suppliersQuery = `
      SELECT u.*, sm.* 
      FROM users u
      LEFT JOIN supplier_metrics sm ON u.id = sm.supplier_id
      JOIN categories c ON c.id = $1
      WHERE u.role = 'supplier'
      AND (
        -- Supplier is in the same industry
        EXISTS (
          SELECT 1 FROM categories c2
          WHERE c2.industry_id = $2
          AND c2.id IN (
            SELECT category_id FROM supplier_categories
            WHERE supplier_id = u.id
          )
        )
        OR
        -- Supplier is in the exact category
        EXISTS (
          SELECT 1 FROM supplier_categories sc
          WHERE sc.supplier_id = u.id
          AND sc.category_id = $1
        )
      )
      -- Only include suppliers with metrics if available
      ORDER BY
        CASE WHEN sm.overall_rating IS NOT NULL THEN sm.overall_rating ELSE 0 END DESC,
        CASE WHEN sm.response_rate IS NOT NULL THEN sm.response_rate ELSE 0 END DESC
      LIMIT 10
    `;
    
    // For demo/testing purposes, if the query fails (e.g., supplier_categories table doesn't exist),
    // fall back to a simpler query
    let suppliersResult;
    try {
      suppliersResult = await pool.query(suppliersQuery, [rfq.category_id, category.industry_id]);
    } catch (error) {
      console.error('Error in advanced supplier matching, falling back to simple query:', error);
      suppliersResult = await pool.query(
        'SELECT * FROM users WHERE role = $1 LIMIT 10', 
        ['supplier']
      );
    }
    
    // Calculate match score for each supplier
    const matches = suppliersResult.rows.map(supplier => {
      // Don't return the password
      delete supplier.password;
      
      // Calculate match score (0-100)
      // In a real implementation, this would use AI/ML to compute similarity
      const randomScore = Math.floor(65 + Math.random() * 35); // Random score between 65-100
      
      return {
        supplier,
        matchScore: randomScore,
        matchReason: [
          'Category expertise',
          'Similar past projects',
          'Location proximity',
          'High performance metrics'
        ].slice(0, Math.floor(1 + Math.random() * 3)) // Random 1-3 reasons
      };
    });
    
    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    // Notify all connected WebSocket clients about the match request
    broadcastMessage('rfq_match_requested', {
      rfqId,
      title: rfq.title,
      timestamp: new Date().toISOString()
    });
    
    return res.json({
      status: 'success',
      data: {
        rfq,
        matches
      }
    });
  } catch (error) {
    console.error('Error finding RFQ matches:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to find RFQ matches'
    });
  }
});

// Submit RFQ to multiple suppliers
app.post('/api/rfqs/:id/submit', async (req, res) => {
  const rfqId = parseInt(req.params.id);
  const { supplierIds } = req.body;
  
  if (isNaN(rfqId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid RFQ ID'
    });
  }
  
  if (!Array.isArray(supplierIds) || supplierIds.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'At least one supplier ID must be provided'
    });
  }
  
  try {
    // Check if RFQ exists
    const rfqResult = await pool.query('SELECT * FROM rfqs WHERE id = $1', [rfqId]);
    
    if (rfqResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'RFQ not found'
      });
    }
    
    const rfq = rfqResult.rows[0];
    
    // Check if suppliers exist
    const suppliersResult = await pool.query(
      'SELECT * FROM users WHERE id = ANY($1) AND role = $2',
      [supplierIds, 'supplier']
    );
    
    if (suppliersResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No valid suppliers found'
      });
    }
    
    // Update RFQ status to published if it's in draft
    if (rfq.status === 'draft') {
      await pool.query(
        'UPDATE rfqs SET status = $1, updated_at = $2 WHERE id = $3',
        ['published', new Date(), rfqId]
      );
    }
    
    // Create RFQ invitations (in a real app, this would be a separate table)
    const suppliers = suppliersResult.rows;
    const invitationData = suppliers.map(supplier => ({
      supplierId: supplier.id,
      supplierName: supplier.full_name || supplier.company_name || supplier.username,
      sentAt: new Date().toISOString()
    }));
    
    // Notify all connected WebSocket clients
    broadcastMessage('rfq_submitted', {
      rfqId,
      title: rfq.title,
      supplierCount: suppliers.length,
      timestamp: new Date().toISOString()
    });
    
    // Notify specific suppliers via WebSocket
    suppliers.forEach(supplier => {
      // In a real app, we would filter by user ID in the WebSocket clients
      broadcastMessage('new_rfq_received', {
        rfqId,
        title: rfq.title,
        buyerId: rfq.buyer_id,
        timestamp: new Date().toISOString()
      });
    });
    
    return res.json({
      status: 'success',
      message: `RFQ submitted to ${suppliers.length} suppliers`,
      data: {
        rfq,
        invitations: invitationData
      }
    });
  } catch (error) {
    console.error('Error submitting RFQ to suppliers:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit RFQ to suppliers'
    });
  }
});

// Get trading analytics
app.get('/api/analytics/trading', async (req, res) => {
  try {
    // Get RFQ stats
    const rfqStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_rfqs,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_rfqs,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_rfqs,
        COUNT(CASE WHEN status = 'awarded' THEN 1 END) as awarded_rfqs
      FROM rfqs
    `);
    
    // Get quotes stats
    const quoteStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_quotes,
        AVG(price) as avg_quote_price,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotes
      FROM quotes
    `);
    
    // Get user stats
    const userStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyer_count,
        COUNT(CASE WHEN role = 'supplier' THEN 1 END) as supplier_count
      FROM users
    `);
    
    // Get category stats
    const categoryStatsResult = await pool.query(`
      SELECT c.name, COUNT(r.id) as rfq_count
      FROM categories c
      LEFT JOIN rfqs r ON c.id = r.category_id
      GROUP BY c.name
      ORDER BY rfq_count DESC
      LIMIT 5
    `);
    
    // Combine all stats
    const analytics = {
      rfq: rfqStatsResult.rows[0] || { total_rfqs: 0, published_rfqs: 0, closed_rfqs: 0, awarded_rfqs: 0 },
      quotes: quoteStatsResult.rows[0] || { total_quotes: 0, avg_quote_price: 0, accepted_quotes: 0 },
      users: userStatsResult.rows[0] || { total_users: 0, buyer_count: 0, supplier_count: 0 },
      topCategories: categoryStatsResult.rows || []
    };
    
    return res.json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching trading analytics:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trading analytics'
    });
  }
});

// WebSocket endpoint for browser clients
app.get('/ws-info', (req, res) => {
  res.json({
    status: 'success',
    message: 'WebSocket server is running',
    endpoint: `ws://${req.headers.host}`,
    activeConnections: clients.size
  });
});

// Serve frontend HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Bell24h server running on port ${PORT}`);
});
