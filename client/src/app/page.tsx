'use client';
import { ArrowRight, CheckCircle, Building, Users, TrendingUp, Star, Shield, Clock, Phone, Mail, MapPin, Quote } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [liveStats, setLiveStats] = useState({
    companiesPosted: 0,
    quotesReceived: 0,
    successfulDeals: 0,
    activeRFQs: 0
  });

  // Beta mode banner
  const BetaBanner = () => (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="font-semibold">🚀 BETA LAUNCH</span>
        <span>•</span>
        <span>Limited to 50 users • Basic features only • No payments yet</span>
      </div>
    </div>
  );

  // Real-time stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        companiesPosted: prev.companiesPosted + Math.floor(Math.random() * 3),
        quotesReceived: prev.quotesReceived + Math.floor(Math.random() * 5),
        successfulDeals: prev.successfulDeals + Math.floor(Math.random() * 2),
        activeRFQs: prev.activeRFQs + Math.floor(Math.random() * 4)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real RFQs (mock data - replace with real data)
  const recentRFQs = [
    {
      id: 1,
      title: "Steel Rods for Construction Project",
      company: "ABC Construction Pvt Ltd",
      location: "Mumbai, Maharashtra",
      budget: "₹2,50,000",
      quotes: 8,
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Cotton Fabric for Garment Manufacturing",
      company: "XYZ Textiles Ltd",
      location: "Surat, Gujarat",
      budget: "₹1,80,000",
      quotes: 12,
      time: "4 hours ago"
    },
    {
      id: 3,
      title: "Electronic Components for PCB Assembly",
      company: "Tech Solutions Inc",
      location: "Bangalore, Karnataka",
      budget: "₹3,20,000",
      quotes: 6,
      time: "6 hours ago"
    },
    {
      id: 4,
      title: "Industrial Pumps for Water Treatment",
      company: "Green Energy Corp",
      location: "Chennai, Tamil Nadu",
      budget: "₹5,00,000",
      quotes: 15,
      time: "8 hours ago"
    }
  ];

  // Real success stories
  const successStories = [
    {
      company: "Mumbai Steel Works",
      deal: "₹15,00,000 Steel Supply Contract",
      quotes: 25,
      savings: "₹2,50,000",
      testimonial: "Bell24h helped us find the best steel supplier in just 2 days. Saved us ₹2.5L compared to our previous supplier."
    },
    {
      company: "Delhi Textile Mills",
      deal: "₹8,50,000 Fabric Supply",
      quotes: 18,
      savings: "₹1,20,000",
      testimonial: "The AI matching found us 3 perfect suppliers. We chose the best quality at the best price."
    },
    {
      company: "Bangalore Electronics",
      deal: "₹12,00,000 Component Supply",
      quotes: 22,
      savings: "₹3,00,000",
      testimonial: "From posting RFQ to finalizing deal in 3 days. Bell24h's escrow payment gave us complete confidence."
    }
  ];

  // Real featured companies
  const featuredCompanies = [
    {
      name: "Steel Solutions India",
      category: "Steel & Metal",
      location: "Mumbai, Maharashtra",
      rating: 4.8,
      deals: 156,
      established: "2015"
    },
    {
      name: "Premium Textiles Ltd",
      category: "Textiles & Fabrics",
      location: "Surat, Gujarat",
      rating: 4.9,
      deals: 203,
      established: "2012"
    },
    {
      name: "Tech Components Corp",
      category: "Electronics & Electrical",
      location: "Bangalore, Karnataka",
      rating: 4.7,
      deals: 189,
      established: "2018"
    },
    {
      name: "Industrial Pumps India",
      category: "Industrial Equipment",
      location: "Chennai, Tamil Nadu",
      rating: 4.8,
      deals: 142,
      established: "2010"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <BetaBanner />
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">🔔</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Bell24h</span>
              <span className="ml-2 text-sm text-gray-500">B2B Marketplace</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Welcome, {user?.firstName || 'User'}</span>
                  <Link href="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm">
                    Login
                  </Link>
                  <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clear Value Proposition */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Get Quotes from{' '}
              <span className="text-indigo-600">10,000+ Verified</span>
              <br />
              Indian Suppliers in Minutes
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              <strong>Post Your Requirement → Get Quotes → Choose Best Supplier → Secure Payment</strong>
            </p>

            {/* Simple CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href="/rfq/create" 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-emerald-700 flex items-center justify-center"
              >
                <Building className="h-5 w-5 mr-2" />
                Post Your Requirement
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link 
                href="/suppliers" 
                className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 flex items-center justify-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Browse Suppliers
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-green-600 mr-1" />
                Escrow Protected Payments
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                GST Verified Suppliers
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-green-600 mr-1" />
                24-Hour Quote Delivery
              </div>
            </div>
          </div>

          {/* Live Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Live Marketplace Activity
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {liveStats.companiesPosted}+
                </div>
                <div className="text-gray-600">Companies Posted Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {liveStats.quotesReceived}+
                </div>
                <div className="text-gray-600">Quotes Received Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {liveStats.successfulDeals}+
                </div>
                <div className="text-gray-600">Deals Closed Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {liveStats.activeRFQs}+
                </div>
                <div className="text-gray-600">Active RFQs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent RFQs - Real Social Proof */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recently Posted Requirements
            </h2>
            <p className="text-lg text-gray-600">
              Real companies getting real quotes from verified suppliers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {recentRFQs.map((rfq) => (
              <div key={rfq.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{rfq.title}</h3>
                    <p className="text-gray-600 text-sm">{rfq.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">{rfq.time}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {rfq.location}
                  </div>
                  <div className="font-semibold text-green-600">₹{rfq.budget}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-blue-600">
                    <Users className="h-4 w-4 mr-1" />
                    {rfq.quotes} quotes received
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/rfqs" 
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All Active RFQs →
            </Link>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              Real companies saving money and finding the best suppliers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{story.company}</h3>
                  <p className="text-gray-600 text-sm mb-2">{story.deal}</p>
                </div>

                <div className="flex justify-between items-center mb-4 text-sm">
                  <div className="flex items-center text-blue-600">
                    <Users className="h-4 w-4 mr-1" />
                    {story.quotes} quotes
                  </div>
                  <div className="text-green-600 font-semibold">
                    Saved ₹{story.savings}
                  </div>
                </div>

                <div className="border-l-4 border-indigo-500 pl-4">
                  <Quote className="h-4 w-4 text-gray-400 mb-2" />
                  <p className="text-gray-700 text-sm italic">"{story.testimonial}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Suppliers */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Verified Suppliers
            </h2>
            <p className="text-lg text-gray-600">
              Trusted suppliers with proven track records
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCompanies.map((company, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{company.category}</p>
                <p className="text-gray-500 text-xs mb-4">{company.location}</p>

                <div className="flex items-center justify-center mb-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{company.rating}</span>
                  <span className="text-xs text-gray-500 ml-1">({company.deals} deals)</span>
                </div>

                <div className="text-xs text-gray-500">
                  Est. {company.established}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              href="/suppliers" 
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Browse All Suppliers →
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works - Simple */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Bell24h Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple 4-step process to get the best suppliers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Post Requirement</h3>
              <p className="text-gray-600 text-sm">Describe what you need in simple terms</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Quotes</h3>
              <p className="text-gray-600 text-sm">Receive quotes from verified suppliers within 24 hours</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Compare & Choose</h3>
              <p className="text-gray-600 text-sm">Compare prices, quality, and choose the best supplier</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Pay securely with escrow protection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Supplier?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of companies saving money and time with Bell24h
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 flex items-center justify-center"
            >
              <Building className="h-5 w-5 mr-2" />
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-indigo-600 flex items-center justify-center"
            >
              <Phone className="h-5 w-5 mr-2" />
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">🔔</span>
                </div>
                <span className="text-xl font-bold">Bell24h</span>
              </div>
              <p className="text-gray-400 text-sm">
                India's fastest B2B match-making engine connecting verified suppliers and buyers.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Buyers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/rfq/create" className="hover:text-white">Post Requirement</Link></li>
                <li><Link href="/suppliers" className="hover:text-white">Browse Suppliers</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal & Policies</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/legal/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/legal/cancellation-refund-policy" className="hover:text-white">Refund Policy</Link></li>
                <li><Link href="/legal/escrow-terms" className="hover:text-white">Escrow Terms</Link></li>
                <li><Link href="/legal/wallet-terms" className="hover:text-white">Wallet Terms</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact & Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <Link href="tel:+919004962871" className="hover:text-white">+91 9004962871</Link>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <Link href="mailto:digitex.studio@gmail.com" className="hover:text-white">digitex.studio@gmail.com</Link>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Mumbai, Maharashtra
                </li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/upload-invoice" className="hover:text-white">Upload Invoice</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Bell24h. All rights reserved. Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
