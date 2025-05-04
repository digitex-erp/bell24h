
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { CheckCircle } from 'lucide-react';

const plans = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Up to 10 RFQs/month',
      'Basic analytics',
      'Email support',
      'Standard matching'
    ]
  },
  growth: {
    name: 'Growth',
    price: 1499,
    features: [
      'Up to 50 RFQs/month',
      'Advanced analytics',
      'Priority support',
      'AI-powered matching',
      'Invoice discounting'
    ]
  },
  professional: {
    name: 'Professional',
    price: 3999,
    features: [
      'Up to 200 RFQs/month',
      'Premium analytics',
      'Dedicated support',
      'Advanced AI features',
      'Custom integrations',
      'Bulk RFQ tools'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 9999,
    features: [
      'Unlimited RFQs',
      'Enterprise analytics',
      'Account manager',
      'Custom AI models',
      'API access',
      'White-label options',
      'Custom workflows'
    ]
  }
};

export function SubscriptionPlans() {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubscribe(plan: string) {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      
      if (!response.ok) throw new Error('Subscription failed');
      
      toast({
        title: "Success",
        description: "Subscription updated successfully",
        variant: "default"
      });
      
      setCurrentPlan(plan);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600">Scale your business with our flexible subscription plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Object.entries(plans).map(([key, plan]) => (
          <Card key={key} className={`p-6 ${currentPlan === key ? 'ring-2 ring-blue-500' : ''} hover:shadow-lg transition-shadow`}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-4xl font-bold mb-2">
                ₹{plan.price}<span className="text-sm font-normal">/month</span>
              </p>
            </div>

            <ul className="mb-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={currentPlan === key ? "outline" : "default"}
              disabled={loading || currentPlan === key}
              onClick={() => handleSubscribe(key)}
            >
              {loading 
                ? "Processing..." 
                : currentPlan === key 
                  ? 'Current Plan' 
                  : key === 'free' 
                    ? 'Get Started' 
                    : 'Upgrade Now'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
