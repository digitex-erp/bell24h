// seed_data.js - Script to seed the database with initial data
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

// Set up database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sample industry data
const industries = [
  { name: 'Manufacturing', description: 'Industrial manufacturing companies' },
  { name: 'Electronics', description: 'Electronic components and devices' },
  { name: 'Chemicals', description: 'Chemical production and processing' },
  { name: 'Automotive', description: 'Automobile parts and assembly' },
  { name: 'Textiles', description: 'Textile manufacturing and processing' }
];

// Sample category data
const categories = [
  { name: 'Metal Fabrication', industry_id: 1, description: 'Custom metal fabrication services' },
  { name: 'Plastic Molding', industry_id: 1, description: 'Plastic injection molding services' },
  { name: 'PCB Assembly', industry_id: 2, description: 'Printed circuit board assembly' },
  { name: 'Electronic Components', industry_id: 2, description: 'Electronic components supply' },
  { name: 'Industrial Chemicals', industry_id: 3, description: 'Chemicals for industrial use' },
  { name: 'Auto Parts', industry_id: 4, description: 'Automotive parts manufacturing' },
  { name: 'Fabric Manufacturing', industry_id: 5, description: 'Textile and fabric manufacturing' }
];

// Sample user data (buyers and suppliers)
const users = [
  {
    username: 'techbuyer1',
    password: 'password123', // In a real app, this would be hashed
    email: 'buyer@techcompany.com',
    full_name: 'John Tech',
    company_name: 'Tech Innovations Ltd',
    role: 'buyer',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India'
  },
  {
    username: 'supplier1',
    password: 'password123', // In a real app, this would be hashed
    email: 'supplier@metalworks.com',
    full_name: 'Rajesh Kumar',
    company_name: 'Metal Works Industries',
    role: 'supplier',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India'
  }
];

// Sample RFQ data
const rfqs = [
  {
    title: 'Custom Metal Fabrication for Industrial Equipment',
    description: 'Looking for suppliers capable of fabricating custom metal components for industrial machinery. The parts need to meet high precision standards and durability requirements.',
    buyer_id: 1,
    category_id: 1,
    quantity: 500,
    budget: 250000,
    deadline: new Date(2025, 5, 15), // June 15, 2025
    delivery_location: 'Mumbai, Maharashtra',
    status: 'published',
    requirements: JSON.stringify({
      material: 'Stainless Steel 316',
      thickness: '2-5mm',
      tolerance: '±0.05mm',
      finish: 'Brushed'
    })
  },
  {
    title: 'PCB Assembly for IoT Devices',
    description: 'Seeking PCB assembly services for a new line of IoT devices. Need a supplier with experience in surface mount technology and testing capabilities.',
    buyer_id: 1,
    category_id: 3,
    quantity: 1000,
    budget: 350000,
    deadline: new Date(2025, 4, 30), // May 30, 2025
    delivery_location: 'Bangalore, Karnataka',
    status: 'published',
    requirements: JSON.stringify({
      boardSize: '10cm x 8cm',
      layers: 4,
      components: 'SMT and THT',
      testing: 'Full functional testing required'
    })
  }
];

// Sample supplier metrics
const supplierMetrics = [
  {
    supplier_id: 2,
    response_rate: 95.5,
    delivery_time_adherence: 98.2,
    quality_rating: 4.8,
    communication_rating: 4.7,
    overall_rating: 4.7
  }
];

// Function to seed the database
async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Starting database seeding...');
    
    // Insert industries
    console.log('Seeding industries...');
    for (const industry of industries) {
      await client.query(
        'INSERT INTO industries (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [industry.name, industry.description]
      );
    }
    
    // Insert categories
    console.log('Seeding categories...');
    for (const category of categories) {
      await client.query(
        'INSERT INTO categories (name, industry_id, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [category.name, category.industry_id, category.description]
      );
    }
    
    // Insert users
    console.log('Seeding users...');
    for (const user of users) {
      await client.query(
        `INSERT INTO users (
          username, password, email, full_name, company_name, role, 
          city, state, country
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        ON CONFLICT (username) DO NOTHING`,
        [
          user.username, user.password, user.email, user.full_name, 
          user.company_name, user.role, user.city, user.state, user.country
        ]
      );
    }
    
    // Insert RFQs
    console.log('Seeding RFQs...');
    for (const rfq of rfqs) {
      await client.query(
        `INSERT INTO rfqs (
          title, description, buyer_id, category_id, quantity, 
          budget, deadline, delivery_location, status, requirements
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING`,
        [
          rfq.title, rfq.description, rfq.buyer_id, rfq.category_id, 
          rfq.quantity, rfq.budget, rfq.deadline, rfq.delivery_location,
          rfq.status, rfq.requirements
        ]
      );
    }
    
    // Insert supplier metrics
    console.log('Seeding supplier metrics...');
    for (const metrics of supplierMetrics) {
      await client.query(
        `INSERT INTO supplier_metrics (
          supplier_id, response_rate, delivery_time_adherence, 
          quality_rating, communication_rating, overall_rating
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING`,
        [
          metrics.supplier_id, metrics.response_rate, metrics.delivery_time_adherence,
          metrics.quality_rating, metrics.communication_rating, metrics.overall_rating
        ]
      );
    }
    
    await client.query('COMMIT');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during database seeding:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('Seed process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Seed process failed:', error);
    process.exit(1);
  });