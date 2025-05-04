/**
 * Database Migration Script for Bell24h
 * 
 * This script creates the database tables if they do not exist already.
 */
import { connectToDatabase, client } from './db';
import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';

// Main migration function
async function runMigrations() {
  console.log('Creating tables if they do not exist...');
  
  try {
    // First test the connection
    const connected = await connectToDatabase();
    if (!connected) {
      console.error('Cannot run migrations: Database connection failed.');
      process.exit(1);
    }
    
    // Create database schema using drizzle-orm
    const db = drizzle(client, { schema });
    
    // Create tables for users
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        business_name VARCHAR(255),
        business_type VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create tables for RFQs
    await client`
      CREATE TABLE IF NOT EXISTS rfqs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        quantity INTEGER,
        budget DECIMAL(10, 2),
        deadline TIMESTAMP,
        status VARCHAR(50) DEFAULT 'open',
        voice_url TEXT,
        original_language VARCHAR(50),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create tables for quotes
    await client`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        price DECIMAL(10, 2) NOT NULL,
        delivery_time TIMESTAMP,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        rfq_id INTEGER REFERENCES rfqs(id),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create tables for messages
    await client`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        rfq_id INTEGER REFERENCES rfqs(id),
        quote_id INTEGER REFERENCES quotes(id),
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create tables for notifications
    await client`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        read BOOLEAN DEFAULT FALSE,
        type VARCHAR(50),
        reference_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Run migrations if executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Database migrations completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default runMigrations;
