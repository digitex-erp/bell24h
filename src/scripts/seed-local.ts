// Local SQLite seed script for testing
// This version works with local SQLite database

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CONFIG = {
  SUPPLIERS_COUNT: 50,
  BUYERS_COUNT: 20,
  RFQS_COUNT: 30,
  QUOTES_COUNT: 50,
  MESSAGES_COUNT: 100,
  CATEGORIES_COUNT: 50,
  PAYMENTS_COUNT: 25,
};

async function seedLocalDatabase() {
  console.log('🌱 Starting LOCAL database seed for Bell24h...');
  
  try {
    // 1. Create 50 supplier accounts
    console.log('🧑‍💼 Creating 50 suppliers...');
    const suppliers = await createSuppliers();
    
    // 2. Create 20 buyer accounts
    console.log('👥 Creating 20 buyers...');
    const buyers = await createBuyers();
    
    // 3. Create 50 categories
    console.log('📂 Creating 50 product categories...');
    const categories = await createCategories();
    
    // 4. Create 30 RFQs
    console.log('📋 Creating 30 RFQs...');
    const rfqs = await createRFQs(buyers, categories);
    
    // 5. Create 50 quotes
    console.log('💰 Creating 50 quotes...');
    await createQuotes(suppliers, rfqs);
    
    // 6. Create 100 messages
    console.log('💬 Creating 100 messages...');
    await createMessages(buyers, suppliers, rfqs);
    
    // 7. Create 25 payments
    console.log('💳 Creating 25 payments...');
    await createPayments(buyers, suppliers, rfqs);
    
    console.log('✅ LOCAL Database seeded successfully!');
    
    // Show summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   • Suppliers: ${suppliers.length}`);
    console.log(`   • Buyers: ${buyers.length}`);
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • RFQs: ${rfqs.length}`);
    console.log(`   • Quotes: 50`);
    console.log(`   • Messages: 100`);
    console.log(`   • Payments: 25`);
    
    console.log('\n📝 Test Accounts Ready:');
    console.log('   • Buyers: buyer1@bell24h.com to buyer20@bell24h.com (password: Test@123)');
    console.log('   • Suppliers: supplier1@bell24h.com to supplier50@bell24h.com (password: Test@123)');
    
  } catch (error) {
    console.error('❌ LOCAL Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createSuppliers() {
  const suppliers = [];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Ahmedabad', 'Kolkata', 'Surat', 'Jaipur'];
  const industries = ['Electronics', 'Textiles', 'Chemicals', 'Machinery', 'Agriculture', 'Automotive', 'Construction', 'Pharmaceuticals'];
  const companyTypes = ['Metal Works Pvt Ltd', 'Electronics Corporation', 'Trading Company', 'Manufacturing Ltd', 'Industries', 'Enterprises', 'Solutions Pvt Ltd'];
  
  for (let i = 1; i <= CONFIG.SUPPLIERS_COUNT; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const type = companyTypes[Math.floor(Math.random() * companyTypes.length)];
    
    const supplier = await prisma.user.create({
      data: {
        email: `supplier${i}@bell24h.com`,
        phone: `+91${9000000000 + i}`,
        name: `${city} ${industry} ${type}`,
        type: 'SUPPLIER',
        companyName: `${city} ${industry} ${type}`,
        city: city,
        state: getStateForCity(city),
        gstNumber: `27${String(Math.floor(Math.random() * 90000) + 10000)}${String(Math.floor(Math.random() * 900000) + 100000)}${String(Math.floor(Math.random() * 9) + 1)}Z`,
        panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9000) + 1000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9) + 1)}`,
        verified: Math.random() > 0.3, // 70% verified
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 stars
        completedOrders: Math.floor(Math.random() * 101), // 0-100 orders
        password: await bcrypt.hash('Test@123', 10),
      }
    });
    suppliers.push(supplier);
  }
  return suppliers;
}

