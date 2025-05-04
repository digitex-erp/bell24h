/**
 * Database seed file for Bell24h
 */
import { db } from '.';
import {
  users, rfqs, quotes, products, suppliers, bids, contracts,
  market_data, market_trends, messages, message_threads,
  thread_participants, portfolio_items, wallet_transactions,
  buyer_profiles, user_roles
} from '../shared/schema';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Check if user roles exist
    const existingRoles = await db.query.user_roles.findMany();
    if (existingRoles.length === 0) {
      console.log('Seeding user roles...');
      
      // Seed roles
      await db.insert(user_roles).values([
        {
          name: 'admin',
          description: 'Administrator with full access',
          permissions: JSON.stringify(['all'])
        },
        {
          name: 'buyer',
          description: 'Can create RFQs and receive quotes',
          permissions: JSON.stringify(['create:rfq', 'view:quotes', 'manage:contracts'])
        },
        {
          name: 'supplier',
          description: 'Can respond to RFQs with quotes',
          permissions: JSON.stringify(['create:quotes', 'view:rfqs', 'manage:products'])
        },
        {
          name: 'guest',
          description: 'Limited access to view public information',
          permissions: JSON.stringify(['view:public'])
        }
      ]);
    } else {
      console.log(`Found ${existingRoles.length} existing user roles, skipping role seeding`);
    }

    // Check if users exist
    const existingUsers = await db.query.users.findMany();
    if (existingUsers.length === 0) {
      console.log('Seeding users...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Seed demo users
      await db.insert(users).values([
        {
          username: 'admin1',
          email: 'admin@bell24h.com',
          password: hashedPassword,
          fullName: 'Admin User',
          businessName: 'Bell24h Administration',
          businessType: 'Platform',
          role: 'admin',
          gstNumber: 'ADMIN1234567Z',
          businessAddress: 'Bell24h HQ, Bangalore',
          phone: '+91 9876543210',
          isVerified: true,
          walletBalance: 100000,
          kycStatus: 'verified',
          preferences: JSON.stringify({notifications: true, language: 'en'})
        },
        {
          username: 'buyer1',
          email: 'buyer1@example.com',
          password: hashedPassword,
          fullName: 'Demo Buyer',
          businessName: 'Buyer Company',
          businessType: 'Manufacturer',
          role: 'buyer',
          gstNumber: 'BUYER1234567Z',
          businessAddress: '123 Buyer St, Mumbai',
          phone: '+91 9876543211',
          isVerified: true,
          walletBalance: 50000,
          kycStatus: 'verified',
          preferences: JSON.stringify({notifications: true, language: 'en'})
        },
        {
          username: 'supplier1',
          email: 'supplier1@example.com',
          password: hashedPassword,
          fullName: 'Demo Supplier',
          businessName: 'Supplier Inc',
          businessType: 'Distributor',
          role: 'supplier',
          gstNumber: 'SUPPL1234567Z',
          businessAddress: '456 Supplier Ave, Delhi',
          phone: '+91 9876543212',
          isVerified: true,
          walletBalance: 25000,
          kycStatus: 'verified',
          preferences: JSON.stringify({notifications: true, language: 'hi'})
        },
        {
          username: 'buyer2',
          email: 'buyer2@example.com',
          password: hashedPassword,
          fullName: 'Second Buyer',
          businessName: 'Procurement Ltd',
          businessType: 'Retailer',
          role: 'buyer',
          gstNumber: 'BUYER2234567Z',
          businessAddress: '789 Business Blvd, Chennai',
          phone: '+91 9876543213',
          isVerified: true,
          walletBalance: 35000,
          kycStatus: 'verified',
          preferences: JSON.stringify({notifications: true, language: 'en'})
        },
        {
          username: 'supplier2',
          email: 'supplier2@example.com',
          password: hashedPassword,
          fullName: 'Second Supplier',
          businessName: 'Manufacturing Co',
          businessType: 'Manufacturer',
          role: 'supplier',
          gstNumber: 'SUPPL2234567Z',
          businessAddress: '101 Factory Rd, Hyderabad',
          phone: '+91 9876543214',
          isVerified: true,
          walletBalance: 40000,
          kycStatus: 'verified',
          preferences: JSON.stringify({notifications: true, language: 'en'})
        }
      ]);
    } else {
      console.log(`Found ${existingUsers.length} existing users, skipping user seeding`);
    }
    
    // Get seeded users for reference
    const seededUsers = await db.query.users.findMany();
    const adminUser = seededUsers.find(user => user.role === 'admin');
    const buyerUser = seededUsers.find(user => user.role === 'buyer' && user.username === 'buyer1');
    const buyerUser2 = seededUsers.find(user => user.role === 'buyer' && user.username === 'buyer2');
    const supplierUser = seededUsers.find(user => user.role === 'supplier' && user.username === 'supplier1');
    const supplierUser2 = seededUsers.find(user => user.role === 'supplier' && user.username === 'supplier2');
    
    if (!buyerUser || !supplierUser) {
      console.log('Required user roles not found, skipping further seeding');
      return;
    }

    // Seed buyer profiles
    const existingBuyerProfiles = await db.query.buyer_profiles.findMany();
    if (existingBuyerProfiles.length === 0) {
      console.log('Seeding buyer profiles...');
      await db.insert(buyer_profiles).values([
        {
          userId: buyerUser.id,
          companyDetails: JSON.stringify({
            founded: 2010,
            employees: '50-100',
            website: 'https://buyer-company.example.com',
            locations: ['Mumbai', 'Pune']
          }),
          procurementPolicy: 'Quality-focused with competitive pricing',
          preferredPaymentTerms: 'Net 30',
          preferredSupplierCriteria: JSON.stringify([
            'ISO Certified',
            'On-time delivery track record',
            'Quality assurance processes'
          ]),
          annualProcurementBudget: 5000000,
          industryFocus: JSON.stringify(['Manufacturing', 'Industrial Equipment'])
        },
        {
          userId: buyerUser2.id,
          companyDetails: JSON.stringify({
            founded: 2015,
            employees: '100-500',
            website: 'https://procurement-ltd.example.com',
            locations: ['Chennai', 'Bangalore']
          }),
          procurementPolicy: 'Cost-effective solutions with sustainability focus',
          preferredPaymentTerms: 'Net 45',
          preferredSupplierCriteria: JSON.stringify([
            'Environmental certifications',
            'Local suppliers',
            'Innovative solutions'
          ]),
          annualProcurementBudget: 10000000,
          industryFocus: JSON.stringify(['Retail', 'Consumer Goods'])
        }
      ]);
    } else {
      console.log(`Found ${existingBuyerProfiles.length} existing buyer profiles, skipping buyer profile seeding`);
    }

    // Seed supplier profiles
    const existingSuppliers = await db.query.suppliers.findMany();
    if (existingSuppliers.length === 0) {
      console.log('Seeding supplier profiles...');
      await db.insert(suppliers).values([
        {
          userId: supplierUser.id,
          companyName: 'Supplier Inc',
          description: 'Leading distributor of industrial equipment and parts.',
          logo: '/uploads/logos/supplier-inc.png',
          website: 'https://supplier-inc.example.com',
          establishedYear: 2005,
          employeeCount: 75,
          annualRevenue: '$5M - $10M',
          certifications: JSON.stringify([
            { name: 'ISO 9001', year: 2018 },
            { name: 'ISO 14001', year: 2019 }
          ]),
          categories: JSON.stringify(['Industrial Equipment', 'Machinery Parts', 'Electrical Components']),
          rating: 4.7,
          isVerified: true
        },
        {
          userId: supplierUser2.id,
          companyName: 'Manufacturing Co',
          description: 'Custom manufacturing solutions for various industries.',
          logo: '/uploads/logos/manufacturing-co.png',
          website: 'https://manufacturing-co.example.com',
          establishedYear: 2000,
          employeeCount: 150,
          annualRevenue: '$10M - $50M',
          certifications: JSON.stringify([
            { name: 'ISO 9001', year: 2015 },
            { name: 'CE Marking', year: 2016 }
          ]),
          categories: JSON.stringify(['Custom Manufacturing', 'Steel Products', 'Fabrication Services']),
          rating: 4.5,
          isVerified: true
        }
      ]);
    } else {
      console.log(`Found ${existingSuppliers.length} existing suppliers, skipping supplier seeding`);
    }
    
    // Check if RFQs exist
    const existingRfqs = await db.query.rfqs.findMany();
    if (existingRfqs.length === 0) {
      console.log('Seeding RFQs...');
      
      // Seed demo RFQs
      await db.insert(rfqs).values([
        {
          title: 'Industrial Pumps Supply',
          description: 'Looking for 50 industrial water pumps for a new manufacturing facility.',
          quantity: 50,
          budget: '$25,000 - $35,000',
          deadline: new Date('2025-06-30'),
          status: 'open',
          category: 'Industrial Equipment',
          subcategory: 'Pumps',
          tags: JSON.stringify(['water pumps', 'industrial', 'manufacturing']),
          requirements: 'Must meet ISO 9001 standards and include a 2-year warranty.',
          visibility: 'public',
          userId: buyerUser.id
        },
        {
          title: 'Steel Fabrication Services',
          description: 'Need a supplier for custom steel fabrication for construction project.',
          quantity: 1,
          budget: '$10,000 - $15,000',
          deadline: new Date('2025-07-15'),
          status: 'open',
          category: 'Construction',
          subcategory: 'Steel Fabrication',
          tags: JSON.stringify(['steel', 'fabrication', 'construction']),
          requirements: 'Experience with large-scale commercial projects required.',
          visibility: 'public',
          userId: buyerUser.id
        },
        {
          title: 'Voice RFQ Test',
          description: 'This is a test RFQ created via voice recording.',
          quantity: 10,
          budget: '$5,000',
          status: 'pending',
          category: 'Electronics',
          subcategory: 'Components',
          voiceUrl: '/uploads/audio/sample-voice-rfq.mp3',
          originalLanguage: 'hi', // Hindi
          visibility: 'public',
          userId: buyerUser.id
        },
        {
          title: 'Office Furniture Procurement',
          description: 'Seeking supplier for complete office furniture package including desks, chairs, and storage units.',
          quantity: 25,
          budget: '$15,000 - $20,000',
          deadline: new Date('2025-08-15'),
          status: 'open',
          category: 'Office Supplies',
          subcategory: 'Furniture',
          tags: JSON.stringify(['office furniture', 'desks', 'chairs', 'corporate']),
          requirements: 'Ergonomic design, consistent style, quick delivery timeline.',
          visibility: 'public',
          userId: buyerUser2.id
        },
        {
          title: 'IT Infrastructure Setup',
          description: 'Looking for complete IT infrastructure solution including servers, networking, and workstations.',
          quantity: 1,
          budget: '$50,000 - $75,000',
          deadline: new Date('2025-09-30'),
          status: 'open',
          category: 'IT Equipment',
          subcategory: 'Infrastructure',
          tags: JSON.stringify(['IT', 'servers', 'networking', 'infrastructure']),
          requirements: 'Must include installation, configuration, and 1-year support.',
          visibility: 'public',
          userId: buyerUser2.id
        }
      ]);
    } else {
      console.log(`Found ${existingRfqs.length} existing RFQs, skipping RFQ seeding`);
    }
    
    // Get seeded RFQs for reference
    const seededRfqs = await db.query.rfqs.findMany();
    
    // Check if quotes/bids exist
    const existingBids = await db.query.bids.findMany();
    if (existingBids.length === 0 && seededRfqs.length > 0) {
      console.log('Seeding bids...');
      
      // Get RFQs for bids
      const pumpsRfq = seededRfqs.find(rfq => rfq.title === 'Industrial Pumps Supply');
      const steelRfq = seededRfqs.find(rfq => rfq.title === 'Steel Fabrication Services');
      const furnitureRfq = seededRfqs.find(rfq => rfq.title === 'Office Furniture Procurement');
      
      if (pumpsRfq && steelRfq && furnitureRfq) {
        // Seed demo bids
        await db.insert(bids).values([
          {
            rfqId: pumpsRfq.id,
            supplierId: supplierUser.id,
            amount: 32000,
            description: 'We can supply 50 high-quality industrial pumps at competitive prices.',
            deliveryTime: '4 weeks',
            status: 'pending',
            termsOfService: 'Net 30 payment terms, 2-year warranty included.'
          },
          {
            rfqId: pumpsRfq.id,
            supplierId: supplierUser2.id,
            amount: 28500,
            description: 'Our industrial water pumps meet all specifications and include installation support.',
            deliveryTime: '5 weeks',
            status: 'pending',
            termsOfService: 'Payment: 50% advance, 50% on delivery. 3-year warranty.'
          },
          {
            rfqId: steelRfq.id,
            supplierId: supplierUser2.id,
            amount: 12500,
            description: 'Comprehensive steel fabrication services with quality materials and expert craftsmanship.',
            deliveryTime: '3 weeks',
            status: 'pending',
            termsOfService: 'Payment terms negotiable. All work guaranteed to meet specifications.'
          },
          {
            rfqId: furnitureRfq.id,
            supplierId: supplierUser.id,
            amount: 17500,
            description: 'Complete office furniture package with ergonomic designs and premium materials.',
            deliveryTime: '2 weeks',
            status: 'pending',
            termsOfService: 'Free delivery and installation. Payment: Net 15.'
          }
        ]);
      }
    } else {
      console.log(`Found ${existingBids.length} existing bids, skipping bid seeding`);
    }

    // Ensure quotes also exist (using the same data as bids but in the quotes table)
    const existingQuotes = await db.query.quotes.findMany();
    if (existingQuotes.length === 0 && seededRfqs.length > 0) {
      console.log('Seeding quotes...');
      
      // Get RFQs for quotes
      const pumpsRfq = seededRfqs.find(rfq => rfq.title === 'Industrial Pumps Supply');
      const steelRfq = seededRfqs.find(rfq => rfq.title === 'Steel Fabrication Services');
      
      if (pumpsRfq && steelRfq) {
        // Seed demo quotes (same as bids but in quotes table)
        await db.insert(quotes).values([
          {
            rfqId: pumpsRfq.id,
            userId: supplierUser.id,
            price: 32000,
            description: 'We can supply 50 high-quality industrial pumps at competitive prices.',
            deliveryTime: '4 weeks',
            status: 'pending',
            terms: 'Net 30 payment terms, 2-year warranty included.'
          },
          {
            rfqId: steelRfq.id,
            userId: supplierUser2.id,
            price: 12500,
            description: 'Comprehensive steel fabrication services with quality materials and expert craftsmanship.',
            deliveryTime: '3 weeks',
            status: 'pending',
            terms: 'Payment terms negotiable. All work guaranteed to meet specifications.'
          }
        ]);
      }
    } else {
      console.log(`Found ${existingQuotes.length} existing quotes, skipping quote seeding`);
    }

    // Seed products
    const existingProducts = await db.query.products.findMany();
    if (existingProducts.length === 0) {
      console.log('Seeding products...');
      await db.insert(products).values([
        {
          name: 'Industrial Water Pump - Model XP500',
          description: 'High-capacity industrial water pump suitable for manufacturing and processing applications.',
          price: 750,
          category: 'Industrial Equipment',
          subcategory: 'Pumps',
          images: JSON.stringify([
            '/uploads/products/pump-xp500-1.jpg',
            '/uploads/products/pump-xp500-2.jpg'
          ]),
          specifications: JSON.stringify({
            capacity: '500 gallons per minute',
            power: '5 HP',
            material: 'Stainless Steel',
            warranty: '2 years'
          }),
          inventory: 35,
          userId: supplierUser.id,
          isActive: true
        },
        {
          name: 'Steel Framework Components - Commercial Grade',
          description: 'Custom steel fabrication components for commercial construction projects.',
          price: 1200,
          category: 'Construction',
          subcategory: 'Steel Fabrication',
          images: JSON.stringify([
            '/uploads/products/steel-framework-1.jpg',
            '/uploads/products/steel-framework-2.jpg'
          ]),
          specifications: JSON.stringify({
            material: 'Galvanized Steel',
            thickness: '5-8mm',
            finishes: ['Raw', 'Powder-coated', 'Galvanized'],
            customization: 'Available'
          }),
          inventory: 50,
          userId: supplierUser2.id,
          isActive: true
        },
        {
          name: 'Ergonomic Office Chair - Executive Series',
          description: 'Premium ergonomic office chair with adjustable features and lumbar support.',
          price: 350,
          category: 'Office Supplies',
          subcategory: 'Furniture',
          images: JSON.stringify([
            '/uploads/products/office-chair-exec-1.jpg',
            '/uploads/products/office-chair-exec-2.jpg'
          ]),
          specifications: JSON.stringify({
            material: 'Mesh and Premium Leather',
            adjustability: 'Height, armrests, backrest, tilt',
            weight_capacity: '150 kg',
            warranty: '5 years'
          }),
          inventory: 25,
          userId: supplierUser.id,
          isActive: true
        },
        {
          name: 'Server Rack - Enterprise Grade',
          description: '42U Enterprise-grade server rack with cooling and power management.',
          price: 2500,
          category: 'IT Equipment',
          subcategory: 'Infrastructure',
          images: JSON.stringify([
            '/uploads/products/server-rack-1.jpg',
            '/uploads/products/server-rack-2.jpg'
          ]),
          specifications: JSON.stringify({
            height: '42U',
            width: '600mm',
            depth: '1000mm',
            features: ['Cable management', 'Ventilation', 'Lockable doors']
          }),
          inventory: 10,
          userId: supplierUser2.id,
          isActive: true
        }
      ]);
    } else {
      console.log(`Found ${existingProducts.length} existing products, skipping product seeding`);
    }

    // Seed contracts
    const existingContracts = await db.query.contracts.findMany();
    if (existingContracts.length === 0) {
      console.log('Seeding contracts...');
      const completedRfq = seededRfqs.find(rfq => rfq.title.includes('Voice RFQ Test'));
      if (completedRfq) {
        await db.insert(contracts).values([
          {
            title: 'Component Supply Agreement',
            rfqId: completedRfq.id,
            buyerId: buyerUser.id,
            supplierId: supplierUser.id,
            amount: 4800,
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-07-15'), 
            terms: 'Supplier to deliver 10 electronic components as specified in RFQ.',
            status: 'active',
            documents: JSON.stringify([
              { name: 'Contract.pdf', url: '/uploads/contracts/contract-v1.pdf' },
              { name: 'Terms.pdf', url: '/uploads/contracts/terms-v1.pdf' }
            ]),
            signatures: JSON.stringify({
              buyer: { signedAt: '2025-01-10', ip: '103.25.178.15' },
              supplier: { signedAt: '2025-01-11', ip: '103.25.190.22' }
            })
          }
        ]);
      }
    } else {
      console.log(`Found ${existingContracts.length} existing contracts, skipping contract seeding`);
    }

    // Seed messaging infrastructure
    const existingThreads = await db.query.message_threads.findMany();
    if (existingThreads.length === 0) {
      console.log('Seeding message threads...');
      
      // Create a general thread and an RFQ-specific thread
      await db.insert(message_threads).values([
        {
          title: 'General Discussion',
          status: 'active'
        },
        {
          title: 'Regarding Pumps RFQ',
          rfqId: seededRfqs.find(rfq => rfq.title.includes('Pumps'))?.id,
          status: 'active'
        }
      ]);
      
      // Get the created threads
      const threads = await db.query.message_threads.findMany();
      const generalThread = threads.find(thread => thread.title === 'General Discussion');
      const rfqThread = threads.find(thread => thread.title.includes('Pumps'));
      
      if (generalThread && rfqThread) {
        // Add participants to threads
        await db.insert(thread_participants).values([
          {
            threadId: generalThread.id,
            userId: buyerUser.id,
            isActive: true,
            role: 'member',
            lastReadAt: new Date()
          },
          {
            threadId: generalThread.id,
            userId: supplierUser.id,
            isActive: true,
            role: 'member',
            lastReadAt: new Date()
          },
          {
            threadId: rfqThread.id,
            userId: buyerUser.id,
            isActive: true,
            role: 'owner',
            lastReadAt: new Date()
          },
          {
            threadId: rfqThread.id,
            userId: supplierUser.id,
            isActive: true,
            role: 'member',
            lastReadAt: new Date()
          }
        ]);
        
        // Add messages to the threads
        await db.insert(messages).values([
          {
            senderId: buyerUser.id,
            receiverId: supplierUser.id,
            threadId: generalThread.id,
            content: 'Hello! I would like to discuss potential business opportunities.',
            isRead: true
          },
          {
            senderId: supplierUser.id,
            receiverId: buyerUser.id,
            threadId: generalThread.id,
            content: 'Hi there! We would be happy to discuss how we can meet your needs.',
            isRead: true
          },
          {
            senderId: buyerUser.id,
            receiverId: supplierUser.id,
            threadId: rfqThread.id,
            content: 'I have a few questions about your bid for the industrial pumps.',
            isRead: false
          },
          {
            senderId: supplierUser.id,
            receiverId: buyerUser.id,
            threadId: rfqThread.id,
            content: 'Of course! Please let me know your questions and I will address them promptly.',
            isRead: false
          }
        ]);
      }
    } else {
      console.log(`Found ${existingThreads.length} existing message threads, skipping message thread seeding`);
    }

    // Seed portfolio items
    const existingPortfolioItems = await db.query.portfolio_items.findMany();
    if (existingPortfolioItems.length === 0) {
      console.log('Seeding portfolio items...');
      await db.insert(portfolio_items).values([
        {
          userId: supplierUser.id,
          title: 'Water Treatment Plant Supply',
          description: 'Supplied industrial pumps and equipment for a major water treatment facility.',
          category: 'Industrial Equipment',
          images: JSON.stringify([
            '/uploads/portfolio/water-treatment-1.jpg',
            '/uploads/portfolio/water-treatment-2.jpg'
          ]),
          details: JSON.stringify({
            client: 'Municipal Water Authority',
            year: 2023,
            value: '$1.2M',
            scope: 'Equipment supply and installation support'
          }),
          isPublic: true
        },
        {
          userId: supplierUser2.id,
          title: 'Commercial Building Steel Framework',
          description: 'Provided custom steel fabrication for a 12-story commercial building.',
          category: 'Construction',
          images: JSON.stringify([
            '/uploads/portfolio/commercial-building-1.jpg',
            '/uploads/portfolio/commercial-building-2.jpg'
          ]),
          details: JSON.stringify({
            client: 'Prestige Constructions',
            year: 2024,
            value: '$850K',
            scope: 'Design, fabrication, and delivery of steel framework components'
          }),
          isPublic: true
        }
      ]);
    } else {
      console.log(`Found ${existingPortfolioItems.length} existing portfolio items, skipping portfolio item seeding`);
    }

    // Seed wallet transactions
    const existingTransactions = await db.query.wallet_transactions.findMany();
    if (existingTransactions.length === 0) {
      console.log('Seeding wallet transactions...');
      await db.insert(wallet_transactions).values([
        {
          userId: buyerUser.id,
          amount: 25000,
          type: 'credit',
          status: 'completed',
          reference: 'DEPOSIT-001',
          description: 'Initial account funding'
        },
        {
          userId: buyerUser.id,
          amount: 4800,
          type: 'debit',
          status: 'completed',
          reference: 'CONTRACT-001',
          description: 'Payment for electronic components contract'
        },
        {
          userId: supplierUser.id,
          amount: 4800,
          type: 'credit',
          status: 'completed',
          reference: 'CONTRACT-001',
          description: 'Payment received for electronic components contract'
        },
        {
          userId: supplierUser.id,
          amount: 1500,
          type: 'debit',
          status: 'completed',
          reference: 'PAYOUT-001',
          description: 'Withdrawal to bank account'
        }
      ]);
    } else {
      console.log(`Found ${existingTransactions.length} existing wallet transactions, skipping transaction seeding`);
    }

    // Seed market data
    const existingMarketData = await db.query.market_data.findMany();
    if (existingMarketData.length === 0) {
      console.log('Seeding market data...');
      await db.insert(market_data).values([
        {
          category: 'Industrial Equipment',
          subcategory: 'Pumps',
          priceIndex: 105.2,
          supplyIndex: 95.8,
          demandIndex: 110.5,
          timePeriod: 'Q2 2025',
          region: 'India',
          dataSource: 'Bell24h Market Analysis',
          metadata: JSON.stringify({
            sampleSize: 250,
            confidenceLevel: 0.95,
            lastUpdated: '2025-04-15'
          })
        },
        {
          category: 'Construction',
          subcategory: 'Steel Fabrication',
          priceIndex: 112.7,
          supplyIndex: 90.3,
          demandIndex: 118.2,
          timePeriod: 'Q2 2025',
          region: 'India',
          dataSource: 'Bell24h Market Analysis',
          metadata: JSON.stringify({
            sampleSize: 180,
            confidenceLevel: 0.95,
            lastUpdated: '2025-04-20'
          })
        }
      ]);
    } else {
      console.log(`Found ${existingMarketData.length} existing market data entries, skipping market data seeding`);
    }

    // Seed market trends
    const existingMarketTrends = await db.query.market_trends.findMany();
    if (existingMarketTrends.length === 0) {
      console.log('Seeding market trends...');
      await db.insert(market_trends).values([
        {
          title: 'Rising Demand for Energy-Efficient Industrial Equipment',
          description: 'Market analysis shows increasing demand for energy-efficient industrial pumps and related equipment driven by sustainability initiatives across manufacturing sectors.',
          category: 'Industrial Equipment',
          trendType: 'demand',
          impact: 'positive',
          timeframe: 'long-term',
          source: 'Industry Reports & Bell24h Analytics',
          confidence: 0.85,
          data: JSON.stringify({
            demandGrowth: '15% YoY',
            priceImpact: '+5% premium for energy-efficient models',
            topRegions: ['Maharashtra', 'Gujarat', 'Tamil Nadu']
          })
        },
        {
          title: 'Steel Price Volatility Affecting Construction Sector',
          description: 'Ongoing fluctuations in steel prices are creating challenges for construction projects and steel fabrication services.',
          category: 'Construction',
          trendType: 'price',
          impact: 'negative',
          timeframe: 'short-term',
          source: 'Commodity Markets & Bell24h Analytics',
          confidence: 0.78,
          data: JSON.stringify({
            priceVolatility: '±8% in last quarter',
            supplyConstraints: 'Moderate',
            riskFactors: ['International trade policies', 'Transportation costs', 'Raw material shortages']
          })
        }
      ]);
    } else {
      console.log(`Found ${existingMarketTrends.length} existing market trends, skipping market trend seeding`);
    }
    
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => {
    console.log('Database seeded successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
