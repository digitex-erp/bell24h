'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, X, ArrowUpRight, Loader2 } from 'lucide-react';

interface SubscriptionPlan {
  identifier: string;
  displayName: string;
  features: string[];
  limits: {
    rfqsPerMonth: number;
    suppliersPerRfq: number;
    storageGB: number;
  };
  price: number;
  currency: string;
  isPopular?: boolean;
  savings?: string;
}

interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  currentPlan: SubscriptionPlan;
  subscriptionStatus: 'free' | 'active' | 'expired';
  expirationDate?: string;
  managementURL?: string;
  usage: {
    rfqsThisMonth: number;
    apiCallsThisMonth: number;
    storageUsedGB: number;
  };
}

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch current subscription
      const subResponse = await fetch('/api/subscriptions/current');
      const subData = await subResponse.json();
      
      // Fetch available plans
      const plansResponse = await fetch('/api/subscriptions/plans');
      const plansData = await plansResponse.json();
      
      if (subData.success) {
        setSubscription(subData.subscription);
      }
      
      if (plansData.success) {
        setPlans(plansData.plans);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    try {
      setPurchasing(planId);
      
      const response = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: planId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh subscription data
        await fetchSubscriptionData();
      } else {
        alert('Purchase failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Failed to load subscription information</p>
        <Button onClick={fetchSubscriptionData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            {subscription.subscriptionStatus === 'active' 
              ? 'You have an active subscription'
              : 'You are on the free plan'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{subscription.currentPlan.displayName}</h3>
                <p className="text-sm text-gray-500">
                  {subscription.currentPlan.price === 0 
                    ? 'Free'
                    : `₹${subscription.currentPlan.price.toLocaleString()}/month`
                  }
                </p>
              </div>
              <Badge 
                variant={subscription.subscriptionStatus === 'active' ? 'success' : 'secondary'}
              >
                {subscription.subscriptionStatus}
              </Badge>
            </div>

            {/* Usage Statistics */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>RFQs This Month</span>
                  <span>
                    {subscription.usage.rfqsThisMonth} / 
                    {subscription.currentPlan.limits.rfqsPerMonth === -1 
                      ? '∞'
                      : subscription.currentPlan.limits.rfqsPerMonth
                    }
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(
                    subscription.usage.rfqsThisMonth,
                    subscription.currentPlan.limits.rfqsPerMonth
                  )}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage Used</span>
                  <span>
                    {subscription.usage.storageUsedGB} GB / 
                    {subscription.currentPlan.limits.storageGB === -1 
                      ? '∞'
                      : `${subscription.currentPlan.limits.storageGB} GB`
                    }
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(
                    subscription.usage.storageUsedGB,
                    subscription.currentPlan.limits.storageGB
                  )}
                  className="h-2"
                />
              </div>
            </div>

            {subscription.managementURL && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(subscription.managementURL, '_blank')}
              >
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.identifier} 
              className={`relative ${plan.isPopular ? 'border-blue-500 border-2' : ''}`}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle>{plan.displayName}</CardTitle>
                <div className="text-3xl font-bold">
                  ₹{plan.price.toLocaleString()}
                  {plan.price > 0 && <span className="text-sm text-gray-500">/month</span>}
                </div>
                {plan.savings && (
                  <p className="text-sm text-green-600">{plan.savings}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>RFQs per month:</span>
                    <span>{plan.limits.rfqsPerMonth === -1 ? 'Unlimited' : plan.limits.rfqsPerMonth}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Suppliers per RFQ:</span>
                    <span>{plan.limits.suppliersPerRfq === -1 ? 'Unlimited' : plan.limits.suppliersPerRfq}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage:</span>
                    <span>{plan.limits.storageGB === -1 ? 'Unlimited' : `${plan.limits.storageGB} GB`}</span>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => handlePurchase(plan.identifier)}
                  disabled={purchasing === plan.identifier}
                  variant={plan.identifier === subscription.currentPlan.identifier ? 'outline' : 'default'}
                >
                  {purchasing === plan.identifier ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : plan.identifier === subscription.currentPlan.identifier ? (
                    'Current Plan'
                  ) : (
                    'Upgrade'
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
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.identifier} className="text-center p-2">
                      {plan.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">AI-Powered Matching</td>
                  {plans.map((plan) => (
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
                  {plans.map((plan) => (
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
                  {plans.map((plan) => (
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
                  {plans.map((plan) => (
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