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
          font-family: 'Inter', sans-serif;
          background-color: #ffffff;
          color: #212121;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Hero Section - Exact Match to Reference */
        .hero {
          background-color: #ffffff;
          padding: 80px 0;
          text-align: center;
        }
        
        .hero h1 {
          font-size: 56px;
          color: #212121;
          line-height: 1.2;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .hero h1 .highlight {
          color: #1a237e;
          font-weight: 700;
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
          font-weight: 700;
          background-color: rgba(26, 35, 126, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Trust Badges - Exact Match */
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
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          max-width: 800px;
          margin: 0 auto 40px;
        }

        .search-bar {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .category-select {
          padding: 12px 15px;
          border: none;
          background-color: #f5f5f5;
          font-size: 16px;
          outline: none;
          cursor: pointer;
          border-right: 1px solid #e0e0e0;
        }

        .search-input {
          flex-grow: 1;
          padding: 12px 15px;
          border: none;
          font-size: 16px;
          outline: none;
        }

        .search-button {
          background-color: #ff6f00;
          color: white;
          border: none;
          padding: 12px 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(255, 111, 0, 0.3);
        }

        .search-button:hover {
          background-color: #e65100;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(255, 111, 0, 0.4);
        }

        .search-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(255, 111, 0, 0.3);
        }

        .popular-searches {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .popular-search {
          background-color: #f0f4ff;
          color: #1a237e;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(26, 35, 126, 0.2);
        }

        .popular-search:hover {
          background-color: #1a237e;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(26, 35, 126, 0.3);
        }

        /* Live RFQ Ticker */
        .rfq-ticker {
          background-color: #1a237e;
          color: white;
          padding: 15px 0;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
        }

        .rfq-ticker-content {
          display: inline-block;
          padding-left: 100%;
          animation: marquee 30s linear infinite;
        }

        .rfq-ticker-item {
          display: inline-block;
          margin-right: 50px;
          font-size: 16px;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        /* Stats Section */
        .stats-section {
          background-color: #f5f5f5;
          padding: 60px 0;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
        }

        .stat-item h3 {
          font-size: 42px;
          color: #1a237e;
          margin-bottom: 5px;
        }

        .stat-item p {
          font-size: 16px;
          color: #757575;
        }

        /* Categories Section */
        .categories-section {
          background-color: #ffffff;
          padding: 80px 0;
          text-align: center;
        }

        .categories-section h2 {
          font-size: 36px;
          color: #212121;
          margin-bottom: 50px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 25px;
        }

        .category-card {
          background-color: #f5f5f5;
          padding: 30px 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        .category-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .category-card h3 {
          font-size: 18px;
          color: #212121;
          margin-bottom: 5px;
        }

        .category-card p {
          font-size: 13px;
          color: #757575;
        }

        /* How It Works Section */
        .how-it-works-section {
          background-color: #ffffff;
          padding: 80px 0;
          text-align: center;
        }

        .how-it-works-section h2 {
          font-size: 36px;
          color: #212121;
          margin-bottom: 60px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }

        .step-item .icon {
          font-size: 60px;
          margin-bottom: 20px;
          color: #ff6f00;
        }

        .step-item h3 {
          font-size: 24px;
          color: #212121;
          margin-bottom: 10px;
        }

        .step-item p {
          font-size: 16px;
          color: #757575;
        }

        /* Testimonials Section */
        .testimonials-section {
          background-color: #f5f5f5;
          padding: 80px 0;
          text-align: center;
        }

        .testimonials-section h2 {
          font-size: 36px;
          color: #212121;
          margin-bottom: 50px;
        }

        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .testimonial-card {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          text-align: left;
        }

        .testimonial-card p {
          font-size: 16px;
          color: #212121;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .testimonial-author img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .author-info h4 {
          font-size: 18px;
          color: #1a237e;
          margin: 0;
        }

        .author-info p {
          font-size: 14px;
          color: #757575;
          margin: 0;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .hero h1 {
            font-size: 48px;
          }
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 36px;
          }
          .search-section {
            flex-direction: column;
            padding: 15px;
          }
          .search-bar {
            flex-direction: column;
            border: none;
          }
          .category-select,
          .search-input,
          .search-button {
            width: 100%;
            margin-right: 0;
            margin-bottom: 10px;
            border-radius: 8px;
          }
          .category-select {
            margin-bottom: 15px;
          }
          .stats-grid, .category-grid, .steps-grid, .testimonial-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .hero h1 {
            font-size: 28px;
          }
          .trust-badges {
            flex-direction: column;
          }
          .stats-grid, .category-grid, .steps-grid, .testimonial-grid {
            grid-template-columns: 1fr;
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
                value={selectedCategory || 'all'}
                onChange={(e) => setSelectedCategory(e.target.value || 'all')}
              >
                <option value="all">All Categories</option>
                <option value="steel">Steel & Metals</option>
                <option value="textiles">Textiles & Fabrics</option>
                <option value="electronics">Electronics & IT</option>
                <option value="chemicals">Chemicals</option>
                <option value="machinery">Machinery</option>
                <option value="packaging">Packaging</option>
                <option value="agriculture">Agriculture</option>
                <option value="construction">Construction</option>
                <option value="auto">Auto Parts</option>
                <option value="pharmaceuticals">Pharmaceuticals</option>
                <option value="food">Food & Beverages</option>
                <option value="services">Business Services</option>
              </select>
              <input
                type="text"
                className="search-input"
                placeholder="What are you looking for today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="search-button"
                onClick={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push(`/rfq/create?query=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
                  } else {
                    router.push('/rfq/create');
                  }
                }}
                type="button"
              >
                Post Your RFQ
              </button>
            </div>

            <div className="popular-searches">
              <span 
                className="popular-search"
                onClick={() => {
                  setSearchQuery('Steel Pipes');
                  setSelectedCategory('steel');
                }}
              >Steel Pipes</span>
              <span 
                className="popular-search"
                onClick={() => {
                  setSearchQuery('Cotton Fabric');
                  setSelectedCategory('textiles');
                }}
              >Cotton Fabric</span>
              <span 
                className="popular-search"
                onClick={() => {
                  setSearchQuery('Electronics Components');
                  setSelectedCategory('electronics');
                }}
              >Electronics Components</span>
              <span 
                className="popular-search"
                onClick={() => {
                  setSearchQuery('Chemical Raw Materials');
                  setSelectedCategory('chemicals');
                }}
              >Chemical Raw Materials</span>
              <span 
                className="popular-search"
                onClick={() => {
                  setSearchQuery('Packaging Materials');
                  setSelectedCategory('packaging');
                }}
              >Packaging Materials</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live RFQ Ticker */}
      <section className="rfq-ticker">
        <div className="rfq-ticker-content">
          {liveRFQs.map((rfq, index) => (
            <span key={index} className="rfq-ticker-item">
              {rfq}
            </span>
          ))}
          {liveRFQs.map((rfq, index) => (
            <span key={`dup-${index}`} className="rfq-ticker-item">
              {rfq}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-item">
            <h3>45,000+</h3>
            <p>Verified Suppliers</p>
          </div>
          <div className="stat-item">
            <h3>2.5 Million+</h3>
            <p>Products Listed</p>
          </div>
          <div className="stat-item">
            <h3>10,000+</h3>
            <p>RFQs Daily</p>
          </div>
          <div className="stat-item">
            <h3>24 Hours</h3>
            <p>Avg. Response Time</p>
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
                <p>{category.count} Products</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2>How Bell24h Works</h2>
          <div className="steps-grid">
            <div className="step-item">
              <div className="icon">1️⃣</div>
              <h3>Post Your Requirement</h3>
              <p>Submit your RFQ via text, voice, or video. Our AI analyzes and matches you with relevant suppliers.</p>
            </div>
            <div className="step-item">
              <div className="icon">2️⃣</div>
              <h3>Get Verified Quotes</h3>
              <p>Receive competitive quotes from GST-verified suppliers within 24 hours. Compare and choose the best.</p>
            </div>
            <div className="step-item">
              <div className="icon">3️⃣</div>
              <h3>Secure Payments</h3>
              <p>Transact securely with escrow protection. Funds are released only after you confirm satisfactory delivery.</p>
            </div>
            <div className="step-item">
              <div className="icon">4️⃣</div>
              <h3>Track & Manage</h3>
              <p>Monitor your orders, communicate with suppliers, and manage all your B2B activities from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2>What Our Customers Say</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>"Bell24h transformed our sourcing process. We found reliable suppliers faster and secured better deals. The escrow service is a game-changer!"</p>
              <div className="testimonial-author">
                <img src="/avatar1.svg" alt="Client 1" />
                <div className="author-info">
                  <h4>Rajesh Kumar</h4>
                  <p>Procurement Head, SteelCo India</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"As an MSME, finding verified buyers was tough. Bell24h connected us with serious buyers and streamlined our sales. Highly recommended!"</p>
              <div className="testimonial-author">
                <img src="/avatar2.svg" alt="Client 2" />
                <div className="author-info">
                  <h4>Priya Sharma</h4>
                  <p>CEO, Textile Innovations</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"The AI matching is incredibly accurate. We save hours every week and have significantly improved our supply chain efficiency. Fantastic platform!"</p>
              <div className="testimonial-author">
                <img src="/avatar3.svg" alt="Client 3" />
                <div className="author-info">
                  <h4>Amit Patel</h4>
                  <p>Operations Manager, ElectroTech Solutions</p>
                </div>
              </div>
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