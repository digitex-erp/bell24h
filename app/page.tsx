'use client';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { featureFlags } from '@/lib/featureFlags';

// Dynamic imports for 3D background
const CanvasBackground = dynamic(() => import('@/components/CanvasBackground'), { ssr: false });

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOTP, setDemoOTP] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mobile OTP Login Functions
  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate demo OTP for testing
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOTP(generatedOTP);
      console.log(`📱 OTP for +91${phone}: ${generatedOTP}`);
      setLoginStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp !== demoOTP) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Success - redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    setOtp('');
    setError('');
    sendOTP();
  };

  const resetLogin = () => {
    setLoginStep('phone');
    setPhone('');
    setOtp('');
    setDemoOTP('');
    setError('');
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 3D Background - Optional */}
      {featureFlags.enableCanvas && <CanvasBackground />}
      {/* Beta Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <span className="font-semibold">🚀 BETA LAUNCH • Limited to 50 users • Basic features only • No payments yet</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bell24h</h1>
                <p className="text-sm text-gray-500">Enterprise B2B</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md font-medium">Home</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Supplier Showcase</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Fintech Services</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">Wallet & Escrow</a>
              <a href="#" className="text-gray-700 hover:text-indigo-600 font-medium">AI Features</a>
            </div>

             {/* Login Button */}
             <button 
               onClick={() => setShowLoginModal(true)}
               className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
             >
               Login
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            India's Leading{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered B2B Marketplace
            </span>
          </h1>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">✅ GST Verified</span>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">🛡️ Escrow Protected</span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold">🤖 AI Powered</span>
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold">🎤 Voice RFQs</span>
            <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full font-semibold">📹 Video RFQs</span>
            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">🗣️ Hindi Support</span>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Voice RFQs • Video RFQs • AI Matching • Secure Escrow • Real-time Analytics • Mobile OTP Login
          </p>

          {/* Location */}
          <div className="flex items-center justify-center space-x-2 text-indigo-600 mb-12">
            <span className="text-red-500">📍</span>
            <span className="text-lg font-medium">Based in Mumbai, Maharashtra - Serving All India</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Login with Mobile OTP
            </button>
            <Link href="/rfq/create" className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition">
              Create RFQ
            </Link>
            <Link href="/dashboard" className="bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-900 transition">
              View Dashboard
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="What are you looking for? (e.g., 'steel pipes', 'textiles')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </div>
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="md:w-64">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                >
                  <option value="all">All Categories</option>
                  <option value="steel">Steel & Metals</option>
                  <option value="textiles">Textiles</option>
                  <option value="electronics">Electronics</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="machinery">Machinery</option>
                </select>
              </div>

              {/* AI Search Button */}
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-sm">AI</span>
                  </div>
                  <span>AI Search</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600">1,250+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">847</div>
              <div className="text-gray-600">Verified Suppliers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">98%</div>
              <div className="text-gray-600">AI Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600">24hr</div>
              <div className="text-gray-600">Quote Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Voice RFQ */}
            <Link href="/rfq/voice" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-2xl font-bold mb-3">Voice RFQs</h3>
              <p className="text-gray-600">Create RFQs by speaking. 60-second voice recording with AI transcription.</p>
            </Link>
            
            {/* Video RFQ */}
            <Link href="/rfq/video" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">📹</div>
              <h3 className="text-2xl font-bold mb-3">Video RFQs</h3>
              <p className="text-gray-600">Show what you need. 120-second video recording with AI analysis.</p>
            </Link>
            
            {/* AI Dashboard */}
            <Link href="/admin/dashboard" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-3">AI Analytics</h3>
              <p className="text-gray-600">Advanced analytics with SHAP explainability and trust scoring.</p>
            </Link>
            
            {/* Mobile OTP */}
            <Link href="/auth/phone-email" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold mb-3">Mobile OTP Login</h3>
              <p className="text-gray-600">Secure authentication with instant OTP verification.</p>
            </Link>
            
            {/* Escrow */}
            <Link href="/escrow" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-3">Escrow Protection</h3>
              <p className="text-gray-600">100% payment security with milestone-based releases.</p>
            </Link>
            
            {/* Pricing */}
            <Link href="/pricing" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-2xl font-bold mb-3">Flexible Pricing</h3>
              <p className="text-gray-600">Plans from Free to Enterprise starting at ₹0/month.</p>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Post Your Requirement</h3>
              <p className="text-gray-600">Use text, voice, or video to create RFQs and get quotes from verified suppliers</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Compare & Choose</h3>
              <p className="text-gray-600">Compare prices, ratings, and AI trust scores to find the best supplier</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Secure Transaction</h3>
              <p className="text-gray-600">Complete your purchase with escrow protection and track delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8">Join thousands of businesses already using Bell24h</p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Register as Buyer
            </Link>
            <Link href="/claim-company" className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600">
              Become a Supplier
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold">Bell24h</span>
              </div>
              <p className="text-gray-400">India's fastest B2B marketplace with AI-powered matching, voice/video RFQs, and secure escrow payments.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">RFQ Features</h3>
              <ul className="space-y-2">
                <li><Link href="/rfq" className="text-gray-400 hover:text-white">Create Text RFQ</Link></li>
                <li><Link href="/rfq/voice" className="text-gray-400 hover:text-white">Voice RFQ</Link></li>
                <li><Link href="/rfq/video" className="text-gray-400 hover:text-white">Video RFQ</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing Plans</Link></li>
                <li><Link href="/escrow" className="text-gray-400 hover:text-white">Escrow Protection</Link></li>
                <li><Link href="/wallet" className="text-gray-400 hover:text-white">Wallet</Link></li>
                <li><Link href="/admin/dashboard" className="text-gray-400 hover:text-white">Admin Panel</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <p className="text-gray-400">📞 +91 98765 43210</p>
                <p className="text-gray-400">✉️ support@bell24h.com</p>
                <p className="text-gray-400">📍 Mumbai, Maharashtra</p>
                <Link href="/help" className="text-gray-400 hover:text-white block">Help Center</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 Bell24h. All rights reserved. | Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>

       {/* Floating Chat Button */}
       <div className="fixed bottom-8 right-8 z-50">
         <button className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
           💬
         </button>
       </div>

       {/* Mobile OTP Login Modal */}
       {showLoginModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
             {/* Close Button */}
             <button
               onClick={resetLogin}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
             >
               ×
             </button>

             {/* Header */}
             <div className="text-center mb-8">
               <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-white font-bold text-2xl">B</span>
               </div>
               <h2 className="text-2xl font-bold text-gray-900">Bell24h Login</h2>
               <p className="text-gray-600 mt-2">
                 {loginStep === 'phone' && 'Enter your mobile number to continue'}
                 {loginStep === 'otp' && 'Enter the OTP sent to your phone'}
               </p>
             </div>

             {/* Demo OTP Display */}
             {demoOTP && loginStep === 'otp' && (
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                 <div className="text-center">
                   <h3 className="text-sm font-medium text-yellow-800">Demo OTP</h3>
                   <p className="text-3xl font-bold text-yellow-900 mt-1">{demoOTP}</p>
                   <p className="text-xs text-yellow-700 mt-1">Use this code for testing</p>
                 </div>
               </div>
             )}

             {/* Error Message */}
             {error && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                 <p className="text-red-800 text-center">{error}</p>
               </div>
             )}

             {/* Phone Input Step */}
             {loginStep === 'phone' && (
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Mobile Number
                   </label>
                   <div className="flex">
                     <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                       +91
                     </span>
                     <input
                       type="tel"
                       value={phone}
                       onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                       placeholder="9876543210"
                       className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
                       maxLength={10}
                     />
                   </div>
                   <p className="text-xs text-gray-500 mt-1">
                     Enter your 10-digit mobile number to receive OTP
                   </p>
                 </div>

                 <button
                   onClick={sendOTP}
                   disabled={loading || phone.length !== 10}
                   className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                 >
                   {loading ? '📱 Sending OTP...' : '📱 Send OTP'}
                 </button>

                 <div className="text-center">
                   <p className="text-xs text-gray-500">
                     By continuing, you agree to Bell24h's Terms & Privacy Policy
                   </p>
                 </div>
               </div>
             )}

             {/* OTP Input Step */}
             {loginStep === 'otp' && (
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Enter OTP
                   </label>
                   <input
                     type="text"
                     value={otp}
                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                     placeholder="123456"
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center text-2xl font-bold tracking-widest"
                     maxLength={6}
                   />
                   <p className="text-xs text-gray-500 mt-1 text-center">
                     OTP sent to +91 {phone} • Valid for 5 minutes
                   </p>
                 </div>

                 <button
                   onClick={verifyOTP}
                   disabled={loading || otp.length !== 6}
                   className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                 >
                   {loading ? '🔓 Verifying...' : '🔓 Verify & Login'}
                 </button>

                 <div className="flex justify-between text-sm">
                   <button
                     onClick={() => setLoginStep('phone')}
                     className="text-indigo-600 hover:text-indigo-800"
                   >
                     ← Change Number
                   </button>
                   <button
                     onClick={resendOTP}
                     disabled={loading}
                     className="text-indigo-600 hover:text-indigo-800"
                   >
                     Resend OTP
                   </button>
                 </div>
               </div>
             )}
           </div>
         </div>
       )}
     </div>
   );
 }