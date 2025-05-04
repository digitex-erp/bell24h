import { db } from './index';
import { 
  users, rfqs, suppliers, quotes, wallets, transactions, invoices, marketInsights,
  supplierMetrics, supplierAttributes, supplierRecommendations, historicalMatches,
  milestonePayments
} from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Seed the database with initial data
 * 
 * Includes sample data for supplier metrics, attributes, recommendations and historical matches
 */
async function seed() {
  console.log('🌱 Seeding database...');
  
  try {
    // Check if we already have users
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('Database already has users. Skipping user seed.');
      return;
    }
    
    // Create test users
    console.log('Creating users...');
    const [buyer] = await db.insert(users).values({
      username: 'buyer',
      password: 'password', // In a real app, this would be hashed
      fullName: 'Alex Johnson',
      email: 'buyer@example.com',
      role: 'buyer',
      company: 'TechInnovate Solutions',
      location: 'Bangalore, India'
    }).returning();
    
    const [supplier1] = await db.insert(users).values({
      username: 'supplier1',
      password: 'password', // In a real app, this would be hashed
      fullName: 'Sarah Miller',
      email: 'supplier1@example.com',
      role: 'supplier',
      company: 'TechPro Solutions',
      location: 'Mumbai, India'
    }).returning();
    
    const [supplier2] = await db.insert(users).values({
      username: 'supplier2',
      password: 'password', // In a real app, this would be hashed
      fullName: 'Rahul Sharma',
      email: 'supplier2@example.com',
      role: 'supplier',
      company: 'ElectroIndia Components',
      location: 'Pune, India'
    }).returning();
    
    console.log('Creating supplier profiles...');
    const [techProSolutions] = await db.insert(suppliers).values({
      userId: supplier1.id,
      companyName: 'TechPro Solutions',
      description: 'Leading provider of automation and electronic components with global certifications',
      location: 'Mumbai, India',
      categories: ['Electronics', 'Automation', 'IoT'],
      verified: true,
      riskScore: 1.5,
      riskGrade: 'A+'
    }).returning();
    
    const [electroIndiaComponents] = await db.insert(suppliers).values({
      userId: supplier2.id,
      companyName: 'ElectroIndia Components',
      description: 'Specialized in industrial electronic components with 15+ years experience',
      location: 'Pune, India',
      categories: ['Electronics', 'Industrial'],
      verified: true,
      riskScore: 1.8,
      riskGrade: 'A'
    }).returning();
    
    console.log('Creating RFQs...');
    const [rfq1] = await db.insert(rfqs).values({
      title: 'Industrial Automation Components',
      description: 'Looking for PLC controllers and HMI panels for a factory automation project',
      category: 'Electronics',
      userId: buyer.id,
      status: 'active',
      type: 'text',
      quantity: 15,
      budget: 50000,
      deadline: new Date('2025-05-15')
    }).returning();
    
    const [rfq2] = await db.insert(rfqs).values({
      title: 'Office Furniture Procurement',
      description: 'Need ergonomic chairs and adjustable desks for new office setup',
      category: 'Furniture',
      userId: buyer.id,
      status: 'active',
      type: 'text',
      quantity: 30,
      budget: 150000,
      deadline: new Date('2025-05-30')
    }).returning();
    
    console.log('Creating quotes...');
    await db.insert(quotes).values({
      rfqId: rfq1.id,
      supplierId: techProSolutions.id,
      price: 48000,
      description: 'High-quality PLC controllers and HMI panels with 2-year warranty',
      deliveryTime: 15, // days
      matchScore: 4.8,
      matchFactors: {
        expertise: 0.9,
        location: 0.85,
        pricing: 0.8,
        delivery: 0.85,
        reputation: 0.9
      },
      status: 'pending'
    });
    
    await db.insert(quotes).values({
      rfqId: rfq1.id,
      supplierId: electroIndiaComponents.id,
      price: 45000,
      description: 'Industrial-grade automation components with technical support',
      deliveryTime: 18, // days
      matchScore: 4.5,
      matchFactors: {
        expertise: 0.85,
        location: 0.8,
        pricing: 0.9,
        delivery: 0.8,
        reputation: 0.85
      },
      status: 'pending'
    });
    
    console.log('Creating wallets...');
    const [buyerWallet] = await db.insert(wallets).values({
      userId: buyer.id,
      balance: '100000', // ₹1,00,000
      escrowBalance: '50000' // ₹50,000
    }).returning();
    
    const [supplier1Wallet] = await db.insert(wallets).values({
      userId: supplier1.id,
      balance: '75000', // ₹75,000
      escrowBalance: '0' // ₹0
    }).returning();
    
    const [supplier2Wallet] = await db.insert(wallets).values({
      userId: supplier2.id,
      balance: '60000', // ₹60,000
      escrowBalance: '0' // ₹0
    }).returning();
    
    console.log('Creating transactions...');
    await db.insert(transactions).values({
      walletId: buyerWallet.id,
      amount: '100000',
      type: 'deposit',
      status: 'completed',
      description: 'Initial deposit'
    });
    
    await db.insert(transactions).values({
      walletId: buyerWallet.id,
      amount: '50000',
      type: 'escrow',
      status: 'completed',
      description: 'Escrow payment for Industrial Automation Components'
    });
    
    await db.insert(transactions).values({
      walletId: supplier1Wallet.id,
      amount: '75000',
      type: 'deposit',
      status: 'completed',
      description: 'Initial deposit'
    });
    
    await db.insert(transactions).values({
      walletId: supplier2Wallet.id,
      amount: '60000',
      type: 'deposit',
      status: 'completed',
      description: 'Initial deposit'
    });
    
    console.log('Creating invoices...');
    await db.insert(invoices).values({
      supplierId: techProSolutions.id,
      buyerId: buyer.id,
      amount: '48000',
      dueDate: new Date('2025-06-15'),
      status: 'pending'
    });
    
    console.log('Creating market insights...');
    await db.insert(marketInsights).values({
      category: 'Electronics',
      priceChange: 0.05,
      supplyStatus: 'Limited',
      forecastPeriod: 'Q2 2025',
      data: {
        trends: [
          { month: 'Jan', price: 100 },
          { month: 'Feb', price: 102 },
          { month: 'Mar', price: 103 },
          { month: 'Apr', price: 105 }
        ],
        suppliers: 215,
        avgDeliveryTime: 18
      }
    });
    
    await db.insert(marketInsights).values({
      category: 'Industrial',
      priceChange: -0.02,
      supplyStatus: 'Stable',
      forecastPeriod: 'Q2 2025',
      data: {
        trends: [
          { month: 'Jan', price: 100 },
          { month: 'Feb', price: 99 },
          { month: 'Mar', price: 98 },
          { month: 'Apr', price: 98 }
        ],
        suppliers: 180,
        avgDeliveryTime: 22
      }
    });
    
    // Creating supplier metrics
    console.log('Creating supplier metrics...');
    await db.insert(supplierMetrics).values({
      supplierId: techProSolutions.id,
      responseTime: 6.5, // Average response time in hours
      acceptanceRate: 85.0, // Percentage of accepted quotes
      completionRate: 96.5, // Percentage of completed orders
      onTimeDelivery: 92.0, // Percentage of on-time deliveries
      qualityRating: 4.8, // Average quality rating (1-5)
      communicationRating: 4.7, // Average communication rating (1-5)
      priceCompetitiveness: -5.2, // Price comparison against market average (negative is better)
      similarRfqCount: 28, // Count of RFQs in similar categories
    });

    await db.insert(supplierMetrics).values({
      supplierId: electroIndiaComponents.id,
      responseTime: 8.2, // Average response time in hours
      acceptanceRate: 78.0, // Percentage of accepted quotes
      completionRate: 94.0, // Percentage of completed orders
      onTimeDelivery: 88.0, // Percentage of on-time deliveries
      qualityRating: 4.6, // Average quality rating (1-5)
      communicationRating: 4.3, // Average communication rating (1-5)
      priceCompetitiveness: -7.8, // Price comparison against market average (negative is better)
      similarRfqCount: 22, // Count of RFQs in similar categories
    });
    
    // Creating supplier attributes
    console.log('Creating supplier attributes...');
    await db.insert(supplierAttributes).values({
      supplierId: techProSolutions.id,
      certifications: ['ISO 9001', 'ISO 14001', 'CE', 'RoHS'],
      manufacturingCapacity: 15000, // Monthly capacity units
      minOrderValue: 10000, // Minimum order value accepted
      maxOrderValue: 2000000, // Maximum order value accepted
      sustainabilityScore: 85, // 0-100 score for sustainability practices
      yearsInBusiness: 12, // Number of years the supplier has been in business
      employeeCount: 250, // Number of employees
      specializations: ['Automation Controls', 'IoT Devices', 'Industrial HMI'],
      industries: ['Manufacturing', 'Automotive', 'Pharmaceuticals'],
      preferredCategories: ['Electronics', 'Automation', 'IoT'],
    });

    await db.insert(supplierAttributes).values({
      supplierId: electroIndiaComponents.id,
      certifications: ['ISO 9001', 'ISO 27001', 'RoHS'],
      manufacturingCapacity: 12000, // Monthly capacity units
      minOrderValue: 5000, // Minimum order value accepted
      maxOrderValue: 1500000, // Maximum order value accepted
      sustainabilityScore: 72, // 0-100 score for sustainability practices
      yearsInBusiness: 15, // Number of years the supplier has been in business
      employeeCount: 180, // Number of employees
      specializations: ['Electronic Components', 'PCB Assembly', 'Industrial Controls'],
      industries: ['Manufacturing', 'Electronics', 'Energy'],
      preferredCategories: ['Electronics', 'Industrial'],
    });
    
    // Creating supplier recommendations
    console.log('Creating supplier recommendations...');
    await db.insert(supplierRecommendations).values({
      rfqId: rfq1.id,
      supplierId: techProSolutions.id,
      matchScore: 92.5, // 0-100 matching score 
      matchReason: "Strong match based on category expertise and previous performance",
      matchFactors: [
        {
          factor: "category_match",
          weight: 40,
          score: 100,
          explanation: "Direct category match with 'Electronics'"
        },
        {
          factor: "performance_metrics",
          weight: 20,
          score: 92,
          explanation: "Performance score: 92/100 based on response time, acceptance rate, on-time delivery, and quality"
        },
        {
          factor: "location_advantage",
          weight: 10,
          score: 70,
          explanation: "Located in the same country for faster delivery"
        },
        {
          factor: "verification_status",
          weight: 10,
          score: 100,
          explanation: "Supplier is verified"
        },
        {
          factor: "similar_rfq_experience",
          weight: 20,
          score: 85,
          explanation: "Supplier has extensive experience with similar RFQs"
        }
      ],
      recommended: true,
      contacted: true,
      responded: true,
    });

    await db.insert(supplierRecommendations).values({
      rfqId: rfq1.id,
      supplierId: electroIndiaComponents.id,
      matchScore: 87.0, // 0-100 matching score 
      matchReason: "Good match based on competitive pricing and relevant experience",
      matchFactors: [
        {
          factor: "category_match",
          weight: 40,
          score: 100,
          explanation: "Direct category match with 'Electronics'"
        },
        {
          factor: "performance_metrics",
          weight: 20,
          score: 86,
          explanation: "Performance score: 86/100 based on response time, acceptance rate, on-time delivery, and quality"
        },
        {
          factor: "location_advantage",
          weight: 10,
          score: 70,
          explanation: "Located in the same country for faster delivery"
        },
        {
          factor: "verification_status",
          weight: 10,
          score: 100,
          explanation: "Supplier is verified"
        },
        {
          factor: "similar_rfq_experience",
          weight: 20,
          score: 70,
          explanation: "Supplier has good experience with similar RFQs"
        }
      ],
      recommended: true,
      contacted: true,
      responded: true,
    });
    
    // Creating historical matches
    console.log('Creating historical matches...');
    await db.insert(historicalMatches).values({
      rfqId: rfq1.id,
      supplierId: techProSolutions.id,
      originalMatchScore: 92.5,
      wasSuccessful: true,
      buyerFeedback: 5, // 5-star rating
      supplierFeedback: 5, // 5-star rating
      feedbackNotes: "Perfect match, excellent supplier communication and product quality",
      completedAt: new Date('2025-03-15'),
    });

    // Creating milestone payments
    console.log('Creating milestone payments...');
    await db.insert(milestonePayments).values({
      rfqId: rfq1.id,
      supplierId: techProSolutions.id,
      userId: buyer.id,
      amount: 15000, // First milestone payment - 15,000
      milestoneNumber: 1,
      milestoneTotal: 3,
      milestonePercent: 30, // 30% of total contract value
      title: "Project Initiation and Design",
      description: "Initial payment for design phase and procurement of materials",
      status: "released",
      approvalDate: new Date('2025-03-10'),
      releaseDate: new Date('2025-03-15'),
      razorpayPaymentId: "pay_mock123initiation",
      contractId: "contract001",
      contractAddress: "0x1234567890abcdef1234567890abcdef12345678"
    });

    await db.insert(milestonePayments).values({
      rfqId: rfq1.id,
      supplierId: techProSolutions.id,
      userId: buyer.id,
      amount: 20000, // Second milestone payment - 20,000
      milestoneNumber: 2,
      milestoneTotal: 3,
      milestonePercent: 40, // 40% of total contract value
      title: "Component Assembly and Testing",
      description: "Payment for assembly of components and initial testing phase",
      status: "approved",
      approvalDate: new Date('2025-04-10'),
      releaseDate: null,
      razorpayPaymentId: "pay_mock123assembly",
      contractId: "contract001",
      contractAddress: "0x1234567890abcdef1234567890abcdef12345678"
    });

    await db.insert(milestonePayments).values({
      rfqId: rfq1.id,
      supplierId: techProSolutions.id,
      userId: buyer.id,
      amount: 15000, // Third milestone payment - 15,000
      milestoneNumber: 3,
      milestoneTotal: 3,
      milestonePercent: 30, // 30% of total contract value
      title: "Final Delivery and Acceptance",
      description: "Final payment upon successful deployment and acceptance testing",
      status: "pending",
      approvalDate: null,
      releaseDate: null,
      razorpayPaymentId: null,
      contractId: "contract001",
      contractAddress: "0x1234567890abcdef1234567890abcdef12345678"
    });
    
    // Create milestone payment for the second supplier
    await db.insert(milestonePayments).values({
      rfqId: rfq2.id,
      supplierId: electroIndiaComponents.id,
      userId: buyer.id,
      amount: 75000, // First milestone payment - 75,000 (50% of 150,000)
      milestoneNumber: 1,
      milestoneTotal: 2,
      milestonePercent: 50, // 50% of total contract value
      title: "Initial Office Furniture Delivery",
      description: "Payment for the first batch of ergonomic chairs and desks",
      status: "pending",
      approvalDate: null,
      releaseDate: null,
      razorpayPaymentId: null,
      contractId: "contract002",
      contractAddress: "0x2345678901abcdef2345678901abcdef23456789"
    });
    
    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  }
}

// Run the seed function
seed().catch(console.error);