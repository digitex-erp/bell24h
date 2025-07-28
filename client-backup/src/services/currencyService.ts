// Currency service for handling currency conversion and formatting

interface ExchangeRates {
  [key: string]: number; // Key is currency code, value is rate relative to base currency
}

export type { CurrencyInfo };

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimalDigits: number;
}

// Base currency (INR - Indian Rupee)
const BASE_CURRENCY = 'INR';

// Common currencies with their info
const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalDigits: 2 },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalDigits: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalDigits: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalDigits: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalDigits: 0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalDigits: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalDigits: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalDigits: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalDigits: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalDigits: 2 },
];

// Default exchange rates (will be updated from API)
let exchangeRates: ExchangeRates = {
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.8,
  AUD: 0.018,
  CAD: 0.016,
  CNY: 0.086,
  SGD: 0.016,
  AED: 0.044,
  // Base currency should always be 1
  [BASE_CURRENCY]: 1,
};

// Cache for exchange rates
let lastFetched: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetches latest exchange rates from the API
 */
export const fetchExchangeRates = async (): Promise<void> => {
  try {
    // In a real app, you would use an API like ExchangeRate-API or fixer.io
    // For now, we'll use a mock implementation
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
    const data = await response.json();
    
    if (data && data.rates) {
      exchangeRates = { ...data.rates, [BASE_CURRENCY]: 1 };
      lastFetched = Date.now();
      // Store in localStorage for offline use
      localStorage.setItem('currencyRates', JSON.stringify({
        rates: exchangeRates,
        timestamp: lastFetched
      }));
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    // Fallback to default rates if API fails
    const cached = localStorage.getItem('currencyRates');
    if (cached) {
      try {
        const { rates, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION * 7) { // Use cached rates up to 7 days
          exchangeRates = rates;
          lastFetched = timestamp;
        }
      } catch (e) {
        console.error('Failed to parse cached rates:', e);
      }
    }
  }
};

/**
 * Converts amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to base currency first
  const baseAmount = amount / (exchangeRates[fromCurrency] || 1);
  // Convert to target currency
  return baseAmount * (exchangeRates[toCurrency] || 1);
};

/**
 * Formats a number as currency
 */
export const formatCurrency = (
  amount: number,
  currency: string,
  options: Intl.NumberFormatOptions = {}
): string => {
  const currencyInfo = CURRENCIES.find(c => c.code === currency) || {
    code: currency,
    symbol: currency,
    decimalDigits: 2
  };

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: currencyInfo.decimalDigits,
    maximumFractionDigits: currencyInfo.decimalDigits,
    ...options
  }).format(amount);
};

/**
 * Gets all available currencies
 */
export const getAvailableCurrencies = (): CurrencyInfo[] => {
  return [...CURRENCIES];
};

/**
 * Gets the current exchange rate between two currencies
 */
export const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return 1;
  return (exchangeRates[toCurrency] || 1) / (exchangeRates[fromCurrency] || 1);
};

// Initialize the service by fetching rates if needed
if (typeof window !== 'undefined') {
  // Load cached rates if available
  const cached = localStorage.getItem('currencyRates');
  if (cached) {
    try {
      const { rates, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        exchangeRates = rates;
        lastFetched = timestamp;
      } else {
        // Refresh rates if cache is stale
        fetchExchangeRates();
      }
    } catch (e) {
      console.error('Failed to initialize currency service:', e);
    }
  } else {
    // No cache, fetch fresh rates
    fetchExchangeRates();
  }
}

export default {
  fetchExchangeRates,
  convertCurrency,
  formatCurrency,
  getAvailableCurrencies,
  getExchangeRate,
  BASE_CURRENCY,
};
