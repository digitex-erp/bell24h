// Script to create a test user for password reset testing
require('dotenv').config();
const { db } = require('../server/db');
const { users } = require('../server/models/schema');
const bcrypt = require('bcrypt');

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test@1234';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if user already exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, TEST_EMAIL))
      .limit(1);
    
    if (existingUser) {
      console.log('ℹ️ Test user already exists:');
      console.log(`ID: ${existingUser.id}`);
      console.log(`Name: ${existingUser.name}`);
      console.log(`Email: ${existingUser.email}`);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    
    // Create test user
    const [newUser] = await db.insert(users)
      .values({
        name: 'Test User',
        email: TEST_EMAIL,
        password: hashedPassword,
        email_verified: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    console.log('✅ Test user created successfully!');
    console.log(`ID: ${newUser.id}`);
    console.log(`Name: ${newUser.name}`);
    console.log(`Email: ${newUser.email}`);
    console.log('\nYou can now test the password reset flow with this user.');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();
