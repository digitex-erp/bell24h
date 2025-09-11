// app/page.tsx – Bell24h Strategic Redesign (Trust + Verification Focus)
'use client';
import { ArrowRight, CheckCircle, Globe, Phone, Shield, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import PhoneOTPModal from '../components/PhoneOTPModal';
import SearchInterface from '../components/SearchInterface';

export default function HomePage() {
  const [geo, setGeo] = useState('Global');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('//ipapi.co/json')
      .then(r => r.json())
      .then(d => setGeo(d.country_name === 'India' ? 'India' : 'Global'));
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    // Redirect to dashboard or show success message
    window.location.href = '/dashboard';
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0A0A1B] to-[#1A1A2E] text-white'>
      {/* Header */}
      <header className='sticky top-0 z-50 bg-gray-900/80 backdrop-blur px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <span className='text-white text-lg font-bold'>🔔</span>
          </div>
          <h1 className='text-2xl font-bold'>Bell<span className='text-amber-400'>24h</span></h1>
        </div>
        <nav className='hidden md:flex items-center space-x-4'>
          <a href='/leads' className='text-white hover:text-amber-400 transition-colors'>Submit RFQ</a>
          <a href='/supplier/leads' className='text-white hover:text-amber-400 transition-colors'>Browse Leads</a>
          <a href='/services/verification' className='text-white hover:text-amber-400 transition-colors'>Verification</a>
          <a href='/services/rfq-writing' className='text-white hover:text-amber-400 transition-colors'>RFQ Writing</a>
          <a href='/services/featured-suppliers' className='text-white hover:text-amber-400 transition-colors'>Get Featured</a>
          <button
            onClick={() => setShowAuthModal(true)}
            className='text-white hover:text-amber-400 transition-colors flex items-center space-x-1'
          >
            <Phone className='h-4 w-4' />
            <span>Login</span>
          </button>
          <a href='/pricing' className='bg-amber-500 text-black px-4 py-1 rounded'>Pricing</a>
        </nav>
        <div className='md:hidden flex items-center space-x-2'>
          <button
            onClick={() => setShowAuthModal(true)}
            className='text-white hover:text-amber-400 transition-colors flex items-center space-x-1'
          >
            <Phone className='h-4 w-4' />
            <span className='hidden sm:inline'>Login</span>
          </button>
          <a href='/pricing' className='bg-amber-500 text-black px-3 py-1 rounded text-sm'>Pricing</a>
        </div>
      </header>

      {/* Hero Section - Strategic Redesign */}
      <main className='flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6'>
        {/* Main Headline - Trust + Global Focus */}
        <div className='text-center max-w-5xl'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-amber-400 bg-clip-text text-transparent leading-tight mb-6'>
            Verified Business Deals.<br />
            <span className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl'>Powered by Technology.</span><br />
            <span className='text-xl sm:text-2xl md:text-3xl lg:text-4xl'>Trusted by SMEs & Exporters.</span>
          </h1>

          {/* Sub-Text - Focus on Trust + Escrow */}
          <p className='text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed'>
            Bell24h connects Indian SMEs with global buyers through smart matching,
            <span className='text-amber-400 font-semibold'> supplier risk verification</span>, and
            <span className='text-blue-400 font-semibold'> secure payment processing</span>.
          </p>

          {/* Call-to-Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
            <button
              onClick={() => setShowAuthModal(true)}
              className='inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base sm:text-lg transition-all duration-200 hover:scale-105 shadow-lg min-h-[44px]'
            >
              <Phone className='h-5 w-5 sm:h-6 sm:w-6 mr-2' />
              <span className='hidden sm:inline'>Join Free with Phone OTP</span>
              <span className='sm:hidden'>Join Free</span>
              <ArrowRight className='h-4 w-4 sm:h-5 sm:w-5 ml-2' />
            </button>
            <a
              href='/supplier/leads'
              className='inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-base sm:text-lg transition-all duration-200 hover:scale-105 shadow-lg min-h-[44px]'
            >
              <Shield className='h-5 w-5 sm:h-6 sm:w-6 mr-2' />
              <span className='hidden sm:inline'>Find Verified Suppliers</span>
              <span className='sm:hidden'>Find Suppliers</span>
              <ArrowRight className='h-4 w-4 sm:h-5 sm:w-5 ml-2' />
            </a>
          </div>

          {/* Trust Badges - Reorganized for Trust Focus */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12'>
            <div className='bg-white/10 backdrop-blur rounded-lg p-4 text-center hover:bg-white/20 transition-colors border border-green-500/30'>
              <CheckCircle className='h-8 w-8 text-green-400 mx-auto mb-2' />
              <div className='text-sm font-semibold text-green-400'>Supplier Risk Verified</div>
            </div>
            <div className='bg-white/10 backdrop-blur rounded-lg p-4 text-center hover:bg-white/20 transition-colors border border-blue-500/30'>
              <Shield className='h-8 w-8 text-blue-400 mx-auto mb-2' />
              <div className='text-sm font-semibold text-blue-400'>Escrow Secured</div>
            </div>
            <div className='bg-white/10 backdrop-blur rounded-lg p-4 text-center hover:bg-white/20 transition-colors border border-purple-500/30'>
              <Globe className='h-8 w-8 text-purple-400 mx-auto mb-2' />
              <div className='text-sm font-semibold text-purple-400'>Export-Ready</div>
            </div>
            <div className='bg-white/10 backdrop-blur rounded-lg p-4 text-center hover:bg-white/20 transition-colors border border-amber-500/30'>
              <Zap className='h-8 w-8 text-amber-400 mx-auto mb-2' />
              <div className='text-sm font-semibold text-amber-400'>Smart Matching</div>
            </div>
          </div>

          {/* Trust Metrics - Differentiated from IndiaMART/Udaan */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16'>
            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center'>
              <div className='text-3xl font-bold text-amber-400 mb-2'>534,672</div>
              <div className='text-gray-300'>Verified Suppliers</div>
            </div>
            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center'>
              <div className='text-3xl font-bold text-blue-400 mb-2'>12,500</div>
              <div className='text-gray-300'>Secure RFQs</div>
            </div>
            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center'>
              <div className='text-3xl font-bold text-green-400 mb-2'>₹100Cr</div>
              <div className='text-gray-300'>Secure Transactions</div>
            </div>
            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center'>
              <div className='text-3xl font-bold text-purple-400 mb-2'>98.5%</div>
              <div className='text-gray-300'>Trust Score</div>
            </div>
          </div>
        </div>

        {/* Services Section - Enhanced with Trust Focus */}
        <div className='w-full max-w-6xl'>
          <h2 className='text-3xl font-bold text-center mb-4'>Trust-First B2B Services</h2>
          <p className='text-center text-gray-400 mb-8 max-w-2xl mx-auto'>
            Every service designed to build trust and reduce risk in B2B transactions
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center hover:bg-white/20 transition-colors border border-green-500/30'>
              <div className='w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <CheckCircle className='h-8 w-8 text-green-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Supplier Verification</h3>
              <p className='text-gray-300 mb-4'>Comprehensive verification reports with GST/PAN authentication, business history check, and risk assessment</p>
              <div className='text-2xl font-bold text-amber-400 mb-4'>₹2,000</div>
              <a href='/services/verification' className='bg-amber-500 text-black px-4 sm:px-6 py-2 rounded hover:bg-amber-400 transition-colors inline-flex items-center justify-center min-h-[44px] text-sm sm:text-base'>
                <span className='hidden sm:inline'>Order Verification</span>
                <span className='sm:hidden'>Order</span>
                <ArrowRight className='h-4 w-4 ml-2' />
              </a>
            </div>

            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center hover:bg-white/20 transition-colors border border-blue-500/30'>
              <div className='w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <Shield className='h-8 w-8 text-blue-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>RFQ Writing</h3>
              <p className='text-gray-300 mb-4'>Professional RFQ writing to attract verified suppliers and get competitive quotes</p>
              <div className='text-2xl font-bold text-amber-400 mb-4'>₹500</div>
              <a href='/services/rfq-writing' className='bg-amber-500 text-black px-4 sm:px-6 py-2 rounded hover:bg-amber-400 transition-colors inline-flex items-center justify-center min-h-[44px] text-sm sm:text-base'>
                Get Started
                <ArrowRight className='h-4 w-4 ml-2' />
              </a>
            </div>

            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center hover:bg-white/20 transition-colors border border-purple-500/30'>
              <div className='w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <TrendingUp className='h-8 w-8 text-purple-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Featured Suppliers</h3>
              <p className='text-gray-300 mb-4'>Premium visibility on our platform to reach more verified buyers</p>
              <div className='text-2xl font-bold text-amber-400 mb-4'>₹1,000/mo</div>
              <a href='/services/featured-suppliers' className='bg-amber-500 text-black px-4 sm:px-6 py-2 rounded hover:bg-amber-400 transition-colors inline-flex items-center justify-center min-h-[44px] text-sm sm:text-base'>
                <span className='hidden sm:inline'>Become Featured</span>
                <span className='sm:hidden'>Featured</span>
                <ArrowRight className='h-4 w-4 ml-2' />
              </a>
            </div>
          </div>
        </div>

        {/* Search Interface - Thomasnet Inspired */}
        <div className='mt-16 w-full'>
          <SearchInterface />
        </div>

        {/* Trust Statement - Differentiated Positioning */}
        <div className='mt-16 text-center max-w-4xl mx-auto'>
          <div className='bg-white/5 backdrop-blur rounded-2xl p-8 border border-amber-500/30'>
            <h3 className='text-2xl font-bold mb-4 text-amber-400'>Why Choose Bell24h?</h3>
            <p className='text-lg text-gray-300 mb-6'>
              Unlike generic B2B platforms, Bell24h focuses on <span className='text-amber-400 font-semibold'>verified, secure, and trustworthy</span> business connections.
              Every supplier is verified, every transaction is escrow-protected, and every deal is backed by our AI-powered risk assessment.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <a href='/about' className='text-blue-400 hover:text-blue-300 transition-colors'>
                Learn More About Our Trust Process →
              </a>
              <a href='/contact' className='text-green-400 hover:text-green-300 transition-colors'>
                Contact Our Verification Team →
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Phone OTP Authentication Modal */}
      <PhoneOTPModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}