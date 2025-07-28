/**
 * Neon PostgreSQL Connection Test
 * 
 * This script verifies connection to your Neon serverless PostgreSQL database.
 * Make sure you have a valid DATABASE_URL in your .env file.
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

// Validate environment variable
if (!process.env.DATABASE_URL) {
  console.error('\x1b[31mERROR: DATABASE_URL is not set in your .env file\x1b[0m');
  console.log('Please create a .env file with your Neon database connection string:');
  console.log('DATABASE_URL=postgres://user:password@hostname/database');
  process.exit(1);
}

// Create SQL query function
const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  console.log('Attempting to connect to Neon PostgreSQL...');
  
  try {
    // Test basic connection
    const versionResult = await sql`SELECT version()`;
    console.log('\x1b[32m✓ Successfully connected to PostgreSQL!\x1b[0m');
    console.log(`PostgreSQL version: ${versionResult[0].version}`);
    
    // Get database size
    const sizeResult = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
    `;
    console.log(`Database size: ${sizeResult[0].db_size}`);
    
    // List tables (if any)
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tablesResult.length > 0) {
      console.log('\nAvailable tables:');
      tablesResult.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    } else {
      console.log('\nNo tables found in the public schema.');
    }
    
    console.log('\n\x1b[32m✓ Connection test completed successfully!\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m✗ Connection failed:\x1b[0m', err);
    console.log('\nPossible issues:');
    console.log('1. Invalid connection string');
    console.log('2. Database server is not accessible');
    console.log('3. Network/firewall restrictions');
    console.log('4. Invalid credentials');
  }
}

// Run the test
testConnection();
