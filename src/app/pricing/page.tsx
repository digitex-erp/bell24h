import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Button, Card, CardContent, CardHeader, CardTitle, Check, Crown, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';;;

export const metadata: Metadata = {
  title: 'Pricing - Bell24h | Transparent B2B Marketplace Pricing',
  description: 'Choose the perfect plan for your business. Free Forever plan available, Premium plans with advanced features. No hidden costs, transparent pricing.',
  keywords: 'bell24h pricing, B2B marketplace pricing, MSME plans, supplier pricing, free plan',
};

export default function PricingPage() {
  const features = {
    free: [
      'Up to 10 RFQs per month',
      'Basic supplier matching',
      'Email support',
      'Standard verification',
      'Basic analytics',
      'Mobile app access'
    ],
    premium: [
      'Unlimited RFQs',
      'AI-powered matching',
      'Priority support',
      '15-point verification',
      'Advanced analytics',
      'Voice/Video RFQ',
      'Escrow payments',
      'Custom integrations',
      'API access',
      'Dedicated account manager'
    ],
    enterprise: [
      'Everything in Premium',
      'White-label solution',
      'Custom workflows',
      'Advanced security',
      '24/7 phone support',
      'Custom reporting',
      'Multi-user accounts',
      'SLA guarantee',
      'Training & onboarding',
      'Priority feature requests'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
            Choose the perfect plan for your business needs. Start free, scale as you grow.
            No hidden costs, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Free Forever</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">₹0</div>
                <div className="text-gray-600">per month</div>
                <div className="text-sm text-green-600 font-semibold mt-2">
                  Perfect for small businesses
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-indigo-500 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  Most Popular
                </div>
              </div>
              <CardHeader className="text-center pb-4 pt-8">
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Crown className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl text-indigo-900">Premium</CardTitle>
                <div className="text-4xl font-bold text-indigo-600 mb-2">₹3,000</div>
                <div className="text-gray-600">per month</div>
                <div className="text-sm text-indigo-600 font-semibold mt-2">
                  Best for growing businesses
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {features.premium.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Start Premium Trial
                </Button>
                <div className="text-center mt-3 text-sm text-gray-500">
                  14-day free trial
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-emerald-500 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl text-emerald-900">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-emerald-600 mb-2">Custom</div>
                <div className="text-gray-600">contact us</div>
                <div className="text-sm text-emerald-600 font-semibold mt-2">
                  For large organizations
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {features.enterprise.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Pricing Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Additional Services & Fees
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-600">
                  <Shield className="h-6 w-6 mr-2" />
                  Transaction Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Payment Processing</span>
                    <span className="font-semibold">2.5% + GST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Escrow Service</span>
                    <span className="font-semibold">₹500 per transaction</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Instant Settlement</span>
                    <span className="font-semibold">₹200 per transaction</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-600">
                  <Zap className="h-6 w-6 mr-2" />
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Advanced Analytics</span>
                    <span className="font-semibold">₹1,000/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Custom Integrations</span>
                    <span className="font-semibold">₹5,000 setup</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Priority Support</span>
                    <span className="font-semibold">₹2,000/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose Bell24h?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">97% Faster Procurement</h3>
                <p className="text-gray-600">
                  Reduce your procurement cycle from weeks to hours with our AI-powered matching system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">100% Secure Payments</h3>
                <p className="text-gray-600">
                  Escrow-secured transactions with 15-point supplier verification ensure complete safety.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">534K+ Verified Suppliers</h3>
                <p className="text-gray-600">
                  Access India&apos;s largest network of verified B2B suppliers across 50+ categories.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Is there really a free forever plan?</h3>
                <p className="text-gray-600">
                  Yes! Our Free Forever plan includes up to 10 RFQs per month, basic supplier matching, 
                  and standard verification. Perfect for small businesses getting started.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major payment methods including UPI, Net Banking, Credit/Debit Cards, 
                  and Wallets. All transactions are processed through secure, RBI-compliant payment gateways.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Can I change my plan anytime?</h3>
                <p className="text-gray-600">
                  Absolutely! You can upgrade, downgrade, or cancel your plan at any time. 
                  Changes take effect immediately, and we&apos;ll prorate any billing adjustments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">What happens to my data if I cancel?</h3>
                <p className="text-gray-600">
                  Your data remains accessible for 90 days after cancellation. You can export all your 
                  data at any time. We never sell or share your business data with third parties.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of MSMEs who have transformed their procurement with Bell24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/landing" 
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
