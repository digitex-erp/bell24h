// File: src/scripts/seed-database.ts
// Comprehensive database seeder for Bell24h - Indian B2B procurement marketplace
// Populates database with realistic test data for Indian B2B marketplace

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  SUPPLIERS_COUNT: 50,
  BUYERS_COUNT: 20,
  RFQS_COUNT: 30,
  QUOTES_COUNT: 50,
  MESSAGES_COUNT: 100,
  CATEGORIES_COUNT: 50,
  PAYMENTS_COUNT: 25,
  SALT_ROUNDS: 10,
  DEFAULT_PASSWORD: 'Test@123'
};

// Realistic Indian B2B product requirements
const REALISTIC_RFQ_TITLES = [
  "Need 500 kg steel sheets for construction project in Mumbai",
  "Looking for bulk order of 1000 Android tablets for education",
  "Require 200 meters of electrical cable (3 core, 2.5mm)",
  "Urgent requirement: 5000 cotton fabric meters for garment manufacturing",
  "Seeking reliable supplier for 50 metric tons rice export",
  "Need 2000 kg industrial chemicals for pharmaceutical production",
  "Looking for 100 car batteries for automotive dealership",
  "Require 1000 PVC pipes (6 inch diameter) for infrastructure project",
  "Need 500 sets brake pads for automotive service center",
  "Seeking 2000 liters engine oil for fleet maintenance",
  "Urgent: 10000 cement bags for construction site in Delhi",
  "Need 500 bales cotton for textile mill in Ahmedabad",
  "Looking for 2000 tea leaves kg for export to Europe",
  "Require 100 hydraulic presses for manufacturing unit",
  "Seeking 500 ceramic tiles for hotel renovation project",
  "Need 200 glass sheets (8mm thickness) for office building",
  "Looking for 1000 wheat metric tons for flour mill",
  "Require 500 coffee beans kg for premium coffee brand",
  "Need 200 tire tubes for automotive workshop",
  "Seeking 1000 LED bulbs for government tender",
  "Urgent: 500 mobile chargers for retail chain",
  "Need 200 Bluetooth speakers for electronics store",
  "Looking for 1000 power banks for corporate gifting",
  "Require 500 silk sarees for wedding season",
  "Seeking 2000 denim jeans for export order",
  "Need 1000 cotton t-shirts for promotional campaign",
  "Looking for 500 wool sweaters for winter collection",
  "Require 200 paint liters for industrial coating",
  "Need 1000 fertilizer kg for agricultural cooperative",
  "Seeking 500 pharmaceutical raw materials kg for drug manufacturing"
];

// Indian business data
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Ahmedabad', 'Kolkata', 
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 
  'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 
  'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 
  'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 
  'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Solapur', 'Hubballi-Dharwad'
];

const INDIAN_STATES = {
  'Mumbai': 'Maharashtra', 'Pune': 'Maharashtra', 'Nagpur': 'Maharashtra', 'Nashik': 'Maharashtra',
  'Delhi': 'Delhi', 'Faridabad': 'Haryana', 'Ghaziabad': 'Uttar Pradesh', 'Meerut': 'Uttar Pradesh',
  'Bangalore': 'Karnataka', 'Mysore': 'Karnataka', 'Hubballi-Dharwad': 'Karnataka',
  'Chennai': 'Tamil Nadu', 'Coimbatore': 'Tamil Nadu', 'Madurai': 'Tamil Nadu',
  'Hyderabad': 'Telangana', 'Vijayawada': 'Andhra Pradesh', 'Visakhapatnam': 'Andhra Pradesh',
  'Ahmedabad': 'Gujarat', 'Surat': 'Gujarat', 'Vadodara': 'Gujarat', 'Rajkot': 'Gujarat',
  'Kolkata': 'West Bengal', 'Howrah': 'West Bengal', 'Dhanbad': 'Jharkhand', 'Ranchi': 'Jharkhand',
  'Jaipur': 'Rajasthan', 'Jodhpur': 'Rajasthan', 'Kota': 'Rajasthan', 'Agra': 'Uttar Pradesh',
  'Lucknow': 'Uttar Pradesh', 'Kanpur': 'Uttar Pradesh', 'Allahabad': 'Uttar Pradesh',
  'Indore': 'Madhya Pradesh', 'Bhopal': 'Madhya Pradesh', 'Jabalpur': 'Madhya Pradesh', 'Gwalior': 'Madhya Pradesh',
  'Patna': 'Bihar', 'Chandigarh': 'Chandigarh', 'Srinagar': 'Jammu and Kashmir',
  'Amritsar': 'Punjab', 'Ludhiana': 'Punjab', 'Aurangabad': 'Maharashtra', 'Solapur': 'Maharashtra',
  'Kalyan-Dombivali': 'Maharashtra', 'Vasai-Virar': 'Maharashtra', 'Navi Mumbai': 'Maharashtra',
  'Thane': 'Maharashtra', 'Kalyan': 'Maharashtra', 'Dombivali': 'Maharashtra'
};

