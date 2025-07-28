/**
 * Database Connection Module for Bell24H
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as schema from '../shared/schema';

// Load environment variables
dotenv.config();

// Get the database connection string from the environment
const connectionString = process.env.DATABASE_URL;

// Initialize the Postgres client
const queryClient = postgres(connectionString || '', {
  max: 10, // Maximum number of connections
  idle_timeout: 30, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
});

// Initialize the Drizzle ORM
export const db = drizzle(queryClient, { schema });

/**
 * Connect to the database
 */
export async function connectToDatabase(): Promise<boolean> {
  try {
    if (!connectionString) {
      console.error('DATABASE_URL environment variable is not set');
      return false;
    }
    
    // Test the connection
    await queryClient`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Close the database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await queryClient.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}
