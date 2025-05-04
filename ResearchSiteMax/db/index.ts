/**
 * Database Connection Setup for Bell24h
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Initialize postgres client with the DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a postgres connection
const client = postgres(connectionString, { max: 10 });

// Create a drizzle ORM instance
export const db = drizzle(client, { schema });

/**
 * Tests the database connection
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 */
export async function connectToDatabase(): Promise<boolean> {
  try {
    // Try to connect to the database
    console.log('Testing database connection...');
    await client`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Runs database migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('Running database migrations...');
    // This will run SQL migrations from the 'drizzle' folder
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running database migrations:', error);
    throw error;
  }
}
