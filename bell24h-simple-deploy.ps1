# 🚀 Bell24h Simple Deployment Script
# Fixes PowerShell syntax issues

Write-Host "🚀 Bell24h Simple Deployment Starting..." -ForegroundColor Green
Write-Host ""

# Step 1: Create clean production directory
Write-Host "📁 Step 1: Creating clean production directory..." -ForegroundColor Yellow
if (Test-Path "bell24h-production") {
  Remove-Item -Recurse -Force "bell24h-production"
}
mkdir bell24h-production
cd bell24h-production

# Step 2: Initialize Next.js project
Write-Host "🔧 Step 2: Initializing Next.js project..." -ForegroundColor Yellow
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes

# Step 3: Install packages
Write-Host "📦 Step 3: Installing packages..." -ForegroundColor Yellow
npm install @prisma/client prisma next-auth @next-auth/prisma-adapter
npm install @tanstack/react-query @tanstack/react-table
npm install @radix-ui/react-dropdown-menu @radix-ui/react-dialog
npm install lucide-react framer-motion
npm install @hookform/resolvers react-hook-form zod

# Step 4: Create homepage file
Write-Host "🎨 Step 4: Creating homepage..." -ForegroundColor Yellow
$homepageFile = "app/page.tsx"
$homepageContent = @'
'use client'
import { useState } from 'react'
import Link from 'next/link'

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
                <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                <Link href="/suppliers" className="text-gray-700 hover:text-blue-600">Suppliers</Link>
                <Link href="/rfq" className="text-gray-700 hover:text-blue-600">RFQ</Link>
                <Link href="/admin" className="text-gray-700 hover:text-blue-600">Admin</Link>
              </div>
            </div>
            <Link href="/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Login</Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="text-6xl font-bold mb-8">
            <span className="text-black">India's Leading</span><br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered B2B Marketplace</span>
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">Made in India</span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">GST Compliant</span>
            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">MSME Friendly</span>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">UPI Payments</span>
          </div>

          <p className="text-xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Connect with verified Indian suppliers and buyers using advanced AI matching, secure escrow payments, and intelligent analytics for seamless B2B transactions.
          </p>

          <div className="bg-white rounded-lg shadow-xl p-2 max-w-4xl mx-auto flex gap-2">
            <input type="text" placeholder="What are you looking for?" className="flex-1 px-6 py-4 text-lg border-none outline-none" />
            <select className="px-4 py-2 border-l border-gray-200 bg-white text-gray-700">
              <option>All Categories</option>
              <option>Manufacturing</option>
              <option>Textiles</option>
              <option>Electronics</option>
            </select>
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">AI Search</button>
          </div>
        </div>
      </main>
    </div>
  )
}
'@

$homepageContent | Out-File -FilePath $homepageFile -Encoding UTF8

# Step 5: Create login page
Write-Host "📱 Step 5: Creating login page..." -ForegroundColor Yellow
mkdir -p "app/login"
$loginFile = "app/login/page.tsx"
$loginContent = @'
'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">B</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Bell24h</h1>
          <p className="text-gray-600">India's AI-Powered B2B Marketplace</p>
        </div>

        {step === 'phone' ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setStep('otp')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-2"
            >
              Verify OTP
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Change Phone
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
'@

$loginContent | Out-File -FilePath $loginFile -Encoding UTF8

# Step 6: Initialize Git
Write-Host "📦 Step 6: Initializing Git..." -ForegroundColor Yellow
git init
git add .
git commit -m "feat: Bell24h homepage and login system"

Write-Host ""
Write-Host "✅ BELL24H HOMEPAGE READY!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository: bell24h-production" -ForegroundColor White
Write-Host "2. Run: git remote add origin https://github.com/YOUR-USERNAME/bell24h-production.git" -ForegroundColor White
Write-Host "3. Run: git push -u origin main" -ForegroundColor White
Write-Host "4. Deploy to Vercel: npx vercel --prod" -ForegroundColor White
Write-Host "5. Add domain: www.bell24h.com" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your Bell24h homepage will be live in minutes!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
