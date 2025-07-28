'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Mic, 
  Brain, 
  Shield, 
  TrendingUp, 
  Building2, 
  CreditCard, 
  Wallet, 
  BarChart3, 
  Video, 
  LogIn,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const pathname = usePathname();

  const mainNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'AI Features', href: '/dashboard/ai-features', icon: Brain },
    { name: 'Voice RFQ', href: '/dashboard/voice-rfq', icon: Mic },
    { name: 'Supplier Showcase', href: '/supplier/SUP001', icon: Building2 },
    { name: 'Fintech Services', href: '/fintech', icon: CreditCard },
    { name: 'Wallet & Escrow', href: '/wallet', icon: Wallet },
  ];

  const aiFeatures = [
    { name: 'AI Features Dashboard', href: '/dashboard/ai-features', icon: Brain },
    { name: 'Voice RFQ', href: '/dashboard/voice-rfq', icon: Mic },
    { name: 'AI Explainability', href: '/dashboard/ai-features?tab=explain', icon: Brain },
    { name: 'Risk Scoring', href: '/dashboard/ai-features?tab=risk', icon: Shield },
    { name: 'Market Data', href: '/dashboard/ai-features?tab=market', icon: TrendingUp },
    { name: 'Video RFQ', href: '/dashboard/video-rfq', icon: Video },
  ];

  const enterpriseFeatures = [
    { name: 'Supplier Showcase', href: '/supplier/SUP001', icon: Building2 },
    { name: 'Fintech Services', href: '/fintech', icon: CreditCard },
    { name: 'Wallet & Escrow', href: '/wallet', icon: Wallet },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Bell24h</span>
                <div className="text-xs text-gray-500 -mt-1">Enterprise B2B</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Main Navigation */}
            {mainNavigation.slice(0, 2).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* AI Features Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFeaturesDropdownOpen(!isFeaturesDropdownOpen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  pathname.includes('/dashboard/ai-features') || pathname.includes('/dashboard/voice-rfq')
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>AI Features</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFeaturesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFeaturesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  {aiFeatures.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsFeaturesDropdownOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Enterprise Features */}
            {mainNavigation.slice(3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Login Button */}
            <Link
              href="/auth/login"
              className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {/* Main Navigation */}
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-all flex items-center space-x-3 ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* AI Features Section */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  AI Features
                </div>
                {aiFeatures.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-3 ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Login Button */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Link
                  href="/auth/login"
                  className="block px-3 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isFeaturesDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsFeaturesDropdownOpen(false)}
        />
      )}
    </nav>
  );
} 