const INDUSTRIES = [
  'Electronics', 'Textiles', 'Chemicals', 'Machinery', 'Agriculture', 'Automotive', 
  'Construction', 'Pharmaceuticals', 'Food Processing', 'Metal Works', 'Plastics', 
  'Packaging', 'Logistics', 'Energy', 'Telecommunications', 'IT Services', 'Healthcare',
  'Education', 'Hospitality', 'Real Estate', 'Banking', 'Insurance', 'Retail',
  'Manufacturing', 'Mining', 'Oil & Gas', 'Renewable Energy', 'Aerospace', 'Defense',
  'Consumer Goods', 'Furniture', 'Paper & Pulp', 'Printing', 'Rubber', 'Leather',
  'Ceramics', 'Glass', 'Cement', 'Steel', 'Aluminum', 'Copper', 'Brass', 'Iron'
];

const COMPANY_SUFFIXES = [
  'Private Limited', 'Limited', 'Corporation', 'Industries', 'Enterprises', 'Solutions',
  'Technologies', 'Systems', 'Services', 'Trading Company', 'Manufacturing Company',
  'Works', 'Engineering', 'Consultants', 'Suppliers', 'Distributors', 'Exporters',
  'Importers', 'Agencies', 'Partners', 'Ventures', 'Holdings', 'Group'
];

const B2B_PRODUCTS = [
  // Electronics
  { name: 'Android Tablets', category: 'Electronics', unit: 'units', minQty: 100, maxQty: 5000 },
  { name: 'LED Light Bulbs', category: 'Electronics', unit: 'pieces', minQty: 1000, maxQty: 50000 },
  { name: 'Mobile Phone Chargers', category: 'Electronics', unit: 'pieces', minQty: 500, maxQty: 10000 },
  { name: 'Bluetooth Speakers', category: 'Electronics', unit: 'units', minQty: 50, maxQty: 2000 },
  { name: 'Power Banks', category: 'Electronics', unit: 'units', minQty: 200, maxQty: 10000 },
  
  // Textiles
  { name: 'Cotton Fabric', category: 'Textiles', unit: 'meters', minQty: 1000, maxQty: 50000 },
  { name: 'Silk Sarees', category: 'Textiles', unit: 'pieces', minQty: 50, maxQty: 1000 },
  { name: 'Denim Jeans', category: 'Textiles', unit: 'pieces', minQty: 100, maxQty: 5000 },
  { name: 'Cotton T-Shirts', category: 'Textiles', unit: 'pieces', minQty: 500, maxQty: 20000 },
  { name: 'Wool Sweaters', category: 'Textiles', unit: 'pieces', minQty: 100, maxQty: 5000 },
  
  // Chemicals
  { name: 'Industrial Chemicals', category: 'Chemicals', unit: 'kg', minQty: 100, maxQty: 10000 },
  { name: 'Cleaning Detergents', category: 'Chemicals', unit: 'liters', minQty: 500, maxQty: 20000 },
  { name: 'Paint & Coatings', category: 'Chemicals', unit: 'liters', minQty: 200, maxQty: 10000 },
  { name: 'Fertilizers', category: 'Chemicals', unit: 'kg', minQty: 1000, maxQty: 50000 },
  { name: 'Pharmaceutical Raw Materials', category: 'Chemicals', unit: 'kg', minQty: 50, maxQty: 5000 },
  
  // Machinery
  { name: 'Hydraulic Press', category: 'Machinery', unit: 'units', minQty: 1, maxQty: 10 },
  { name: 'CNC Machines', category: 'Machinery', unit: 'units', minQty: 1, maxQty: 5 },
  { name: 'Industrial Pumps', category: 'Machinery', unit: 'units', minQty: 5, maxQty: 50 },
  { name: 'Electric Motors', category: 'Machinery', unit: 'units', minQty: 10, maxQty: 200 },
  { name: 'Air Compressors', category: 'Machinery', unit: 'units', minQty: 2, maxQty: 20 },
  
  // Construction
  { name: 'PVC Pipes', category: 'Construction', unit: 'meters', minQty: 1000, maxQty: 50000 },
  { name: 'Steel Bars', category: 'Construction', unit: 'metric tons', minQty: 10, maxQty: 500 },
  { name: 'Cement Bags', category: 'Construction', unit: 'bags', minQty: 1000, maxQty: 100000 },
  { name: 'Ceramic Tiles', category: 'Construction', unit: 'square meters', minQty: 500, maxQty: 20000 },
  { name: 'Glass Sheets', category: 'Construction', unit: 'square meters', minQty: 100, maxQty: 5000 },
  
  // Agriculture
  { name: 'Rice', category: 'Agriculture', unit: 'metric tons', minQty: 10, maxQty: 1000 },
  { name: 'Wheat', category: 'Agriculture', unit: 'metric tons', minQty: 20, maxQty: 2000 },
  { name: 'Cotton Bales', category: 'Agriculture', unit: 'bales', minQty: 100, maxQty: 5000 },
  { name: 'Tea Leaves', category: 'Agriculture', unit: 'kg', minQty: 500, maxQty: 25000 },
  { name: 'Coffee Beans', category: 'Agriculture', unit: 'kg', minQty: 200, maxQty: 10000 },
  
  // Automotive
  { name: 'Car Batteries', category: 'Automotive', unit: 'units', minQty: 100, maxQty: 5000 },
  { name: 'Tire & Tubes', category: 'Automotive', unit: 'units', minQty: 200, maxQty: 10000 },
  { name: 'Engine Oil', category: 'Automotive', unit: 'liters', minQty: 1000, maxQty: 50000 },
  { name: 'Brake Pads', category: 'Automotive', unit: 'sets', minQty: 500, maxQty: 25000 },
  { name: 'Headlights', category: 'Automotive', unit: 'units', minQty: 200, maxQty: 10000 }
];

const BUYER_COMPANIES = [
  'Reliance Industries', 'Tata Group', 'Aditya Birla Group', 'Mahindra Group',
  'Bajaj Group', 'Godrej Group', 'Larsen & Toubro', 'ITC Limited',
  'Hindustan Unilever', 'ICICI Bank', 'HDFC Bank', 'State Bank of India',
  'Bharti Airtel', 'Vodafone Idea', 'Jio Platforms', 'Flipkart',
  'Amazon India', 'Paytm', 'Ola Cabs', 'Uber India', 'Zomato',
  'Swiggy', 'BYJU\'S', 'Unacademy', 'Vedantu', 'PharmEasy',
  'Netmeds', 'BigBasket', 'Grofers', 'MedLife', 'Licious'
];

