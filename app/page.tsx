'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [showAIDropdown, setShowAIDropdown] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                <div>
                  <div className="font-bold text-xl">Bell24h</div>
                  <div className="text-xs text-gray-600">Enterprise B2B</div>
                </div>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600">🏠 Home</Link>
                <Link href="/suppliers" className="text-gray-700 hover:text-blue-600">🏢 Supplier Showcase</Link>
                <Link href="/services/finance" className="text-gray-700 hover:text-blue-600">📋 Fintech Services</Link>
                <Link href="/services/escrow" className="text-gray-700 hover:text-blue-600">💳 Wallet & Escrow</Link>

                <div className="relative">
                  <button
                    onClick={() => setShowAIDropdown(!showAIDropdown)}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 border border-gray-300 px-4 py-2 rounded-lg"
                  >
                    🤖 AI Features <span className="text-xs">▼</span>
                  </button>
                  {showAIDropdown && (
                    <div className="absolute top-full mt-2 bg-white shadow-xl rounded-lg py-2 w-64">
                      <Link href="/dashboard/ai-features" className="block px-4 py-2 hover:bg-gray-100">🧠 AI Features Dashboard</Link>
                      <Link href="/voice-rfq" className="block px-4 py-2 hover:bg-gray-100">🎤 Voice RFQ</Link>
                      <Link href="/dashboard/ai-features" className="block px-4 py-2 hover:bg-gray-100">🔍 AI Explainability</Link>
                      <Link href="/dashboard/ai-features" className="block px-4 py-2 hover:bg-gray-100">⚠️ Risk Scoring</Link>
                      <Link href="/dashboard/ai-features" className="block px-4 py-2 hover:bg-gray-100">📈 Market Data</Link>
                      <Link href="/dashboard/ai-features" className="block px-4 py-2 hover:bg-gray-100">🎯 Smart Matching</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link href="/demo-login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2">
              Login <span className="text-xs">→</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="text-6xl font-bold mb-8">
            <span className="text-black">India&apos;s Leading</span><br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered B2B Market</span>
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">🇮🇳 Made in India</span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">🏛️ GST Compliant</span>
            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">🏪 MSME Friendly</span>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">💳 UPI Payments</span>
            <span className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">🗣️ Hindi Support</span>
          </div>

          <p className="text-xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Connect with verified Indian suppliers and buyers using advanced AI matching, secure escrow payments, and intelligent analytics for seamless B2B transactions.
          </p>

          <p className="text-lg text-blue-600 mb-12">📍 Based in Mumbai, Maharashtra - Serving All India</p>

          <div className="bg-white rounded-lg shadow-xl p-2 max-w-4xl mx-auto flex gap-2">
            <input type="text" placeholder="What are you looking for? (e.g., 'steel pipes', 'textiles')" className="flex-1 px-6 py-4 text-lg border-none outline-none" />
            <select className="px-4 py-2 border-l border-gray-200 bg-white text-gray-700">
              <option>All Categories</option>
              <option>Manufacturing</option>
              <option>Textiles</option>
              <option>Electronics</option>
              <option>Construction</option>
            </select>
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2">
              🔍 AI Search
            </button>
            <button className="px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg">
              💬
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}