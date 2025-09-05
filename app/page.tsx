// app/page.tsx – Bell24h MVP (VS Code / Cursor safe)
'use client';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [geo, setGeo] = useState('Global');

  useEffect(() => {
    fetch('//ipapi.co/json')
      .then(r => r.json())
      .then(d => setGeo(d.country_name === 'India' ? 'India' : 'Global'));
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0A0A1B] to-[#1A1A2E] text-white'>
      <header className='sticky top-0 z-50 bg-gray-900/80 backdrop-blur px-6 py-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Bell<span className='text-amber-400'>24h</span></h1>
        <nav className='hidden md:flex items-center space-x-4'>
          <a href='/leads' className='text-white hover:text-amber-400 transition-colors'>Submit RFQ</a>
          <a href='/supplier/leads' className='text-white hover:text-amber-400 transition-colors'>Browse Leads</a>
          <a href='/services/verification' className='text-white hover:text-amber-400 transition-colors'>Verification</a>
          <a href='/services/rfq-writing' className='text-white hover:text-amber-400 transition-colors'>RFQ Writing</a>
          <a href='/services/featured-suppliers' className='text-white hover:text-amber-400 transition-colors'>Get Featured</a>
          <a href='/pricing' className='bg-amber-500 text-black px-4 py-1 rounded'>Pricing</a>
        </nav>
        <div className='md:hidden'>
          <a href='/pricing' className='bg-amber-500 text-black px-4 py-1 rounded'>Pricing</a>
        </div>
      </header>
      <main className='flex flex-col items-center justify-center h-[calc(100vh-80px)]'>
        <h1 className='text-5xl font-bold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent'>
          The {geo} B2B Operating System
        </h1>
        <div className='mt-8 grid grid-cols-2 md:grid-cols-4 gap-4'>
          {['534,672 Suppliers','12,500 RFQs','₹100Cr Revenue','98.5% Success'].map(k=>(
            <div key={k} className='bg-white/10 backdrop-blur rounded-lg p-4'><div className='text-amber-400 font-bold'>{k}</div></div>
          ))}
        </div>
        
        {/* Services Section */}
        <div className='mt-16 w-full max-w-6xl'>
          <h2 className='text-3xl font-bold text-center mb-8'>Our Services</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center hover:bg-white/20 transition-colors'>
              <h3 className='text-xl font-semibold mb-2'>Supplier Verification</h3>
              <p className='text-gray-300 mb-4'>Get detailed verification reports for any supplier</p>
              <div className='text-2xl font-bold text-amber-400 mb-2'>₹2,000</div>
              <a href='/services/verification' className='bg-amber-500 text-black px-4 py-2 rounded hover:bg-amber-400 transition-colors'>Order Now</a>
            </div>
            
            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center hover:bg-white/20 transition-colors'>
              <h3 className='text-xl font-semibold mb-2'>RFQ Writing</h3>
              <p className='text-gray-300 mb-4'>Professional RFQ writing to attract better suppliers</p>
              <div className='text-2xl font-bold text-amber-400 mb-2'>₹500</div>
              <a href='/services/rfq-writing' className='bg-amber-500 text-black px-4 py-2 rounded hover:bg-amber-400 transition-colors'>Get Started</a>
            </div>
            
            <div className='bg-white/10 backdrop-blur rounded-lg p-6 text-center hover:bg-white/20 transition-colors'>
              <h3 className='text-xl font-semibold mb-2'>Featured Suppliers</h3>
              <p className='text-gray-300 mb-4'>Get premium visibility on our platform</p>
              <div className='text-2xl font-bold text-amber-400 mb-2'>₹1,000/mo</div>
              <a href='/services/featured-suppliers' className='bg-amber-500 text-black px-4 py-2 rounded hover:bg-amber-400 transition-colors'>Become Featured</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
