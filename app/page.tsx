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
        <a href='/pricing' className='bg-amber-500 text-black px-4 py-1 rounded'>Pricing</a>
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
      </main>
    </div>
  );
}
