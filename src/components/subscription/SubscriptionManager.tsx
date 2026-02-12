'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Loader2, Crown, Zap, Star } from 'lucide-react';

// Note: RevenueCat web SDK would be imported here in a real implementation
// import { Purchases, PurchasesPackage } from '@revenuecat/purchases-js';

interface PurchasesPackage {
  identifier: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

interface CustomerInfo {
  activeSubscriptions: string[];
  entitlements: {
    active: Record<string, any>;
  };
  expirationDate?: string;
}

interface SubscriptionPlan {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  features: string[];
  isPopular?: boolean;
  icon: React.ReactNode;
}

export default function SubscriptionManager({ userId }: { userId: string }) {
  const [offerings, setOfferings] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    if (userId) {
      loadOfferings();
      checkCurrentSubscription();
    }
  }, [userId]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch available plans from our API
      const response = await fetch('/api/subscriptions/plans');
      const data = await response.json();
      
      if (data.success) {
        // Transform RevenueCat packages to our format
        const plans: SubscriptionPlan[] = data.plans.map((plan: any) => ({
          identifier: plan.identifier,
          title: plan.displayName,
          description: plan.description || 'Premium subscription plan',
          price: plan.price,
          priceString: `₹${plan.price.toLocaleString()}${plan.price > 0 ? '/month' : ''}`,
          features: plan.features || [],
          isPopular: plan.isPopular,
          icon: plan.identifier.includes('pro') ? <Crown className="h-5 w-5" /> : 
                 plan.identifier.includes('starter') ? <Zap className="h-5 w-5" /> : 
                 <Star className="h-5 w-5" />
        }));
        
        setOfferings(plans);
      } else {
        throw new Error('Failed to load subscription plans');
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentSubscription = async () => {
    try {
      // Check current subscription status
      const response = await fetch('/api/subscriptions/current');
      const data = await response.json();
      
      if (data.success && data.subscription) {
        setCurrentPlan(data.subscription.currentPlan?.identifier || null);
        setCustomerInfo({
          activeSubscriptions: data.subscription.hasActiveSubscription ? [data.subscription.currentPlan?.identifier || ''] : [],
          entitlements: {
            active: data.subscription.entitlements || {}
          },
          expirationDate: data.subscription.expirationDate
        });
      }
    } catch (error) {
      console.error('Failed to check current subscription:', error);
    }
  };

  const handlePurchase = async (packageIdentifier: string) => {
    try {
      setPurchasing(packageIdentifier);
      setError(null);
      
      // Purchase through our API
      const response = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageId: packageIdentifier,
          userId 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentPlan(packageIdentifier);
        setCustomerInfo(data.customerInfo);
        
        // Trigger n8n workflow for subscription activation
        await triggerN8NWorkflow('subscription-activated', {
          userId,
          plan: packageIdentifier,
          event: 'purchase'
        });
        
        // Show success message
        alert('Subscription activated successfully!');
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      setError(error instanceof Error ? error.message : 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const triggerN8NWorkflow = async (workflow: string, data: any) => {
    try {
      await fetch(`/api/webhooks/n8n/${workflow}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to trigger n8n workflow:', error);
    }
  };

  const isCurrentPlan = (planIdentifier: string) => {
    return currentPlan === planIdentifier;
  };

  const hasActiveSubscription = () => {
    return currentPlan && currentPlan !== 'bell24h_free';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {hasActiveSubscription() && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>
            You have an active <strong>{currentPlan}</strong> subscription. 
            {customerInfo?.expirationDate && (
              <> Expires on {new Date(customerInfo.expirationDate).toLocaleDateString()}</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Plan Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offerings.map((plan) => (
            <Card 
              key={plan.identifier} 
              className={`relative ${plan.isPopular ? 'border-blue-500 border-2' : ''} ${
                isCurrentPlan(plan.identifier) ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <div className="text-blue-600">{plan.icon}</div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{plan.priceString}</div>
                  {plan.price > 0 && (
                    <div className="text-sm text-gray-500">per month</div>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full"
                  onClick={() => handlePurchase(plan.identifier)}
                  disabled={purchasing === plan.identifier || isCurrentPlan(plan.identifier)}
                  variant={isCurrentPlan(plan.identifier) ? 'outline' : 'default'}
                >
                  {purchasing === plan.identifier ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : isCurrentPlan(plan.identifier) ? (
                    'Current Plan'
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Feature</th>
                  {offerings.map((plan) => (
                    <th key={plan.identifier} className="text-center p-2">
                      {plan.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">AI-Powered Matching</td>
                  {offerings.map((plan) => (
                    <td key={plan.identifier} className="text-center p-2">
                      {plan.identifier !== 'bell24h_free' ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2">Voice RFQ Processing</td>
                  {offerings.map((plan) => (
                    <td key={plan.identifier} className="text-center p-2">
                      {plan.identifier === 'bell24h_pro_monthly' || plan.identifier === 'bell24h_enterprise_yearly' ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2">Priority Support</td>
                  {offerings.map((plan) => (
                    <td key={plan.identifier} className="text-center p-2">
                      {plan.identifier !== 'bell24h_free' ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2">API Access</td>
                  {offerings.map((plan) => (
                    <td key={plan.identifier} className="text-center p-2">
                      {plan.identifier !== 'bell24h_free' ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}