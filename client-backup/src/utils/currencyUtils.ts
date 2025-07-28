import currencyService from '../services/currencyService';

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a number as currency with options
 */
export const formatCurrency = (
  amount: number,
  currency: string,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    showSymbol = true,
    showCode = false,
    locale = undefined,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  const currencyInfo = currencyService
    .getAvailableCurrencies()
    .find(c => c.code === currency);

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: minimumFractionDigits ?? currencyInfo?.decimalDigits ?? 2,
    maximumFractionDigits: maximumFractionDigits ?? currencyInfo?.decimalDigits ?? 2,
    currencyDisplay: showSymbol ? 'symbol' : 'code',
  };

  let formatted = new Intl.NumberFormat(locale, formatOptions).format(amount);

  if (showCode && !formatted.includes(currency)) {
    formatted += ` ${currency}`;
  }

  return formatted;
};

/**
 * Parse a currency string into a number
 */
export const parseCurrency = (value: string, locale = 'en-IN'): number => {
  // Get the decimal and group separators for the locale
  const parts = new Intl.NumberFormat(locale)
    .formatToParts(1000.1)
    .reduce((acc, part) => {
      if (part.type === 'decimal') acc.decimal = part.value;
      if (part.type === 'group') acc.group = part.value;
      return acc;
    }, {} as { decimal: string; group: string });

  // Create a regex to match numbers with the locale's separators
  const regex = new RegExp(
    `[^0-9${parts.decimal}${parts.group || ''}-]`,
    'g'
  );

  // Remove all non-numeric characters except decimal and group separators
  const numericString = value
    .replace(regex, '')
    .replace(new RegExp(`\\${parts.group}`, 'g'), '')
    .replace(parts.decimal, '.');

  const number = parseFloat(numericString);
  return isNaN(number) ? 0 : number;
};

/**
 * Get the currency symbol for a currency code
 */
export const getCurrencySymbol = (currency: string): string => {
  const currencyInfo = currencyService
    .getAvailableCurrencies()
    .find(c => c.code === currency);
  
  return currencyInfo?.symbol || currency;
};

/**
 * Get the number of decimal places for a currency
 */
export const getCurrencyDecimals = (currency: string): number => {
  const currencyInfo = currencyService
    .getAvailableCurrencies()
    .find(c => c.code === currency);
  
  return currencyInfo?.decimalDigits ?? 2;
};

export default {
  formatCurrency,
  parseCurrency,
  getCurrencySymbol,
  getCurrencyDecimals,
};
