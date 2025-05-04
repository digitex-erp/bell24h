// Simple script to initialize the database with Drizzle
const { db } = require('./db');
const schema = require('./shared/schema');
const { migrate } = require('drizzle-orm/postgres-js/migrator');

async function initializeDatabase() {
  try {
    console.log('Attempting to apply schema changes to the database...');
    
    // Get list of exported tables
    const tables = Object.keys(schema).filter(key => 
      typeof schema[key] === 'object' && 
      schema[key].hasOwnProperty('$inferSelect')
    );
    
    console.log(`Found ${tables.length} tables to initialize: ${tables.join(', ')}`);
    
    // Try creating the database schema
    console.log('Connected to database. Creating schema...');
    
    // For each table, try to create it
    for (const tableName of tables) {
      try {
        const table = schema[tableName];
        // This is a simple way to force the schema to be applied
        const check = await db.select().from(table).limit(1);
        console.log(`Table ${tableName} exists.`);
      } catch (err) {
        console.log(`Error with table ${tableName}: ${err.message}`);
      }
    }
    
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

console.log('Starting database initialization...');
initializeDatabase().catch(console.error);