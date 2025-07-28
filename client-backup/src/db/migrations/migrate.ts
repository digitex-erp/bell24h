import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Read all migration files
    const migrationsDir = path.join(__dirname, './');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Execute each migration file
    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await pool.query(sql);
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
