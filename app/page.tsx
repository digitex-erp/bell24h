'use client'
import { useState } from 'react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div className="min-h-screen hero-gradient">

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