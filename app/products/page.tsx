'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProductsPage() {
  const categories = [
    { name: 'Steel & Metals', icon: '🏗️', count: '2,340 products' },
    { name: 'Textiles & Fabrics', icon: '🧵', count: '1,890 products' },
    { name: 'Electronics', icon: '📱', count: '3,210 products' },
    { name: 'Chemicals', icon: '🧪', count: '1,567 products' },
    { name: 'Machinery', icon: '🏭', count: '2,890 products' },
    { name: 'Packaging', icon: '📦', count: '1,234 products' },
    { name: 'Automotive', icon: '🚗', count: '1,876 products' },
    { name: 'Pharmaceuticals', icon: '💊', count: '987 products' },
    { name: 'Food & Beverage', icon: '🍽️', count: '1,543 products' },
    { name: 'Construction', icon: '🏢', count: '2,156 products' },
    { name: 'Agriculture', icon: '🌾', count: '1,432 products' },
    { name: 'Energy', icon: '⚡', count: '756 products' }
  ];

  return (
    <>
      <style jsx>{`
        .products-page {
          min-height: 100vh;
          background: #ffffff;
        }
        
        .hero-section {
          background: #1a237e;
          color: white;
          padding: 60px 0;
          text-align: center;
        }
        
        .hero-section h1 {
          font-size: 48px;
          margin-bottom: 20px;
          font-weight: bold;
        }
        
        .hero-section p {
          font-size: 20px;
          opacity: 0.9;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .products-grid {
          padding: 80px 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .products-grid h2 {
          text-align: center;
          font-size: 42px;
          margin-bottom: 50px;
          color: #1a237e;
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
          border: 2px solid #f3f4f6;
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
          color: #1a237e;
          font-weight: 600;
        }
        
        .category-card p {
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }
        
        .stats-section {
          background: #f5f5f5;
          padding: 60px 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        
        .stat-item {
          padding: 30px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
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
      `}</style>

      <Header />

      <div className="products-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1>Products</h1>
            <p>Discover millions of verified products from trusted suppliers across India</p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="products-grid">
          <div className="container">
            <h2>Browse by Category</h2>
            <div className="category-grid">
              {categories.map((category, index) => (
                <div key={index} className="category-card">
                  <div className="category-icon">{category.icon}</div>
                  <h3>{category.name}</h3>
                  <p>{category.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">2.5M+</div>
                <div className="stat-label">Products Available</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">45,000+</div>
                <div className="stat-label">Verified Suppliers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Product Categories</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24hr</div>
                <div className="stat-label">Response Time</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
