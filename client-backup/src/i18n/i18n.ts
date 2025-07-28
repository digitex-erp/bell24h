import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Create i18n instance
const i18n = i18next;

// Define RTL languages
const RTL_LANGUAGES = ['ar', 'he'];

// Helper function to set document direction based on language
const setDocumentDirection = (language: string) => {
  const dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
  document.body.dir = dir;
  
  // Add or remove RTL class from body for styling
  if (dir === 'rtl') {
    document.body.classList.add('rtl-layout');
  } else {
    document.body.classList.remove('rtl-layout');
  }
};

i18n
  .use(LanguageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'hi', 'bn', 'ta', 'te', 'es', 'fr', 'de', 'zh', 'ar'],
    fallbackLng: 'en',
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: true,
    },
  });

// Set initial document direction based on current language
setDocumentDirection(i18n.language);

// Listen for language changes and update document direction
i18n.on('languageChanged', (lng: string) => {
  setDocumentDirection(lng);
});

export default i18n;