const SUPPLIER_COMPANIES = [
  'Steel Authority of India', 'Bharat Heavy Electricals', 'National Aluminium Company',
  'Hindalco Industries', 'Vedanta Limited', 'JSW Steel', 'Tata Steel',
  'Essar Steel', 'Bhilai Steel Plant', 'Rourkela Steel Plant', 'Durgapur Steel Plant',
  'Bokaro Steel Plant', 'Indian Oil Corporation', 'Bharat Petroleum', 'Hindustan Petroleum',
  'Oil and Natural Gas Corporation', 'Gas Authority of India', 'Reliance Petroleum',
  'Essar Oil', 'Cairn India', 'Tata Motors', 'Mahindra & Mahindra', 'Bajaj Auto',
  'Hero MotoCorp', 'TVS Motor Company', 'Ashok Leyland', 'Eicher Motors',
  'Maruti Suzuki', 'Hyundai India', 'Toyota Kirloskar', 'Honda Cars India',
  'Ford India', 'Volkswagen India', 'BMW India', 'Mercedes-Benz India',
  'Audi India', 'Jaguar Land Rover India', 'Tata Power', 'Reliance Power',
  'Adani Power', 'NTPC Limited', 'Power Grid Corporation', 'NHPC Limited'
];

/**
 * Main seed function - IDEMPOTENT (can run multiple times safely)
 */
