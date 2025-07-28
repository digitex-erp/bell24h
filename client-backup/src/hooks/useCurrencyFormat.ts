import { useCurrency } from '../contexts/CurrencyContext';

/**
 * Hook to format and convert currency values
 * @returns Object with formatting and conversion utilities
 */
export const useCurrencyFormat = () => {
  const { 
    currency: currentCurrency, 
    formatCurrency: format, 
    convertCurrency: convert,
    getExchangeRate
  } = useCurrency();

  /**
   * Format a price with the user's selected currency
   * @param amount - The amount to format
   * @param originalCurrency - The original currency of the amount
   * @param options - Additional formatting options
   * @returns Formatted currency string
   */
  const formatPrice = (
    amount: number | undefined | null,
    originalCurrency: string = currentCurrency,
    options?: Intl.NumberFormatOptions
  ): string => {
    if (amount === null || amount === undefined) return '-';
    
    try {
      // Convert the amount if it's in a different currency
      const displayAmount = originalCurrency === currentCurrency 
        ? amount 
        : convert(amount, originalCurrency, currentCurrency);
      
      return format(displayAmount, undefined, options);
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'N/A';
    }
  };

  /**
   * Get the exchange rate between two currencies
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code (defaults to user's selected currency)
   * @returns Exchange rate as a number
   */
  const getRate = (fromCurrency: string, toCurrency: string = currentCurrency): number => {
    return getExchangeRate(fromCurrency, toCurrency);
  };

  /**
   * Convert an amount from one currency to another
   * @param amount - The amount to convert
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code (defaults to user's selected currency)
   * @returns Converted amount
   */
  const convertPrice = (
    amount: number,
    fromCurrency: string,
    toCurrency: string = currentCurrency
  ): number => {
    return convert(amount, fromCurrency, toCurrency);
  };

  return {
    currentCurrency,
    formatPrice,
    convertPrice,
    getRate,
  };
};

export default useCurrencyFormat;
