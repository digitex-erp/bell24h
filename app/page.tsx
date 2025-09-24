<<<<<<< HEAD
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { featureFlags } from '@/lib/featureFlags';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import Logos from '@/components/Logos';
import Timeline from '@/components/Timeline';
import ROI from '@/components/ROI';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CanvasBackground = dynamic(()=>import('@/components/CanvasBackground'),{ ssr:false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bell24h.com';

// JSON-LD Structured Data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bell24h",
  "url": siteUrl,
  "logo": `${siteUrl}/logo.png`,
  "description": "India's fastest B2B match-making engine connecting MSMEs with verified suppliers",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressLocality": "India"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9004962871",
    "contactType": "customer service",
    "email": "digitex.studio@gmail.com"
  },
  "sameAs": [
    "https://www.bell24h.com"
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Bell24h",
  "url": siteUrl,
  "description": "Post RFQ. Get 3 Verified Quotes in 24 Hours. Trust-first, AI-powered B2B marketplace.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteUrl}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bell24h"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": siteUrl
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Bell24h?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bell24h is India's fastest B2B match-making engine that connects MSMEs with verified suppliers. Post your RFQ and get 3 verified quotes in 24 hours using 200+ live data signals for AI-powered matching."
      }
    },
    {
      "@type": "Question",
      "name": "How does the escrow system work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bell24h uses escrow-secured payments where your payment is held safely until you're satisfied with the delivered goods or services. This ensures trust and security in all B2B transactions."
      }
    },
    {
      "@type": "Question",
      "name": "What is the refund policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer a comprehensive refund policy. If you're not satisfied with the delivered goods or services, you can request a refund within the specified timeframe. All refunds are processed through our secure escrow system."
      }
    }
  ]
};

export default function Page(){
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <main id="content" className="min-h-screen bg-[#0b1220] text-white">
        <Header />
        {featureFlags.enableCanvas ? <CanvasBackground/> : null}

        <section className="relative">
          <Hero />
        </section>

        <section className="mx-auto max-w-7xl px-6">
          <div className="mt-8">
            <SearchBar />
          </div>

          {/* Existing features grid goes here; keep your current component unchanged */}
          <div className="mt-14">
            {/* <ExistingFeaturesGrid /> */}
        </div>

          <div className="mt-16">
            <ErrorBoundary fallback={<div className="text-neutral-300">Loading trusted brands…</div>}>
              <Logos />
            </ErrorBoundary>
        </div>

          <div className="mt-20">
            <Timeline />
          </div>

          <div className="mt-20 mb-28">
            <ROI />
          </div>
        </section>
      </main>
    </>
  );
}
=======
'use client';