async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seed for Bell24h...');
  
  try {
    // Clear existing data (idempotent operation)
    console.log('🧹 Clearing existing data for clean seed...');
    await clearExistingData();
    
    // 1. Create Categories First
    console.log('📂 Creating 50 product categories...');
    const categories = await createCategories();
    
    // 2. Create Users (Suppliers and Buyers)
    console.log('👥 Creating 50 supplier accounts...');
    const suppliers = await createSuppliers();
    
    console.log('👤 Creating 20 buyer accounts...');
    const buyers = await createBuyers();
    
    // 3. Create RFQs
    console.log('📋 Creating 30 active RFQs...');
    const rfqs = await createRFQs(buyers, categories);
    
    // 4. Create Quotes
    console.log('💰 Creating 50 quotes from suppliers...');
    const quotes = await createQuotes(suppliers, rfqs);
    
    // 5. Create Messages
    console.log('💬 Creating 100 chat messages...');
    await createMessages(buyers, suppliers, rfqs);
    
    // 6. Create Payments
    console.log('💳 Creating 25 payment records...');
    await createPayments(buyers, suppliers, rfqs, quotes);
    
    console.log('✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Buyers: ${buyers.length}`);
    console.log(`   - RFQs: ${rfqs.length}`);
    console.log(`   - Quotes: ${quotes.length}`);
    console.log(`   - Messages: 100`);
    console.log(`   - Payments: 25`);
    
    // Test accounts summary
    console.log('\n🧪 Test Accounts Ready:');
    console.log(`   - Buyers: buyer1@bell24h.com to buyer20@bell24h.com`);
    console.log(`   - Suppliers: supplier1@bell24h.com to supplier50@bell24h.com`);
    console.log(`   - Password: ${CONFIG.DEFAULT_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clear existing data - IDEMPOTENT
 */
async function clearExistingData() {
  try {
    // Delete in order of dependencies (reverse order of creation)
    console.log('  Deleting messages...');
    await prisma.message.deleteMany({});
    
    console.log('  Deleting payments...');
    await prisma.payment.deleteMany({});
    
    console.log('  Deleting quotes...');
    await prisma.quote.deleteMany({});
    
    console.log('  Deleting RFQs...');
    await prisma.rfq.deleteMany({});
    
    console.log('  Deleting users...');
    await prisma.user.deleteMany({});
    
    console.log('  Deleting categories...');
    await prisma.category.deleteMany({});
    
    console.log('✅ All existing data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing existing data:', error);
    throw error;
  }
}

/**
 * Create 50 product categories
 */
async function createCategories() {
  const categories = [
    { name: 'Agriculture & Food Products', slug: 'agriculture', icon: '🌾', description: 'Agricultural products, food items, and farming equipment' },
    { name: 'Electronics & Electricals', slug: 'electronics', icon: '⚡', description: 'Electronic components, devices, and electrical equipment' },
    { name: 'Textiles & Apparel', slug: 'textiles', icon: '👕', description: 'Fabrics, garments, and textile machinery' },
    { name: 'Chemicals & Petrochemicals', slug: 'chemicals', icon: '🧪', description: 'Industrial chemicals, petrochemicals, and laboratory equipment' },
    { name: 'Machinery & Equipment', slug: 'machinery', icon: '⚙️', description: 'Industrial machinery and manufacturing equipment' },
    { name: 'Construction & Building Materials', slug: 'construction', icon: '🏗️', description: 'Construction materials and building supplies' },
    { name: 'Automotive & Auto Parts', slug: 'automotive', icon: '🚗', description: 'Automotive components and vehicle parts' },
    { name: 'Pharmaceuticals & Healthcare', slug: 'pharmaceuticals', icon: '💊', description: 'Pharmaceutical products and medical equipment' },
    { name: 'Metals & Alloys', slug: 'metals', icon: '🔧', description: 'Metal products, alloys, and metalworking equipment' },
    { name: 'Plastics & Polymers', slug: 'plastics', icon: '🔲', description: 'Plastic products, polymers, and processing equipment' },
    { name: 'Packaging Materials', slug: 'packaging', icon: '📦', description: 'Packaging solutions and materials' },
    { name: 'Logistics & Transportation', slug: 'logistics', icon: '🚚', description: 'Logistics services and transportation equipment' },
    { name: 'Energy & Power', slug: 'energy', icon: '🔋', description: 'Energy equipment and power generation systems' },
    { name: 'Telecommunications', slug: 'telecommunications', icon: '📡', description: 'Telecom equipment and communication systems' },
    { name: 'IT Services & Software', slug: 'it-services', icon: '💻', description: 'IT services, software solutions, and hardware' },
    { name: 'Healthcare & Medical', slug: 'healthcare', icon: '🏥', description: 'Medical equipment and healthcare products' },
    { name: 'Education & Training', slug: 'education', icon: '🎓', description: 'Educational services and training equipment' },
    { name: 'Hospitality & Tourism', slug: 'hospitality', icon: '🏨', description: 'Hospitality services and tourism equipment' },
    { name: 'Real Estate & Property', slug: 'real-estate', icon: '🏢', description: 'Real estate services and property management' },
    { name: 'Banking & Financial Services', slug: 'banking', icon: '🏦', description: 'Financial services and banking solutions' },
    { name: 'Insurance Services', slug: 'insurance', icon: '🛡️', description: 'Insurance products and risk management services' },
    { name: 'Retail & Consumer Goods', slug: 'retail', icon: '🛍️', description: 'Consumer products and retail services' },
    { name: 'Manufacturing', slug: 'manufacturing', icon: '🏭', description: 'Manufacturing services and industrial products' },
    { name: 'Mining & Minerals', slug: 'mining', icon: '⛏️', description: 'Mining equipment and mineral products' },
    { name: 'Oil & Gas', slug: 'oil-gas', icon: '🛢️', description: 'Oil and gas equipment and services' },
    { name: 'Renewable Energy', slug: 'renewable-energy', icon: '🌱', description: 'Renewable energy systems and equipment' },
    { name: 'Aerospace & Defense', slug: 'aerospace', icon: '🚀', description: 'Aerospace components and defense equipment' },
    { name: 'Consumer Goods', slug: 'consumer-goods', icon: '📱', description: 'Consumer electronics and household goods' },
    { name: 'Furniture & Fixtures', slug: 'furniture', icon: '🪑', description: 'Furniture and office fixtures' },
    { name: 'Paper & Pulp', slug: 'paper', icon: '📄', description: 'Paper products and pulp processing equipment' },
    { name: 'Printing & Publishing', slug: 'printing', icon: '🖨️', description: 'Printing equipment and publishing services' },
    { name: 'Rubber & Rubber Products', slug: 'rubber', icon: '🔧', description: 'Rubber products and processing equipment' },
    { name: 'Leather & Leather Goods', slug: 'leather', icon: '👜', description: 'Leather products and processing equipment' },
    { name: 'Ceramics & Pottery', slug: 'ceramics', icon: '🏺', description: 'Ceramic products and pottery equipment' },
    { name: 'Glass & Glass Products', slug: 'glass', icon: '🪟', description: 'Glass products and manufacturing equipment' },
    { name: 'Cement & Concrete', slug: 'cement', icon: '🧱', description: 'Cement and concrete products' },
    { name: 'Steel & Iron Products', slug: 'steel', icon: '🏗️', description: 'Steel products and iron processing equipment' },
    { name: 'Aluminum Products', slug: 'aluminum', icon: '🔩', description: 'Aluminum products and processing equipment' },
    { name: 'Copper & Copper Alloys', slug: 'copper', icon: '🔌', description: 'Copper products and copper alloy equipment' },
    { name: 'Brass & Bronze Products', slug: 'brass', icon: '🎺', description: 'Brass and bronze products' },
    { name: 'Iron & Cast Iron', slug: 'iron', icon: '⚒️', description: 'Iron products and cast iron equipment' },
    { name: 'Gemstones & Jewelry', slug: 'gemstones', icon: '💎', description: 'Gemstones and jewelry manufacturing equipment' },
    { name: 'Handicrafts & Artifacts', slug: 'handicrafts', icon: '🎨', description: 'Handicraft products and artisan tools' },
    { name: 'Sports Equipment', slug: 'sports', icon: '⚽', description: 'Sports equipment and fitness products' },
    { name: 'Toys & Games', slug: 'toys', icon: '🧸', description: 'Toys and gaming equipment' },
    { name: 'Musical Instruments', slug: 'musical', icon: '🎸', description: 'Musical instruments and audio equipment' },
    { name: 'Watches & Clocks', slug: 'watches', icon: '⌚', description: 'Watches, clocks, and timekeeping equipment' },
    { name: 'Optical Equipment', slug: 'optical', icon: '👓', description: 'Optical instruments and eyewear' },
    { name: 'Photography Equipment', slug: 'photography', icon: '📷', description: 'Photography and videography equipment' }
  ];

  const createdCategories = [];
  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: categoryData
    });
    createdCategories.push(category);
  }
  
  console.log(`✅ Created ${createdCategories.length} categories`);
  return createdCategories;
}

/**
 * Create 50 supplier accounts with realistic Indian business data
 */
async function createSuppliers() {
  const suppliers = [];
  
  for (let i = 1; i <= CONFIG.SUPPLIERS_COUNT; i++) {
    const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
    const companySuffix = COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)];
    const companyName = `${SUPPLIER_COMPANIES[i % SUPPLIER_COMPANIES.length]} ${companySuffix}`;
    
    const supplier = await prisma.user.create({
      data: {
        email: `supplier${i}@bell24h.com`,
        phone: `+919${String(100000000 + i).padStart(9, '0')}`,
        password: await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, CONFIG.SALT_ROUNDS),
        name: `${companyName} - ${city}`,
        companyName: companyName,
        type: 'SUPPLIER',
        city: city,
        state: INDIAN_STATES[city] || 'Maharashtra',
        gstNumber: `27${String(Math.floor(Math.random() * 90000) + 10000)}${String(Math.floor(Math.random() * 900000) + 100000)}${String(Math.floor(Math.random() * 9) + 1)}Z`,
        panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9000) + 1000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9) + 1)}`,
        verified: Math.random() > 0.3, // 70% verified as requested
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3-5 stars as requested
        completedOrders: Math.floor(Math.random() * 100), // 0-100 as requested
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date()
      }
    });
    
    suppliers.push(supplier);
    if (i % 10 === 0) {
      console.log(`  Created ${i}/${CONFIG.SUPPLIERS_COUNT} suppliers`);
    }
  }
  
  console.log(`✅ Created ${suppliers.length} suppliers`);
  return suppliers;
}

