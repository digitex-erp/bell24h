# 🚀 Bell24h Production Deployment Script
# Zero-contamination repo → Live in < 24 hours

Write-Host "🚀 Bell24h Production Deployment Starting..." -ForegroundColor Green
Write-Host ""

# Step 1: Create clean directory
Write-Host "📁 Step 1: Creating clean production directory..." -ForegroundColor Yellow
if (Test-Path "bell24h-production") {
  Remove-Item -Recurse -Force "bell24h-production"
}
mkdir bell24h-production
cd bell24h-production

# Step 2: Initialize Next.js project
Write-Host "🔧 Step 2: Initializing Next.js project..." -ForegroundColor Yellow
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

# Step 3: Create clean homepage
Write-Host "📝 Step 3: Creating clean Bell24h homepage..." -ForegroundColor Yellow
$homepageContent = @'
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [showAIDropdown, setShowAIDropdown] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
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
                <Link href="/fintech" className="text-gray-700 hover:text-blue-600">💳 Fintech Services</Link>
                <Link href="/wallet" className="text-gray-700 hover:text-blue-600">💰 Wallet & Escrow</Link>
                
                <div className="relative">
                  <button onClick={() => setShowAIDropdown(!showAIDropdown)} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 border border-gray-300 px-4 py-2 rounded-lg">
                    🤖 AI Features <span className="text-xs">▼</span>
                  </button>
                  {showAIDropdown && (
                    <div className="absolute top-full mt-2 bg-white shadow-xl rounded-lg py-2 w-64">
                      <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">📊 AI Features Dashboard</Link>
                      <Link href="/voice-rfq" className="block px-4 py-2 hover:bg-gray-100">🎤 Voice RFQ</Link>
                      <Link href="/ai-explainability" className="block px-4 py-2 hover:bg-gray-100">🧠 AI Explainability</Link>
                      <Link href="/risk-scoring" className="block px-4 py-2 hover:bg-gray-100">⚠️ Risk Scoring</Link>
                      <Link href="/market-data" className="block px-4 py-2 hover:bg-gray-100">📈 Market Data</Link>
                      <Link href="/video-rfq" className="block px-4 py-2 hover:bg-gray-100">📹 Video RFQ</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link href="/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Login</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="text-6xl font-bold mb-8">
            <span className="text-black">India's Leading</span><br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered B2B Marketplace</span>
          </h1>

          {/* Feature Badges */}
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

          {/* Search Interface */}
          <div className="bg-white rounded-lg shadow-xl p-2 max-w-4xl mx-auto flex gap-2">
            <input type="text" placeholder="What are you looking for? (e.g., 'steel pipes', 'textiles')" className="flex-1 px-6 py-4 text-lg border-none outline-none" />
            <select className="px-4 py-2 border-l border-gray-200 bg-white text-gray-700">
              <option>All Categories</option>
              <option>Manufacturing</option>
              <option>Textiles</option>
              <option>Electronics</option>
              <option>Construction</option>
            </select>
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">🔍 AI Search</button>
          </div>
        </div>
      </main>
    </div>
  )
}
'@

$homepageContent | Out-File -FilePath "app/page.tsx" -Encoding UTF8

# Step 4: Initialize Git and push
Write-Host "📦 Step 4: Initializing Git repository..." -ForegroundColor Yellow
git init
git add .
git commit -m "feat: clean Bell24h homepage - India's Thomasnet equivalent"

Write-Host ""
Write-Host "✅ CLEAN REPOSITORY READY!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository: bell24h-production" -ForegroundColor White
Write-Host "2. Run: git remote add origin https://github.com/YOUR-USERNAME/bell24h-production.git" -ForegroundColor White
Write-Host "3. Run: git push -u origin main" -ForegroundColor White
Write-Host "4. Deploy to Vercel Pro: npx vercel --prod" -ForegroundColor White
Write-Host "5. Add domain: www.bell24h.com in Vercel dashboard" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your Bell24h homepage will be live in < 24 hours!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
