import React, { useState } from 'react';
import { Globe } from 'lucide-react';

// Define the available languages
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
];

// Define the translations for common UI elements
const translations = {
  en: {
    heroTitle: 'Efficient, AI-powered RFQ matching for seamless supplier connections',
    heroSubtitle: 'Streamline your procurement process with our intelligent B2B marketplace platform',
    startRfq: 'Start RFQ',
    exploreBlockchain: 'Explore Blockchain Features',
    keyFeatures: 'Key Features',
    smartRfq: 'Smart RFQ Management',
    smartRfqDesc: 'Create, manage, and track RFQs with voice and image-based submissions',
    imageRfq: 'Image-Based RFQ',
    imageRfqDesc: 'Upload product images and let our AI extract specifications automatically',
    analytics: 'Real-time Analytics',
    analyticsDesc: 'Track performance metrics and gain insights with AI-powered analytics',
    blockchain: 'Blockchain Verification',
    blockchainDesc: 'Secure supplier verification with blockchain technology',
    mobile: 'Mobile Optimized',
    mobileDesc: 'Access your dashboard on any device with our responsive design',
    ctaTitle: 'Ready to transform your procurement process?',
    ctaDesc: 'Join thousands of businesses already using BELL24H to streamline their RFQ process',
    getStarted: 'Get Started Today',
    login: 'Login',
    register: 'Register'
  },
  hi: {
    heroTitle: 'कुशल, AI-संचालित RFQ मिलान के लिए निर्बाध आपूर्तिकर्ता कनेक्शन',
    heroSubtitle: 'हमारे बुद्धिमान B2B मार्केटप्लेस प्लेटफॉर्म के साथ अपनी खरीद प्रक्रिया को सुव्यवस्थित करें',
    startRfq: 'RFQ शुरू करें',
    exploreBlockchain: 'ब्लॉकचेन सुविधाएँ देखें',
    keyFeatures: 'प्रमुख विशेषताएं',
    smartRfq: 'स्मार्ट RFQ प्रबंधन',
    smartRfqDesc: 'आवाज और छवि-आधारित सबमिशन के साथ RFQ बनाएं, प्रबंधित करें और ट्रैक करें',
    imageRfq: 'छवि-आधारित RFQ',
    imageRfqDesc: 'उत्पाद छवियां अपलोड करें और हमारे AI को स्वचालित रूप से विनिर्देश निकालने दें',
    analytics: 'रीयल-टाइम एनालिटिक्स',
    analyticsDesc: 'AI-संचालित एनालिटिक्स के साथ प्रदर्शन मेट्रिक्स ट्रैक करें और अंतर्दृष्टि प्राप्त करें',
    blockchain: 'ब्लॉकचेन सत्यापन',
    blockchainDesc: 'ब्लॉकचेन तकनीक के साथ सुरक्षित आपूर्तिकर्ता सत्यापन',
    mobile: 'मोबाइल अनुकूलित',
    mobileDesc: 'हमारे रेस्पॉन्सिव डिज़ाइन के साथ किसी भी डिवाइस पर अपना डैशबोर्ड एक्सेस करें',
    ctaTitle: 'अपनी खरीद प्रक्रिया को बदलने के लिए तैयार हैं?',
    ctaDesc: 'हजारों व्यवसायों में शामिल हों जो पहले से ही अपनी RFQ प्रक्रिया को सुव्यवस्थित करने के लिए BELL24H का उपयोग कर रहे हैं',
    getStarted: 'आज ही शुरू करें',
    login: 'लॉगिन',
    register: 'रजिस्टर करें'
  }
};

interface LanguageSwitcherProps {
  onLanguageChange: (language: string, translations: any) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);

  const handleLanguageChange = (language: typeof languages[0]) => {
    setCurrentLanguage(language);
    onLanguageChange(language.code, translations[language.code as keyof typeof translations]);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher">
      <button 
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <Globe size={16} />
        <span>{currentLanguage.flag}</span>
        <span className="language-name">{currentLanguage.name}</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${language.code === currentLanguage.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language)}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { LanguageSwitcher, translations };
export type { LanguageSwitcherProps };