/**
 * Create 20 buyer accounts with realistic Indian business data
 */
async function createBuyers() {
  const buyers = [];
  
  for (let i = 1; i <= CONFIG.BUYERS_COUNT; i++) {
    const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
    const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
    const companyName = `${BUYER_COMPANIES[i % BUYER_COMPANIES.length]} ${COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)]}`;
    
    const buyer = await prisma.user.create({
      data: {
        email: `buyer${i}@bell24h.com`,
        phone: `+918${String(100000000 + i).padStart(9, '0')}`,
        password: await bcrypt.hash(CONFIG.DEFAULT_PASSWORD, CONFIG.SALT_ROUNDS),
        name: `${companyName} - ${city}`,
        companyName: companyName,
        type: 'BUYER',
        city: city,
        state: INDIAN_STATES[city] || 'Maharashtra',
        gstNumber: `27${String(Math.floor(Math.random() * 90000) + 10000)}${String(Math.floor(Math.random() * 900000) + 100000)}${String(Math.floor(Math.random() * 9) + 1)}Z`,
        panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9000) + 1000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 9) + 1)}`,
        verified: Math.random() > 0.1, // 90% verified
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0 stars
        completedOrders: Math.floor(Math.random() * 200),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date()
      }
    });
    
    buyers.push(buyer);
    if (i % 5 === 0) {
      console.log(`  Created ${i}/${CONFIG.BUYERS_COUNT} buyers`);
    }
  }
  
  console.log(`✅ Created ${buyers.length} buyers`);
  return buyers;
}

/**
 * Create 30 RFQs with realistic Indian B2B requirements
 * Budget: ₹10,000 - ₹1,000,000 (as requested)
 * Delivery: 7-30 days (as requested)
 */
async function createRFQs(buyers: any[], categories: any[]) {
  const rfqs = [];
  
  for (let i = 1; i <= CONFIG.RFQS_COUNT; i++) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const product = B2B_PRODUCTS[Math.floor(Math.random() * B2B_PRODUCTS.length)];
    const category = categories.find(cat => cat.name === product.category) || categories[0];
    const quantity = Math.floor(Math.random() * (product.maxQty - product.minQty)) + product.minQty;
    const deadlineDays = Math.floor(Math.random() * 23) + 7; // 7-30 days from now (as requested)
    const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);
    const budgetRange = Math.floor(Math.random() * 990000) + 10000; // ₹10,000 - ₹1,000,000 (as requested)
    
    // Use realistic titles from the predefined list
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
- GST registration mandatory
- Previous supply experience preferred
- Quality certification required
- Competitive pricing expected
- Timely delivery commitment essential
- Local suppliers preferred for faster delivery`,
        categoryId: category.id,
        buyerId: buyer.id,
        quantity: quantity,
        unit: product.unit,
        targetPrice: budgetRange,
        deadline: deadline,
        deliveryLocation: `${buyer.city}, ${buyer.state}`,
        status: i <= 20 ? 'ACTIVE' : ['CLOSED', 'EXPIRED'][Math.floor(Math.random() * 2)], // First 20 are active
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)), // Random within last 60 days
        updatedAt: new Date()
      }
    });
    
    rfqs.push(rfq);
    if (i % 10 === 0) {
      console.log(`  Created ${i}/${CONFIG.RFQS_COUNT} RFQs`);
    }
  }
  
  console.log(`✅ Created ${rfqs.length} RFQs`);
  return rfqs;
}

