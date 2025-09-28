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
            <span className="text-black">India&apos;s Leading</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered B2B Market</span>
          </h1>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 animate-slide-up">
            <span className="px-4 py-2 bg-green-200 text-green-900 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
              <span>🇮🇳</span>
              <span>Made in India</span>
            </span>
            <span className="px-4 py-2 bg-blue-200 text-blue-900 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
              <span>🏛️</span>
              <span>GST Compliant</span>
            </span>
            <span className="px-4 py-2 bg-orange-200 text-orange-900 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
              <span>🏪</span>
              <span>MSME Friendly</span>
            </span>
            <span className="px-4 py-2 bg-purple-200 text-purple-900 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
              <span>💳</span>
              <span>UPI Payments</span>
            </span>
            <span className="px-4 py-2 bg-pink-200 text-pink-900 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
              <span>🗣️</span>
              <span>Hindi Support</span>
            </span>
          </div>

          {/* Description */}
          <p className="hero-subtitle mb-8 animate-fade-in">
            Connect with verified Indian suppliers and buyers using advanced AI matching, secure escrow payments, and intelligent analytics for seamless B2B transactions.
          </p>

          {/* Location */}
          <p className="text-lg text-blue-600 mb-12 flex items-center justify-center gap-2 animate-fade-in font-medium">
            <span>📍</span>
            <span>Based in Mumbai, Maharashtra - Serving All India</span>
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-xl p-2 max-w-4xl mx-auto animate-slide-up">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What are you looking for? (e.g., 'steel pipes', 'textiles')"
                className="flex-1 px-6 py-4 text-lg border-none outline-none bg-transparent placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="px-4 py-2 border-l border-gray-200 bg-white text-gray-700 rounded-none"
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
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200">
                <span>🔍</span>
                <span>AI Search</span>
              </button>
              <button className="px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                <span className="text-xl">💬</span>
              </button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold hover:bg-blue-200 cursor-pointer transition-colors duration-200 shadow-sm">
              Steel Pipes
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold hover:bg-blue-200 cursor-pointer transition-colors duration-200 shadow-sm">
              Cotton Fabric
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold hover:bg-blue-200 cursor-pointer transition-colors duration-200 shadow-sm">
              Electronics
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold hover:bg-blue-200 cursor-pointer transition-colors duration-200 shadow-sm">
              Machinery Parts
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold hover:bg-blue-200 cursor-pointer transition-colors duration-200 shadow-sm">
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
              <div className="text-4xl font-bold text-blue-600 mb-2">45,000+</div>
              <div className="text-gray-600">Verified Suppliers</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-blue-600 mb-2">2.5M+</div>
              <div className="text-gray-600">Products Listed</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">RFQs Daily</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-gray-600">Avg. Response Time</div>
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