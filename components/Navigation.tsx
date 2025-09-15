'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [showAIDropdown, setShowAIDropdown] = useState(false)

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                B
              </div>
              <div>
                <div className="font-bold text-xl">Bell24h</div>
                <div className="text-xs text-gray-600">Enterprise B2B</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                🏠 Home
              </Link>
              <Link href="/suppliers" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                🏢 Supplier Showcase
              </Link>
              <Link href="/fintech" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                💳 Fintech Services
              </Link>
              <Link href="/wallet" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                💰 Wallet & Escrow
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowAIDropdown(!showAIDropdown)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 border border-gray-300 px-4 py-2 rounded-lg"
                >
                  🤖 AI Features <span className="text-xs">▼</span>
                </button>
                {showAIDropdown && (
                  <div className="absolute top-full mt-2 bg-white shadow-xl rounded-lg py-2 w-64">
                    <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                      📊 AI Features Dashboard
                    </Link>
                    <Link href="/voice-rfq" className="block px-4 py-2 hover:bg-gray-100">
                      🎤 Voice RFQ
                    </Link>
                    <Link href="/ai-explainability" className="block px-4 py-2 hover:bg-gray-100">
                      🧠 AI Explainability
                    </Link>
                    <Link href="/risk-scoring" className="block px-4 py-2 hover:bg-gray-100">
                      ⚠️ Risk Scoring
                    </Link>
                    <Link href="/market-data" className="block px-4 py-2 hover:bg-gray-100">
                      📈 Market Data
                    </Link>
                    <Link href="/video-rfq" className="block px-4 py-2 hover:bg-gray-100">
                      📹 Video RFQ
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}
