'use client'
import { useState } from 'react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Redirect to search results or marketplace
      window.location.href = `/marketplace?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`
    }
  }

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term)
    window.location.href = `/marketplace?q=${encodeURIComponent(term)}`
  }

  const handleGetStarted = () => {
    window.location.href = '/auth/register'
  }

  const handleScheduleDemo = () => {
    window.location.href = '/contact'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Hero Section */}
      <main className="container-custom py-8">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="text-black">India&apos;s Leading</span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">AI-Powered B2B Market</span>
          </h1>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6 animate-slide-up">
            <span className="px-3 py-1.5 bg-green-300 text-green-900 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
              <span>🇮🇳</span>
              <span>Made in India</span>
            </span>
            <span className="px-3 py-1.5 bg-blue-300 text-blue-900 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
              <span>🏛️</span>
              <span>GST Compliant</span>
            </span>
            <span className="px-3 py-1.5 bg-orange-300 text-orange-900 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
              <span>🏪</span>
              <span>MSME Friendly</span>
            </span>
            <span className="px-3 py-1.5 bg-purple-300 text-purple-900 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
              <span>💳</span>
              <span>UPI Payments</span>
            </span>
            <span className="px-3 py-1.5 bg-pink-300 text-pink-900 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
              <span>🗣️</span>
              <span>Hindi Support</span>
            </span>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-700 mb-6 animate-fade-in max-w-4xl mx-auto">
            Connect with verified Indian suppliers and buyers using advanced AI matching, secure escrow payments, and intelligent analytics for seamless B2B transactions.
          </p>

          {/* Location */}
          <p className="text-lg text-blue-600 mb-8 flex items-center justify-center gap-2 animate-fade-in font-semibold">
            <span>📍</span>
            <span>Based in Mumbai, Maharashtra - Serving All India</span>
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-2xl p-1 max-w-5xl mx-auto animate-slide-up">
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="What are you looking for? (e.g., 'steel pipes', 'textiles')"
                className="flex-1 px-6 py-4 text-lg border-none outline-none bg-transparent placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <select 
                className="px-4 py-4 border-l border-gray-200 bg-white text-gray-700 rounded-none text-lg"
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
              <button 
                onClick={handleSearch}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors duration-200 text-lg"
              >
                <span>🔍</span>
                <span>AI Search</span>
              </button>
              <button className="px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                <span className="text-2xl">💬</span>
              </button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fade-in">
            <span 
              onClick={() => handlePopularSearch('Steel Pipes')}
              className="px-3 py-1.5 bg-blue-200 text-blue-900 rounded-full text-sm font-bold hover:bg-blue-300 cursor-pointer transition-colors duration-200 shadow-md"
            >
              Steel Pipes
            </span>
            <span 
              onClick={() => handlePopularSearch('Cotton Fabric')}
              className="px-3 py-1.5 bg-blue-200 text-blue-900 rounded-full text-sm font-bold hover:bg-blue-300 cursor-pointer transition-colors duration-200 shadow-md"
            >
              Cotton Fabric
            </span>
            <span 
              onClick={() => handlePopularSearch('Electronics')}
              className="px-3 py-1.5 bg-blue-200 text-blue-900 rounded-full text-sm font-bold hover:bg-blue-300 cursor-pointer transition-colors duration-200 shadow-md"
            >
              Electronics
            </span>
            <span 
              onClick={() => handlePopularSearch('Machinery Parts')}
              className="px-3 py-1.5 bg-blue-200 text-blue-900 rounded-full text-sm font-bold hover:bg-blue-300 cursor-pointer transition-colors duration-200 shadow-md"
            >
              Machinery Parts
            </span>
            <span 
              onClick={() => handlePopularSearch('Chemical Raw Materials')}
              className="px-3 py-1.5 bg-blue-200 text-blue-900 rounded-full text-sm font-bold hover:bg-blue-300 cursor-pointer transition-colors duration-200 shadow-md"
            >
              Chemical Raw Materials
            </span>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-blue-600 mb-1">45,000+</div>
              <div className="text-gray-600 text-sm">Verified Suppliers</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-blue-600 mb-1">2.5M+</div>
              <div className="text-gray-600 text-sm">Products Listed</div>
          </div>
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-blue-600 mb-1">10,000+</div>
              <div className="text-gray-600 text-sm">RFQs Daily</div>
          </div>
            <div className="animate-fade-in">
              <div className="text-3xl font-bold text-blue-600 mb-1">24h</div>
              <div className="text-gray-600 text-sm">Avg. Response Time</div>
          </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Bell24h?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI technology meets traditional B2B expertise to deliver unmatched results
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🤖</span>
        </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Matching</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our advanced AI analyzes 200+ data points to match you with the most relevant suppliers and buyers.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Escrow Protection</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Secure transactions with milestone-based escrow payments. Funds released only after delivery confirmation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📊</span>
            </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Analytics</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Track market trends, supplier performance, and transaction insights with our comprehensive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your B2B Experience?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of businesses already using Bell24h to streamline their procurement and sales processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              Get Started Free
            </button>
            <button 
              onClick={handleScheduleDemo}
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Schedule Demo
            </button>
                </div>
              </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted by Leading Businesses</h3>
            <p className="text-gray-600">Join 10,000+ companies already using Bell24h</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">TATA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">RELIANCE</div>
                </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">ADANI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">MAHINDRA</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}