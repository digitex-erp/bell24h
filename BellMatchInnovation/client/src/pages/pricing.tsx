import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your business needs with our wallet-driven ecosystem, AI-powered matching, and integrated invoice discounting via KredX.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Free Tier */}
        <Card className="border-2 flex flex-col">
          <CardHeader className="pb-8 pt-6">
            <CardTitle className="text-2xl">Free</CardTitle>
            <div className="mt-2 mb-1">
              <span className="text-3xl font-bold">₹0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <CardDescription>
              Perfect for small businesses just getting started
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <FeatureItem>5 RFQs per month</FeatureItem>
              <FeatureItem>10 products allowed</FeatureItem>
              <FeatureItem>Basic AI matching</FeatureItem>
              <FeatureItem>Wallet access</FeatureItem>
              <FeatureItem>Email support</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full" variant="outline">
              Get Started Free
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Monthly Tier */}
        <Card className="border-2 border-primary relative flex flex-col">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
            <Badge variant="default" className="rounded-full px-4 py-1">Most Popular</Badge>
          </div>
          <CardHeader className="pb-8 pt-6">
            <CardTitle className="text-2xl">Pro</CardTitle>
            <div className="mt-2 mb-1">
              <span className="text-3xl font-bold">₹1,500</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <CardDescription>
              For growing SMEs with frequent RFQ needs
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <FeatureItem>Unlimited RFQs</FeatureItem>
              <FeatureItem>50 products allowed</FeatureItem>
              <FeatureItem>Advanced AI matching</FeatureItem>
              <FeatureItem>SHAP explanations for matches</FeatureItem>
              <FeatureItem>GST compliance verification</FeatureItem>
              <FeatureItem>Priority support</FeatureItem>
              <FeatureItem>Detailed analytics dashboard</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full">
              Start Pro Monthly
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Yearly Tier */}
        <Card className="border-2 flex flex-col">
          <CardHeader className="pb-8 pt-6">
            <CardTitle className="text-2xl">Pro Yearly</CardTitle>
            <div className="mt-2 mb-1">
              <span className="text-3xl font-bold">₹15,000</span>
              <span className="text-muted-foreground">/year</span>
            </div>
            <CardDescription>
              Save 20% with annual commitment
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <FeatureItem>All Pro Monthly features</FeatureItem>
              <FeatureItem>20% discount vs monthly</FeatureItem>
              <FeatureItem>Unlimited RFQs</FeatureItem>
              <FeatureItem>50 products allowed</FeatureItem>
              <FeatureItem>Basic escrow integration</FeatureItem>
              <FeatureItem>Supplier verification status</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full" variant="outline">
              Start Pro Yearly
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Tier */}
        <Card className="border-2 flex flex-col">
          <CardHeader className="pb-8 pt-6">
            <CardTitle className="text-2xl">Enterprise</CardTitle>
            <div className="mt-2 mb-1">
              <span className="text-3xl font-bold">₹50,000</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <CardDescription>
              Custom solutions for large businesses
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <FeatureItem>Unlimited RFQs & products</FeatureItem>
              <FeatureItem>Custom AI models</FeatureItem>
              <FeatureItem>API access</FeatureItem>
              <FeatureItem>Full escrow integration</FeatureItem>
              <FeatureItem>Invoice discounting</FeatureItem>
              <FeatureItem>Dedicated account manager</FeatureItem>
              <FeatureItem>Custom integrations</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full" variant="outline">
              Contact Sales
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Additional Services</h2>
          <div className="space-y-6">
            <ServiceCard 
              title="Transaction Fees" 
              description="2-5% fee on transaction value, depending on volume and transaction type."
              price="2-5%"
            />
            <ServiceCard 
              title="Escrow Services" 
              description="Secure milestone-based payments with blockchain verification and dispute resolution."
              price="1-2%"
            />
            <ServiceCard 
              title="Invoice Discounting" 
              description="Get immediate payment on your invoices through our KredX integration."
              price="0.5%"
            />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Advertising Options</h2>
          <div className="space-y-6">
            <ServiceCard 
              title="Promoted Listings" 
              description="Boost your visibility with promoted supplier listings in search results."
              price="₹5,000/month"
            />
            <ServiceCard 
              title="Featured RFQs" 
              description="Highlight your RFQs to attract more quality supplier responses."
              price="₹10,000/month"
            />
            <ServiceCard 
              title="Custom Advertising" 
              description="Tailored advertising solutions for specific needs and campaigns."
              price="Contact Sales"
            />
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Enterprise & Custom Solutions</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          For large enterprises with specific requirements, we offer custom solutions with dedicated support and tailored features.
        </p>
        <Button size="lg" className="px-8">
          Schedule a Consultation
        </Button>
      </div>

      <div className="mt-16 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <FaqItem
            question="How does transaction fee work?"
            answer="Transaction fees are applied only on successful transactions and range from 2-5% depending on your subscription plan and transaction volume."
          />
          <FaqItem
            question="Can I upgrade or downgrade my plan?"
            answer="Yes, you can upgrade your plan at any time. Downgrades take effect at the end of your current billing cycle."
          />
          <FaqItem
            question="What payment methods do you accept?"
            answer="We accept credit/debit cards, UPI, net banking, and wallet payments. Enterprise plans can also be paid via invoice."
          />
          <FaqItem
            question="Is there a free trial for paid plans?"
            answer="Yes, all paid plans come with a 14-day free trial. No credit card required to start your trial."
          />
          <FaqItem
            question="How does the escrow service work?"
            answer="Our escrow service holds payment until predefined milestones are completed, providing security for both buyers and suppliers."
          />
          <FaqItem
            question="What is the invoice discounting feature?"
            answer="Invoice discounting through KredX allows suppliers to get immediate payment on their invoices at a small fee, improving cash flow."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center">
      <Check className="h-4 w-4 mr-2 text-green-500" />
      <span className="text-sm">{children}</span>
    </li>
  );
}

function ServiceCard({ title, description, price }: { title: string; description: string; price: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary">{price}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{question}</h3>
      <p className="text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}