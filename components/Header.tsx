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
      <style jsx>{`
        .top-bar {
          background: #0d47a1;
          color: white;
          padding: 6px 0;
          font-size: 12px;
        }
        
        .top-bar .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .top-bar .left span {
          margin-right: 20px;
        }
        
        .top-bar .right a {
          color: white;
          text-decoration: none;
          margin-left: 10px;
        }
        
        .top-bar .right a:hover {
          text-decoration: underline;
        }
        
        .main-header {
          background: white;
          color: #333;
          padding: 10px 0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .main-header .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #333;
        }
        
        .logo .logo-icon {
          width: 40px;
          height: 40px;
          background: #2563eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          font-weight: bold;
          margin-right: 10px;
        }
        
        .logo h1 {
          font-size: 24px;
          margin: 0;
          font-weight: bold;
          color: #1f2937;
        }
        
        .logo p {
          font-size: 10px;
          margin: 0;
          color: #6b7280;
        }
        
        .main-nav ul {
          display: flex;
          gap: 30px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .main-nav a {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .main-nav a:hover {
          color: #2563eb;
        }
        
        .dropdown {
          position: relative;
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          min-width: 200px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-radius: 8px;
          padding: 10px 0;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s;
          z-index: 1001;
        }
        
        .dropdown:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .dropdown-menu a {
          color: #333;
          padding: 10px 20px;
          display: block;
          font-size: 14px;
        }
        
        .dropdown-menu a:hover {
          background: #f5f5f5;
          color: #2563eb;
        }
        
        .header-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        .login-btn {
          background: #2563eb;
          color: white;
          padding: 10px 25px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        
        .login-btn:hover {
          background: #1d4ed8;
        }
        
        @media (max-width: 768px) {
          .top-bar .right {
            display: none;
          }
          
          .main-nav {
            display: none;
          }
        }
      `}</style>

      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="left">
            <span>📧 support@bell24h.com</span>
            <span>📞 +91-9876543210</span>
          </div>
          <div className="right">
            <Link href="/supplier">Supplier Zone</Link>
            <span>|</span>
            <Link href="/help">Help</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="container">
          {/* Logo */}
          <Link href="/" className="logo">
            <div className="logo-icon">B</div>
            <div>
              <h1>Bell24h</h1>
              <p>Enterprise B2B</p>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="main-nav">
            <ul>
              <li><Link href="/">🏠 Home</Link></li>
              <li><Link href="/suppliers">🏢 Supplier Showcase</Link></li>
              <li><Link href="/services/finance">📋 Fintech Services</Link></li>
              <li><Link href="/services/escrow">💳 Wallet & Escrow</Link></li>
              <li className="dropdown">
                <a>🤖 AI Features ▼</a>
                <div className="dropdown-menu">
                  <Link href="/dashboard/ai-features">🧠 AI Features Dashboard</Link>
                  <Link href="/voice-rfq">🎤 Voice RFQ</Link>
                  <Link href="/dashboard/ai-features">🔍 AI Explainability</Link>
                  <Link href="/dashboard/ai-features">⚠️ Risk Scoring</Link>
                  <Link href="/dashboard/ai-features">📈 Market Data</Link>
                  <Link href="/dashboard/ai-features">🎯 Smart Matching</Link>
                </div>
              </li>
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="header-actions">
            <button
              onClick={handleLoginClick}
              className="login-btn"
            >
              Login <span>→</span>
            </button>
          </div>
        </div>
      </header>

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