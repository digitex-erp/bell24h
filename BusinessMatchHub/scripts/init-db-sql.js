/**
 * Database Initialization Script for Bell24h
 * 
 * This script creates all necessary tables based on the schema,
 * sets up indexes, and adds some initial sample data using direct SQL.
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Create a PostgreSQL client
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function initializeDatabase() {
  console.log('Starting database initialization...');
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Create tables based on the schema
    console.log('Creating tables if they do not exist...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        company_name TEXT NOT NULL,
        location TEXT,
        industry TEXT,
        gst_number TEXT,
        gst_verified BOOLEAN,
        wallet_balance NUMERIC(10, 2) DEFAULT 0,
        user_type TEXT NOT NULL,
        profile_picture TEXT,
        company_logo TEXT,
        company_website TEXT,
        year_founded INTEGER,
        employee_count INTEGER,
        annual_revenue NUMERIC(14, 2),
        contact_phone TEXT,
        contact_email TEXT,
        social_profiles JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create rfqs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rfqs (
        id SERIAL PRIMARY KEY,
        reference_number TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        quantity TEXT NOT NULL,
        deadline TIMESTAMP WITH TIME ZONE NOT NULL,
        category TEXT NOT NULL,
        specifications JSONB,
        rfq_type TEXT NOT NULL,
        media_url TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        match_success_rate NUMERIC(5, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create suppliers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        industry TEXT NOT NULL,
        description TEXT,
        sub_industries JSONB,
        products JSONB,
        service_areas JSONB,
        late_delivery_rate NUMERIC(5, 2),
        compliance_score NUMERIC(5, 2),
        financial_stability NUMERIC(5, 2),
        user_feedback NUMERIC(5, 2),
        risk_score NUMERIC(5, 2),
        certifications JSONB,
        manufacturing_capacity TEXT,
        payment_terms TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create bids table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        rfq_id INTEGER NOT NULL,
        supplier_id INTEGER NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        delivery_days INTEGER NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        attachments JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        rfq_id INTEGER,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create wallet_transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        status TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create contracts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        rfq_id INTEGER NOT NULL,
        bid_id INTEGER NOT NULL,
        supplier_id INTEGER NOT NULL,
        buyer_id INTEGER NOT NULL,
        total_value NUMERIC(10, 2) NOT NULL,
        status TEXT NOT NULL,
        milestones JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create market_data table
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_data (
        id SERIAL PRIMARY KEY,
        industry TEXT NOT NULL,
        sub_industry TEXT,
        average_price NUMERIC(10, 2),
        price_volatility NUMERIC(5, 2),
        supply_demand_ratio NUMERIC(5, 2),
        lead_time INTEGER,
        quality_index NUMERIC(5, 2),
        trend_direction TEXT,
        forecasted_growth NUMERIC(5, 2),
        data_source TEXT,
        confidence NUMERIC(5, 2),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        specifications JSONB,
        certifications JSONB,
        minimum_order_quantity TEXT,
        production_capacity TEXT,
        price NUMERIC(10, 2),
        price_unit TEXT,
        currency TEXT,
        lead_time TEXT,
        images JSONB,
        status TEXT,
        customizable BOOLEAN DEFAULT false,
        sample_available BOOLEAN DEFAULT false,
        origin TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create portfolio_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        client_name TEXT,
        client_location TEXT,
        project_value NUMERIC(10, 2),
        completion_date DATE,
        duration INTEGER,
        challenge TEXT,
        solution TEXT,
        results TEXT,
        images JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('All tables created successfully.');

    // Add some sample data
    await insertSampleData(client);

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database initialization completed successfully.');
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    // Release client
    client.release();
  }
}

async function insertSampleData(client) {
  console.log('Inserting sample data...');

  try {
    // Check if users table is empty
    const userCountResult = await client.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(userCountResult.rows[0].count) === 0) {
      console.log('Adding sample users...');
      
      // Insert buyer user
      const buyerInsertResult = await client.query(`
        INSERT INTO users (
          username, password, email, company_name, location, industry, 
          gst_number, gst_verified, wallet_balance, user_type, 
          company_website, year_founded, employee_count, 
          contact_phone, contact_email
        ) VALUES (
          'buyer1', 'password123', 'buyer1@example.com', 
          'Tech Imports Ltd', 'Mumbai, India', 'Electronics',
          '27AABCT3518Q1Z2', true, 10000, 'buyer',
          'https://techimports.example.com', 2010, 85,
          '+91 9876543210', 'info@techimports.example.com'
        ) RETURNING id
      `);
      const buyerId = buyerInsertResult.rows[0].id;
      
      // Insert supplier1
      const supplier1InsertResult = await client.query(`
        INSERT INTO users (
          username, password, email, company_name, location, industry, 
          gst_number, gst_verified, wallet_balance, user_type, 
          company_website, year_founded, employee_count, 
          contact_phone, contact_email
        ) VALUES (
          'supplier1', 'password123', 'supplier1@example.com', 
          'Global Electronics Manufacturing', 'Shenzhen, China', 'Electronics',
          '33AAACG7942R1Z5', true, 5000, 'supplier',
          'https://gem-electronics.example.com', 2005, 250,
          '+86 1357924680', 'sales@gem-electronics.example.com'
        ) RETURNING id
      `);
      const supplier1Id = supplier1InsertResult.rows[0].id;
      
      // Insert supplier2
      const supplier2InsertResult = await client.query(`
        INSERT INTO users (
          username, password, email, company_name, location, industry, 
          gst_number, gst_verified, wallet_balance, user_type, 
          company_website, year_founded, employee_count, 
          contact_phone, contact_email
        ) VALUES (
          'supplier2', 'password123', 'supplier2@example.com', 
          'Dubai Machinery Solutions', 'Dubai, UAE', 'Machinery',
          '29AABFD4773J1ZP', true, 8000, 'supplier',
          'https://dubai-machinery.example.com', 2008, 120,
          '+971 501234567', 'info@dubai-machinery.example.com'
        ) RETURNING id
      `);
      const supplier2Id = supplier2InsertResult.rows[0].id;
      
      // Insert sample RFQs
      console.log('Adding sample RFQs...');
      const rfq1InsertResult = await client.query(`
        INSERT INTO rfqs (
          reference_number, user_id, title, description, 
          quantity, deadline, category, specifications, 
          rfq_type, status, match_success_rate
        ) VALUES (
          'RFQ-2025-001', $1, 'Mobile Phone Components', 
          'Looking for suppliers of high-quality mobile phone components including camera modules, displays, and batteries.',
          '10,000 units each', '2025-07-15', 'Electronics', 
          $2, 'standard', 'open', 85.5
        ) RETURNING id
      `, [
        buyerId, 
        JSON.stringify({
          components: ['Camera modules', 'LCD displays', 'Batteries'],
          quality: 'Grade A',
          certification: 'ISO 9001'
        })
      ]);
      const rfq1Id = rfq1InsertResult.rows[0].id;
      
      const rfq2InsertResult = await client.query(`
        INSERT INTO rfqs (
          reference_number, user_id, title, description, 
          quantity, deadline, category, specifications, 
          rfq_type, status, match_success_rate
        ) VALUES (
          'RFQ-2025-002', $1, 'Industrial Packaging Machinery', 
          'Seeking suppliers for automated packaging machinery for food products with high throughput.',
          '2 units', '2025-08-30', 'Machinery', 
          $2, 'detailed', 'open', 75.0
        ) RETURNING id
      `, [
        buyerId, 
        JSON.stringify({
          type: 'Fully automated',
          capacity: '1000 units/hour',
          power: '3-phase, 440V'
        })
      ]);
      const rfq2Id = rfq2InsertResult.rows[0].id;
      
      // Insert sample supplier profiles
      console.log('Adding sample supplier profiles...');
      const supplier1ProfileResult = await client.query(`
        INSERT INTO suppliers (
          user_id, industry, description, sub_industries, products, 
          service_areas, late_delivery_rate, compliance_score, 
          financial_stability, user_feedback, risk_score, 
          certifications, manufacturing_capacity, payment_terms
        ) VALUES (
          $1, 'Electronics', 
          'Leading manufacturer of electronic components with over 15 years of experience.',
          $2, $3, $4, 3.5, 92.0, 88.5, 4.7, 15.0, $5,
          '50,000 units per month', '30% advance, 70% before shipping'
        ) RETURNING id
      `, [
        supplier1Id,
        JSON.stringify(['Mobile Components', 'Consumer Electronics', 'Circuit Boards']),
        JSON.stringify({ categories: ['Camera Modules', 'LCD Displays', 'Batteries', 'PCBs'] }),
        JSON.stringify(['Asia', 'Europe', 'Middle East']),
        JSON.stringify(['ISO 9001', 'ISO 14001', 'ROHS Compliant'])
      ]);
      const supplier1ProfileId = supplier1ProfileResult.rows[0].id;
      
      const supplier2ProfileResult = await client.query(`
        INSERT INTO suppliers (
          user_id, industry, description, sub_industries, products, 
          service_areas, late_delivery_rate, compliance_score, 
          financial_stability, user_feedback, risk_score, 
          certifications, manufacturing_capacity, payment_terms
        ) VALUES (
          $1, 'Machinery', 
          'Specialized in industrial machinery solutions for packaging, processing, and manufacturing.',
          $2, $3, $4, 5.2, 88.0, 85.0, 4.5, 18.5, $5,
          '25 machines per month', '40% advance, 30% in production, 30% before shipping'
        ) RETURNING id
      `, [
        supplier2Id,
        JSON.stringify(['Packaging Machinery', 'Food Processing Equipment', 'Industrial Automation']),
        JSON.stringify({ categories: ['Packaging Machines', 'Conveyors', 'Labeling Systems'] }),
        JSON.stringify(['Middle East', 'Asia', 'Africa']),
        JSON.stringify(['ISO 9001', 'CE Certified'])
      ]);
      const supplier2ProfileId = supplier2ProfileResult.rows[0].id;
      
      // Insert sample bids
      console.log('Adding sample bids...');
      await client.query(`
        INSERT INTO bids (
          rfq_id, supplier_id, price, delivery_days, message, status, attachments
        ) VALUES (
          $1, $2, 85000.00, 45, 
          'We can provide high-quality components that meet all your specifications. Our production line is ready to start immediately upon confirmation.',
          'pending', $3
        )
      `, [
        rfq1Id,
        supplier1ProfileId,
        JSON.stringify({
          documents: ['product_catalog.pdf', 'certification.pdf'],
          samples: ['sample_images.jpg']
        })
      ]);
      
      await client.query(`
        INSERT INTO bids (
          rfq_id, supplier_id, price, delivery_days, message, status, attachments
        ) VALUES (
          $1, $2, 120000.00, 60, 
          'Our packaging machinery meets all your requirements and comes with a 2-year warranty. We also provide installation and training services.',
          'pending', $3
        )
      `, [
        rfq2Id,
        supplier2ProfileId,
        JSON.stringify({
          documents: ['technical_specifications.pdf', 'warranty_terms.pdf'],
          videos: ['machinery_operation.mp4']
        })
      ]);
      
      // Insert sample products
      console.log('Adding sample products...');
      await client.query(`
        INSERT INTO products (
          supplier_id, name, description, category, subcategory,
          specifications, certifications, minimum_order_quantity,
          production_capacity, price, price_unit, currency, lead_time,
          images, status, customizable, sample_available, origin
        ) VALUES (
          $1, 'High-Resolution Camera Module', 
          'Advanced 48MP camera module with auto-focus and low-light performance, ideal for premium smartphones and tablets.',
          'Electronics', 'Mobile Components',
          $2, $3, '1,000 units', '50,000 units per month',
          12.50, 'per_piece', 'USD', '2-3 weeks',
          $4, 'active', true, true, 'China'
        )
      `, [
        supplier1ProfileId,
        JSON.stringify({
          resolution: '48 Megapixels',
          sensorSize: '1/2-inch',
          aperture: 'f/1.8',
          features: ['Auto-focus', 'OIS', 'Night mode']
        }),
        JSON.stringify(['RoHS', 'CE']),
        JSON.stringify([
          'camera_module_front.jpg',
          'camera_module_side.jpg'
        ])
      ]);
      
      await client.query(`
        INSERT INTO products (
          supplier_id, name, description, category, subcategory,
          specifications, certifications, minimum_order_quantity,
          production_capacity, price, price_unit, currency, lead_time,
          images, status, customizable, sample_available, origin
        ) VALUES (
          $1, 'Lithium Polymer Battery Pack', 
          'High-capacity 4000mAh lithium polymer battery with protection circuit, suitable for smartphones and tablets.',
          'Electronics', 'Power Components',
          $2, $3, '2,000 units', '100,000 units per month',
          8.75, 'per_piece', 'USD', '2 weeks',
          $4, 'active', true, true, 'China'
        )
      `, [
        supplier1ProfileId,
        JSON.stringify({
          capacity: '4000mAh',
          voltage: '3.7V',
          chemistry: 'Lithium Polymer',
          features: ['Overcharge protection', 'Short circuit protection']
        }),
        JSON.stringify(['UL', 'CE', 'RoHS']),
        JSON.stringify([
          'battery_pack.jpg',
          'battery_specs.jpg'
        ])
      ]);
      
      await client.query(`
        INSERT INTO products (
          supplier_id, name, description, category, subcategory,
          specifications, certifications, minimum_order_quantity,
          production_capacity, price, price_unit, currency, lead_time,
          images, status, customizable, sample_available, origin
        ) VALUES (
          $1, 'Automatic Packaging Machine', 
          'Fully automatic packaging machine for food products with high throughput and precision.',
          'Machinery', 'Packaging Equipment',
          $2, $3, '1 unit', '10 units per month',
          45000.00, 'per_piece', 'USD', '8-10 weeks',
          $4, 'active', true, false, 'UAE'
        )
      `, [
        supplier2ProfileId,
        JSON.stringify({
          type: 'Fully automatic',
          capacity: '1000 units/hour',
          power: '3-phase, 440V',
          dimensions: '2.5m x 1.5m x 2m'
        }),
        JSON.stringify(['ISO 9001', 'CE']),
        JSON.stringify([
          'packaging_machine_front.jpg',
          'packaging_machine_operation.jpg'
        ])
      ]);
      
      // Insert sample portfolio items
      console.log('Adding sample portfolio items...');
      await client.query(`
        INSERT INTO portfolio_items (
          supplier_id, title, description, category,
          client_name, client_location, project_value, completion_date,
          duration, challenge, solution, results, images
        ) VALUES (
          $1, 'Camera Module Supply for Major Smartphone Brand', 
          'Supplied custom-designed camera modules for a flagship smartphone series, meeting strict quality and timeline requirements.',
          'Electronics', 'Major Smartphone Manufacturer', 'South Korea',
          1500000.00, '2024-12-15', 120,
          'Designing a custom camera module with high resolution and low-light performance while maintaining a thin profile.',
          'Developed a proprietary lens system and optimized the sensor placement to achieve the required specifications.',
          'Successfully delivered 2 million camera modules with a defect rate of less than 0.1%.',
          $2
        )
      `, [
        supplier1ProfileId,
        JSON.stringify([
          'camera_project_1.jpg',
          'camera_project_2.jpg'
        ])
      ]);
      
      await client.query(`
        INSERT INTO portfolio_items (
          supplier_id, title, description, category,
          client_name, client_location, project_value, completion_date,
          duration, challenge, solution, results, images
        ) VALUES (
          $1, 'Automated Packaging Line for Food Company', 
          'Designed and installed a complete packaging line for a major food processing company, increasing their throughput by 150%.',
          'Machinery', 'Premium Foods Inc.', 'Saudi Arabia',
          850000.00, '2024-09-20', 90,
          'Integrating multiple packaging processes into a single automated line with minimal footprint.',
          'Custom-designed a vertical integration solution with smart control systems for seamless operation.',
          'Increased packaging efficiency by 150% and reduced labor costs by 40%.',
          $2
        )
      `, [
        supplier2ProfileId,
        JSON.stringify([
          'packaging_project_1.jpg',
          'packaging_project_2.jpg'
        ])
      ]);
      
      // Insert sample market data
      console.log('Adding sample market data...');
      await client.query(`
        INSERT INTO market_data (
          industry, sub_industry, average_price, price_volatility,
          supply_demand_ratio, lead_time, quality_index, trend_direction,
          forecasted_growth, data_source, confidence
        ) VALUES (
          'Electronics', 'Mobile Components', 15.75, 3.2,
          1.05, 21, 4.2, 'up', 8.5, 'Market Analysis', 85.0
        )
      `);
      
      await client.query(`
        INSERT INTO market_data (
          industry, sub_industry, average_price, price_volatility,
          supply_demand_ratio, lead_time, quality_index, trend_direction,
          forecasted_growth, data_source, confidence
        ) VALUES (
          'Electronics', 'Consumer Electronics', 48.50, 4.5,
          0.95, 28, 4.0, 'stable', 5.2, 'Industry Reports', 80.0
        )
      `);
      
      await client.query(`
        INSERT INTO market_data (
          industry, sub_industry, average_price, price_volatility,
          supply_demand_ratio, lead_time, quality_index, trend_direction,
          forecasted_growth, data_source, confidence
        ) VALUES (
          'Machinery', 'Packaging Equipment', 52000.00, 2.8,
          1.15, 60, 4.3, 'up', 6.8, 'Market Analysis', 82.0
        )
      `);
      
      console.log('Sample data added successfully');
    } else {
      console.log('Sample data already exists. Skipping insertion.');
    }
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database setup completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });