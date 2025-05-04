import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Parse the connection string from environment variables
const connectionString = process.env.DATABASE_URL || '';

// Create the PostgreSQL client
const client = postgres(connectionString, { 
  max: 10, // Max number of connections in the pool
  idle_timeout: 30 // Max idle time for connections in seconds
});

// Create Drizzle ORM instance with all schemas
export const db = drizzle(client, { schema });