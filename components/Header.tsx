'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AudioToggle from './AudioToggle';
import { featureFlags } from '@/lib/featureFlags';
const ThreeBell = featureFlags.enableThreeBell ? dynamic(()=>import('./ThreeBell'),{ssr:false,loading:()=>null}) : (()=>null) as any;
export default function Header(){
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur">
      {/* Skip to content link for accessibility */}
      <a 
        href="#content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        aria-label="Skip to main content"
      >
        Skip to content
      </a>
      
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Bell24h Homepage">
          <div className="size-7 rounded-md bg-amber-400/30" aria-hidden="true"/><span className="bg-gradient-to-r from-white to-amber-200 bg-clip-text text-base font-semibold text-transparent">Bell24h</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-neutral-200 md:flex" role="navigation" aria-label="Main navigation">
          <Link href="/suppliers" className="hover:text-white" aria-label="Browse verified suppliers">Suppliers</Link>
          <Link href="/rfq" className="hover:text-white" aria-label="Post RFQ request">RFQ</Link>
          <Link href="/services" className="hover:text-white" aria-label="Our services">Services</Link>
          <Link href="/about" className="hover:text-white" aria-label="About Bell24h">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <AudioToggle/>
          {featureFlags.enableThreeBell ? <ThreeBell/> : null}
          <Link href="/login" className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-neutral-100 hover:bg-white/5" aria-label="Login to your account">Login</Link>
          <Link href="/register" className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500" aria-label="Register for free account">Register Free</Link>
        </div>
      </div>
    </header>
  );
}
