/**
 * Database Initialization Script for Bell24h
 * 
 * This script creates all necessary tables based on the schema,
 * sets up indexes, and adds some initial sample data.
 */

const { Pool } = require('@neondatabase/serverless');

// Create a PostgreSQL client
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initializeDatabase() {
  console.log('Starting database initialization...');

  try {
    // Create tables based on the schema
    console.log('Creating tables if they do not exist...');
    
    // Create users table
    await db.execute(`
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
    await db.execute(`
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
    await db.execute(`
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
    await db.execute(`
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
    await db.execute(`
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
    await db.execute(`
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
    await db.execute(`
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
    await db.execute(`
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
    await db.execute(`
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
    await db.execute(`
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
    await insertSampleData();

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    // Close the database connection
    await db.end();
  }
}

async function insertSampleData() {
  console.log('Inserting sample data...');

  try {
    // Check if users table is empty
    const [userCount] = await db.execute('SELECT COUNT(*) FROM users');
    
    if (parseInt(userCount.count) === 0) {
      console.log('Adding sample users...');
      
      // Insert sample users
      await db.insert(users).values([
        {
          username: 'buyer1',
          password: 'password123', // In a real app, this would be hashed
          email: 'buyer1@example.com',
          companyName: 'Tech Imports Ltd',
          location: 'Mumbai, India',
          industry: 'Electronics',
          gstNumber: '27AABCT3518Q1Z2',
          gstVerified: true,
          walletBalance: 10000,
          userType: 'buyer',
          companyWebsite: 'https://techimports.example.com',
          yearFounded: 2010,
          employeeCount: 85,
          contactPhone: '+91 9876543210',
          contactEmail: 'info@techimports.example.com'
        },
        {
          username: 'supplier1',
          password: 'password123', // In a real app, this would be hashed
          email: 'supplier1@example.com',
          companyName: 'Global Electronics Manufacturing',
          location: 'Shenzhen, China',
          industry: 'Electronics',
          gstNumber: '33AAACG7942R1Z5',
          gstVerified: true,
          walletBalance: 5000,
          userType: 'supplier',
          companyWebsite: 'https://gem-electronics.example.com',
          yearFounded: 2005,
          employeeCount: 250,
          contactPhone: '+86 1357924680',
          contactEmail: 'sales@gem-electronics.example.com'
        },
        {
          username: 'supplier2',
          password: 'password123', // In a real app, this would be hashed
          email: 'supplier2@example.com',
          companyName: 'Dubai Machinery Solutions',
          location: 'Dubai, UAE',
          industry: 'Machinery',
          gstNumber: '29AABFD4773J1ZP',
          gstVerified: true,
          walletBalance: 8000,
          userType: 'supplier',
          companyWebsite: 'https://dubai-machinery.example.com',
          yearFounded: 2008,
          employeeCount: 120,
          contactPhone: '+971 501234567',
          contactEmail: 'info@dubai-machinery.example.com'
        }
      ]);
      
      // Get user IDs
      const [buyer] = await db.select({ id: users.id }).from(users).where(users.username.equals('buyer1'));
      const [supplier1] = await db.select({ id: users.id }).from(users).where(users.username.equals('supplier1'));
      const [supplier2] = await db.select({ id: users.id }).from(users).where(users.username.equals('supplier2'));
      
      // Insert sample RFQs
      console.log('Adding sample RFQs...');
      await db.insert(rfqs).values([
        {
          referenceNumber: 'RFQ-2025-001',
          userId: buyer.id,
          title: 'Mobile Phone Components',
          description: 'Looking for suppliers of high-quality mobile phone components including camera modules, displays, and batteries.',
          quantity: '10,000 units each',
          deadline: new Date('2025-07-15'),
          category: 'Electronics',
          specifications: { 
            components: ['Camera modules', 'LCD displays', 'Batteries'],
            quality: 'Grade A',
            certification: 'ISO 9001'
          },
          rfqType: 'standard',
          status: 'open',
          matchSuccessRate: 85.5
        },
        {
          referenceNumber: 'RFQ-2025-002',
          userId: buyer.id,
          title: 'Industrial Packaging Machinery',
          description: 'Seeking suppliers for automated packaging machinery for food products with high throughput.',
          quantity: '2 units',
          deadline: new Date('2025-08-30'),
          category: 'Machinery',
          specifications: {
            type: 'Fully automated',
            capacity: '1000 units/hour',
            power: '3-phase, 440V'
          },
          rfqType: 'detailed',
          status: 'open',
          matchSuccessRate: 75.0
        }
      ]);
      
      // Get RFQ IDs
      const [rfq1] = await db.select({ id: rfqs.id }).from(rfqs).where(rfqs.referenceNumber.equals('RFQ-2025-001'));
      const [rfq2] = await db.select({ id: rfqs.id }).from(rfqs).where(rfqs.referenceNumber.equals('RFQ-2025-002'));
      
      // Insert sample supplier profiles
      console.log('Adding sample supplier profiles...');
      await db.insert(suppliers).values([
        {
          userId: supplier1.id,
          industry: 'Electronics',
          description: 'Leading manufacturer of electronic components with over 15 years of experience.',
          subIndustries: ['Mobile Components', 'Consumer Electronics', 'Circuit Boards'],
          products: { categories: ['Camera Modules', 'LCD Displays', 'Batteries', 'PCBs'] },
          serviceAreas: ['Asia', 'Europe', 'Middle East'],
          lateDeliveryRate: 3.5,
          complianceScore: 92.0,
          financialStability: 88.5,
          userFeedback: 4.7,
          riskScore: 15.0, // Lower is better
          certifications: ['ISO 9001', 'ISO 14001', 'ROHS Compliant'],
          manufacturingCapacity: '50,000 units per month',
          paymentTerms: '30% advance, 70% before shipping'
        },
        {
          userId: supplier2.id,
          industry: 'Machinery',
          description: 'Specialized in industrial machinery solutions for packaging, processing, and manufacturing.',
          subIndustries: ['Packaging Machinery', 'Food Processing Equipment', 'Industrial Automation'],
          products: { categories: ['Packaging Machines', 'Conveyors', 'Labeling Systems'] },
          serviceAreas: ['Middle East', 'Asia', 'Africa'],
          lateDeliveryRate: 5.2,
          complianceScore: 88.0,
          financialStability: 85.0,
          userFeedback: 4.5,
          riskScore: 18.5, // Lower is better
          certifications: ['ISO 9001', 'CE Certified'],
          manufacturingCapacity: '25 machines per month',
          paymentTerms: '40% advance, 30% in production, 30% before shipping'
        }
      ]);
      
      // Get supplier IDs
      const [supplierProfile1] = await db.select({ id: suppliers.id }).from(suppliers).where(suppliers.userId.equals(supplier1.id));
      const [supplierProfile2] = await db.select({ id: suppliers.id }).from(suppliers).where(suppliers.userId.equals(supplier2.id));
      
      // Insert sample bids
      console.log('Adding sample bids...');
      await db.insert(bids).values([
        {
          rfqId: rfq1.id,
          supplierId: supplierProfile1.id,
          price: 85000.00,
          deliveryDays: 45,
          message: 'We can provide high-quality components that meet all your specifications. Our production line is ready to start immediately upon confirmation.',
          status: 'pending',
          attachments: {
            documents: ['product_catalog.pdf', 'certification.pdf'],
            samples: ['sample_images.jpg']
          }
        },
        {
          rfqId: rfq2.id,
          supplierId: supplierProfile2.id,
          price: 120000.00,
          deliveryDays: 60,
          message: 'Our packaging machinery meets all your requirements and comes with a 2-year warranty. We also provide installation and training services.',
          status: 'pending',
          attachments: {
            documents: ['technical_specifications.pdf', 'warranty_terms.pdf'],
            videos: ['machinery_operation.mp4']
          }
        }
      ]);
      
      // Insert sample products
      console.log('Adding sample products...');
      await db.insert(products).values([
        {
          supplierId: supplierProfile1.id,
          name: 'High-Resolution Camera Module',
          description: 'Advanced 48MP camera module with auto-focus and low-light performance, ideal for premium smartphones and tablets.',
          category: 'Electronics',
          subcategory: 'Mobile Components',
          specifications: {
            resolution: '48 Megapixels',
            sensorSize: '1/2-inch',
            aperture: 'f/1.8',
            features: ['Auto-focus', 'OIS', 'Night mode']
          },
          certifications: ['RoHS', 'CE'],
          minimumOrderQuantity: '1,000 units',
          productionCapacity: '50,000 units per month',
          price: 12.50,
          priceUnit: 'per_piece',
          currency: 'USD',
          leadTime: '2-3 weeks',
          images: [
            'camera_module_front.jpg',
            'camera_module_side.jpg'
          ],
          status: 'active',
          customizable: true,
          sampleAvailable: true,
          origin: 'China'
        },
        {
          supplierId: supplierProfile1.id,
          name: 'Lithium Polymer Battery Pack',
          description: 'High-capacity 4000mAh lithium polymer battery with protection circuit, suitable for smartphones and tablets.',
          category: 'Electronics',
          subcategory: 'Power Components',
          specifications: {
            capacity: '4000mAh',
            voltage: '3.7V',
            chemistry: 'Lithium Polymer',
            features: ['Overcharge protection', 'Short circuit protection']
          },
          certifications: ['UL', 'CE', 'RoHS'],
          minimumOrderQuantity: '2,000 units',
          productionCapacity: '100,000 units per month',
          price: 8.75,
          priceUnit: 'per_piece',
          currency: 'USD',
          leadTime: '2 weeks',
          images: [
            'battery_pack.jpg',
            'battery_specs.jpg'
          ],
          status: 'active',
          customizable: true,
          sampleAvailable: true,
          origin: 'China'
        },
        {
          supplierId: supplierProfile2.id,
          name: 'Automatic Packaging Machine',
          description: 'Fully automatic packaging machine for food products with high throughput and precision.',
          category: 'Machinery',
          subcategory: 'Packaging Equipment',
          specifications: {
            type: 'Fully automatic',
            capacity: '1000 units/hour',
            power: '3-phase, 440V',
            dimensions: '2.5m x 1.5m x 2m'
          },
          certifications: ['ISO 9001', 'CE'],
          minimumOrderQuantity: '1 unit',
          productionCapacity: '10 units per month',
          price: 45000.00,
          priceUnit: 'per_piece',
          currency: 'USD',
          leadTime: '8-10 weeks',
          images: [
            'packaging_machine_front.jpg',
            'packaging_machine_operation.jpg'
          ],
          status: 'active',
          customizable: true,
          sampleAvailable: false,
          origin: 'UAE'
        }
      ]);
      
      // Insert sample portfolio items
      console.log('Adding sample portfolio items...');
      await db.insert(portfolioItems).values([
        {
          supplierId: supplierProfile1.id,
          title: 'Camera Module Supply for Major Smartphone Brand',
          description: 'Supplied custom-designed camera modules for a flagship smartphone series, meeting strict quality and timeline requirements.',
          category: 'Electronics',
          clientName: 'Major Smartphone Manufacturer',
          clientLocation: 'South Korea',
          projectValue: 1500000.00,
          completionDate: new Date('2024-12-15'),
          duration: 120,
          challenge: 'Designing a custom camera module with high resolution and low-light performance while maintaining a thin profile.',
          solution: 'Developed a proprietary lens system and optimized the sensor placement to achieve the required specifications.',
          results: 'Successfully delivered 2 million camera modules with a defect rate of less than 0.1%.',
          images: [
            'camera_project_1.jpg',
            'camera_project_2.jpg'
          ]
        },
        {
          supplierId: supplierProfile2.id,
          title: 'Automated Packaging Line for Food Company',
          description: 'Designed and installed a complete packaging line for a major food processing company, increasing their throughput by 150%.',
          category: 'Machinery',
          clientName: 'Premium Foods Inc.',
          clientLocation: 'Saudi Arabia',
          projectValue: 850000.00,
          completionDate: new Date('2024-09-20'),
          duration: 90,
          challenge: 'Integrating multiple packaging processes into a single automated line with minimal footprint.',
          solution: 'Custom-designed a vertical integration solution with smart control systems for seamless operation.',
          results: 'Increased packaging efficiency by 150% and reduced labor costs by 40%.',
          images: [
            'packaging_project_1.jpg',
            'packaging_project_2.jpg'
          ]
        }
      ]);
      
      // Insert sample market data
      console.log('Adding sample market data...');
      await db.insert(marketData).values([
        {
          industry: 'Electronics',
          subIndustry: 'Mobile Components',
          averagePrice: 15.75,
          priceVolatility: 3.2,
          supplyDemandRatio: 1.05,
          leadTime: 21,
          qualityIndex: 4.2,
          trendDirection: 'up',
          forecastedGrowth: 8.5,
          dataSource: 'Market Analysis',
          confidence: 85.0
        },
        {
          industry: 'Electronics',
          subIndustry: 'Consumer Electronics',
          averagePrice: 48.50,
          priceVolatility: 4.5,
          supplyDemandRatio: 0.95,
          leadTime: 28,
          qualityIndex: 4.0,
          trendDirection: 'stable',
          forecastedGrowth: 5.2,
          dataSource: 'Industry Reports',
          confidence: 80.0
        },
        {
          industry: 'Machinery',
          subIndustry: 'Packaging Equipment',
          averagePrice: 52000.00,
          priceVolatility: 2.8,
          supplyDemandRatio: 1.15,
          leadTime: 60,
          qualityIndex: 4.3,
          trendDirection: 'up',
          forecastedGrowth: 6.8,
          dataSource: 'Market Analysis',
          confidence: 82.0
        }
      ]);
      
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