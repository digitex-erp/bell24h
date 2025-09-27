'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f8fafc;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .nav {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .logo-subtitle {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .hero {
          background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #ecfdf5 100%);
          padding: 80px 0;
          text-align: center;
        }
        
        .hero h1 {
          font-size: 64px;
          margin-bottom: 20px;
          color: #1f2937;
          font-weight: 700;
          line-height: 1.1;
        }
        
        .hero-subtitle {
          font-size: 24px;
          color: #374151;
          margin-bottom: 40px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          font-weight: 500;
        }
        
        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        
        .trust-badge {
          background: white;
          padding: 12px 24px;
          border-radius: 50px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          font-weight: 600;
          font-size: 16px;
        }
        
        .badge-green { color: #059669; background: #d1fae5; }
        .badge-blue { color: #2563eb; background: #dbeafe; }
        .badge-purple { color: #7c3aed; background: #e9d5ff; }
        
        .search-bar {
          background: white;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          display: flex;
          max-width: 600px;
          margin: 40px auto;
        }
        
        .search-input {
          flex: 1;
          padding: 16px 20px;
          border: none;
          font-size: 16px;
          outline: none;
          border-radius: 8px;
        }
        
        .search-button {
          background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
          transition: transform 0.2s;
        }
        
        .search-button:hover {
          transform: translateY(-2px);
        }
        
        .metrics {
          background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
          color: white;
          padding: 60px 0;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          text-align: center;
        }
        
        .metric-number {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .metric-label {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .how-it-works {
          padding: 80px 0;
          background: white;
        }
        
        .section-title {
          font-size: 48px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 60px;
          color: #1f2937;
        }
        
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          text-align: center;
        }
        
        .step {
          padding: 40px 20px;
        }
        
        .step-number {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          font-size: 32px;
          font-weight: 700;
        }
        
        .step-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1f2937;
        }
        
        .step-description {
          font-size: 16px;
          color: #6b7280;
          line-height: 1.6;
        }
        
        .cta-section {
          background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
          color: white;
          padding: 80px 0;
          text-align: center;
        }
        
        .cta-title {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        
        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 40px;
          flex-wrap: wrap;
        }
        
        .btn-primary {
          background: white;
          color: #2563eb;
          padding: 16px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 18px;
          transition: transform 0.2s;
        }
        
        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 14px 30px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 18px;
          transition: all 0.2s;
        }
        
        .btn-primary:hover, .btn-secondary:hover {
          transform: translateY(-2px);
        }
        
        .footer {
          background: #1f2937;
          color: white;
          padding: 60px 0 40px;
        }
        
        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .footer-description {
          color: #d1d5db;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .footer-section h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        
        .footer-links {
          list-style: none;
        }
        
        .footer-links li {
          margin-bottom: 12px;
        }
        
        .footer-links a {
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .footer-links a:hover {
          color: white;
        }
        
        .footer-bottom {
          border-top: 1px solid #374151;
          padding-top: 20px;
          text-align: center;
          color: #9ca3af;
        }
        
        @media (max-width: 768px) {
          .hero h1 { font-size: 40px; }
          .hero-subtitle { font-size: 18px; }
          .metrics-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .steps-grid { grid-template-columns: 1fr; }
          .footer-content { grid-template-columns: 1fr; }
          .cta-buttons { flex-direction: column; align-items: center; }
        }
      `}</style>

      <div>
        <nav className="nav">
          <div className="container nav-content">
            <div className="logo">
              <div className="logo-icon">B</div>
              <div>
                <div className="logo-text">Bell24h</div>
                <div className="logo-subtitle">Verified B2B Platform</div>
              </div>
            </div>
            <Link href="/auth/login" style={{
              background: '#2563eb',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>Login</Link>
          </div>
        </nav>

        <section className="hero">
          <div className="container">
            <h1>Post RFQ. Get 3 Verified Quotes in 24 Hours</h1>
            <p className="hero-subtitle">
              200 live data signals—GST, credit, logistics, ESG—to match you with 3 pre-qualified suppliers. 
              <strong> Escrow-secured payments</strong> until goods arrive.
            </p>
            
            <div className="trust-badges">
              <span className="trust-badge badge-green">✅ Escrow-Secured (ICICI Bank Partner)</span>
              <span className="trust-badge badge-blue">✅ GST & PAN Verified</span>
              <span className="trust-badge badge-purple">✅ AI Trust-Score</span>
            </div>

            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="What are you looking for? (e.g., Steel Pipes, Cotton Fabric, Electronics)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-button">🚀 Start My RFQ Now</button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button className="btn-secondary" style={{ 
                background: 'white', 
                color: '#2563eb', 
                border: '2px solid #2563eb',
                padding: '14px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '18px'
              }}>
                ▶️ Watch 2-Min Demo
              </button>
            </div>
          </div>
        </section>

        <section className="metrics">
          <div className="container">
            <div className="metrics-grid">
              <div>
                <div className="metric-number">4,321</div>
                <div className="metric-label">RFQs processed yesterday</div>
              </div>
              <div>
                <div className="metric-number">98%</div>
                <div className="metric-label">Escrow success rate</div>
              </div>
              <div>
                <div className="metric-number">12,400</div>
                <div className="metric-label">Verified suppliers</div>
              </div>
              <div>
                <div className="metric-number">50+</div>
                <div className="metric-label">Product categories</div>
              </div>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <div className="container">
            <h2 className="section-title">How Bell24h Works</h2>
            <div className="steps-grid">
              <div className="step">
                <div className="step-number">1</div>
                <h3 className="step-title">Post Your RFQ</h3>
                <p className="step-description">
                  Submit by voice, video, or text. Our AI understands your requirements and matches with verified suppliers.
                </p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3 className="step-title">Get 3 Verified Quotes</h3>
                <p className="step-description">
                  Receive AI-scored, GST-verified supplier quotes within 24 hours. 200+ data points analyzed.
                </p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3 className="step-title">Secure Escrow Payment</h3>
                <p className="step-description">
                  Payment held in ICICI escrow until goods arrive. Full protection guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <h2 className="cta-title">Ready to Transform Your B2B Sourcing?</h2>
            <p style={{ fontSize: '20px', marginBottom: '40px', opacity: '0.9' }}>
              Join thousands of businesses already using Bell24h
            </p>
            <div className="cta-buttons">
              <Link href="/auth/register" className="btn-primary">Start Free Trial</Link>
              <Link href="/contact" className="btn-secondary">Contact Sales</Link>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div>
                <div className="footer-logo">
                  <div className="logo-icon">B</div>
                  <div>
                    <div className="logo-text">Bell24h</div>
                    <div style={{ color: '#9ca3af', fontSize: '14px' }}>India's Fastest B2B Match-Making Engine for MSMEs</div>
                  </div>
                </div>
                <p className="footer-description">
                  Trusted by 12,400+ verified suppliers across India. Escrow-secured transactions worth ₹100+ crores processed.
                </p>
                <div style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '600' }}>
                  🇮🇳 Made in India
                </div>
              </div>
              
              <div>
                <h3>Quick Links</h3>
                <ul className="footer-links">
                  <li><Link href="/suppliers">Find Suppliers</Link></li>
                  <li><Link href="/rfq/create">Post RFQ</Link></li>
                  <li><Link href="/wallet">Wallet</Link></li>
                  <li><Link href="/escrow">Escrow</Link></li>
                </ul>
              </div>
              
              <div>
                <h3>Support</h3>
                <ul className="footer-links">
                  <li><Link href="/help">Help Center</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><Link href="/terms">Terms</Link></li>
                  <li><Link href="/privacy">Privacy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>© 2024 Bell24h.com. All rights reserved. | Escrow Partner: ICICI Bank | GST: 123456789</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}