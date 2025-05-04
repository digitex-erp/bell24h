/**
 * Script to push the database schema to PostgreSQL
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('Pushing database schema...');

try {
  // Run Drizzle push command to create database tables
  execSync('npx drizzle-kit push:pg', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Error pushing database schema:', error);
  process.exit(1);
}