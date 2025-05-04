/**
 * Cultural UI Configuration
 * 
 * This file contains configurations for culturally appropriate UI transformations
 * based on the selected language/locale. These include formatting preferences,
 * layout adjustments, color schemes, and other cultural UI elements.
 */

export interface CulturalUIConfig {
  // Text direction (right-to-left or left-to-right)
  direction: 'rtl' | 'ltr';
  
  // Date and time formatting preferences
  dateFormat: string;
  timeFormat: string;
  
  // Currency display preferences
  currencySymbolPosition: 'before' | 'after';
  
  // Number formatting
  decimalSeparator: string;
  thousandsSeparator: string;
  
  // Visual preferences
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    background: string;
  };
  
  // Layout preferences 
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  
  // Image and icon preferences
  // Some cultures have specific preferences for imagery and icons
  iconStyle: 'minimal' | 'detailed';
  
  // Name format preferences
  nameFormat: 'firstName-lastName' | 'lastName-firstName' | 'fullName';
  
  // Address format
  addressFormat: string[];
  
  // Business etiquette indicators for communications
  formality: 'formal' | 'neutral' | 'casual';
  
  // Flag code for the language selector
  flagCode: string;
  
  // Native name of the language (in its own script)
  nativeName: string;
  
  // English name of the language
  englishName: string;
}

// Default configuration (English/Western)
const defaultConfig: CulturalUIConfig = {
  direction: 'ltr',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: 'h:mm a',
  currencySymbolPosition: 'before',
  decimalSeparator: '.',
  thousandsSeparator: ',',
  colorScheme: {
    primary: '#0070f3',
    secondary: '#f5f5f5',
    accent: '#ff0080',
    surface: '#ffffff',
    background: '#f8f9fa'
  },
  layoutDensity: 'comfortable',
  iconStyle: 'minimal',
  nameFormat: 'firstName-lastName',
  addressFormat: ['street', 'city', 'state', 'zip', 'country'],
  formality: 'neutral',
  flagCode: 'US',
  nativeName: 'English',
  englishName: 'English'
};

// Hindi (India) configuration
const hiConfig: CulturalUIConfig = {
  direction: 'ltr',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'h:mm a',
  currencySymbolPosition: 'before',
  decimalSeparator: '.',
  thousandsSeparator: ',',
  colorScheme: {
    primary: '#FF9933',  // Saffron from Indian flag
    secondary: '#f5f5f5',
    accent: '#138808',   // Green from Indian flag
    surface: '#ffffff',
    background: '#f8f9fa'
  },
  layoutDensity: 'comfortable',
  iconStyle: 'detailed',
  nameFormat: 'firstName-lastName',
  addressFormat: ['street', 'city', 'state', 'pin', 'country'],
  formality: 'formal',
  flagCode: 'IN',
  nativeName: 'हिन्दी',
  englishName: 'Hindi'
};

// Arabic configuration
const arConfig: CulturalUIConfig = {
  direction: 'rtl',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'h:mm a',
  currencySymbolPosition: 'after',
  decimalSeparator: '٫',
  thousandsSeparator: '٬',
  colorScheme: {
    primary: '#006C35',  // Green - common in Arabic designs
    secondary: '#f5f5f5',
    accent: '#CE1126',   // Red - common in Arab cultural designs
    surface: '#ffffff',
    background: '#f8f9fa'
  },
  layoutDensity: 'spacious',
  iconStyle: 'detailed',
  nameFormat: 'fullName',
  addressFormat: ['street', 'district', 'city', 'postal_code', 'country'],
  formality: 'formal',
  flagCode: 'SA',  // Saudi Arabia as one example
  nativeName: 'العربية',
  englishName: 'Arabic'
};

// Chinese configuration
const zhConfig: CulturalUIConfig = {
  direction: 'ltr',
  dateFormat: 'yyyy-MM-dd',
  timeFormat: 'HH:mm',
  currencySymbolPosition: 'before',
  decimalSeparator: '.',
  thousandsSeparator: ',',
  colorScheme: {
    primary: '#DE2910',  // Red - traditional Chinese color symbolizing good fortune
    secondary: '#f5f5f5',
    accent: '#FFDE00',   // Gold - traditional Chinese color symbolizing wealth
    surface: '#ffffff',
    background: '#f8f9fa'
  },
  layoutDensity: 'compact',
  iconStyle: 'detailed',
  nameFormat: 'lastName-firstName',
  addressFormat: ['country', 'province', 'city', 'district', 'street'],
  formality: 'formal',
  flagCode: 'CN',
  nativeName: '中文',
  englishName: 'Chinese'
};

