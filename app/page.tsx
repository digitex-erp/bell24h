'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [showAIDropdown, setShowAIDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div className="min-h-screen hero-gradient">
      {/* Top Bar */}
      <div className="bg-primary-900 text-white py-2">
        <div className="container-custom">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center gap-2">
                <span>📧</span>
                <span>support@bell24h.com</span>
              </span>
              <span className="flex items-center gap-2">
                <span>📞</span>
                <span>+91-9876543210</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/supplier" className="hover:text-primary-200 transition-colors">
                Supplier Zone
              </Link>
              <span>|</span>
              <Link href="/help" className="hover:text-primary-200 transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform duration-200">
                B
              </div>
              <div>
                <div className="font-bold text-xl text-neutral-900">Bell24h</div>
                <div className="text-xs text-neutral-600">Enterprise B2B</div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="nav-link nav-link-active flex items-center gap-2">
                <span>🏠</span>
                <span>Home</span>
              </Link>
              <Link href="/suppliers" className="nav-link flex items-center gap-2">
                <span>🏢</span>
                <span>Supplier Showcase</span>
              </Link>
              <Link href="/services/finance" className="nav-link flex items-center gap-2">
                <span>📋</span>
                <span>Fintech Services</span>
              </Link>
              <Link href="/services/escrow" className="nav-link flex items-center gap-2">
                <span>💳</span>
                <span>Wallet & Escrow</span>
              </Link>

              {/* AI Features Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAIDropdown(!showAIDropdown)}
                  className="nav-link flex items-center gap-2 border border-neutral-300 px-4 py-2 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                >
                  <span>🤖</span>
                  <span>AI Features</span>
                  <span className={`text-xs transition-transform duration-200 ${showAIDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {showAIDropdown && (
                  <div className="absolute top-full mt-2 bg-white shadow-xl rounded-lg py-2 w-64 border border-neutral-200 animate-slide-down">
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>🧠</span>
                      <span>AI Features Dashboard</span>
                    </Link>
                    <Link href="/voice-rfq" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>🎤</span>
                      <span>Voice RFQ</span>
                    </Link>
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>🔍</span>
                      <span>AI Explainability</span>
                    </Link>
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>⚠️</span>
                      <span>Risk Scoring</span>
                    </Link>
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>📈</span>
                      <span>Market Data</span>
                    </Link>
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>🎯</span>
                      <span>Smart Matching</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Login Button */}
            <Link href="/demo-login" className="btn-primary flex items-center gap-2 hover-lift">
              <span>Login</span>
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container-custom py-16">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Headline */}
          <h1 className="hero-title mb-8 animate-fade-in">
            <span className="text-neutral-900">India&apos;s Leading</span>
            <br />
            <span className="gradient-text">AI-Powered B2B Market</span>
          </h1>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 animate-slide-up">
            <span className="feature-badge feature-badge-green">
              <span>🇮🇳</span>
              <span>Made in India</span>
            </span>
            <span className="feature-badge feature-badge-blue">
              <span>🏛️</span>
              <span>GST Compliant</span>
            </span>
            <span className="feature-badge feature-badge-orange">
              <span>🏪</span>
              <span>MSME Friendly</span>
            </span>
            <span className="feature-badge feature-badge-purple">
              <span>💳</span>
              <span>UPI Payments</span>
            </span>
            <span className="feature-badge feature-badge-pink">
              <span>🗣️</span>
              <span>Hindi Support</span>
            </span>
          </div>

          {/* Description */}
          <p className="hero-subtitle mb-8 animate-fade-in">
            Connect with verified Indian suppliers and buyers using advanced AI matching, secure escrow payments, and intelligent analytics for seamless B2B transactions.
          </p>

          {/* Location */}
          <p className="text-lg text-primary-600 mb-12 flex items-center justify-center gap-2 animate-fade-in">
            <span>📍</span>
            <span>Based in Mumbai, Maharashtra - Serving All India</span>
          </p>

          {/* Search Bar */}
          <div className="search-container animate-slide-up">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What are you looking for? (e.g., 'steel pipes', 'textiles')"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="search-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="textiles">Textiles</option>
                <option value="electronics">Electronics</option>
                <option value="construction">Construction</option>
                <option value="chemicals">Chemicals</option>
                <option value="machinery">Machinery</option>
                <option value="packaging">Packaging</option>
                <option value="automotive">Automotive</option>
                <option value="pharmaceuticals">Pharmaceuticals</option>
                <option value="food">Food & Beverage</option>
                <option value="agriculture">Agriculture</option>
              </select>
              <button className="search-button hover-glow">
                <span>🔍</span>
                <span>AI Search</span>
              </button>
              <button className="px-4 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors duration-200">
                <span className="text-xl">💬</span>
              </button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in">
            <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 cursor-pointer transition-colors duration-200">
              Steel Pipes
            </span>
            <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 cursor-pointer transition-colors duration-200">
              Cotton Fabric
            </span>
            <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 cursor-pointer transition-colors duration-200">
              Electronics
            </span>
            <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 cursor-pointer transition-colors duration-200">
              Machinery Parts
            </span>
            <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 cursor-pointer transition-colors duration-200">
              Chemical Raw Materials
            </span>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary-600 mb-2">45,000+</div>
              <div className="text-neutral-600">Verified Suppliers</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary-600 mb-2">2.5M+</div>
              <div className="text-neutral-600">Products Listed</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary-600 mb-2">10,000+</div>
              <div className="text-neutral-600">RFQs Daily</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary-600 mb-2">24h</div>
              <div className="text-neutral-600">Avg. Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Why Choose Bell24h?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Advanced AI technology meets traditional B2B expertise to deliver unmatched results
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card text-center animate-fade-in">
              <div className="feature-icon mx-auto">
                <span>🤖</span>
              </div>
              <h3 className="feature-title">AI-Powered Matching</h3>
              <p className="feature-description">
                Our advanced AI analyzes 200+ data points to match you with the most relevant suppliers and buyers.
              </p>
            </div>
            
            <div className="feature-card text-center animate-fade-in">
              <div className="feature-icon mx-auto">
                <span>🔒</span>
              </div>
              <h3 className="feature-title">Escrow Protection</h3>
              <p className="feature-description">
                Secure transactions with milestone-based escrow payments. Funds released only after delivery confirmation.
              </p>
            </div>
            
            <div className="feature-card text-center animate-fade-in">
              <div className="feature-icon mx-auto">
                <span>📊</span>
              </div>
              <h3 className="feature-title">Real-time Analytics</h3>
              <p className="feature-description">
                Track market trends, supplier performance, and transaction insights with our comprehensive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}