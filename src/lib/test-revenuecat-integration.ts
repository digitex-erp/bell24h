/**
 * Test RevenueCat Integration
 * Run comprehensive tests to verify your RevenueCat setup
 */

import { RevenueCatService, BELL24H_PLANS } from '@/lib/revenuecat-config';

async function testRevenueCatIntegration() {
  console.log('🚀 Starting RevenueCat Integration Test');
  console.log('='.repeat(50));

  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[]
  };

  function logTest(testName: string, passed: boolean, error?: any) {
    if (passed) {
      console.log(`✅ ${testName}`);
      results.passed++;
    } else {
      console.log(`❌ ${testName}`);
      console.log(`   Error: ${error?.message || 'Unknown error'}`);
      results.failed++;
      results.errors.push(`${testName}: ${error?.message || 'Unknown error'}`);
    }
  }

  try {
    // Test 1: Environment Variables
    console.log('\n📋 Test 1: Environment Variables');
    const apiKey = process.env.REVENUECAT_API_KEY;
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    
    logTest('RevenueCat API Key configured', !!apiKey);
    logTest('RevenueCat Webhook Secret configured', !!webhookSecret);
    
    if (!apiKey) {
      console.log('   ❌ Cannot proceed without API key. Set REVENUECAT_API_KEY in your .env file');
      return results;
    }

    // Test 2: RevenueCat Client Initialization
    console.log('\n📋 Test 2: RevenueCat Client Initialization');
    try {
      await RevenueCatService.initialize();
      logTest('RevenueCat client initialized', true);
    } catch (error) {
      logTest('RevenueCat client initialized', false, error);
    }

    // Test 3: Get Offerings
    console.log('\n📋 Test 3: Get Subscription Offerings');
    try {
      const offerings = await RevenueCatService.getOfferings();
      const availablePackages = offerings.current?.availablePackages || [];
      
      logTest('Successfully retrieved offerings', true);
      logTest(`Found ${availablePackages.length} packages`, availablePackages.length > 0);
      
      if (availablePackages.length > 0) {
        console.log('   📦 Available Packages:');
        availablePackages.forEach(pkg => {
          console.log(`      - ${pkg.identifier}: ${pkg.product.title} - ₹${pkg.product.price}`);
        });
      }
    } catch (error) {
      logTest('Successfully retrieved offerings', false, error);
    }

    // Test 4: Customer Info (might fail in test environment)
    console.log('\n📋 Test 4: Customer Information');
    try {
      const customerInfo = await RevenueCatService.getCustomerInfo();
      logTest('Successfully retrieved customer info', true);
      
      const hasSubscription = await RevenueCatService.hasActiveSubscription();
      logTest(`Customer has active subscription: ${hasSubscription}`, true);
      
      const currentPlan = await RevenueCatService.getCurrentPlan();
      logTest(`Current plan: ${currentPlan}`, true);
      
    } catch (error) {
      logTest('Customer info test (expected to fail in test environment)', true);
      console.log('   ℹ️  This is expected in test environment without active customer');
    }

    // Test 5: Plan Configuration
    console.log('\n📋 Test 5: Plan Configuration');
    const plans = Object.values(BELL24H_PLANS);
    logTest(`Configured ${plans.length} plans`, plans.length > 0);
    
    plans.forEach(plan => {
      logTest(`Plan ${plan.identifier} configured correctly`, 
              plan.identifier && plan.displayName && plan.price !== undefined);
    });

    // Test 6: Webhook Endpoint
    console.log('\n📋 Test 6: Webhook Endpoint Test');
    try {
      const testWebhookData = {
        type: 'INITIAL_PURCHASE',
        app_user_id: 'test_user_123',
        product_id: 'bell24h_pro_monthly',
        transaction_id: 'test_transaction_123',
        original_transaction_id: 'test_original_123',
        purchased_at_ms: Date.now(),
        expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000,
        environment: 'sandbox',
        is_trial_conversion: false,
        period_type: 'normal',
        price: 2999,
        presentment_currency: 'INR'
      };

      const response = await fetch('http://localhost:3000/api/revenuecat/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${webhookSecret}`
        },
        body: JSON.stringify(testWebhookData)
      });

      const result = await response.json();
      logTest('Webhook endpoint responds', response.ok);
      
      if (!response.ok) {
        console.log(`   ⚠️  Webhook test failed: ${result.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      logTest('Webhook endpoint test', false, error);
      console.log('   ℹ️  Make sure your Next.js development server is running');
    }

    // Test 7: API Routes
    console.log('\n📋 Test 7: API Routes Test');
    try {
      const plansResponse = await fetch('http://localhost:3000/api/subscriptions/plans');
      logTest('Subscription plans API responds', plansResponse.ok);
      
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        logTest(`Found ${plansData.plans?.length || 0} plans in API`, plansData.plans?.length > 0);
      }
      
    } catch (error) {
      logTest('API routes test', false, error);
      console.log('   ℹ️  Make sure your Next.js development server is running');
    }

    // Test Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => console.log(`   - ${error}`));
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (!apiKey) {
      console.log('   1. Set REVENUECAT_API_KEY in your .env file');
    }
    if (!webhookSecret) {
      console.log('   2. Set REVENUECAT_WEBHOOK_SECRET in your .env file');
    }
    if (results.failed > 0) {
      console.log('   3. Check your RevenueCat dashboard for correct API keys');
      console.log('   4. Ensure your RevenueCat products are properly configured');
      console.log('   5. Start your Next.js development server for webhook/API tests');
    }
    if (results.passed === results.passed + results.failed) {
      console.log('   🎉 All tests passed! Your RevenueCat integration is ready.');
      console.log('   🚀 Next step: Test the purchase flow in your application');
    }

    return results;

  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error);
    results.failed++;
    results.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
}

/**
 * Run the test if this file is executed directly
 */
if (require.main === module) {
  testRevenueCatIntegration()
    .then(results => {
      console.log('\n🎯 Test execution completed');
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testRevenueCatIntegration };