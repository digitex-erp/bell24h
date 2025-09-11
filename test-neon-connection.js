#!/usr/bin/env node

/**
 * Test Neon.tech Database Connection
 * This script verifies that your Neon database is working correctly
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  console.log('🧪 Testing Neon.tech Database Connection...\n');

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const client = await pool.connect();
    console.log('   ✅ Connected to Neon.tech successfully!');

    // Test query execution
    console.log('\n2. Testing query execution...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('   ✅ Database query works!');
    console.log(`   📅 Current time: ${result.rows[0].current_time}`);
    console.log(`   🐘 PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);

    // Test table existence (if any)
    console.log('\n3. Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    if (tablesResult.rows.length > 0) {
      console.log('   ✅ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`      - ${row.table_name}`);
      });
    } else {
      console.log('   ℹ️  No tables found (this is normal for a new database)');
    }

    client.release();

    console.log('\n🎉 All tests passed! Your Neon.tech database is ready for Bell24h!');
    console.log('\n📊 Database Status:');
    console.log('   ✅ Connection: Working');
    console.log('   ✅ Queries: Working');
    console.log('   ✅ SSL: Enabled');
    console.log('   💰 Cost: FREE (within limits)');

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your DATABASE_URL environment variable');
    console.log('   2. Verify your Neon.tech connection string');
    console.log('   3. Ensure your Neon database is active');
    console.log('   4. Check your internet connection');

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection();