/**
 * Checks if the current language is RTL (Right-to-Left)
 * @param language - The language code to check (defaults to current i18n language)
 * @returns boolean - True if the language is RTL
 */
export const isRTL = (language?: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'syr', 'dv', 'he', 'yi'];
  const lang = language || (typeof window !== 'undefined' ? window.localStorage.getItem('i18nextLng') || 'en' : 'en');
  return rtlLanguages.some(rtlLang => lang.startsWith(rtlLang));
};

/**
 * Gets the text direction for the current language
 * @param language - The language code to check (defaults to current i18n language)
 * @returns 'rtl' or 'ltr'
 */
export const getTextDirection = (language?: string): 'rtl' | 'ltr' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

/**
 * Applies RTL/LTR direction to the document
 * @param language - The language code to set direction for
 */
export const applyTextDirection = (language?: string): void => {
  if (typeof document !== 'undefined') {
    const dir = getTextDirection(language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language || 'en';
    
    // Add/remove RTL class for additional styling
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }
};

/**
 * Handles language change with RTL support
 * @param language - The new language code
 * @param i18n - The i18n instance (optional, will use default if not provided)
 */
export const changeLanguageWithRTL = async (language: string, i18n?: any): Promise<void> => {
  const i18nInstance = i18n || (await import('@/i18n/config')).default;
  await i18nInstance.changeLanguage(language);
  applyTextDirection(language);
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', language);
  }
};
