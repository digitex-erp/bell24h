import { Lightbulb, Lock, Bell, ShieldCheck, Database, CircleDollarSign, Globe, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Features() {
  const features = [
    {
      name: "AI-Powered Matching",
      description: "Our intelligent algorithm matches buyers with the perfect suppliers based on multiple criteria including price, delivery time, and past performance.",
      icon: Lightbulb,
      color: "from-yellow-500 to-amber-400"
    },
    {
      name: "Secure Escrow Payments",
      description: "Our wallet and escrow system ensures that all transactions are secure, with funds released only when both parties are satisfied with the delivery.",
      icon: Lock,
      color: "from-green-500 to-emerald-400"
    },
    {
      name: "Real-time Updates",
      description: "Stay informed with instant notifications about your RFQs, supplier responses, and transaction status changes throughout the process.",
      icon: Bell,
      color: "from-blue-500 to-sky-400"
    },
    {
      name: "GST Validation",
      description: "For Indian suppliers, we validate GST compliance to ensure that all transactions are legitimate and comply with government regulations.",
      icon: ShieldCheck,
      color: "from-indigo-500 to-violet-400"
    },
    {
      name: "Stock Market Data",
      description: "Access real-time market data from Kotak Securities API to make informed decisions based on current market trends and fluctuations.",
      icon: Database,
      color: "from-purple-500 to-fuchsia-400"
    },
    {
      name: "Invoice Discounting",
      description: "Get early payments on your invoices through our KredX integration, improving cash flow and business liquidity when you need it most.",
      icon: CircleDollarSign,
      color: "from-red-500 to-rose-400"
    },
    {
      name: "Global Supplier Network",
      description: "Access a diverse network of verified suppliers from across India and around the world, all in one centralized marketplace.",
      icon: Globe,
      color: "from-cyan-500 to-blue-400"
    },
    {
      name: "Fast Transactions",
      description: "Experience lightning-fast processing for all your business transactions with our optimized platform and simplified workflow.",
      icon: Zap,
      color: "from-orange-500 to-amber-400"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Smart B2B <span className="bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">Connections</span>
          </h2>
          <p className="text-xl text-gray-600">
            Discover how our AI-powered platform revolutionizes the way Indian businesses connect and trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card key={feature.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full transform translate-x-16 -translate-y-16 opacity-20 group-hover:opacity-30 transition-opacity`}></div>
              <CardContent className="p-6 relative">
                <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-primary-100 to-primary-50 rounded-tl-full"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Bell24h for Your Business?</h3>
              <p className="text-gray-600 mb-6">
                Bell24h combines AI technology with deep market expertise to create the most efficient B2B marketplace 
                for Indian businesses. We're committed to simplifying the procurement process while ensuring 
                security, transparency, and compliance at every step.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-600">Verified supplier credentials and ratings</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-600">Transparent pricing and fee structure</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-600">24/7 customer support and assistance</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-600">Rigorous data security and privacy</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 flex flex-col justify-center">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Ready to streamline your procurement?</h4>
              <p className="text-gray-600 mb-4">Join thousands of businesses already benefiting from our platform.</p>
              <div className="text-2xl font-bold text-primary mb-1">20% Faster</div>
              <p className="text-gray-600 mb-4">RFQ processing compared to traditional methods</p>
              <div className="text-2xl font-bold text-primary mb-1">₹50,000+</div>
              <p className="text-gray-600">Average savings per procurement cycle</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
