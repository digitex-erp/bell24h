'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">About Bell24h</h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed">
              India's fastest B2B match-making engine connecting verified suppliers and buyers 
              with AI-powered intelligence and escrow-secured payments.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Mission</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">For Buyers</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Get 3 verified quotes in 24 hours with our AI-powered matching system. 
                    We analyze 200+ data signals including GST, credit scores, and logistics 
                    to connect you with the most suitable suppliers.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">For Suppliers</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Access verified buyers and grow your business with our comprehensive 
                    supplier verification system. Get matched with serious buyers who are 
                    ready to make purchases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-900 mb-2">45,000+</div>
                  <div className="text-gray-600">Verified Suppliers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-900 mb-2">2.5M+</div>
                  <div className="text-gray-600">Products Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-900 mb-2">10,000+</div>
                  <div className="text-gray-600">RFQs Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-900 mb-2">24 Hours</div>
                  <div className="text-gray-600">Avg. Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Powered by AI</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Our proprietary AI system analyzes 200+ live data signals to ensure perfect matches 
                between buyers and suppliers. From GST verification to credit scoring, we leave 
                nothing to chance.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-4">🛡️</div>
                  <h3 className="font-semibold text-gray-900 mb-2">GST Verification</h3>
                  <p className="text-gray-600 text-sm">Real-time GST validation for all suppliers</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-4">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Credit Scoring</h3>
                  <p className="text-gray-600 text-sm">Advanced credit analysis and risk assessment</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-4">🚚</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Logistics Intelligence</h3>
                  <p className="text-gray-600 text-sm">Smart logistics matching and optimization</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Team</h2>
              <p className="text-lg text-gray-700 mb-12 leading-relaxed">
                We're a team of passionate entrepreneurs, engineers, and business experts 
                dedicated to transforming India's B2B landscape.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Leadership Team</h3>
                  <p className="text-gray-600 text-sm">Experienced entrepreneurs with deep B2B expertise</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">👩‍💻</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Engineering Team</h3>
                  <p className="text-gray-600 text-sm">AI and technology experts building the future</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Business Team</h3>
                  <p className="text-gray-600 text-sm">Industry veterans with deep market knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}