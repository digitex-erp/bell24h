/**
 * RevenueCat Integration Test Component
 * Test the complete RevenueCat integration with your API keys
 */

'use client';

import { useState, useEffect } from 'react';
import { RevenueCatService, BELL24H_PLANS, getPlanDetails } from '@/lib/revenuecat-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X, Zap, Crown, Star, TrendingUp } from 'lucide-react';

export default function RevenueCatTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Auto-run basic tests on component mount
    runBasicTests();
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runBasicTests = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setTestResults([]);

    try {
      addTestResult('Starting RevenueCat integration tests...');

      // Test 1: Initialize RevenueCat
      addTestResult('Testing RevenueCat client initialization...');
      await RevenueCatService.initialize();
      addTestResult('✅ RevenueCat client initialized successfully');

      // Test 2: Get offerings
      addTestResult('Testing subscription offerings...');
      const offerings = await RevenueCatService.getOfferings();
      setOfferings(offerings.current?.availablePackages || []);
      addTestResult(`✅ Found ${offerings.current?.availablePackages?.length || 0} subscription packages`);

      // Test 3: Get customer info (might fail in test environment)
      try {
        addTestResult('Testing customer info retrieval...');
        const customer = await RevenueCatService.getCustomerInfo();
        setCustomerInfo(customer);
        addTestResult('✅ Customer info retrieved successfully');
      } catch (err) {
        addTestResult('⚠️ Customer info test failed (expected in test environment)');
      }

      // Test 4: Check subscription status
      addTestResult('Testing subscription status check...');
      const hasSubscription = await RevenueCatService.hasActiveSubscription();
      addTestResult(`✅ Subscription status: ${hasSubscription ? 'Active' : 'No active subscription'}`);

      setSuccess('All basic tests completed successfully!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addTestResult(`❌ Test failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testPurchaseFlow = async (packageId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      addTestResult(`Testing purchase flow for package: ${packageId}`);
      
      // This will open RevenueCat's purchase UI
      const result = await RevenueCatService.purchasePackage(packageId);
      
      addTestResult(`✅ Purchase completed: ${result.customerInfo?.activeSubscriptions?.join(', ') || 'No subscriptions'}`);
      setSuccess('Purchase test completed!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
      addTestResult(`❌ Purchase test failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      addTestResult('Testing webhook endpoint...');
      
      const testWebhookData = {
        type: 'INITIAL_PURCHASE',
        app_user_id: 'test_user_123',
        product_id: 'bell24h_pro_monthly',
        transaction_id: 'test_transaction_123',
        original_transaction_id: 'test_original_123',
        purchased_at_ms: Date.now(),
        expiration_at_ms: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        environment: 'sandbox',
        is_trial_conversion: false,
        period_type: 'normal',
        price: 2999,
        presentment_currency: 'INR'
      };

      const response = await fetch('/api/revenuecat/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_RHgyTMFrokLrDxhXtNGkKZWNrJl'
        },
        body: JSON.stringify(testWebhookData)
      });

      const result = await response.json();
      
      if (response.ok) {
        addTestResult('✅ Webhook test successful');
        setSuccess('Webhook test completed!');
      } else {
        throw new Error(result.error || 'Webhook test failed');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Webhook test failed';
      setError(errorMessage);
      addTestResult(`❌ Webhook test failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planIdentifier: string) => {
    if (planIdentifier.includes('enterprise')) return <Crown className="h-5 w-5" />;
    if (planIdentifier.includes('pro')) return <Zap className="h-5 w-5" />;
    if (planIdentifier.includes('starter')) return <TrendingUp className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RevenueCat Integration Test</CardTitle>
          <CardDescription>
            Test your RevenueCat integration with your API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-xs font-mono text-gray-600">
                      {result}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Test Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={runBasicTests}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Run Basic Tests
            </Button>

            <Button 
              onClick={testWebhook}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              Test Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      {offerings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Subscription Plans</CardTitle>
            <CardDescription>
              RevenueCat offerings detected for Bell24H
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(BELL24H_PLANS).map((plan) => (
                <Card key={plan.identifier} className={plan.isPopular ? 'border-blue-500' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                      <div className="text-blue-600">{getPlanIcon(plan.identifier)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{plan.price.toLocaleString()}
                        {plan.price > 0 && <span className="text-sm text-gray-500">/month</span>}
                      </div>
                      {plan.identifier === 'bell24h_pro_yearly' && (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          Save ₹7,188/year
                        </Badge>
                      )}
                    </div>

                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{plan.features.length - 3} more features
                        </li>
                      )}
                    </ul>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => testPurchaseFlow(plan.identifier)}
                      disabled={loading}
                    >
                      Test Purchase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Info */}
      {customerInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Current subscription status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Subscriptions:</span>
                <span className="font-medium">
                  {customerInfo.activeSubscriptions?.join(', ') || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Entitlements:</span>
                <span className="font-medium">
                  {Object.keys(customerInfo.entitlements?.active || {}).join(', ') || 'None'}
                </span>
              </div>
              {customerInfo.expirationDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expires:</span>
                  <span className="font-medium">
                    {new Date(customerInfo.expirationDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}