import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Clock, CheckCircle } from 'lucide-react';

const MarketplaceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    activeRfqs: 0,
    verifiedSuppliers: 0,
    successfulDeals: 0,
    responseTime: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate metrics when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    const element = document.querySelector('.metrics-section');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);
  
  // Animate counting up when visible
  useEffect(() => {
    if (!isVisible) return;
    
    const finalMetrics = {
      activeRfqs: 10000,
      verifiedSuppliers: 500,
      successfulDeals: 2500,
      responseTime: 24
    };
    
    const duration = 2000; // 2 seconds
    const frameRate = 60;
    const totalFrames = duration / (1000 / frameRate);
    let frame = 0;
    
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      if (frame <= totalFrames) {
        setMetrics({
          activeRfqs: Math.floor(finalMetrics.activeRfqs * progress),
          verifiedSuppliers: Math.floor(finalMetrics.verifiedSuppliers * progress),
          successfulDeals: Math.floor(finalMetrics.successfulDeals * progress),
          responseTime: Math.floor(finalMetrics.responseTime * progress)
        });
      } else {
        clearInterval(timer);
        setMetrics(finalMetrics);
      }
    }, 1000 / frameRate);
    
    return () => clearInterval(timer);
  }, [isVisible]);
  
  return (
    <section className="metrics-section">
      <div className="container">
        <h2 className="section-title">Marketplace Metrics</h2>
        <p className="section-subtitle">Join thousands of businesses already using BELL24H</p>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <BarChart2 size={32} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.activeRfqs.toLocaleString()}+</h3>
              <p className="metric-label">Active RFQs</p>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <Users size={32} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.verifiedSuppliers.toLocaleString()}+</h3>
              <p className="metric-label">Verified Suppliers</p>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <CheckCircle size={32} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.successfulDeals.toLocaleString()}+</h3>
              <p className="metric-label">Successful Deals</p>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <Clock size={32} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.responseTime}/7</h3>
              <p className="metric-label">Support Available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceMetrics;