// Spanish configuration
const esConfig: CulturalUIConfig = {
  direction: 'ltr',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  currencySymbolPosition: 'after',
  decimalSeparator: ',',
  thousandsSeparator: '.',
  colorScheme: {
    primary: '#AA151B',  // Red from Spanish flag
    secondary: '#f5f5f5',
    accent: '#F1BF00',   // Yellow from Spanish flag
    surface: '#ffffff',
    background: '#f8f9fa'
  },
  layoutDensity: 'comfortable',
  iconStyle: 'minimal',
  nameFormat: 'firstName-lastName',
  addressFormat: ['street', 'postal_code', 'city', 'province', 'country'],
  formality: 'formal',
  flagCode: 'ES',
  nativeName: 'Español',
  englishName: 'Spanish'
};

// Export all configurations
export const culturalConfigs: Record<string, CulturalUIConfig> = {
  en: defaultConfig,
  hi: hiConfig,
  ar: arConfig,
  zh: zhConfig,
  es: esConfig
};

// Helper function to get configuration for a specific language
export const getCulturalConfig = (language: string): CulturalUIConfig => {
  return culturalConfigs[language] || defaultConfig;
};

// Helper function to get the appropriate currency format for a language
export const formatCurrency = (amount: number, language: string, currency: string = 'USD'): string => {
  const config = getCulturalConfig(language);
  
  // Format the number first
  const parts = amount.toFixed(2).split('.');
  
  // Apply thousands separator
  const formattedWhole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
  
  // Combine with decimal part
  const formattedNumber = `${formattedWhole}${config.decimalSeparator}${parts[1]}`;
  
  // Apply currency symbol in appropriate position
  if (config.currencySymbolPosition === 'before') {
    return `${getCurrencySymbol(currency)}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${getCurrencySymbol(currency)}`;
  }
};

// Get currency symbol
const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    SAR: '﷼',
  };
  
  return symbols[currency] || currency;
};

// Helper for formatting dates according to cultural preferences
export const formatDate = (date: Date, language: string): string => {
  const config = getCulturalConfig(language);
  
  try {
    // Use Intl API for proper internationalization
    return new Intl.DateTimeFormat(languageToLocale(language), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch (error) {
    // Fallback to manual formatting if Intl API fails
    return formatDateManually(date, config.dateFormat);
  }
};

// Convert language code to locale
const languageToLocale = (language: string): string => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    ar: 'ar-SA',
    zh: 'zh-CN',
    es: 'es-ES'
  };
  
  return localeMap[language] || 'en-US';
};

// Manual date formatting as fallback
const formatDateManually = (date: Date, format: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('yyyy', year.toString())
    .replace('MM', month)
    .replace('dd', day);
};

// Helper for applying layout direction
export const getDocumentDirection = (language: string): 'rtl' | 'ltr' => {
  return getCulturalConfig(language).direction;
};

// Helper to get appropriate name format
export const formatName = (firstName: string, lastName: string, language: string): string => {
  const config = getCulturalConfig(language);
  
  switch (config.nameFormat) {
    case 'firstName-lastName':
      return `${firstName} ${lastName}`;
    case 'lastName-firstName':
      return `${lastName} ${firstName}`;
    case 'fullName':
      return `${firstName} ${lastName}`;
    default:
      return `${firstName} ${lastName}`;
  }
};

// Helper to get the appropriate formality level for communications
export const getFormalityLevel = (language: string): 'formal' | 'neutral' | 'casual' => {
  return getCulturalConfig(language).formality;
};

// Export language information for the selector
export const getLanguageInfo = (language: string) => {
  const config = getCulturalConfig(language);
  return {
    code: language,
    nativeName: config.nativeName,
    englishName: config.englishName,
    flagCode: config.flagCode
  };
};

// Get all available languages
export const getAvailableLanguages = () => {
  return Object.keys(culturalConfigs).map(code => getLanguageInfo(code));
};