/**
 * Create 50 quotes (2-3 quotes per RFQ as requested)
 */
async function createQuotes(suppliers: any[], rfqs: any[]) {
  const quotes = [];
  
  for (let i = 1; i <= CONFIG.QUOTES_COUNT; i++) {
    const rfq = rfqs[Math.floor(Math.random() * rfqs.length)];
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    
    // Skip if supplier is from same city as buyer (to add diversity)
    if (Math.random() > 0.7 && supplier.city === rfqs.find(r => r.id === rfq.id)?.buyer?.city) {
      continue;
    }
    
    const unitPrice = Math.floor(rfq.targetPrice * (0.8 + Math.random() * 0.4)); // 80-120% of target price
    const quantity = rfq.quantity;
    const totalPrice = unitPrice * quantity;
    const deliveryDays = Math.floor(Math.random() * 30) + 5; // 5-35 days
    const validityDays = Math.floor(Math.random() * 30) + 15; // 15-45 days validity
    
    const quote = await prisma.quote.create({
      data: {
        rfqId: rfq.id,
        supplierId: supplier.id,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        quantity: quantity,
        deliveryTime: deliveryDays,
        paymentTerms: ['30 Days', '45 Days', '60 Days', 'COD'][Math.floor(Math.random() * 4)],
        status: i <= 30 ? 'PENDING' : ['ACCEPTED', 'REJECTED', 'EXPIRED'][Math.floor(Math.random() * 3)],
        notes: `Special Notes:
- Bulk order discounts available
- Sample available on request
- Technical support provided
- Installation assistance available
- After-sales service guaranteed`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date()
      }
    });
    
    quotes.push(quote);
    
    if (i % 10 === 0) {
      console.log(`  Created ${i}/${CONFIG.QUOTES_COUNT} quotes`);
    }
  }
  
  console.log(`✅ Created ${quotes.length} quotes`);
  return quotes;
}

