import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, MessageSquare, BarChart2, Shield, Smartphone, Camera } from 'lucide-react';
import { translations } from '../components/LanguageSwitcher';
import Header from '../components/Header';
import VideoHero from '../components/VideoHero';
import MarketplaceMetrics from '../components/MarketplaceMetrics';
import ProductCategories from '../components/ProductCategories';
import MobileOptimizationBanner from '../components/MobileOptimizationBanner';

// Lazy load components that are lower in the page
const AIExplainabilitySection = lazy(() => import('../components/AIExplainabilitySection'));
const AuthForms = lazy(() => import('../components/AuthForms'));

// Import all CSS files
import '../styles/cover-page.css';
import '../styles/header.css';
import '../styles/auth-forms.css';
import '../styles/video-hero.css';
import '../styles/marketplace-components.css';
import '../styles/advertorial-section.css';
import '../styles/demo-video-player.css';

const CoverPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState('en');
  const [currentTranslations, setCurrentTranslations] = useState(translations.en);
  const [isMobile, setIsMobile] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const navigateTo = (path: string) => {
    setLocation(path);
  };
  
  const handleLanguageChange = (languageCode: string, newTranslations: any) => {
    setLanguage(languageCode);
    setCurrentTranslations(newTranslations);
  };

  const openAuthForm = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthForm(true);
  };

  const closeAuthForm = () => {
    setShowAuthForm(false);
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <img src="/logo.svg" alt="BELL24H Logo" className="logo" />
          <h2 className="logo-text">BELL24H</h2>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="cover-page">
      {/* Sticky Header */}
      <Header transparent={true} />
      
      {/* Video Hero Section */}
      <VideoHero translations={currentTranslations} />

      {/* Marketplace Metrics */}
      <MarketplaceMetrics />

      {/* Product Categories */}
      <ProductCategories />

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">{currentTranslations.keyFeatures}</h2>
          <p className="section-subtitle">Powerful tools to streamline your procurement process</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <MessageSquare size={32} />
              </div>
              <h3 className="feature-title">{currentTranslations.smartRfq}</h3>
              <p className="feature-description">
                {currentTranslations.smartRfqDesc}
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Camera size={32} />
              </div>
              <h3 className="feature-title">{currentTranslations.imageRfq}</h3>
              <p className="feature-description">
                {currentTranslations.imageRfqDesc}
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart2 size={32} />
              </div>
              <h3 className="feature-title">{currentTranslations.analytics}</h3>
              <p className="feature-description">
                {currentTranslations.analyticsDesc}
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3 className="feature-title">{currentTranslations.blockchain}</h3>
              <p className="feature-description">
                {currentTranslations.blockchainDesc}
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Smartphone size={32} />
              </div>
              <h3 className="feature-title">{currentTranslations.mobile}</h3>
              <p className="feature-description">
                {currentTranslations.mobileDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explainability Section with Suspense */}
      <Suspense fallback={<div className="section-loading">Loading AI Explainability...</div>}>
        <AIExplainabilitySection />
      </Suspense>
      
      {/* Advertorial Section */}
      <section className="advertorial-section">
        <div className="container">
          <h2 className="section-title">Why Choose BELL24H?</h2>
          <p className="section-subtitle">Tailored solutions for buyers and suppliers</p>
          
          <div className="advertorial-grid">
            <div className="advertorial-card">
              <h3>For Buyers</h3>
              <ul className="advertorial-features">
                <li>Access AI-driven supplier matches</li>
                <li>Real-time analytics to optimize procurement</li>
                <li>Secure blockchain verification</li>
                <li>Voice and image-based RFQ submission</li>
                <li>Milestone-based payment protection</li>
              </ul>
              <button onClick={() => openAuthForm('signup')} className="advertorial-button buyer">
                Register as Buyer <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="advertorial-card">
              <h3>For Suppliers</h3>
              <ul className="advertorial-features">
                <li>Grow your business with automated RFQ matching</li>
                <li>Showcase products with video and images</li>
                <li>Secure, transparent payment processing</li>
                <li>Build verified reputation with blockchain</li>
                <li>Early payment options for better cash flow</li>
              </ul>
              <button onClick={() => openAuthForm('signup')} className="advertorial-button supplier">
                Register as Supplier <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <div className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">{currentTranslations.ctaTitle}</h2>
          <p className="cta-description">
            {currentTranslations.ctaDesc}
          </p>
          <button onClick={() => openAuthForm('signup')} className="cta-button primary large">
            {currentTranslations.getStarted} <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Show mobile app banner only on mobile devices */}
      {isMobile && <MobileOptimizationBanner />}
      
      {/* Auth Form Modal */}
      {showAuthForm && (
        <Suspense fallback={<div className="modal-loading">Loading...</div>}>
          <AuthForms 
            initialMode={authMode} 
            onClose={closeAuthForm} 
            isModal={true} 
          />
        </Suspense>
      )}
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/logo.svg" alt="BELL24H Logo" className="logo-small" />
            <h3 className="footer-logo-text">BELL24H</h3>
          </div>
          <div className="footer-links">
            <div className="footer-links-column">
              <h4 className="footer-links-title">Platform</h4>
              <a href="#" className="footer-link">RFQ Management</a>
              <a href="#" className="footer-link">Supplier Directory</a>
              <a href="#" className="footer-link">Analytics Dashboard</a>
              <a href="#" className="footer-link">Blockchain Verification</a>
            </div>
            <div className="footer-links-column">
              <h4 className="footer-links-title">Company</h4>
              <a href="#" className="footer-link">About Us</a>
              <a href="#" className="footer-link">Contact</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Blog</a>
            </div>
            <div className="footer-links-column">
              <h4 className="footer-links-title">Resources</h4>
              <a href="#" className="footer-link">Documentation</a>
              <a href="#" className="footer-link">API</a>
              <a href="#" className="footer-link">Support</a>
              <a href="#" className="footer-link">Community</a>
            </div>
            <div className="footer-links-column">
              <h4 className="footer-links-title">Legal</h4>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Cookie Policy</a>
              <a href="#" className="footer-link">GDPR</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright"> {new Date().getFullYear()} BELL24H. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CoverPage;
