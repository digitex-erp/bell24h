'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CategoryShowcase from '@/components/homepage/CategoryShowcase';
import FeatureEcosystem from '@/components/homepage/FeatureEcosystem';
import SuccessMetrics from '@/components/homepage/SuccessMetrics';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [stats, setStats] = useState({
    suppliers: 0,
    products: 0,
    transactions: 0,
    countries: 0
  });

  // AI-powered search suggestions
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, category: selectedCategory })
      });
      
      const data = await response.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('AI search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load platform statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/homepage-stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Stats loading error:', error);
      }
    };
    loadStats();
  }, []);

  const categories = [
    'Textiles & Garments', 'Pharmaceuticals', 'Agricultural Products', 'Automotive Parts', 
    'IT Services', 'Gems & Jewelry', 'Handicrafts', 'Machinery & Equipment',
    'Chemicals', 'Food Processing', 'Construction', 'Metals & Steel',
    'Plastics', 'Paper & Packaging', 'Rubber', 'Ceramics', 'Glass', 'Wood', 'Leather'
  ];

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Matching',
      description: 'Advanced AI algorithms match buyers with the perfect suppliers based on requirements, quality, and pricing.'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Real-time business intelligence with predictive analytics for market trends and supplier performance.'
    },
    {
      icon: '🔒',
      title: 'Secure Escrow',
      description: 'Protected transactions with our integrated escrow system ensuring safe B2B payments.'
    },
    {
      icon: '🌍',
      title: 'Global Reach',
      description: 'Connect with suppliers and buyers from 50+ countries across multiple industries.'
    },
    {
      icon: '📱',
      title: 'Voice RFQ',
      description: 'Create RFQs using voice commands with our advanced speech recognition technology.'
    },
    {
      icon: '💳',
      title: 'Payment Solutions',
      description: 'Multiple payment options including trade finance, invoice discounting, and credit facilities.'
    }
  ];

  const aiCapabilities = [
    'Intelligent Supplier Matching',
    'Predictive Market Analysis',
    'Voice-to-Text RFQ Creation',
    'Automated Quality Assessment',
    'Smart Price Optimization',
    'Real-time Risk Scoring',
    'AI-Powered Negotiation',
    'Automated Document Processing'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                BELL24H
              </h1>
              <span className="ml-2 text-sm text-gray-500">AI-Powered B2B Marketplace</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/marketplace" className="text-gray-700 hover:text-amber-600">Marketplace</Link>
              <Link href="/suppliers" className="text-gray-700 hover:text-amber-600">Suppliers</Link>
              <Link href="/rfq" className="text-gray-700 hover:text-amber-600">RFQ</Link>
              <Link href="/analytics" className="text-gray-700 hover:text-amber-600">Analytics</Link>
              <Link href="/register" className="text-gray-700 hover:text-amber-600">Register</Link>
            </nav>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-amber-600">Login</Link>
              <Link href="/register" className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              India's Leading
              <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                AI-Powered B2B Marketplace
              </span>
            </h1>
            <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">🇮🇳 Made in India</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">🏛️ GST Compliant</span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">🏢 MSME Friendly</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">💳 UPI Payments</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">🗣️ Hindi Support</span>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with verified Indian suppliers and buyers using advanced AI matching, 
              secure escrow payments, and intelligent analytics for seamless B2B transactions.
              <span className="block mt-2 text-lg font-medium text-amber-600">📍 Based in Mumbai, Maharashtra - Serving All India</span>
            </p>

            {/* AI Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What are you looking for? (e.g., 'steel pipes', 'textile machinery')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-8 py-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-semibold"
                >
                  {isLoading ? '🔍 Searching...' : '🔍 AI Search'}
                </button>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">🤖 AI Suggestions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-amber-300">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 font-semibold text-lg">
                🚀 Join as Supplier
              </Link>
              <Link href="/rfq/create" className="bg-white text-amber-600 border-2 border-amber-600 px-8 py-4 rounded-lg hover:bg-amber-50 font-semibold text-lg">
                📋 Create RFQ
              </Link>
              <Link href="/marketplace" className="bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 font-semibold text-lg">
                🛍️ Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">{stats.suppliers.toLocaleString()}+</div>
              <div className="text-gray-600">Verified Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">{stats.products.toLocaleString()}+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">{stats.transactions.toLocaleString()}+</div>
              <div className="text-gray-600">Successful Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">{stats.countries}+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🤖 Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of B2B commerce with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🧠 AI Capabilities
            </h2>
            <p className="text-xl text-gray-600">
              Discover how our AI transforms your B2B experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiCapabilities.map((capability, index) => (
              <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                <div className="text-2xl mb-3">🤖</div>
                <h3 className="font-semibold text-gray-900">{capability}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Category Showcase */}
      <CategoryShowcase />

      {/* Complete Feature Ecosystem */}
      <FeatureEcosystem />

      {/* Success Metrics & Social Proof */}
      <SuccessMetrics />

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🏭 Industry Categories
            </h2>
            <p className="text-xl text-gray-600">
              Explore products across 17 major industries
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center hover:border-amber-300 border-2 border-transparent"
              >
                <div className="text-2xl mb-3">🏭</div>
                <h3 className="font-semibold text-gray-900">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your B2B Business?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Join thousands of businesses already using Bell24h's AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-amber-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg">
              🚀 Start Free Trial
            </Link>
            <Link href="/demo" className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-amber-600 font-semibold text-lg">
              📺 Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">BELL24H</h3>
              <p className="text-gray-400">
                India's premier AI-powered B2B marketplace connecting suppliers and buyers globally.
              </p>
              <div className="mt-4 text-sm text-gray-400">
                <p>📍 Artist Village, Maharashtra, India</p>
                <p>📞 +91-XXXXXXXXXX</p>
                <p>📧 info@bell24h.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
                <li><Link href="/rfq" className="hover:text-white">RFQ System</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
                <li><Link href="/escrow" className="hover:text-white">Escrow</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/api" className="hover:text-white">API Docs</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
                <li><Link href="/compliance" className="hover:text-white">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bell24h. All rights reserved. Powered by AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
