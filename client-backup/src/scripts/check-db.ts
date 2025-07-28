// Script to check database connection and tables
require('dotenv').config();
const { db } = require('../server/db');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test the connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    
    // Check if users table exists
    try {
      const tables = await db.execute(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      console.log('\n📋 Database tables:');
      console.table(tables.rows);
      
      // Check users table structure
      const usersColumns = await db.execute(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"
      );
      
      if (usersColumns.rows.length > 0) {
        console.log('\n👤 Users table columns:');
        console.table(usersColumns.rows);
      } else {
        console.log('❌ Users table not found or empty');
      }
      
    } catch (error) {
      console.error('\n❌ Error querying database schema:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    console.log('\nMake sure your database is running and the connection string is correct in .env');
    console.log('Current DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'Not set');
  } finally {
    process.exit(0);
  }
}

checkDatabase();
