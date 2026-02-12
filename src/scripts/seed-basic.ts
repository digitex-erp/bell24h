// File: src/scripts/seed-basic.ts
// Basic database seeder for Bell24h - Quick setup version
// Run this first to get basic data, then run comprehensive seeder for full dataset

import { PrismaClient, UserType, RfqStatus, QuoteStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CONFIG = {
  DEFAULT_PASSWORD: 'Test@123',
  SALT_ROUNDS: 10
};

async function seedBasic() {
  console.log('🌱 Starting basic database seed...');
  
  try {
    // 1. Create basic categories
    console.log('📂 Creating basic categories...');
    const categories = await createBasicCategories();
    
    // 2. Create sample users
    console.log('👥 Creating sample users...');
    const users = await createSampleUsers();
    
    // 3. Create sample RFQs
    console.log('📋 Creating sample RFQs...');
    const rfqs = await createSampleRFQs(users.filter(u => u.type === 'BUYER'), categories);
    
    // 4. Create sample quotes
    console.log('💰 Creating sample quotes...');
    await createSampleQuotes(users.filter(u => u.type === 'SUPPLIER'), rfqs);
    
    console.log('✅ Basic seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - RFQs: ${rfqs.length}`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Run: npm run db:seed:comprehensive (for full dataset)');
    console.log('   2. Login with test accounts:');
    console.log('      - buyer1@bell24h.com / Test@123');
    console.log('      - supplier1@bell24h.com / Test@123');
    
  } catch (error) {
    console.error('❌ Basic seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createBasicCategories() {
  const categories = [
    { name: 'Electronics & Electricals', slug: 'electronics', icon: '⚡', description: 'Electronic components and electrical equipment' },
    { name: 'Textiles & Apparel', slug: 'textiles', icon: '👕', description: 'Fabrics, garments, and textile machinery' },
    { name: 'Chemicals & Petrochemicals', slug: 'chemicals', icon: '🧪', description: 'Industrial chemicals and petrochemicals' },
    { name: 'Machinery & Equipment', slug: 'machinery', icon: '⚙️', description: 'Industrial machinery and manufacturing equipment' },
    { name: 'Construction & Building Materials', slug: 'construction', icon: '🏗️', description: 'Construction materials and building supplies' },
    { name: 'Automotive & Auto Parts', slug: 'automotive', icon: '🚗', description: 'Automotive components and vehicle parts' },
    { name: 'Agriculture & Food Products', slug: 'agriculture', icon: '🌾', description: 'Agricultural products and food items' },
    { name: 'Pharmaceuticals & Healthcare', slug: 'pharmaceuticals', icon: '💊', description: 'Pharmaceutical products and medical equipment' }
  ];

  const createdCategories = [];
  for (const categoryData of categories) {
    const category = await prisma.category.create({ data: categoryData });
    createdCategories.push(category);
  }
  
  return createdCategories;
}

async function createSampleUsers() {
  const users = [];
  
  // Create 2 sample buyers
  for (let i = 1; i <= 2; i++) {
    const buyer = await prisma.user.create({
      data: {
        email: `buyer${i}@bell24h.com`,
        phone: `+91800000000${i}`,
        password: await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, CONFIG.SALT_ROUNDS),
        name: `Test Buyer Company ${i}`,
        type: UserType.BUYER,
        companyName: `Test Buyer Company ${i}`,
        city: 'Mumbai',
        state: 'Maharashtra',
        gstNumber: `27AAAAA0000${i}A1Z5`,
        panNumber: `ABCDE1234${i}F`,
        verified: true,
        rating: 4.5,
        completedOrders: Math.floor(Math.random() * 50),
        description: 'Leading procurement company based in Mumbai, Maharashtra. Established buyer with 10+ years of experience.',
        address: `${i}00, Corporate Tower, Mumbai - 400001`,
        website: `https://www.testbuyer${i}.com`,
        establishedYear: 2010 + i,
        employeeCount: '51-200',
        annualTurnover: '5-25Cr',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    users.push(buyer);
  }
  
  // Create 3 sample suppliers
  for (let i = 1; i <= 3; i++) {
    const supplier = await prisma.user.create({
      data: {
        email: `supplier${i}@bell24h.com`,
        phone: `+91700000000${i}`,
        password: await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, CONFIG.SALT_ROUNDS),
        name: `Test Supplier Company ${i}`,
        type: UserType.SUPPLIER,
        companyName: `Test Supplier Company ${i}`,
        city: i === 1 ? 'Delhi' : i === 2 ? 'Bangalore' : 'Chennai',
        state: i === 1 ? 'Delhi' : i === 2 ? 'Karnataka' : 'Tamil Nadu',
        gstNumber: `27BBBBB0000${i}B1Z5`,
        panNumber: `FGHIJ5678${i}K`,
        verified: true,
        rating: 4.0 + (i * 0.3), // 4.0, 4.3, 4.6
        completedOrders: Math.floor(Math.random() * 100),
        totalRevenue: Math.floor(Math.random() * 10000000) + 1000000,
        description: `Leading manufacturing company based in ${i === 1 ? 'Delhi' : i === 2 ? 'Bangalore' : 'Chennai'}. Established supplier with 15+ years of experience.`,
        address: `${i}00, Industrial Area, ${i === 1 ? 'Delhi' : i === 2 ? 'Bangalore' : 'Chennai'} - ${i}0000${i}`,
        website: `https://www.testsupplier${i}.com`,
        establishedYear: 2005 + i,
        employeeCount: '11-50',
        annualTurnover: '1-5Cr',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    users.push(supplier);
  }
  
  return users;
}

async function createSampleRFQs(buyers: any[], categories: any[]) {
  const rfqs = [];
  const sampleProducts = [
    { name: 'Android Tablets', category: 'Electronics', unit: 'units', qty: '1000' },
    { name: 'Cotton Fabric', category: 'Textiles', unit: 'meters', qty: '5000' },
    { name: 'Industrial Chemicals', category: 'Chemicals', unit: 'kg', qty: '2000' },
    { name: 'Hydraulic Press', category: 'Machinery', unit: 'units', qty: '5' },
    { name: 'PVC Pipes', category: 'Construction', unit: 'meters', qty: '10000' },
    { name: 'Car Batteries', category: 'Automotive', unit: 'units', qty: '500' },
    { name: 'Rice', category: 'Agriculture', unit: 'metric tons', qty: '50' },
    { name: 'Pharmaceutical Raw Materials', category: 'Pharmaceuticals', unit: 'kg', qty: '500' }
  ];
  
  for (let i = 0; i < 5; i++) {
    const buyer = buyers[i % buyers.length];
    const product = sampleProducts[i];
    const category = categories.find(cat => cat.name.includes(product.category));
    
    const rfq = await prisma.rfq.create({
      data: {
        title: `Requirement for ${product.name} - ${product.qty} ${product.unit}`,
        description: `We are looking for reliable suppliers of ${product.name} for our ${buyer.companyName} operations.\n\nProduct Details:\n- Product: ${product.name}\n- Quantity Required: ${product.qty} ${product.unit}\n- Quality Standards: Industry standard/BIS/ISO certified\n- Packaging: Standard export packaging\n- Delivery Location: ${buyer.city}, ${buyer.state}\n- Preferred Delivery: Within 30 days`,
        categoryId: category.id,
        buyerId: buyer.id,
        quantity: product.qty,
        unit: product.unit,
        targetPrice: Math.floor(Math.random() * 100000) + 10000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        deliveryLocation: `${buyer.city}, ${buyer.state}`,
        status: RfqStatus.ACTIVE,
        specifications: `Technical specifications for ${product.name}:\n- Material: High quality industrial grade\n- Dimensions: Standard industry sizes\n- Weight: As per industry standards\n- Certification: ISO/BIS certified preferred\n- Packaging: Export quality packaging`,
        termsConditions: `Terms and Conditions:\n1. GST invoice mandatory\n2. Delivery within specified timeframe\n3. Quality assurance required\n4. Competitive pricing expected\n5. Payment terms: 30 days from invoice`,
        views: Math.floor(Math.random() * 50),
        quotesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    rfqs.push(rfq);
  }
  
  return rfqs;
}

async function createSampleQuotes(suppliers: any[], rfqs: any[]) {
  const quotes = [];
  
  for (let i = 0; i < 8; i++) {
    const rfq = rfqs[i % rfqs.length];
    const supplier = suppliers[i % suppliers.length];
    
    const unitPrice = Math.floor(rfq.targetPrice * (0.8 + Math.random() * 0.4));
    const totalPrice = unitPrice * parseInt(rfq.quantity);
    
    const quote = await prisma.quote.create({
      data: {
        rfqId: rfq.id,
        supplierId: supplier.id,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        quantity: rfq.quantity,
        deliveryTime: `${Math.floor(Math.random() * 20) + 10} days`,
        validityPeriod: '30 days',
        status: QuoteStatus.PENDING,
        termsConditions: `Our Quote Terms:\n1. Price: ₹${unitPrice.toLocaleString()} per ${rfq.unit}\n2. Total Value: ₹${totalPrice.toLocaleString()}\n3. Delivery: Within specified timeframe\n4. Payment Terms: 30 days from invoice\n5. Validity: 30 days from quote date`,
        specifications: 'Product Specifications:\n- Brand: Industry Standard\n- Quality: Premium Grade\n- Certification: ISO/BIS certified\n- Packaging: Export quality',
        notes: 'Special Notes:\n- Bulk order discounts available\n- Sample available on request\n- Technical support provided',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    quotes.push(quote);
    
    // Update RFQ quotes count
    await prisma.rfq.update({
      where: { id: rfq.id },
      data: { quotesCount: { increment: 1 } }
    });
  }
  
  return quotes;
}

// Run the basic seed
if (require.main === module) {
  seedBasic()
    .then(() => {
      console.log('🎉 Basic seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Basic seeding failed:', error);
      process.exit(1);
    });
}

export { seedBasic };