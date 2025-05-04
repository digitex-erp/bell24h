/**
 * Database Schema Push Script for Bell24h
 * 
 * This script pushes the database schema using direct SQL statements.
 */
import postgres from 'postgres';

// Initialize postgres client with the DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a postgres connection
const sql = postgres(connectionString, { max: 1 });

async function pushSchema() {
  try {
    console.log('Pushing database schema...');
    
    // Test database connection
    try {
      await sql`SELECT 1`;
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
    
    // Create users table with all columns
    console.log('Creating/updating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT,
        business_name TEXT,
        business_type TEXT,
        role TEXT,
        gst_number TEXT,
        business_address TEXT,
        phone TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        wallet_balance DECIMAL(10,2) DEFAULT 0,
        kyc_status TEXT DEFAULT 'pending',
        preferences JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create user_roles table
    console.log('Creating/updating user_roles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        permissions JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create rfqs table
    console.log('Creating/updating rfqs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS rfqs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        quantity INTEGER,
        budget TEXT,
        deadline TIMESTAMP,
        status TEXT,
        voice_url TEXT,
        original_language TEXT,
        category TEXT,
        subcategory TEXT,
        tags JSONB,
        attachments JSONB,
        requirements TEXT,
        visibility TEXT DEFAULT 'public',
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create quotes table
    console.log('Creating/updating quotes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        rfq_id INTEGER NOT NULL REFERENCES rfqs(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        price DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        delivery_time TEXT,
        status TEXT NOT NULL,
        terms TEXT,
        attachments JSONB,
        is_negotiable BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create bids table
    console.log('Creating/updating bids table...');
    await sql`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        rfq_id INTEGER NOT NULL REFERENCES rfqs(id),
        supplier_id INTEGER NOT NULL REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        delivery_time TEXT,
        status TEXT DEFAULT 'pending',
        terms_of_service TEXT,
        attachments JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create products table
    console.log('Creating/updating products table...');
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        category TEXT,
        subcategory TEXT,
        images JSONB,
        specifications JSONB,
        inventory INTEGER DEFAULT 0,
        user_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create suppliers table
    console.log('Creating/updating suppliers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        company_name TEXT NOT NULL,
        description TEXT,
        logo TEXT,
        website TEXT,
        established_year INTEGER,
        employee_count INTEGER,
        annual_revenue TEXT,
        certifications JSONB,
        categories JSONB,
        rating DECIMAL(3,2),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create contracts table
    console.log('Creating/updating contracts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        rfq_id INTEGER REFERENCES rfqs(id),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        supplier_id INTEGER NOT NULL REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        terms TEXT,
        status TEXT DEFAULT 'draft',
        documents JSONB,
        signatures JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create message_threads table first, since messages depends on it
    console.log('Creating/updating message_threads table...');
    await sql`
      CREATE TABLE IF NOT EXISTS message_threads (
        id SERIAL PRIMARY KEY,
        title TEXT,
        rfq_id INTEGER REFERENCES rfqs(id),
        contract_id INTEGER REFERENCES contracts(id),
        last_message_at TIMESTAMP DEFAULT NOW(),
        status TEXT DEFAULT 'active',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create messages table 
    console.log('Creating/updating messages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        thread_id INTEGER REFERENCES message_threads(id),
        content TEXT NOT NULL,
        attachments JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create thread_participants table
    console.log('Creating/updating thread_participants table...');
    await sql`
      CREATE TABLE IF NOT EXISTS thread_participants (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES message_threads(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        is_active BOOLEAN DEFAULT TRUE,
        role TEXT,
        last_read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create market_data table
    console.log('Creating/updating market_data table...');
    await sql`
      CREATE TABLE IF NOT EXISTS market_data (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        subcategory TEXT,
        price_index DECIMAL(10,2),
        supply_index DECIMAL(10,2),
        demand_index DECIMAL(10,2),
        time_period TEXT NOT NULL,
        region TEXT,
        data_source TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create market_trends table
    console.log('Creating/updating market_trends table...');
    await sql`
      CREATE TABLE IF NOT EXISTS market_trends (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        trend_type TEXT NOT NULL,
        impact TEXT,
        timeframe TEXT,
        source TEXT,
        confidence DECIMAL(3,2),
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create portfolio_items table
    console.log('Creating/updating portfolio_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        images JSONB,
        details JSONB,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create wallet_transactions table
    console.log('Creating/updating wallet_transactions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        reference TEXT,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Create buyer_profiles table
    console.log('Creating/updating buyer_profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS buyer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        company_details JSONB,
        procurement_policy TEXT,
        preferred_payment_terms TEXT,
        preferred_supplier_criteria JSONB,
        annual_procurement_budget DECIMAL(12,2),
        industry_focus JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('Database schema pushed successfully.');
  } catch (error) {
    console.error('Error pushing database schema:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await sql.end();
  }
}

// Run the schema push
pushSchema()
  .then(() => {
    console.log('Schema push completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Schema push failed:', error);
    process.exit(1);
  });
