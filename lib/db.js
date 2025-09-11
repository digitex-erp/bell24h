// lib/db.js - Database Connection Pooling for Neon.tech
// Critical for preventing crashes under load

import { Pool } from 'pg';

// Connection pool configuration optimized for Neon.tech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Neon free tier limit
  min: 2, // Minimum connections to keep alive
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout after 2 seconds
  ssl: {
    rejectUnauthorized: false // Required for Neon.tech
  },
  // Retry configuration
  retryDelayMs: 1000,
  retryAttempts: 3
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database pool...');
  await pool.end();
  process.exit(0);
});

export default pool;

// Helper function for safe queries with retry logic
export async function safeQuery(text, params = [], retries = 3) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    
    // Retry on connection errors
    if (retries > 0 && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
      console.log(`Retrying query... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return safeQuery(text, params, retries - 1);
    }
    
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Helper function for transactions with retry logic
export async function withTransaction(callback, retries = 3) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    
    // Retry on connection errors
    if (retries > 0 && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
      console.log(`Retrying transaction... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return withTransaction(callback, retries - 1);
    }
    
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}
