import React, { useState } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

const MobileOptimizationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  return isVisible ? (
    <div className="mobile-banner">
      <div className="mobile-banner-content">
        <div className="mobile-banner-icon">
          <Smartphone size={24} />
        </div>
        <div className="mobile-banner-text">
          <h4>Bell24H Mobile App</h4>
          <p>Get our touch-optimized app for a better experience on mobile devices</p>
        </div>
        <div className="mobile-banner-actions">
          <button className="mobile-download-button">
            <Download size={16} />
            <span>Download</span>
          </button>
          <button className="mobile-close-button" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default MobileOptimizationBanner;
