'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthModal from './AuthModal';

interface HeaderProps {
  onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAIDropdown, setShowAIDropdown] = useState(false);

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary-900 text-white py-2">
        <div className="container-custom">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center gap-2">
                <span>📧</span>
                <span>support@bell24h.com</span>
              </span>
              <span className="flex items-center gap-2">
                <span>📞</span>
                <span>+91-9876543210</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/supplier" className="hover:text-primary-200 transition-colors">
                Supplier Zone
              </Link>
              <span>|</span>
              <Link href="/help" className="hover:text-primary-200 transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform duration-200">
                B
              </div>
              <div>
                <div className="font-bold text-xl text-neutral-900">Bell24h</div>
                <div className="text-xs text-neutral-600">Enterprise B2B</div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="nav-link nav-link-active flex items-center gap-2">
                <span>🏠</span>
                <span>Home</span>
              </Link>
              <Link href="/suppliers" className="nav-link flex items-center gap-2">
                <span>🏢</span>
                <span>Supplier Showcase</span>
              </Link>
              <Link href="/services/finance" className="nav-link flex items-center gap-2">
                <span>📋</span>
                <span>Fintech Services</span>
              </Link>
              <Link href="/services/escrow" className="nav-link flex items-center gap-2">
                <span>💳</span>
                <span>Wallet & Escrow</span>
              </Link>

              {/* AI Features Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAIDropdown(!showAIDropdown)}
                  className="nav-link flex items-center gap-2 border border-neutral-300 px-4 py-2 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                >
                  <span>🤖</span>
                  <span>AI Features</span>
                  <span className={`text-xs transition-transform duration-200 ${showAIDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {showAIDropdown && (
                  <div className="absolute top-full mt-2 bg-white shadow-xl rounded-lg py-2 w-64 border border-neutral-200 animate-slide-down">
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>🧠</span>
                      <span>AI Features Dashboard</span>
                    </Link>
                    <Link href="/voice-rfq" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>🎤</span>
                      <span>Voice RFQ</span>
                    </Link>
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>🔍</span>
                      <span>AI Explainability</span>
                    </Link>
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>⚠️</span>
                      <span>Risk Scoring</span>
                    </Link>
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>📈</span>
                      <span>Market Data</span>
                    </Link>
                    <Link href="/dashboard/ai-features" className="block px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-3">
                      <span>🎯</span>
                      <span>Smart Matching</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowAIDropdown(!showAIDropdown)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <span className="text-xl">☰</span>
              </button>
            </div>

            {/* Login Button */}
            <Link href="/demo-login" className="btn-primary flex items-center gap-2 hover-lift">
              <span>Login</span>
              <span className="text-sm">→</span>
            </Link>
          </div>

          {/* Mobile Menu */}
          {showAIDropdown && (
            <div className="lg:hidden border-t border-neutral-200 py-4">
              <div className="flex flex-col space-y-2">
                <Link href="/" className="nav-link flex items-center gap-2 px-4 py-2">
                  <span>🏠</span>
                  <span>Home</span>
                </Link>
                <Link href="/suppliers" className="nav-link flex items-center gap-2 px-4 py-2">
                  <span>🏢</span>
                  <span>Supplier Showcase</span>
                </Link>
                <Link href="/services/finance" className="nav-link flex items-center gap-2 px-4 py-2">
                  <span>📋</span>
                  <span>Fintech Services</span>
                </Link>
                <Link href="/services/escrow" className="nav-link flex items-center gap-2 px-4 py-2">
                  <span>💳</span>
                  <span>Wallet & Escrow</span>
                </Link>
                <div className="border-t border-neutral-200 pt-2 mt-2">
                  <div className="text-sm font-medium text-neutral-500 px-4 py-2">AI Features</div>
                  <Link href="/dashboard/ai-features" className="nav-link flex items-center gap-2 px-4 py-2">
                    <span>🧠</span>
                    <span>AI Features Dashboard</span>
                  </Link>
                  <Link href="/voice-rfq" className="nav-link flex items-center gap-2 px-4 py-2">
                    <span>🎤</span>
                    <span>Voice RFQ</span>
                  </Link>
                  <Link href="/dashboard/ai-features" className="nav-link flex items-center gap-2 px-4 py-2">
                    <span>🔍</span>
                    <span>AI Explainability</span>
                  </Link>
                  <Link href="/dashboard/ai-features" className="nav-link flex items-center gap-2 px-4 py-2">
                    <span>⚠️</span>
                    <span>Risk Scoring</span>
                  </Link>
                  <Link href="/dashboard/ai-features" className="nav-link flex items-center gap-2 px-4 py-2">
                    <span>📈</span>
                    <span>Market Data</span>
                  </Link>
                  <Link href="/dashboard/ai-features" className="nav-link flex items-center gap-2 px-4 py-2">
                    <span>🎯</span>
                    <span>Smart Matching</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            // Redirect to dashboard will be handled by AuthModal
          }}
        />
      )}
    </>
  );
}