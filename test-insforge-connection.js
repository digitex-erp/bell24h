/**
 * InsForge Database Connection Test Script
 * Tests all core database operations and API functionality
 *
 * Usage: node test-insforge-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'blue');
  console.log('='.repeat(60) + '\n');
}

// Initialize InsForge client
const supabaseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  error('Missing InsForge environment variables!');
  console.log('\nPlease set in .env.local:');
  console.log('  NEXT_PUBLIC_INSFORGE_URL=https://xxxxx.supabase.co');
  console.log('  NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJhbGc...\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

let testResults = {
  total: 0,
  passed: 0,
  failed: 0
};

async function runTest(testName, testFn) {
  testResults.total++;
  try {
    await testFn();
    success(testName);
    testResults.passed++;
    return true;
  } catch (err) {
    error(`${testName}: ${err.message}`);
    testResults.failed++;
    return false;
  }
}

// Test 1: Database Connection
async function testConnection() {
  section('TEST 1: Database Connection');

  await runTest('Connect to InsForge database', async () => {
    const { data, error: err } = await supabase.from('users').select('count');
    if (err) throw new Error(`Connection failed: ${err.message}`);
  });
}

// Test 2: Verify Tables Exist
async function testTablesExist() {
  section('TEST 2: Verify Database Tables');

  const expectedTables = [
    'users',
    'rfqs',
    'quotes',
    'transactions',
    'otp_verifications',
    'notifications',
    'suppliers',
    'categories',
    'reviews',
    'commissions',
    'referrals',
    'invoices',
    'chat_messages',
    'audit_logs',
    'ai_explanations'
  ];

  for (const table of expectedTables) {
    await runTest(`Table '${table}' exists and accessible`, async () => {
      const { error: err } = await supabase.from(table).select('count', { count: 'exact' });
      if (err) throw new Error(`Table not found or not accessible: ${err.message}`);
    });
  }
}

// Test 3: CRUD Operations on Users Table
async function testUsersCRUD() {
  section('TEST 3: Users Table CRUD Operations');

  let testUserId;

  // CREATE
  await runTest('Create test user', async () => {
    const { data, error: err } = await supabase
      .from('users')
      .insert({
        phone: `+91${Date.now().toString().slice(-10)}`, // Unique phone
        full_name: 'Test User - InsForge Test',
        email: `test${Date.now()}@bell24h.com`,
        user_type: 'buyer',
        verified: true
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    if (!data) throw new Error('No data returned');

    testUserId = data.id;
    info(`Created user ID: ${testUserId}`);
  });

  // READ
  await runTest('Read test user', async () => {
    const { data, error: err } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (err) throw new Error(err.message);
    if (!data) throw new Error('User not found');
    if (data.full_name !== 'Test User - InsForge Test') {
      throw new Error('User data mismatch');
    }
  });

  // UPDATE
  await runTest('Update test user', async () => {
    const { data, error: err } = await supabase
      .from('users')
      .update({ full_name: 'Updated Test User' })
      .eq('id', testUserId)
      .select()
      .single();

    if (err) throw new Error(err.message);
    if (data.full_name !== 'Updated Test User') {
      throw new Error('Update failed');
    }
  });

  // DELETE
  await runTest('Delete test user', async () => {
    const { error: err } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);

    if (err) throw new Error(err.message);
  });
}

// Test 4: RFQ Operations
async function testRFQOperations() {
  section('TEST 4: RFQ Table Operations');

  let testUserId;
  let testRFQId;

  // Create test user first
  await runTest('Create test user for RFQ', async () => {
    const { data, error: err } = await supabase
      .from('users')
      .insert({
        phone: `+91${Date.now().toString().slice(-10)}`,
        full_name: 'RFQ Test User',
        user_type: 'buyer',
        verified: true
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    testUserId = data.id;
  });

  // Create RFQ
  await runTest('Create test RFQ', async () => {
    const { data, error: err } = await supabase
      .from('rfqs')
      .insert({
        user_id: testUserId,
        title: 'Test RFQ - Industrial Steel',
        description: 'Testing RFQ creation',
        category_path: 'Manufacturing > Metals > Steel',
        type: 'text',
        quantity: 1000,
        unit: 'kg',
        status: 'open',
        budget_min: 50000,
        budget_max: 75000,
        currency: 'INR'
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    testRFQId = data.id;
    info(`Created RFQ ID: ${testRFQId}`);
  });

  // Query RFQs
  await runTest('Query RFQs by status', async () => {
    const { data, error: err } = await supabase
      .from('rfqs')
      .select('*')
      .eq('status', 'open')
      .limit(10);

    if (err) throw new Error(err.message);
    if (!Array.isArray(data)) throw new Error('Invalid response format');
  });

  // Cleanup
  await runTest('Cleanup test RFQ', async () => {
    await supabase.from('rfqs').delete().eq('id', testRFQId);
    await supabase.from('users').delete().eq('id', testUserId);
  });
}

// Test 5: OTP Operations
async function testOTPOperations() {
  section('TEST 5: OTP Verification Operations');

  let testOTPId;

  await runTest('Create OTP record', async () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data, error: err } = await supabase
      .from('otp_verifications')
      .insert({
        phone: '+919876543210',
        otp: otp,
        purpose: 'login',
        expires_at: expiresAt,
        verified: false,
        attempts: 0
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    testOTPId = data.id;
    info(`Created OTP: ${otp}`);
  });

  await runTest('Verify OTP exists', async () => {
    const { data, error: err } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('id', testOTPId)
      .single();

    if (err) throw new Error(err.message);
    if (data.verified !== false) throw new Error('OTP should be unverified');
  });

  await runTest('Cleanup OTP', async () => {
    await supabase.from('otp_verifications').delete().eq('id', testOTPId);
  });
}

// Test 6: Notifications
async function testNotifications() {
  section('TEST 6: Notifications System');

  let testUserId;
  let testNotificationId;

  await runTest('Create test user for notifications', async () => {
    const { data, error: err } = await supabase
      .from('users')
      .insert({
        phone: `+91${Date.now().toString().slice(-10)}`,
        full_name: 'Notification Test User',
        user_type: 'buyer'
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    testUserId = data.id;
  });

  await runTest('Create notification', async () => {
    const { data, error: err } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        type: 'test_notification',
        title: 'Test Notification',
        message: 'This is a test notification',
        read: false
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    testNotificationId = data.id;
  });

  await runTest('Query unread notifications', async () => {
    const { data, error: err } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUserId)
      .eq('read', false);

    if (err) throw new Error(err.message);
    if (data.length === 0) throw new Error('No notifications found');
  });

  await runTest('Cleanup notifications', async () => {
    await supabase.from('notifications').delete().eq('id', testNotificationId);
    await supabase.from('users').delete().eq('id', testUserId);
  });
}

// Test 7: Performance (Parallel Queries)
async function testPerformance() {
  section('TEST 7: Performance - Parallel Queries');

  await runTest('Execute 5 parallel queries', async () => {
    const startTime = Date.now();

    const [users, rfqs, quotes, transactions, notifications] = await Promise.all([
      supabase.from('users').select('count', { count: 'exact' }),
      supabase.from('rfqs').select('count', { count: 'exact' }),
      supabase.from('quotes').select('count', { count: 'exact' }),
      supabase.from('transactions').select('count', { count: 'exact' }),
      supabase.from('notifications').select('count', { count: 'exact' })
    ]);

    const duration = Date.now() - startTime;
    info(`Completed in ${duration}ms`);

    if (users.error || rfqs.error || quotes.error || transactions.error || notifications.error) {
      throw new Error('One or more queries failed');
    }
  });
}

// Test 8: Environment Variables
async function testEnvironmentVariables() {
  section('TEST 8: Environment Variables');

  const requiredVars = [
    'NEXT_PUBLIC_INSFORGE_URL',
    'NEXT_PUBLIC_INSFORGE_ANON_KEY'
  ];

  const optionalVars = [
    'INSFORGE_SERVICE_ROLE_KEY',
    'MSG91_AUTH_KEY',
    'RAZORPAY_KEY_ID',
    'GROQ_API_KEY'
  ];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      success(`${varName} is set`);
      testResults.total++;
      testResults.passed++;
    } else {
      error(`${varName} is NOT set (REQUIRED)`);
      testResults.total++;
      testResults.failed++;
    }
  });

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      info(`${varName} is set (optional)`);
    } else {
      warn(`${varName} is NOT set (optional - some features won't work)`);
    }
  });
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'blue');
  log('║                                                           ║', 'blue');
  log('║        INSFORGE DATABASE CONNECTION TEST SUITE            ║', 'blue');
  log('║              Bell24h B2B Platform                         ║', 'blue');
  log('║                                                           ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════╝', 'blue');
  console.log('\n');

  info(`InsForge URL: ${supabaseUrl}`);
  info(`API Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('\n');

  // Run all test suites
  await testEnvironmentVariables();
  await testConnection();
  await testTablesExist();
  await testUsersCRUD();
  await testRFQOperations();
  await testOTPOperations();
  await testNotifications();
  await testPerformance();

  // Print summary
  section('TEST SUMMARY');

  console.log(`Total Tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%\n`);

  if (testResults.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! InsForge is ready for production.\n', 'green');
    process.exit(0);
  } else {
    log('\n❌ SOME TESTS FAILED. Please review errors above.\n', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
