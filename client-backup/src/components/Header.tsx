import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import AuthForms from './AuthForms';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const headerClass = `header ${scrolled || !transparent ? 'header-solid' : 'header-transparent'} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`;

  return (
    <>
      <header className={headerClass}>
        <div className="header-container">
          <div className="logo-container" onClick={() => handleNavigation('/')}>
            <img src="/logo.svg" alt="BELL24H Logo" className="logo" />
            <h2 className="logo-text">BELL24H</h2>
          </div>
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <nav className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
            <div className="nav-items">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigation('/rfqs'); }}
                className="nav-link"
              >
                RFQ
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigation('/suppliers'); }}
                className="nav-link"
              >
                Suppliers
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigation('/analytics'); }}
                className="nav-link"
              >
                Analytics
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); handleNavigation('/blockchain'); }}
                className="nav-link"
              >
                Blockchain
              </a>
            </div>
            
            <div className="auth-links">
              <LanguageSwitcher onLanguageChange={() => {}} />
              <button 
                className="nav-button" 
                onClick={() => openAuthModal('login')}
              >
                Login
              </button>
              <button 
                className="nav-button register" 
                onClick={() => openAuthModal('signup')}
              >
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </header>
      
      {showAuthModal && (
        <AuthForms 
          initialMode={authMode} 
          onClose={closeAuthModal} 
          isModal={true} 
        />
      )}
    </>
  );
};

export default Header;
