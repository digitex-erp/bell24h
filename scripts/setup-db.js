require('esbuild-register');
const { db } = require('../server/db');
const { 
  users, rfqs, suppliers, bids, messages, 
  walletTransactions, contracts, marketData 
} = require('../shared/schema');

async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    console.log('Creating tables...');
    
    // Create tables in the correct order based on foreign key dependencies
    const sql = `
      -- Drop tables if they exist (in reverse order of dependencies)
      DROP TABLE IF EXISTS market_data;
      DROP TABLE IF EXISTS wallet_transactions;
      DROP TABLE IF EXISTS messages;
      DROP TABLE IF EXISTS contracts;
      DROP TABLE IF EXISTS bids;
      DROP TABLE IF EXISTS rfqs;
      DROP TABLE IF EXISTS suppliers;
      DROP TABLE IF EXISTS users;

      -- Create tables
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        company_name TEXT NOT NULL,
        location TEXT,
        industry TEXT,
        gst_number TEXT,
        gst_verified BOOLEAN DEFAULT FALSE,
        wallet_balance INTEGER DEFAULT 0,
        user_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rfqs (
        id SERIAL PRIMARY KEY,
        reference_number TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity TEXT NOT NULL,
        deadline TIMESTAMP NOT NULL,
        category TEXT NOT NULL,
        specifications JSONB,
        rfq_type TEXT NOT NULL,
        media_url TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        match_success_rate INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        industry TEXT NOT NULL,
        products JSONB,
        description TEXT,
        late_delivery_rate DOUBLE PRECISION DEFAULT 0,
        compliance_score DOUBLE PRECISION DEFAULT 100,
        financial_stability DOUBLE PRECISION DEFAULT 100,
        user_feedback DOUBLE PRECISION DEFAULT 100,
        risk_score DOUBLE PRECISION,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        rfq_id INTEGER NOT NULL REFERENCES rfqs(id),
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
        price INTEGER NOT NULL,
        delivery_days INTEGER NOT NULL,
        message TEXT,
        attachments JSONB,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        rfq_id INTEGER REFERENCES rfqs(id),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        rfq_id INTEGER NOT NULL REFERENCES rfqs(id),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        supplier_id INTEGER NOT NULL REFERENCES users(id),
        bid_id INTEGER NOT NULL REFERENCES bids(id),
        total_value INTEGER NOT NULL,
        milestones JSONB,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS market_data (
        id SERIAL PRIMARY KEY,
        industry TEXT NOT NULL,
        symbol TEXT NOT NULL,
        data JSONB NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `;

    await db.execute(sql);
    
    // Insert seed data
    await insertSeedData();
    
    console.log('Database tables created successfully!');
    console.log('Sample data has been added.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database tables:', error);
    process.exit(1);
  }
}

async function insertSeedData() {
  console.log('Inserting seed data...');
  
  // Insert sample user
  const [user] = await db
    .insert(users)
    .values({
      username: "johndoe",
      password: "$2b$10$m6WJrKMu4wRIB7QZXf1Nw.e/gDJKL0XoX/h2XGbv1l8Aq2KOq3GQy", // "password"
      email: "john@example.com",
      companyName: "Acme Corp",
      location: "Mumbai, Maharashtra",
      industry: "Manufacturing",
      gstNumber: "27AAPFU0939F1ZV",
      gstVerified: true,
      walletBalance: 25000,
      userType: "buyer"
    })
    .returning();
  
  // Insert sample RFQs
  const [rfq1] = await db
    .insert(rfqs)
    .values({
      referenceNumber: "RFQ-2023-09-001",
      userId: user.id,
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
      matchSuccessRate: 87
    })
    .returning();
    
  const [rfq2] = await db
    .insert(rfqs)
    .values({
      referenceNumber: "RFQ-2023-08-045",
      userId: user.id,
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
      matchSuccessRate: 92
    })
    .returning();
  
  // Create a supplier user
  const [supplierUser] = await db
    .insert(users)
    .values({
      username: "supplier1",
      password: "$2b$10$m6WJrKMu4wRIB7QZXf1Nw.e/gDJKL0XoX/h2XGbv1l8Aq2KOq3GQy", // "password"
      email: "supplier1@example.com",
      companyName: "Pump Masters Ltd",
      location: "Delhi, Delhi",
      industry: "Manufacturing",
      gstNumber: "07AABCU9603R1ZP",
      gstVerified: true,
      walletBalance: 10000,
      userType: "supplier"
    })
    .returning();
  
  // Insert sample supplier
  const [supplier1] = await db
    .insert(suppliers)
    .values({
      userId: supplierUser.id,
      industry: "Manufacturing",
      products: { categories: ["Pumps", "Valves", "Pipes"] },
      description: "Leading supplier of industrial pumps and related equipment",
      lateDeliveryRate: 5,
      complianceScore: 95,
      financialStability: 90,
      userFeedback: 92,
      riskScore: 8.5 // Lower score = lower risk
    })
    .returning();
  
  // Create another supplier user
  const [supplierUser2] = await db
    .insert(users)
    .values({
      username: "supplier2",
      password: "$2b$10$m6WJrKMu4wRIB7QZXf1Nw.e/gDJKL0XoX/h2XGbv1l8Aq2KOq3GQy", // "password"
      email: "supplier2@example.com",
      companyName: "ElectroComponents Inc",
      location: "Bangalore, Karnataka",
      industry: "Electronics",
      gstNumber: "29AALFP0230N1ZO",
      gstVerified: true,
      walletBalance: 15000,
      userType: "supplier"
    })
    .returning();
  
  // Insert second sample supplier
  const [supplier2] = await db
    .insert(suppliers)
    .values({
      userId: supplierUser2.id,
      industry: "Electronics",
      products: { categories: ["Resistors", "Capacitors", "Transistors"] },
      description: "Electronic components supplier with global sourcing",
      lateDeliveryRate: 3,
      complianceScore: 98,
      financialStability: 85,
      userFeedback: 95,
      riskScore: 6.0 // Lower score = lower risk
    })
    .returning();
  
  // Insert sample market data
  await db
    .insert(marketData)
    .values({
      industry: "Electronics",
      symbol: "ELEC",
      data: {
        dates: ["2023-05-01", "2023-06-01", "2023-07-01", "2023-08-01", "2023-09-01"],
        values: [65, 59, 80, 81, 92],
      }
    });
    
  await db
    .insert(marketData)
    .values({
      industry: "Industrial",
      symbol: "INDL",
      data: {
        dates: ["2023-05-01", "2023-06-01", "2023-07-01", "2023-08-01", "2023-09-01"],
        values: [28, 48, 40, 45, 56],
      }
    });
    
  console.log('Seed data inserted successfully!');
}

setupDatabase();