/**
 * Create 100 messages with Hindi-English mix (as requested)
 */
async function createMessages(buyers: any[], suppliers: any[], rfqs: any[]) {
  const messages = [];
  
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
    
    const messageType = ['rfq_clarification', 'quote_negotiation', 'order_confirmation', 'logistics', 'payment'][Math.floor(Math.random() * 5)];
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
        content = `Could you please confirm the delivery schedule and provide tracking details once the shipment is dispatched? We need to coordinate our receiving arrangements.`;
        break;
      case 'payment':
        content = `The payment has been processed as per our agreed terms. Please confirm receipt and provide the necessary documentation for our records.`;
        break;
    }
    
    const message = await prisma.message.create({
      data: {
        rfqId: rfq.id,
        senderId: sender.id,
        receiverId: receiver.id,
        content: content,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date()
      }
    });
    
    messages.push(message);
    if (i % 20 === 0) {
      console.log(`  Created ${i}/${CONFIG.MESSAGES_COUNT} messages`);
    }
  }
  
  console.log(`✅ Created ${messages.length} messages`);
  return messages;
}

/**
 * Create 25 payment records
 */
async function createPayments(buyers: any[], suppliers: any[], rfqs: any[], quotes: any[]) {
  const payments = [];
  
  for (let i = 1; i <= CONFIG.PAYMENTS_COUNT; i++) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const rfq = rfqs.find(r => r.id === quote.rfqId);
    const buyer = buyers.find(b => b.id === rfq.buyerId);
    const supplier = suppliers.find(s => s.id === quote.supplierId);
    
    const amount = Math.floor(quote.totalPrice * (0.3 + Math.random() * 0.7)); // 30-100% of quote
    const status = Math.random() > 0.8 ? 'FAILED' : 'COMPLETED';
    
    const payment = await prisma.payment.create({
      data: {
        amount: amount,
        currency: 'INR',
        status: status,
        razorpayOrderId: `order_${Date.now()}_${i}`,
        razorpayPaymentId: status === 'COMPLETED' ? `pay_${Date.now()}_${i}` : null,
        razorpaySignature: status === 'COMPLETED' ? `signature_${Date.now()}_${i}` : null,
        buyerId: buyer.id,
        supplierId: supplier.id,
        rfqId: rfq.id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date()
      }
    });
    
    payments.push(payment);
    if (i % 5 === 0) {
      console.log(`  Created ${i}/${CONFIG.PAYMENTS_COUNT} payments`);
    }
  }
  
  console.log(`✅ Created ${payments.length} payments`);
  return payments;
}

/**
 * Execute the seed function
 */
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Database seeding completed successfully!');
      console.log('\n📋 Quick Test Commands:');
      console.log('  $env:DATABASE_URL="file:./dev.db"');
      console.log('  npx prisma studio');
      console.log('  # Open http://localhost:5555 to browse data');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };