// Simple script to check if test user exists
require('dotenv').config();
const { db } = require('../server/db');
const { users } = require('../server/models/schema');
const { eq } = require('drizzle-orm');

async function checkTestUser() {
  try {
    console.log('Checking for test user...');
    const [user] = await db.select().from(users).where(eq(users.email, 'test@example.com')).limit(1);
    
    if (user) {
      console.log('✅ Test user found:');
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Created: ${user.created_at}`);
    } else {
      console.log('❌ Test user not found. To create a test user, run:');
      console.log('   npx ts-node src/scripts/create-test-user.ts');
    }
  } catch (error) {
    console.error('Error checking test user:', error);
  } finally {
    process.exit(0);
  }
}

checkTestUser();
