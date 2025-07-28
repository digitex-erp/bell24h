// This is a simplified test script to test the password reset flow
// Run with: npx ts-node src/scripts/test-password-reset.ts

require('ts-node/register');
const { db } = require('../server/db');
const { users } = require('../server/models/schema');
const { eq } = require('drizzle-orm');
const { getPasswordResetEmailTemplate } = require('../utils/emailTemplates');
const { sendEmail } = require('../utils/emailService');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Simple logging function
const log = (message: string) => console.log(`[${new Date().toISOString()}] ${message}`);

// Load environment variables
dotenv.config();

// Test configuration
const TEST_EMAIL = 'test@example.com';

/**
 * Main test function
 */
async function main() {
  try {
    log('Starting password reset test...');
    
    // 1. Find the test user
    log(`Looking up test user: ${TEST_EMAIL}`);
    const [testUser] = await db.select().from(users).where(eq(users.email, TEST_EMAIL)).limit(1);
    
    if (!testUser) {
      throw new Error(`Test user not found: ${TEST_EMAIL}. Please create this user first.`);
    }
    
    log(`Found user: ${testUser.name} (ID: ${testUser.id})`);
    
    // 2. Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    log(`Generated reset token: ${resetToken}`);
    
    // 3. Update user with token
    await db.update(users)
      .set({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString(),
        updated_at: new Date()
      })
      .where(eq(users.id, testUser.id));
    
    log('Updated user with reset token');
    
    // 4. Generate and send email
    const email = getPasswordResetEmailTemplate(testUser.name || 'User', resetToken);
    
    log('Sending password reset email...');
    const result = await sendEmail({
      to: testUser.email,
      subject: email.subject,
      text: email.text,
      html: email.html
    });
    
    log('Password reset email sent successfully!');
    log(`Ethereal Preview URL: ${result.previewUrl}`);
    
    // 5. Show next steps
    console.log('\n✅ Password reset test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Check your email (or Ethereal inbox) for the reset link');
    console.log('2. Or use this token to reset the password:');
    console.log(`   Token: ${resetToken}`);
    console.log('\nTo reset the password, make a POST request to:');
    console.log('POST http://localhost:3001/api/auth/reset-password');
    console.log('Body: { "token": "<token>", "password": "new-password" }');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
