import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../models/schema';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

// For migrations and seeding
export const migrationClient = postgres(connectionString, { max: 1 });

// For application queries
export const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });

export async function runMigrations() {
  try {
    console.log('Running migrations...');
    await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' });
    console.log('Migrations completed');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}