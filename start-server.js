/**
 * Bell24h Server Starter
 * 
 * This script intelligently starts the Bell24h application server.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if OPENAI_API_KEY is present
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ Warning: OPENAI_API_KEY environment variable is not set.');
  console.warn('Voice RFQ functionality will not work properly without an OpenAI API key.');
}

// Run migrations and seed the database
console.log('🔄 Setting up database...');

try {
  // Run database migrations
  console.log('🗄️  Running database migrations...');
  execSync('npx tsx src/db-migrator.ts', { stdio: 'inherit' });
  
  // Seed the database
  console.log('🌱 Seeding database...');
  execSync('npx tsx db/seed.ts', { stdio: 'inherit' });
  
  // Start the server
  console.log('🚀 Starting Bell24h server...');
  execSync('npx tsx src/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error running server:', error.message);
  process.exit(1);
}
