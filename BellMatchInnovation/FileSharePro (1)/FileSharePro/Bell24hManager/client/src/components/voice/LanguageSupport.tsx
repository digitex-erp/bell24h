
import React, { useEffect, useState } from 'react';
import { useWhisper } from '../../hooks/use-whisper';

interface LanguageSupportProps {
  onLanguageChange: (lang: string) => void;
}

const SUPPORTED_LANGUAGES = {
  'en-IN': 'English',
  'hi-IN': 'Hindi',
  'gu-IN': 'Gujarati',
  'pa-IN': 'Punjabi',
  'mr-IN': 'Marathi'
};

export const LanguageSupport: React.FC<LanguageSupportProps> = ({ onLanguageChange }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en-IN');
  const { updateLanguage } = useWhisper();

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    updateLanguage(lang);
    onLanguageChange(lang);
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900">Select Language</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`p-3 text-sm font-medium rounded-md transition-colors
              ${currentLanguage === code 
                ? 'bg-primary-100 text-primary-700 border-primary-500' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSupport;
