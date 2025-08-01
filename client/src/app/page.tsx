'use client';

import CategoryShowcase from '@/components/homepage/CategoryShowcase';
import FeatureEcosystem from '@/components/homepage/FeatureEcosystem';
import SuccessMetrics from '@/components/homepage/SuccessMetrics';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Mic, 
  Brain, 
  Shield, 
  TrendingUp, 
  Building2, 
  CreditCard, 
  Wallet, 
  BarChart3, 
  Video, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Globe,
  Zap
} from 'lucide-react';

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
    countries: 0,
  });

  // AI-powered search suggestions
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, category: selectedCategory }),
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
    'Textiles & Garments',
    'Pharmaceuticals',
    'Agricultural Products',
    'Automotive Parts',
    'IT Services',
    'Gems & Jewelry',
    'Handicrafts',
    'Machinery & Equipment',
    'Chemicals',
    'Food Processing',
    'Construction',
    'Metals & Steel',
    'Plastics',
    'Paper & Packaging',
    'Rubber',
    'Ceramics',
    'Glass',
    'Wood',
    'Leather',
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description:
        'Advanced AI algorithms match buyers with the perfect suppliers based on requirements, quality, and pricing.',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description:
        'Real-time business intelligence with predictive analytics for market trends and supplier performance.',
    },
    {
      icon: Shield,
      title: 'Secure Escrow',
      description:
        'Protected transactions with our integrated escrow system ensuring safe B2B payments.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description:
        'Connect with suppliers and buyers from 50+ countries across multiple industries.',
    },
    {
      icon: Mic,
      title: 'Voice RFQ',
      description:
        'Create RFQs using voice commands with our advanced speech recognition technology.',
    },
    {
      icon: CreditCard,
      title: 'Payment Solutions',
      description:
        'Multiple payment options including trade finance, invoice discounting, and credit facilities.',
    },
  ];

  const aiCapabilities = [
    'Intelligent Supplier Matching',
    'Predictive Market Analysis',
    'Voice-to-Text RFQ Creation',
    'Automated Quality Assessment',
    'Smart Price Optimization',
    'Real-time Risk Scoring',
    'AI-Powered Negotiation',
    'Automated Document Processing',
  ];

  const enterpriseFeatures = [
    {
      title: 'AI Features Dashboard',
      description: 'Comprehensive AI-powered tools for voice RFQ, explainability, and risk scoring',
      href: '/dashboard/ai-features',
      icon: Brain,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Supplier Showcase',
      description: 'Detailed supplier profiles with capabilities, products, and financial standing',
      href: '/supplier/SUP001',
      icon: Building2,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Fintech Services',
      description: 'M1 Exchange and Kreed integrations for invoice discounting and supply chain finance',
      href: '/fintech',
      icon: CreditCard,
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Wallet & Escrow',
      description: 'Digital wallets and high-value escrow system for secure ₹5L+ transactions',
      href: '/wallet',
      icon: Wallet,
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Hero Section */}
      <section className='relative py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center'>
            <h1 className='text-5xl md:text-7xl font-bold text-gray-900 mb-6'>
              India's Leading
              <span className='block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                AI-Powered B2B Marketplace
              </span>
            </h1>
            <div className='flex justify-center items-center gap-4 mb-4 flex-wrap'>
              <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium'>
                🇮🇳 Made in India
              </span>
              <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
                🏛️ GST Compliant
              </span>
              <span className='bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium'>
                🏢 MSME Friendly
              </span>
              <span className='bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium'>
                💳 UPI Payments
              </span>
              <span className='bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium'>
                🗣️ Hindi Support
              </span>
            </div>
            <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
              Connect with verified Indian suppliers and buyers using advanced AI matching, secure
              escrow payments, and intelligent analytics for seamless B2B transactions.
              <span className='block mt-2 text-lg font-medium text-blue-600'>
                📍 Based in Mumbai, Maharashtra - Serving All India
              </span>
            </p>

            {/* AI Search Bar */}
            <div className='max-w-4xl mx-auto mb-8'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                  <input
                    type='text'
                    placeholder="What are you looking for? (e.g., 'steel pipes', 'textile machinery')"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className='px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className='px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold'
                >
                  {isLoading ? '🔍 Searching...' : '🔍 AI Search'}
                </button>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8'>
                <h3 className='text-lg font-semibold mb-4'>🤖 AI Suggestions</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className='p-4 border border-gray-200 rounded-lg hover:border-blue-300'
                    >
                      <h4 className='font-medium'>{suggestion.title}</h4>
                      <p className='text-sm text-gray-600'>{suggestion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/register'
                className='bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg flex items-center justify-center space-x-2'
              >
                <span>🚀 Join as Supplier</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href='/rfq/create'
                className='bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 font-semibold text-lg flex items-center justify-center space-x-2'
              >
                <span>📋 Create RFQ</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href='/marketplace'
                className='bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 font-semibold text-lg flex items-center justify-center space-x-2'
              >
                <span>🛍️ Browse Marketplace</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='text-4xl font-bold text-blue-600 mb-2'>
                {stats.suppliers.toLocaleString()}+
              </div>
              <div className='text-gray-600'>Verified Suppliers</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold text-purple-600 mb-2'>
                {stats.products.toLocaleString()}+
              </div>
              <div className='text-gray-600'>Products Listed</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold text-green-600 mb-2'>
                ₹{stats.transactions.toLocaleString()}Cr+
              </div>
              <div className='text-gray-600'>Transaction Value</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold text-orange-600 mb-2'>
                {stats.countries}+
              </div>
              <div className='text-gray-600'>Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section className='py-20 bg-gradient-to-br from-gray-50 to-blue-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              🚀 Enterprise Features
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Discover our comprehensive suite of enterprise-grade features designed for modern B2B commerce
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {enterpriseFeatures.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center'
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  {feature.description}
                </p>
                <div className='mt-4 flex items-center justify-center text-blue-600 group-hover:text-blue-700'>
                  <span className='text-sm font-medium'>Explore</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              🤖 AI-Powered Capabilities
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Experience the future of B2B commerce with our advanced AI features
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {aiCapabilities.map((capability, index) => (
              <div key={index} className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100'>
                <div className='flex items-center space-x-3'>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className='text-gray-900 font-medium'>{capability}</span>
                </div>
              </div>
            ))}
          </div>

          <div className='text-center mt-12'>
            <Link
              href='/dashboard/ai-features'
              className='inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors'
            >
              <Brain className="w-5 h-5" />
              <span>Explore AI Features</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-gradient-to-br from-gray-50 to-blue-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              ✨ Platform Features
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Everything you need for successful B2B transactions
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <div key={index} className='bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300'>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6'>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-20 bg-gradient-to-br from-blue-600 to-purple-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-4xl font-bold text-white mb-6'>
            Ready to Transform Your B2B Business?
          </h2>
          <p className='text-xl text-blue-100 mb-8 max-w-3xl mx-auto'>
            Join thousands of businesses already using Bell24h for their B2B transactions. 
            Experience the power of AI-driven commerce today.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/register'
              className='bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg flex items-center justify-center space-x-2'
            >
              <span>🚀 Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href='/dashboard/ai-features'
              className='bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 font-semibold text-lg flex items-center justify-center space-x-2 transition-colors'
            >
              <span>🤖 Try AI Features</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div>
              <h3 className='text-xl font-bold mb-4'>Bell24h</h3>
              <p className='text-gray-400'>
                India's premier AI-powered B2B marketplace connecting businesses across the globe.
              </p>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Features</h4>
              <ul className='space-y-2 text-gray-400'>
                <li><Link href='/dashboard/ai-features' className='hover:text-white'>AI Features</Link></li>
                <li><Link href='/supplier/SUP001' className='hover:text-white'>Supplier Showcase</Link></li>
                <li><Link href='/fintech' className='hover:text-white'>Fintech Services</Link></li>
                <li><Link href='/wallet' className='hover:text-white'>Wallet & Escrow</Link></li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Company</h4>
              <ul className='space-y-2 text-gray-400'>
                <li><Link href='/about' className='hover:text-white'>About Us</Link></li>
                <li><Link href='/contact' className='hover:text-white'>Contact</Link></li>
                <li><Link href='/privacy' className='hover:text-white'>Privacy Policy</Link></li>
                <li><Link href='/terms' className='hover:text-white'>Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Support</h4>
              <ul className='space-y-2 text-gray-400'>
                <li><Link href='/help' className='hover:text-white'>Help Center</Link></li>
                <li><Link href='/auth/login' className='hover:text-white'>Login</Link></li>
                <li><Link href='/register' className='hover:text-white'>Register</Link></li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>&copy; 2025 Bell24h. All rights reserved. Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
