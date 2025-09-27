'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);

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
          background: #1a237e;
          color: white;
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
          color: white;
        }
        
        .logo img {
          height: 45px;
          margin-right: 10px;
        }
        
        .logo h1 {
          font-size: 24px;
          margin: 0;
          font-weight: bold;
        }
        
        .logo p {
          font-size: 10px;
          margin: 0;
          opacity: 0.9;
        }
        
        .main-nav ul {
          display: flex;
          gap: 30px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .main-nav a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .main-nav a:hover {
          color: #ff6f00;
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
          color: #1a237e;
        }
        
        .header-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        .messages-link {
          position: relative;
          color: white;
          text-decoration: none;
          font-weight: 500;
        }
        
        .messages-link:hover {
          color: #ff6f00;
        }
        
        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff6f00;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .login-btn {
          background: #ff6f00;
          color: white;
          padding: 10px 25px;
          border-radius: 5px;
          border: none;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
          text-decoration: none;
          display: inline-block;
        }
        
        .login-btn:hover {
          background: #e65100;
        }
        
        @media (max-width: 768px) {
          .top-bar .right {
            display: none;
          }
          
          .main-nav {
            display: none;
          }
          
          .header-actions .messages-link {
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
            <div style={{
              width: '45px',
              height: '45px',
              background: '#ff6f00',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              marginRight: '10px'
            }}>
              B
            </div>
            <div>
              <h1>Bell24h</h1>
              <p>B2B Marketplace</p>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="main-nav">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li className="dropdown">
                <a>Find Suppliers ▼</a>
                <div className="dropdown-menu">
                  <Link href="/suppliers/verified">Verified Suppliers</Link>
                  <Link href="/suppliers/manufacturers">Manufacturers</Link>
                  <Link href="/suppliers/exporters">Exporters</Link>
                  <Link href="/suppliers/wholesalers">Wholesalers</Link>
                </div>
              </li>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/rfq/post">Post Buy Requirement</Link></li>
              <li className="dropdown">
                <a>Services ▼</a>
                <div className="dropdown-menu">
                  <Link href="/services/logistics">Logistics</Link>
                  <Link href="/services/inspection">Inspection</Link>
                  <Link href="/services/finance">Trade Finance</Link>
                </div>
              </li>
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="header-actions">
            <Link href="/messages" className="messages-link">
              💬 Messages
              <span className="badge">5</span>
            </Link>
            
            <button 
              onClick={() => setShowAuthModal(true)}
              className="login-btn"
            >
              Login / Join Free
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