import { useState } from 'react';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState('phone'); // 'phone' | 'otp' | 'success'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOTP, setDemoOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (data.success) {
        setDemoOTP(data.demoOTP || '');
        setLoginStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (data.success) {
        setLoginStep('success');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Navigation - Brand Compliant */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  B
                </div>
                <div>
                  <div className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                    Bell24h
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Verified B2B Platform</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="/suppliers" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Suppliers</a>
                <a href="/rfq/create" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Post RFQ</a>
                <a href="/wallet" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Wallet</a>
                <a href="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">About</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowLoginModal(true)}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                📱 Mobile Login
              </button>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Brand Compliant */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-7xl md:text-8xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            Post RFQ. Get 3 Verified Quotes in 24 Hours
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl text-gray-700 mb-8 max-w-5xl mx-auto font-medium">
          200 live data signals—GST, credit, logistics, ESG—to match you with 3 pre-qualified suppliers. 
          <span className="text-indigo-600 font-semibold"> Escrow-secured payments</span> until goods arrive.
        </p>

        {/* Trust Layer - Brand Mandated */}
        <div className="flex justify-center gap-6 mb-12 flex-wrap">
          <span className="px-6 py-3 bg-green-100 text-green-800 rounded-full text-xl font-bold flex items-center gap-3 shadow-md">
            ✅ Escrow-Secured (ICICI Bank Partner)
          </span>
          <span className="px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-xl font-bold flex items-center gap-3 shadow-md">
            ✅ GST & PAN Verified
          </span>
          <span className="px-6 py-3 bg-purple-100 text-purple-800 rounded-full text-xl font-bold flex items-center gap-3 shadow-md">
            ✅ AI Trust-Score
          </span>
        </div>

        {/* Social Proof Strip - Brand Required Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-indigo-600">4,321</div>
            <div className="text-gray-600 font-medium">RFQs processed yesterday</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-emerald-600">98%</div>
            <div className="text-gray-600 font-medium">Escrow success rate</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600">12,400</div>
            <div className="text-gray-600 font-medium">Verified suppliers</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-gray-600 font-medium">Product categories</div>
          </div>
        </div>

        {/* Main CTA Section - Brand Mandated */}
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Start Your RFQ Journey</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <input 
              type="text" 
              placeholder="What are you looking for? (e.g., Steel Pipes, Cotton Fabric, Electronics)" 
              className="flex-1 px-6 py-4 text-xl outline-none border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
            />
            <button className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white px-10 py-4 rounded-xl text-xl font-bold hover:from-indigo-700 hover:to-emerald-700 transition-all duration-300 shadow-lg transform hover:scale-105">
              🚀 Start My RFQ Now
            </button>
          </div>
          <div className="flex justify-center mt-6">
            <button className="bg-white text-indigo-600 border-2 border-indigo-600 px-10 py-4 rounded-xl text-xl font-bold hover:bg-indigo-50 transition-all duration-300 shadow-lg">
              ▶️ Watch 2-Min Demo
            </button>
          </div>
        </div>

        {/* How It Works Section - Brand Required */}
        <section className="py-16 bg-white rounded-2xl shadow-xl mb-20">
          <h2 className="text-5xl font-bold mb-16 text-gray-900">How Bell24h Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-800">Post Your RFQ</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Submit by voice, video, or text. Our AI understands your requirements and matches with verified suppliers.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-800">Get 3 Verified Quotes</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Receive AI-scored, GST-verified supplier quotes within 24 hours. 200+ data points analyzed.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-800">Secure Escrow Payment</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Payment held in ICICI escrow until goods arrive. Full protection guaranteed.
              </p>
            </div>
          </div>
        </section>

        {/* Popular Categories - Brand Required */}
        <section className="py-16">
          <h2 className="text-5xl font-bold mb-16 text-gray-900">Popular Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">🏗️</div>
              <h3 className="text-3xl font-bold text-indigo-700 mb-4">Steel & Metals</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Find verified suppliers for TMT bars, structural steel, aluminum, and specialty metals.
              </p>
              <button className="text-indigo-600 font-bold text-lg hover:underline hover:text-indigo-800 transition-colors">
                Explore Steel →
              </button>
            </div>
            
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">🧵</div>
              <h3 className="text-3xl font-bold text-emerald-700 mb-4">Textiles & Garments</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Connect with manufacturers for cotton, silk, synthetic fabrics, and ready-made garments.
              </p>
              <button className="text-emerald-600 font-bold text-lg hover:underline hover:text-emerald-800 transition-colors">
                Explore Textiles →
              </button>
            </div>
            
            <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">📱</div>
              <h3 className="text-3xl font-bold text-purple-700 mb-4">Electronics & IT</h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Source semiconductors, mobile components, LED displays, and IT hardware.
              </p>
              <button className="text-purple-600 font-bold text-lg hover:underline hover:text-purple-800 transition-colors">
                Explore Electronics →
              </button>
            </div>
          </div>
        </section>

        {/* AI Features Highlight */}
        <section className="py-16 bg-gradient-to-r from-indigo-100 to-emerald-100 rounded-2xl mb-20">
          <h2 className="text-5xl font-bold mb-8 text-gray-900">AI-Powered B2B Engine</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI Matching</h3>
              <p className="text-gray-600">200+ data points analysis</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Voice RFQ</h3>
              <p className="text-gray-600">Speak your requirements</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Trust Scoring</h3>
              <p className="text-gray-600">AI-generated risk assessment</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Escrow</h3>
              <p className="text-gray-600">Automated payment protection</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Brand Compliant */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                  B
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                    Bell24h
                  </div>
                  <div className="text-gray-400">India's Fastest B2B Match-Making Engine for MSMEs</div>
                </div>
              </div>
              <p className="text-gray-300 text-lg mb-4">
                Trusted by 12,400+ verified suppliers across India. Escrow-secured transactions worth ₹100+ crores processed.
              </p>
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="text-2xl">🇮🇳</span>
                <span className="font-semibold">Made in India</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/suppliers" className="hover:text-white transition-colors">Find Suppliers</a></li>
                <li><a href="/rfq/create" className="hover:text-white transition-colors">Post RFQ</a></li>
                <li><a href="/wallet" className="hover:text-white transition-colors">Wallet</a></li>
                <li><a href="/escrow" className="hover:text-white transition-colors">Escrow</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">© 2024 Bell24h.com. All rights reserved. | Escrow Partner: ICICI Bank | GST: 123456789</p>
          </div>
        </div>
      </footer>

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
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">B</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Bell24h Login</h2>
              <p className="text-gray-600 mt-2">
                {loginStep === 'phone' && 'Enter your mobile number'}
                {loginStep === 'otp' && 'Enter the OTP sent to your phone'}
                {loginStep === 'success' && 'Login successful!'}
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
                  onClick={handleSendOTP}
                  disabled={loading || phone.length !== 10}
                  className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* Success Step */}
            {loginStep === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 text-4xl">✅</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Login Successful!</h3>
                  <p className="text-gray-600">Welcome to Bell24h! Redirecting to dashboard...</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    📱 Phone: +91 {phone} verified successfully
                  </p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
>>>>>>> 504c5ee690291e877954561480a78ee33260c24a
