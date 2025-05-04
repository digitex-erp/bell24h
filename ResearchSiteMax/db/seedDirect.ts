/**
 * Direct Database Seeding Script for Bell24h
 * 
 * This script seeds the database with initial data using direct SQL.
 */
import postgres from 'postgres';
import bcrypt from 'bcrypt';

// Initialize postgres client with the DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a postgres connection
const sql = postgres(connectionString, { max: 1 });

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Test database connection
    try {
      await sql`SELECT 1`;
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
    
    // Seed user roles
    console.log('Seeding user roles...');
    const existingRoles = await sql`SELECT * FROM user_roles LIMIT 1`;
    if (existingRoles.length === 0) {
      await sql`
        INSERT INTO user_roles (name, description, permissions)
        VALUES 
          ('admin', 'Administrator with full access', ${'["all"]'}),
          ('buyer', 'Can create RFQs and receive quotes', ${'["create:rfq", "view:quotes", "manage:contracts"]'}),
          ('supplier', 'Can respond to RFQs with quotes', ${'["create:quotes", "view:rfqs", "manage:products"]'}),
          ('guest', 'Limited access to view public information', ${'["view:public"]'})
      `;
      console.log('User roles seeded successfully');
    } else {
      console.log('User roles already exist, skipping');
    }
    
    // Seed users
    console.log('Seeding users...');
    const existingUsers = await sql`SELECT * FROM users LIMIT 1`;
    if (existingUsers.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await sql`
        INSERT INTO users (username, email, password, full_name, business_name, business_type, role, gst_number, business_address, phone, is_verified, wallet_balance, kyc_status, preferences)
        VALUES 
          ('admin1', 'admin@bell24h.com', ${hashedPassword}, 'Admin User', 'Bell24h Administration', 'Platform', 'admin', 'ADMIN1234567Z', 'Bell24h HQ, Bangalore', '+91 9876543210', TRUE, 100000, 'verified', ${{notifications: true, language: 'en'}}),
          ('buyer1', 'buyer1@example.com', ${hashedPassword}, 'Demo Buyer', 'Buyer Company', 'Manufacturer', 'buyer', 'BUYER1234567Z', '123 Buyer St, Mumbai', '+91 9876543211', TRUE, 50000, 'verified', ${{notifications: true, language: 'en'}}),
          ('supplier1', 'supplier1@example.com', ${hashedPassword}, 'Demo Supplier', 'Supplier Inc', 'Distributor', 'supplier', 'SUPPL1234567Z', '456 Supplier Ave, Delhi', '+91 9876543212', TRUE, 25000, 'verified', ${{notifications: true, language: 'hi'}}),
          ('buyer2', 'buyer2@example.com', ${hashedPassword}, 'Second Buyer', 'Procurement Ltd', 'Retailer', 'buyer', 'BUYER2234567Z', '789 Business Blvd, Chennai', '+91 9876543213', TRUE, 35000, 'verified', ${{notifications: true, language: 'en'}}),
          ('supplier2', 'supplier2@example.com', ${hashedPassword}, 'Second Supplier', 'Manufacturing Co', 'Manufacturer', 'supplier', 'SUPPL2234567Z', '101 Factory Rd, Hyderabad', '+91 9876543214', TRUE, 40000, 'verified', ${{notifications: true, language: 'en'}})
      `;
      console.log('Users seeded successfully');
    } else {
      console.log('Users already exist, skipping');
    }
    
    // Get users for reference
    const users = await sql`SELECT * FROM users`;
    console.log('Found users:', users.length);
    
    // If no users were found but we think we've seeded them, try inserting them again
    if (users.length === 0) {
      console.log('No users found, forcing user creation...');
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await sql`
        INSERT INTO users (username, email, password, full_name, business_name, business_type, role)
        VALUES 
          ('buyer1', 'buyer1@example.com', ${hashedPassword}, 'Demo Buyer', 'Buyer Company', 'Manufacturer', 'buyer'),
          ('supplier1', 'supplier1@example.com', ${hashedPassword}, 'Demo Supplier', 'Supplier Inc', 'Distributor', 'supplier')
      `;
      console.log('Basic users created');
      
      // Re-fetch users
      const users = await sql`SELECT * FROM users`;
      console.log('After force-adding, found users:', users.length);
    }
    
    // Re-query with simpler approach to avoid potential issues with find() method on an array-like object
    // Using simple role-based queries instead of specific usernames
    const buyerUser = (await sql`SELECT * FROM users WHERE role = 'buyer' LIMIT 1`)[0];
    const buyerUser2 = buyerUser; // Use the same buyer for now
    const supplierUser = (await sql`SELECT * FROM users WHERE role = 'supplier' LIMIT 1`)[0];
    const supplierUser2 = supplierUser; // Use the same supplier for now
    
    console.log('Buyer user found:', !!buyerUser);
    console.log('Supplier user found:', !!supplierUser);
    
    if (!buyerUser || !supplierUser) {
      console.log('Required users not found, skipping further seeding');
      return;
    }
    
    // Seed RFQs
    console.log('Seeding RFQs...');
    const existingRfqs = await sql`SELECT * FROM rfqs LIMIT 1`;
    if (existingRfqs.length === 0) {
      await sql`
        INSERT INTO rfqs (title, description, quantity, budget, deadline, status, category, subcategory, tags, requirements, visibility, user_id, voice_url, original_language)
        VALUES 
          ('Industrial Pumps Supply', 'Looking for 50 industrial water pumps for a new manufacturing facility.', 50, '$25,000 - $35,000', ${new Date('2025-06-30')}, 'open', 'Industrial Equipment', 'Pumps', ${'["water pumps", "industrial", "manufacturing"]'}, 'Must meet ISO 9001 standards and include a 2-year warranty.', 'public', ${buyerUser.id}, NULL, NULL),
          ('Steel Fabrication Services', 'Need a supplier for custom steel fabrication for construction project.', 1, '$10,000 - $15,000', ${new Date('2025-07-15')}, 'open', 'Construction', 'Steel Fabrication', ${'["steel", "fabrication", "construction"]'}, 'Experience with large-scale commercial projects required.', 'public', ${buyerUser.id}, NULL, NULL),
          ('Voice RFQ Test', 'This is a test RFQ created via voice recording.', 10, '$5,000', NULL, 'pending', 'Electronics', 'Components', NULL, NULL, 'public', ${buyerUser.id}, '/uploads/audio/sample-voice-rfq.mp3', 'hi'),
          ('Office Furniture Procurement', 'Seeking supplier for complete office furniture package including desks, chairs, and storage units.', 25, '$15,000 - $20,000', ${new Date('2025-08-15')}, 'open', 'Office Supplies', 'Furniture', ${'["office furniture", "desks", "chairs", "corporate"]'}, 'Ergonomic design, consistent style, quick delivery timeline.', 'public', ${buyerUser2.id}, NULL, NULL),
          ('IT Infrastructure Setup', 'Looking for complete IT infrastructure solution including servers, networking, and workstations.', 1, '$50,000 - $75,000', ${new Date('2025-09-30')}, 'open', 'IT Equipment', 'Infrastructure', ${'["IT", "servers", "networking", "infrastructure"]'}, 'Must include installation, configuration, and 1-year support.', 'public', ${buyerUser2.id}, NULL, NULL)
      `;
      console.log('RFQs seeded successfully');
    } else {
      console.log('RFQs already exist, skipping');
    }
    
    // Get RFQs for reference
    const rfqs = await sql`SELECT * FROM rfqs`;
    const pumpsRfq = rfqs.find(rfq => rfq.title === 'Industrial Pumps Supply');
    const steelRfq = rfqs.find(rfq => rfq.title === 'Steel Fabrication Services');
    const voiceRfq = rfqs.find(rfq => rfq.title === 'Voice RFQ Test');
    const furnitureRfq = rfqs.find(rfq => rfq.title === 'Office Furniture Procurement');
    
    // Seed products
    console.log('Seeding products...');
    const existingProducts = await sql`SELECT * FROM products LIMIT 1`;
    if (existingProducts.length === 0) {
      await sql`
        INSERT INTO products (name, description, price, category, subcategory, images, specifications, inventory, user_id, is_active)
        VALUES 
          ('Industrial Water Pump - Model XP500', 'High-capacity industrial water pump suitable for manufacturing and processing applications.', 750, 'Industrial Equipment', 'Pumps', ${'["/uploads/products/pump-xp500-1.jpg", "/uploads/products/pump-xp500-2.jpg"]'}, ${{capacity: '500 gallons per minute', power: '5 HP', material: 'Stainless Steel', warranty: '2 years'}}, 35, ${supplierUser.id}, TRUE),
          ('Steel Framework Components - Commercial Grade', 'Custom steel fabrication components for commercial construction projects.', 1200, 'Construction', 'Steel Fabrication', ${'["/uploads/products/steel-framework-1.jpg", "/uploads/products/steel-framework-2.jpg"]'}, ${{material: 'Galvanized Steel', thickness: '5-8mm', finishes: ['Raw', 'Powder-coated', 'Galvanized'], customization: 'Available'}}, 50, ${supplierUser2.id}, TRUE),
          ('Ergonomic Office Chair - Executive Series', 'Premium ergonomic office chair with adjustable features and lumbar support.', 350, 'Office Supplies', 'Furniture', ${'["/uploads/products/office-chair-exec-1.jpg", "/uploads/products/office-chair-exec-2.jpg"]'}, ${{material: 'Mesh and Premium Leather', adjustability: 'Height, armrests, backrest, tilt', weight_capacity: '150 kg', warranty: '5 years'}}, 25, ${supplierUser.id}, TRUE),
          ('Server Rack - Enterprise Grade', '42U Enterprise-grade server rack with cooling and power management.', 2500, 'IT Equipment', 'Infrastructure', ${'["/uploads/products/server-rack-1.jpg", "/uploads/products/server-rack-2.jpg"]'}, ${{height: '42U', width: '600mm', depth: '1000mm', features: ['Cable management', 'Ventilation', 'Lockable doors']}}, 10, ${supplierUser2.id}, TRUE)
      `;
      console.log('Products seeded successfully');
    } else {
      console.log('Products already exist, skipping');
    }
    
    // Seed bids
    if (pumpsRfq && steelRfq && furnitureRfq) {
      console.log('Seeding bids...');
      const existingBids = await sql`SELECT * FROM bids LIMIT 1`;
      if (existingBids.length === 0) {
        await sql`
          INSERT INTO bids (rfq_id, supplier_id, amount, description, delivery_time, status, terms_of_service)
          VALUES 
            (${pumpsRfq.id}, ${supplierUser.id}, 32000, 'We can supply 50 high-quality industrial pumps at competitive prices.', '4 weeks', 'pending', 'Net 30 payment terms, 2-year warranty included.'),
            (${pumpsRfq.id}, ${supplierUser2.id}, 28500, 'Our industrial water pumps meet all specifications and include installation support.', '5 weeks', 'pending', 'Payment: 50% advance, 50% on delivery. 3-year warranty.'),
            (${steelRfq.id}, ${supplierUser2.id}, 12500, 'Comprehensive steel fabrication services with quality materials and expert craftsmanship.', '3 weeks', 'pending', 'Payment terms negotiable. All work guaranteed to meet specifications.'),
            (${furnitureRfq.id}, ${supplierUser.id}, 17500, 'Complete office furniture package with ergonomic designs and premium materials.', '2 weeks', 'pending', 'Free delivery and installation. Payment: Net 15.')
        `;
        console.log('Bids seeded successfully');
      } else {
        console.log('Bids already exist, skipping');
      }
      
      // Seed quotes (using the same data as bids but in quotes table for compatibility)
      console.log('Seeding quotes...');
      const existingQuotes = await sql`SELECT * FROM quotes LIMIT 1`;
      if (existingQuotes.length === 0) {
        await sql`
          INSERT INTO quotes (rfq_id, user_id, price, description, delivery_time, status, terms)
          VALUES 
            (${pumpsRfq.id}, ${supplierUser.id}, 32000, 'We can supply 50 high-quality industrial pumps at competitive prices.', '4 weeks', 'pending', 'Net 30 payment terms, 2-year warranty included.'),
            (${steelRfq.id}, ${supplierUser2.id}, 12500, 'Comprehensive steel fabrication services with quality materials and expert craftsmanship.', '3 weeks', 'pending', 'Payment terms negotiable. All work guaranteed to meet specifications.')
        `;
        console.log('Quotes seeded successfully');
      } else {
        console.log('Quotes already exist, skipping');
      }
    }
    
    // Seed contracts
    if (voiceRfq) {
      console.log('Seeding contracts...');
      const existingContracts = await sql`SELECT * FROM contracts LIMIT 1`;
      if (existingContracts.length === 0) {
        await sql`
          INSERT INTO contracts (title, rfq_id, buyer_id, supplier_id, amount, start_date, end_date, terms, status, documents, signatures)
          VALUES 
            ('Component Supply Agreement', ${voiceRfq.id}, ${buyerUser.id}, ${supplierUser.id}, 4800, ${new Date('2025-01-15')}, ${new Date('2025-07-15')}, 'Supplier to deliver 10 electronic components as specified in RFQ.', 'active', ${'[{"name": "Contract.pdf", "url": "/uploads/contracts/contract-v1.pdf"}, {"name": "Terms.pdf", "url": "/uploads/contracts/terms-v1.pdf"}]'}, ${{buyer: { signedAt: '2025-01-10', ip: '103.25.178.15' }, supplier: { signedAt: '2025-01-11', ip: '103.25.190.22' }}})  
        `;
        console.log('Contracts seeded successfully');
      } else {
        console.log('Contracts already exist, skipping');
      }
    }
    
    // Seed basic data for remaining tables to ensure they have columns
    console.log('Seeding remaining tables with basic data...');
    
    // Market data
    const existingMarketData = await sql`SELECT * FROM market_data LIMIT 1`;
    if (existingMarketData.length === 0) {
      await sql`
        INSERT INTO market_data (category, subcategory, price_index, supply_index, demand_index, time_period, region, data_source)
        VALUES 
          ('Industrial Equipment', 'Pumps', 105.2, 95.8, 110.5, 'Q2 2025', 'India', 'Bell24h Market Analysis'),
          ('Construction', 'Steel Fabrication', 112.7, 90.3, 118.2, 'Q2 2025', 'India', 'Bell24h Market Analysis')
      `;
    }
    
    // Market trends
    const existingMarketTrends = await sql`SELECT * FROM market_trends LIMIT 1`;
    if (existingMarketTrends.length === 0) {
      await sql`
        INSERT INTO market_trends (title, description, category, trend_type, impact, timeframe, source, confidence)
        VALUES 
          ('Rising Demand for Energy-Efficient Industrial Equipment', 'Market analysis shows increasing demand for energy-efficient industrial pumps and related equipment driven by sustainability initiatives across manufacturing sectors.', 'Industrial Equipment', 'demand', 'positive', 'long-term', 'Industry Reports & Bell24h Analytics', 0.85),
          ('Steel Price Volatility Affecting Construction Sector', 'Ongoing fluctuations in steel prices are creating challenges for construction projects and steel fabrication services.', 'Construction', 'price', 'negative', 'short-term', 'Commodity Markets & Bell24h Analytics', 0.78)
      `;
    }
    
    // Add basic data to other tables if they're empty
    const tables = ['suppliers', 'message_threads', 'messages', 'thread_participants', 'portfolio_items', 'wallet_transactions', 'buyer_profiles'];
    
    for (const table of tables) {
      const existing = await sql`SELECT * FROM ${sql(table)} LIMIT 1`;
      if (existing.length === 0) {
        console.log(`Ensuring table ${table} has columns...`);
        
        // Add at least one row of data based on table structure
        if (table === 'suppliers') {
          await sql`
            INSERT INTO suppliers (user_id, company_name, description)
            VALUES (${supplierUser.id}, 'Supplier Inc', 'Leading distributor of industrial equipment and parts.')
          `;
        } else if (table === 'message_threads') {
          await sql`
            INSERT INTO message_threads (title, status)
            VALUES ('General Discussion', 'active')
          `;
        } else if (table === 'buyer_profiles') {
          await sql`
            INSERT INTO buyer_profiles (user_id, procurement_policy)
            VALUES (${buyerUser.id}, 'Quality-focused with competitive pricing')
          `;
        }
        // Add other tables as needed
      }
    }
    
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await sql.end();
  }
}

// Run the database seeding
seedDatabase()
  .then(() => {
    console.log('Database seed completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database seed failed:', error);
    process.exit(1);
  });