import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { enTranslations } from './en';
import { hiTranslations } from './hi';
import { esTranslations } from './es';
import { arTranslations } from './ar';
import { zhTranslations } from './zh';

// Define available languages
export type Language = 'en' | 'hi' | 'es' | 'ar' | 'zh';

// Create a type that matches the structure of our translation objects
export type TranslationKey = keyof typeof enTranslations;
type NestedTranslationKeys<T> = {
  [K in keyof T]: T[K] extends object ? `${string & K}.${string & keyof T[K]}` : K;
}[keyof T];

// All possible translation paths, such as 'common.submit' or 'milestone.title'
type TranslationPath = NestedTranslationKeys<typeof enTranslations>;

// Define the translations map
const translations = {
  en: enTranslations,
  hi: hiTranslations,
  es: esTranslations,
  ar: arTranslations,
  zh: zhTranslations,
};

// Create the context type
interface I18nContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

// Create the context with default values
const I18nContext = createContext<I18nContextType>({
  language: 'en',
  changeLanguage: () => {},
  t: (key: string) => key,
  isRTL: false,
});

// Provider component that will wrap the app
interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  defaultLanguage = 'en' 
}) => {
  // Get the stored language from localStorage or use default
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('bell24h-language');
    return (storedLang as Language) || defaultLanguage;
  });

  // RTL languages - Arabic is RTL
  const rtlLanguages: Language[] = ['ar'];
  const isRTL = rtlLanguages.includes(language);

  // Function to change the language
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('bell24h-language', lang);
    
    // Set the HTML direction attribute for RTL support
    document.documentElement.dir = rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
    
    // You could also set the lang attribute for better accessibility
    document.documentElement.lang = lang;
  };

  // Set initial direction and lang attributes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    const translationObj = translations[language];

    try {
      // Navigate through nested objects based on the key path
      let result: any = translationObj;
      for (const k of keys) {
        result = result[k];
        if (result === undefined) {
          throw new Error('Key not found');
        }
      }
      
      // Return the translation if found
      if (typeof result === 'string') {
        return result;
      }
      
      // If it's not a string (nested object), return the key
      return key;
    } catch (error) {
      // Fallback to English if the key doesn't exist in the current language
      if (language !== 'en') {
        try {
          let result: any = translations['en'];
          for (const k of keys) {
            result = result[k];
            if (result === undefined) {
              throw new Error('Key not found in English fallback');
            }
          }
          
          if (typeof result === 'string') {
            return result;
          }
        } catch {
          // Fallback to key if not found in English either
          console.warn(`Translation key not found: ${key}`);
        }
      }
      
      // Return the key itself if translation not found
      return key;
    }
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook to use the translations in components
export const useTranslation = () => {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  return context;
};

// Export languages for dropdown selector
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'es', name: 'Español' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' },
];