async function createBuyers() {
  const buyers = [];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Ahmedabad', 'Kolkata', 'Surat', 'Jaipur'];
  const companyTypes = ['Trading Company', 'Retail Chain', 'Manufacturing Ltd', 'Distribution Co', 'Procurement Solutions'];
  
  for (let i = 1; i <= CONFIG.BUYERS_COUNT; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const type = companyTypes[Math.floor(Math.random() * companyTypes.length)];
    
    const buyer = await prisma.user.create({
      data: {
        email: `buyer${i}@bell24h.com`,
        phone: `+91${8000000000 + i}`,
        name: `${city} ${type}`,
        type: 'BUYER',
        companyName: `${city} ${type}`,
        city: city,
        state: getStateForCity(city),
        gstNumber: `27${String(Math.floor(Math.random() * 90000) + 10000)}${String(Math.floor(Math.random() * 900000) + 100000)}${String(Math.floor(Math.random() * 9) + 1)}Z`,
        panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9000) + 1000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9) + 1)}`,
        verified: Math.random() > 0.2, // 80% verified
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 stars
        completedOrders: Math.floor(Math.random() * 50), // 0-50 orders
        password: await bcrypt.hash('Test@123', 10),
      }
    });
    buyers.push(buyer);
  }
  return buyers;
}

async function createCategories() {
  const categories = [
    { name: 'Agriculture & Food Products', slug: 'agriculture', icon: '🌾' },
    { name: 'Electronics & Electricals', slug: 'electronics', icon: '⚡' },
    { name: 'Textiles & Apparel', slug: 'textiles', icon: '👕' },
    { name: 'Chemicals & Petrochemicals', slug: 'chemicals', icon: '🧪' },
    { name: 'Machinery & Equipment', slug: 'machinery', icon: '⚙️' },
    { name: 'Automotive & Spare Parts', slug: 'automotive', icon: '🚗' },
    { name: 'Construction Materials', slug: 'construction', icon: '🏗️' },
    { name: 'Pharmaceuticals & Healthcare', slug: 'pharma', icon: '💊' },
    { name: 'Metals & Minerals', slug: 'metals', icon: '🔩' },
    { name: 'Packaging Materials', slug: 'packaging', icon: '📦' },
    { name: 'Plastics & Polymers', slug: 'plastics', icon: '🧴' },
    { name: 'Furniture & Fixtures', slug: 'furniture', icon: '🪑' },
    { name: 'Paper & Stationery', slug: 'paper', icon: '📄' },
    { name: 'Tools & Hardware', slug: 'tools', icon: '🔧' },
    { name: 'Safety & Security', slug: 'safety', icon: '🛡️' },
    { name: 'Energy & Power', slug: 'energy', icon: '🔋' },
    { name: 'Environmental Equipment', slug: 'environmental', icon: '♻️' },
    { name: 'Laboratory Equipment', slug: 'laboratory', icon: '🔬' },
    { name: 'IT & Software', slug: 'it', icon: '💻' },
    { name: 'Telecommunications', slug: 'telecom', icon: '📡' },
    { name: 'Office Supplies', slug: 'office', icon: '🖊️' },
    { name: 'Cleaning & Sanitation', slug: 'cleaning', icon: '🧹' },
    { name: 'Hospitality & Catering', slug: 'hospitality', icon: '🏨' },
    { name: 'Sports & Fitness', slug: 'sports', icon: '⚽' },
    { name: 'Educational Materials', slug: 'education', icon: '📚' },
    { name: 'Industrial Gases', slug: 'gases', icon: '💨' },
    { name: 'Rubber Products', slug: 'rubber', icon: '🔲' },
    { name: 'Ceramics & Glass', slug: 'ceramics', icon: '🏺' },
    { name: 'Leather Products', slug: 'leather', icon: '👜' },
    { name: 'Jute & Natural Fibers', slug: 'jute', icon: '🌿' },
    { name: 'Coconut Products', slug: 'coconut', icon: '🥥' },
    { name: 'Spices & Seasonings', slug: 'spices', icon: '🌶️' },
    { name: 'Tea & Coffee', slug: 'beverages', icon: '☕' },
    { name: 'Dairy Products', slug: 'dairy', icon: '🥛' },
    { name: 'Seafood & Fish', slug: 'seafood', icon: '🐟' },
    { name: 'Poultry & Eggs', slug: 'poultry', icon: '🥚' },
    { name: 'Grains & Pulses', slug: 'grains', icon: '🌾' },
    { name: 'Fruits & Vegetables', slug: 'produce', icon: '🍎' },
    { name: 'Nuts & Dry Fruits', slug: 'nuts', icon: '🥜' },
    { name: 'Oils & Fats', slug: 'oils', icon: '🛢️' },
    { name: 'Sugar & Sweeteners', slug: 'sugar', icon: '🍯' },
    { name: 'Flour & Baking', slug: 'flour', icon: '🍞' },
    { name: 'Condiments & Sauces', slug: 'condiments', icon: '🧂' },
    { name: 'Frozen Foods', slug: 'frozen', icon: '❄️' },
    { name: 'Organic Products', slug: 'organic', icon: '🌱' },
    { name: 'Pet Food & Supplies', slug: 'pet', icon: '🐕' },
    { name: 'Cosmetics & Personal Care', slug: 'cosmetics', icon: '💄' },
    { name: 'Jewelry & Accessories', slug: 'jewelry', icon: '💎' },
    { name: 'Toys & Games', slug: 'toys', icon: '🧸' },
    { name: 'Musical Instruments', slug: 'music', icon: '🎸' },
    { name: 'Art & Craft Supplies', slug: 'art', icon: '🎨' },
    { name: 'Books & Magazines', slug: 'books', icon: '📖' },
    { name: 'Gift Items', slug: 'gifts', icon: '🎁' },
    { name: 'Religious Items', slug: 'religious', icon: '🕉️' }
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    createdCategories.push(created);
  }
  return createdCategories;
}

async function createRFQs(buyers: any[], categories: any[]) {
  const rfqs = [];
  const statuses = ['ACTIVE', 'CLOSED', 'EXPIRED'];
  
  const B2B_PRODUCTS = [
    { name: 'Steel Sheets', unit: 'kg', minQty: 100, maxQty: 5000, category: 'Metals & Minerals' },
    { name: 'Android Tablets', unit: 'units', minQty: 50, maxQty: 1000, category: 'Electronics & Electricals' },
    { name: 'Electrical Cables', unit: 'meters', minQty: 100, maxQty: 2000, category: 'Electronics & Electricals' },
    { name: 'Cotton Fabric', unit: 'meters', minQty: 500, maxQty: 10000, category: 'Textiles & Apparel' },
    { name: 'Hydraulic Press', unit: 'units', minQty: 1, maxQty: 10, category: 'Machinery & Equipment' },
    { name: 'PVC Pipes', unit: 'meters', minQty: 200, maxQty: 5000, category: 'Construction Materials' },
    { name: 'Chemical Solvents', unit: 'liters', minQty: 100, maxQty: 2000, category: 'Chemicals & Petrochemicals' },
    { name: 'Automotive Parts', unit: 'units', minQty: 50, maxQty: 500, category: 'Automotive & Spare Parts' },
    { name: 'Pharmaceutical Raw Materials', unit: 'kg', minQty: 10, maxQty: 500, category: 'Pharmaceuticals & Healthcare' },
    { name: 'Food Grade Packaging', unit: 'units', minQty: 1000, maxQty: 50000, category: 'Packaging Materials' },
    { name: 'Industrial Pumps', unit: 'units', minQty: 2, maxQty: 20, category: 'Machinery & Equipment' },
    { name: 'LED Lighting', unit: 'units', minQty: 100, maxQty: 5000, category: 'Electronics & Electricals' },
    { name: 'Plastic Granules', unit: 'kg', minQty: 500, maxQty: 10000, category: 'Plastics & Polymers' },
    { name: 'Office Furniture', unit: 'units', minQty: 10, maxQty: 200, category: 'Furniture & Fixtures' },
    { name: 'Safety Equipment', unit: 'units', minQty: 50, maxQty: 1000, category: 'Safety & Security' },
    { name: 'Solar Panels', unit: 'units', minQty: 20, maxQty: 500, category: 'Energy & Power' },
    { name: 'Steel Bars', unit: 'tons', minQty: 5, maxQty: 100, category: 'Metals & Minerals' },
    { name: 'Textile Machinery', unit: 'units', minQty: 1, maxQty: 5, category: 'Machinery & Equipment' },
    { name: 'Medical Devices', unit: 'units', minQty: 10, maxQty: 100, category: 'Pharmaceuticals & Healthcare' },
    { name: 'Agricultural Equipment', unit: 'units', minQty: 5, maxQty: 50, category: 'Agriculture & Food Products' },
    { name: 'Construction Tools', unit: 'units', minQty: 20, maxQty: 500, category: 'Construction Materials' },
    { name: 'Rubber Sheets', unit: 'kg', minQty: 100, maxQty: 2000, category: 'Rubber Products' },
    { name: 'Ceramic Tiles', unit: 'units', minQty: 100, maxQty: 5000, category: 'Ceramics & Glass' },
    { name: 'Leather Goods', unit: 'units', minQty: 50, maxQty: 1000, category: 'Leather Products' },
    { name: 'Jute Bags', unit: 'units', minQty: 500, maxQty: 10000, category: 'Jute & Natural Fibers' },
    { name: 'Coconut Oil', unit: 'liters', minQty: 100, maxQty: 2000, category: 'Coconut Products' },
    { name: 'Organic Spices', unit: 'kg', minQty: 50, maxQty: 1000, category: 'Spices & Seasonings' },
    { name: 'Coffee Beans', unit: 'kg', minQty: 100, maxQty: 2000, category: 'Tea & Coffee' },
    { name: 'Dairy Products', unit: 'liters', minQty: 500, maxQty: 10000, category: 'Dairy Products' }
  ];

  const REALISTIC_RFQ_TITLES = [
    "Need 500 kg steel sheets for construction project in Mumbai",
    "Looking for bulk order of 1000 Android tablets for education",
    "Require 200 meters of electrical cable (3 core, 2.5mm)",
    "Cotton fabric requirement - 5000 meters for textile manufacturing",
    "Hydraulic press machine needed for metal fabrication workshop",
    "PVC pipes for residential plumbing project - 1000 meters",
    "Chemical solvents for industrial cleaning - 500 liters",
    "Automotive spare parts for service center - bulk order",
    "Pharmaceutical raw materials for medicine manufacturing",
    "Food grade packaging materials for FMCG products",
    "Industrial pumps for water treatment plant",
    "LED lighting fixtures for office building renovation",
    "Plastic granules for injection molding production",
    "Office furniture requirement for new corporate office",
    "Safety equipment and PPE for construction site",
    "Solar panels for renewable energy project",
    "Steel bars for infrastructure development project",
    "Textile machinery for garment manufacturing unit",
    "Medical devices for hospital equipment upgrade",
    "Agricultural equipment for farming operations",
    "Construction tools for building contractor",
    "Rubber sheets for industrial applications",
    "Ceramic tiles for residential flooring project",
    "Leather goods for fashion accessories business",
    "Jute bags for eco-friendly packaging solutions",
    "Coconut oil for food processing industry",
    "Organic spices for restaurant chain supply",
    "Coffee beans for cafe business expansion",
    "Dairy products for retail chain stores"
  ];

  for (let i = 1; i <= CONFIG.RFQS_COUNT; i++) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const product = B2B_PRODUCTS[Math.floor(Math.random() * B2B_PRODUCTS.length)];
    const category = categories.find(cat => cat.name === product.category) || categories[0];
    const quantity = Math.floor(Math.random() * (product.maxQty - product.minQty)) + product.minQty;
    const deadlineDays = Math.floor(Math.random() * 23) + 7; // 7-30 days from now
    const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);
    const status = i <= 20 ? 'ACTIVE' : statuses[Math.floor(Math.random() * statuses.length)];
    const budgetRange = Math.floor(Math.random() * 990000) + 10000; // ₹10,000 - ₹10,00,000
    
    const title = REALISTIC_RFQ_TITLES[i - 1] || `Requirement for ${product.name} - ${quantity} ${product.unit}`;
    
    const rfq = await prisma.rfq.create({
      data: {
        title: title,
        description: `We are looking for reliable suppliers of ${product.name} for our ${buyer.companyName} operations. 

Product Details:
- Product: ${product.name}
- Quantity Required: ${quantity} ${product.unit}
- Quality Standards: Industry standard/BIS/ISO certified
- Packaging: Standard export packaging
- Delivery Location: ${buyer.city}, ${buyer.state}
- Preferred Delivery: Within ${deadlineDays} days
- Budget Range: ₹${budgetRange.toLocaleString()} - ₹${(budgetRange * 2).toLocaleString()}

Additional Requirements:
- Local suppliers preferred for faster delivery
- Must provide quality certificates and test reports
- Competitive pricing for bulk orders
- Reliable after-sales service support`,
        quantity: quantity,
        unit: product.unit,
        targetPrice: Math.floor(Math.random() * 5000) + 1000,
        deadline: deadline,
        status: status,
        deliveryLocation: `${buyer.city}, ${buyer.state}`,
        categoryId: category.id,
        buyerId: buyer.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    rfqs.push(rfq);
  }
  return rfqs;
}

async function createQuotes(suppliers: any[], rfqs: any[]) {
  const quotes = [];
  const statuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
  
  // Ensure 2-3 quotes per RFQ
  for (let i = 0; i < rfqs.length; i++) {
    const rfq = rfqs[i];
    const quotesPerRfq = Math.floor(Math.random() * 2) + 2; // 2-3 quotes per RFQ
    
    for (let j = 0; j < quotesPerRfq; j++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const unitPrice = Math.floor(Math.random() * 2000) + 500;
      const totalPrice = unitPrice * rfq.quantity;
      const deliveryTime = Math.floor(Math.random() * 20) + 5; // 5-25 days
      
      const quote = await prisma.quote.create({
        data: {
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          quantity: rfq.quantity,
          deliveryTime: deliveryTime,
          paymentTerms: ['Net 30', 'Net 45', 'COD', 'Advance 50%'][Math.floor(Math.random() * 4)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          notes: `Competitive pricing for ${rfq.title}. Quality assured with timely delivery.`,
          rfqId: rfq.id,
          supplierId: supplier.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      quotes.push(quote);
    }
  }
  return quotes;
}

async function createMessages(buyers: any[], suppliers: any[], rfqs: any[]) {
  const messages = [];
  const messageTypes = ['rfq_clarification', 'quote_negotiation', 'order_confirmation', 'logistics', 'payment'];
  
  // Hindi-English mixed messages for realistic Indian business conversations
  const hindiEnglishMessages = [
    "Namaste! Kya aap is product ki quality ke baare mein thoda aur detail de sakte hain?",
    "Hello sir, price thoda negotiable hai kya? Bulk order hai humara.",
    "Pranam! Delivery time kya hoga exactly? Humein urgent requirement hai.",
    "Good morning, GST invoice jaroor chahiye. Aapka GST number kya hai?",
    "Namaskar! Sample piece bhej sakte hain kya pehle? Quality check karne ke liye.",
    "Hi, payment terms kya hain? COD possible hai ya advance dena padega?",
    "Hello, aapka manufacturing unit kahan pe hai? Visit karna chahte hain.",
    "Namaste ji! Previous client references mil sakte hain kya?",
    "Good afternoon, warranty kitne time ki hai is product ki?",
    "Pranam! Return policy kya hai agar product defective nikla toh?",
    "Hello, transportation charges included hain ya alag se lagega?",
    "Namaskar! Aapka experience kitna hai is field mein?",
    "Hi there, MOQ (minimum order quantity) kya hai aapka?",
    "Hello, lead time kitna hai order process karne mein?",
    "Namaste! Customization possible hai kya is product mein?",
    "Good evening, packing kaisa hoga? Export quality milega?",
    "Pranam! Discount milega agar regular customer ban jaye toh?",
    "Hello sir, installation service provide karte hain aap?",
    "Namaste! After-sales service available hai kya?",
    "Hi, aapka company registration aur certifications hain?",
    "Hello, payment through LC (Letter of Credit) possible hai?"
  ];
  
  for (let i = 1; i <= CONFIG.MESSAGES_COUNT; i++) {
    const rfq = rfqs[Math.floor(Math.random() * rfqs.length)];
    const sender = Math.random() > 0.5 ? 
      buyers[Math.floor(Math.random() * buyers.length)] : 
      suppliers[Math.floor(Math.random() * suppliers.length)];
  
    const receiver = sender.type === 'BUYER' ? 
      suppliers[Math.floor(Math.random() * suppliers.length)] : 
      buyers[Math.floor(Math.random() * buyers.length)];
  
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    let content = '';
  
    switch (messageType) {
      case 'rfq_clarification':
        content = Math.random() > 0.5 ? 
          `Could you please clarify the specifications for ${rfq.title}? We need more details about the quality standards and delivery requirements.` :
          hindiEnglishMessages[Math.floor(Math.random() * hindiEnglishMessages.length)];
        break;
      case 'quote_negotiation':
        content = Math.random() > 0.5 ?
          `Thank you for your quote. We would like to discuss the pricing and delivery timeline. Is there any possibility for a better rate for bulk orders?` :
          `Sir ji, aapka rate thoda jyada lag raha hai. Kya thoda adjustment possible hai? Humara regular business hai.`;
        break;
      case 'order_confirmation':
        content = Math.random() > 0.5 ?
          `We are pleased to confirm the order for ${rfq.quantity} ${rfq.unit} as per your latest quote. Please proceed with the arrangements.` :
          `Order confirm hai! Aap process kar dijiye. Payment bhej diya jayega time pe.`;
        break;
      case 'logistics':
        content = Math.random() > 0.5 ?
          `Could you please confirm the delivery schedule and provide tracking details once the shipment is dispatched? We need to coordinate our receiving arrangements.` :
          `Delivery schedule bata dijiye. Tracking details bhi share karna once dispatch ho jaye.`;
        break;
      case 'payment':
        content = Math.random() > 0.5 ?
          `We have processed the payment as per the agreed terms. Please confirm receipt and proceed with the order fulfillment.` :
          `Payment bhej diya hai. Please confirm kijiye aur order process kijiye.`;
        break;
    }
    
    const message = await prisma.message.create({
      data: {
        content: content,
        senderId: sender.id,
        receiverId: receiver.id,
        rfqId: rfq.id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date within last 7 days
        updatedAt: new Date(),
      }
    });
    messages.push(message);
  }
  return messages;
}

async function createPayments(buyers: any[], suppliers: any[], rfqs: any[]) {
  const payments = [];
  const statuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
  
  for (let i = 1; i <= CONFIG.PAYMENTS_COUNT; i++) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const rfq = rfqs[Math.floor(Math.random() * rfqs.length)];
    const amount = Math.floor(Math.random() * 50000) + 5000; // ₹5,000 - ₹55,000
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const payment = await prisma.payment.create({
      data: {
        amount: amount,
        currency: 'INR',
        status: status,
        razorpayOrderId: `order_${Date.now()}_${i}`,
        razorpayPaymentId: status === 'COMPLETED' ? `pay_${Date.now()}_${i}` : null,
        buyerId: buyer.id,
        supplierId: supplier.id,
        rfqId: rfq.id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date within last 30 days
        updatedAt: new Date(),
      }
    });
    payments.push(payment);
  }
  return payments;
}

function getStateForCity(city: string): string {
  const cityStateMap: Record<string, string> = {
    'Mumbai': 'Maharashtra',
    'Pune': 'Maharashtra',
    'Delhi': 'Delhi',
    'Bangalore': 'Karnataka',
    'Chennai': 'Tamil Nadu',
    'Hyderabad': 'Telangana',
    'Ahmedabad': 'Gujarat',
    'Kolkata': 'West Bengal',
    'Surat': 'Gujarat',
    'Jaipur': 'Rajasthan'
  };
  return cityStateMap[city] || 'India';
}

// Run the seed
seedLocalDatabase()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });