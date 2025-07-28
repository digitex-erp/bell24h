import i18n, { i18n as I18nType, InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Extend i18n type to include event emitter methods
declare module 'i18next' {
  interface i18n {
    on(event: string, callback: (lng: string) => void): void;
    off(event: string, callback: (lng: string) => void): void;
  }
}

// Extend i18n type to include event emitter methods
declare module 'i18next' {
  interface i18n {
    on(event: string, callback: (lng: string) => void): void;
    off(event: string, callback: (lng: string) => void): void;
  }
}

// Extend i18n type to include event emitter methods
declare module 'i18next' {
  interface i18n {
    on(event: string, callback: (lng: string) => void): void;
    off(event: string, callback: (lng: string) => void): void;
  }
}

// Import all language translations
import enTranslation from './locales/en/translation.json';
import hiTranslation from './locales/hi/translation.json';
import esTranslation from './locales/es/translation.json';
import bnTranslation from './locales/bn/translation.json';
import taTranslation from './locales/ta/translation.json';
import teTranslation from './locales/te/translation.json';
import frTranslation from './locales/fr/translation.json';
import deTranslation from './locales/de/translation.json';
import zhTranslation from './locales/zh/translation.json';
import arTranslation from './locales/ar/translation.json';
import heTranslation from './locales/he/translation.json';

const resources = {
  // English (default)
  en: {
    translation: enTranslation,
  },
  // Indian languages
  hi: {
    translation: hiTranslation,
  },
  bn: {
    translation: bnTranslation,
  },
  ta: {
    translation: taTranslation,
  },
  te: {
    translation: teTranslation,
  },
  // International languages
  es: {
    translation: esTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  de: {
    translation: deTranslation,
  },
  zh: {
    translation: zhTranslation,
  },
  ar: {
    translation: arTranslation,
  },
  // Hebrew (RTL)
  he: {
    translation: heTranslation,
  },
};

// Extend i18n options type to include our custom properties
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
    // other custom type options
  }
}

// Custom type for i18n options with our custom properties
interface CustomI18nOptions extends InitOptions {
  rtlLngs?: string[];
}

// Initialize i18n with proper typing
const i18nConfig: InitOptions = {
  resources,
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['querystring', 'cookie', 'localStorage', 'navigator'],
    lookupQuerystring: 'lang',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'i18nextLng',
    caches: ['localStorage', 'cookie'],
  },
  // RTL language support
  supportedLngs: ['en', 'hi', 'bn', 'ta', 'te', 'es', 'fr', 'de', 'zh', 'ar', 'he'],
  // RTL languages will be handled by our custom utility
  // Default language
  lng: 'en',
  // React i18next options
  react: {
    useSuspense: true,
    bindI18n: 'languageChanged',
    bindI18nStore: '',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
  },
};

// Initialize i18n with proper typing
try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig)
    .catch((error) => {
      console.error('Failed to initialize i18n:', error);
    });
} catch (error) {
  console.error('Error initializing i18n:', error);
}

export default i18n;
