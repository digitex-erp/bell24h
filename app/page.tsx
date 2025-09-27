'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  
  const [liveRFQs, setLiveRFQs] = useState([
    'Buyer from Mumbai looking for Steel Pipes - 2 mins ago',
    'Buyer from Delhi looking for Cotton Fabric - 5 mins ago',
    'Buyer from Bangalore looking for Electronics Components - 8 mins ago',
    'Buyer from Chennai looking for Chemical Raw Materials - 12 mins ago',
    'Buyer from Pune looking for Packaging Materials - 15 mins ago',
    'Buyer from Hyderabad looking for Machinery Parts - 18 mins ago'
  ]);
  const [currentRFQIndex, setCurrentRFQIndex] = useState(0);

  const handleAuthSuccess = (user: any) => {
    setShowAuthModal(false);
    router.push('/dashboard');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRFQIndex((prev) => (prev + 1) % liveRFQs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveRFQs.length]);

  const categories = [
    { name: 'Steel & Metals', icon: '🏗️', count: '2,340' },
    { name: 'Textiles & Fabrics', icon: '🧵', count: '1,890' },
    { name: 'Electronics', icon: '📱', count: '3,210' },
    { name: 'Chemicals', icon: '🧪', count: '1,567' },
    { name: 'Machinery', icon: '🏭', count: '2,890' },
    { name: 'Packaging', icon: '📦', count: '1,234' },
    { name: 'Automotive', icon: '🚗', count: '1,876' },
    { name: 'Pharmaceuticals', icon: '💊', count: '987' },
    { name: 'Food & Beverage', icon: '🍽️', count: '1,543' },
    { name: 'Construction', icon: '🏢', count: '2,156' },
    { name: 'Agriculture', icon: '🌾', count: '1,432' },
    { name: 'Energy', icon: '⚡', count: '756' }
  ];

  return (
    <>
      <Head>
        <title>Bell24h - India's Fastest B2B Match-Making Engine | Post RFQ Get 3 Verified Quotes in 24 Hours</title>
        <meta name="description" content="India's fastest B2B marketplace. Post RFQ and get 3 verified quotes in 24 hours. 45,000+ verified suppliers, 2.5M+ products. AI-powered matching with 200+ data signals. Escrow-secured payments." />
        <meta name="keywords" content="B2B marketplace India, RFQ platform, verified suppliers, B2B procurement, Indian manufacturers, wholesale suppliers, business to business, procurement platform, supplier verification, B2B trading" />
        <meta property="og:title" content="Bell24h - India's Fastest B2B Match-Making Engine" />
        <meta property="og:description" content="Post RFQ. Get 3 Verified Quotes in 24 Hours. 45,000+ verified suppliers, 2.5M+ products. AI-powered matching with escrow-secured payments." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://bell24h.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bell24h - India's Fastest B2B Match-Making Engine" />
        <meta name="twitter:description" content="Post RFQ. Get 3 Verified Quotes in 24 Hours. AI-powered B2B marketplace with verified suppliers." />
        
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Bell24h",
            "description": "India's fastest B2B match-making engine for MSMEs",
            "url": "https://bell24h.com",
            "logo": "https://bell24h.com/logo.png",
            "sameAs": [
              "https://www.linkedin.com/company/bell24h",
              "https://twitter.com/bell24h"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9876543210",
              "contactType": "customer service",
              "email": "support@bell24h.com"
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Mumbai",
              "addressRegion": "Maharashtra",
              "addressCountry": "IN"
            }
          })}
        </script>
      </Head>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #212121;
          background: #ffffff;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .hero {
          background: #f5f5f5;
          padding: 60px 0;
          text-align: center;
        }
        
        .hero h1 {
          font-size: 42px;
          margin-bottom: 20px;
          color: #212121;
          line-height: 1.2;
          font-weight: bold;
        }
        
        .hero h1 .highlight {
          color: #1a237e;
        }
        
        .hero-subtitle {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .hero-subtitle .highlight-text {
          color: #1a237e;
          font-weight: 600;
        }

        /* Trust Badges */
        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .trust-badge {
          background-color: #f5f5f5;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 15px;
          font-weight: 600;
          color: #212121;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .search-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          max-width: 800px;
          margin: 0 auto 30px;
        }
        
        .search-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .category-select {
          padding: 15px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          font-size: 16px;
          min-width: 200px;
          cursor: pointer;
        }
        
        .search-input {
          flex: 1;
          padding: 15px 20px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
        }
        
        .search-input:focus {
          border-color: #1a237e;
        }
        
        .search-button {
          background: #ff6f00;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.3s;
        }
        
        .search-button:hover {
          background: #e65100;
        }
        
        .popular-searches {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        
        .popular-search {
          background: #f5f5f5;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          color: #666;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .popular-search:hover {
          background: #e1e5e9;
        }
        
        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 30px 0;
          flex-wrap: wrap;
        }
        
        .badge {
          background: white;
          padding: 15px 25px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e1e5e9;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .badge.green {
          background: #e8f5e8;
          color: #2e7d32;
          border-color: #c8e6c9;
        }
        
        .badge.blue {
          background: #e3f2fd;
          color: #1565c0;
          border-color: #bbdefb;
        }
        
        .badge.orange {
          background: #fff3e0;
          color: #ef6c00;
          border-color: #ffcc02;
        }
        
        .live-rfq-ticker {
          background: #1a237e;
          color: white;
          padding: 15px 0;
          overflow: hidden;
          position: relative;
        }
        
        .live-rfq-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
        }
        
        .live-dot {
          width: 8px;
          height: 8px;
          background: #ff6f00;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .rfq-text {
          font-size: 16px;
          animation: slideIn 3s infinite;
        }
        
        @keyframes slideIn {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .stats-section {
          padding: 60px 0;
          background: white;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          text-align: center;
        }
        
        .stat-item {
          padding: 30px;
          background: #f5f5f5;
          border-radius: 12px;
          transition: transform 0.3s;
        }
        
        .stat-item:hover {
          transform: translateY(-5px);
        }
        
        .stat-number {
          font-size: 48px;
          font-weight: bold;
          color: #1a237e;
          margin-bottom: 10px;
        }
        
        .stat-label {
          font-size: 18px;
          color: #666;
          font-weight: 500;
        }
        
        .categories-section {
          padding: 80px 0;
          background: #f5f5f5;
        }
        
        .categories-section h2 {
          text-align: center;
          font-size: 42px;
          margin-bottom: 50px;
          color: #212121;
          font-weight: bold;
        }
        
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }
        
        .category-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          transition: all 0.3s;
          cursor: pointer;
          border: 2px solid transparent;
        }
        
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          border-color: #1a237e;
        }
        
        .category-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .category-card h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: #212121;
          font-weight: 600;
        }
        
        .category-card p {
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }
        
        .how-it-works {
          padding: 80px 0;
          background: white;
        }
        
        .how-it-works h2 {
          text-align: center;
          font-size: 42px;
          margin-bottom: 60px;
          color: #212121;
          font-weight: bold;
        }
        
        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 40px;
        }
        
        .step {
          text-align: center;
        }
        
        .step-number {
          width: 80px;
          height: 80px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          margin: 0 auto 25px;
        }
        
        .step h3 {
          font-size: 22px;
          margin-bottom: 15px;
          color: #212121;
          font-weight: 600;
        }
        
        .step p {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 32px;
          }
          
          .search-bar {
            flex-direction: column;
          }
          
          .category-select {
            min-width: auto;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .stat-number {
            font-size: 36px;
          }
        }
      `}</style>

      <Header onLoginClick={() => setShowAuthModal(true)} />

      {/* Hero Section - Exact Reference Match */}
      <section className="hero">
        <div className="container">
          <h1>
            Post RFQ. Get 3 Verified Quotes<br />
            <span className="highlight">in 24 Hours</span>
          </h1>
          
          <p className="hero-subtitle">
            200 live data signals—GST, credit, logistics, ESG—to match you with 3 pre-qualified suppliers. 
            <span className="highlight-text">Escrow-secured payments</span> until goods arrive.
          </p>

          {/* Trust Badges */}
          <div className="trust-badges">
            <span className="trust-badge">✅ Escrow-Secured</span>
            <span className="trust-badge">🛡️ GST Verified</span>
            <span className="trust-badge">⭐ AI Trust-Score</span>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <select 
                className="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="steel">Steel & Metals</option>
                <option value="textiles">Textiles & Fabrics</option>
                <option value="electronics">Electronics</option>
                <option value="chemicals">Chemicals</option>
                <option value="machinery">Machinery</option>
                <option value="packaging">Packaging</option>
              </select>
              <input
                type="text"
                className="search-input"
                placeholder="What are you looking for today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-button">
                Post Your RFQ
              </button>
            </div>

            <div className="popular-searches">
              <span className="popular-search">Steel Pipes</span>
              <span className="popular-search">Cotton Fabric</span>
              <span className="popular-search">Electronics Components</span>
              <span className="popular-search">Chemical Raw Materials</span>
              <span className="popular-search">Packaging Materials</span>
            </div>
            </div>

          <div className="trust-badges">
            <span className="badge green">
              ✅ Escrow-Secured (ICICI Bank Partner)
            </span>
            <span className="badge blue">
              ✅ GST & PAN Verified
            </span>
            <span className="badge orange">
              ✅ AI Trust-Score
            </span>
          </div>
        </div>
      </section>

      {/* Live RFQ Ticker */}
      <section className="live-rfq-ticker">
        <div className="container">
          <div className="live-rfq-content">
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>LIVE RFQs</span>
            </div>
            <div className="rfq-text">
              {liveRFQs[currentRFQIndex]}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">45,000+</div>
              <div className="stat-label">Verified Suppliers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2.5M</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">RFQs Daily</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24hr</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2>Popular Categories</h2>
          <div className="category-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.count} Suppliers</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How Bell24h Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Post Your RFQ</h3>
              <p>Submit your requirements by voice, video, or text. Our AI understands your needs and matches with verified suppliers.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get 3 Verified Quotes</h3>
              <p>Receive AI-scored, GST-verified supplier quotes within 24 hours. 200+ data points analyzed for quality matches.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Secure Escrow Payment</h3>
              <p>Payment held in ICICI escrow until goods arrive. Full protection guaranteed with trade assurance.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Track & Manage</h3>
              <p>Monitor your orders, communicate with suppliers, and manage your business relationships all in one place.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}