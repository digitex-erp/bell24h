import axios from 'axios';


interface CurrencyRates {
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}
export class CurrencyService {
  private readonly baseUrl = 'https://api.exchangerate-api.com/v4/latest';
  private cache: {
    [key: string]: {
      rates: CurrencyRates;
      timestamp: number;
    };
  } = {};

  private readonly cacheDuration = 3600000; // 1 hour

  /**
   * Get the latest currency rates
   */
  async getLatestRates(baseCurrency: string = 'USD'): Promise<CurrencyRates> {
    const cacheKey = baseCurrency;
    const now = Date.now();

    // Check cache
    if (this.cache[cacheKey] && 
        now - this.cache[cacheKey].timestamp < this.cacheDuration) {
      return this.cache[cacheKey].rates;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/${baseCurrency}`);
      const rates = response.data;

      // Update cache
      this.cache[cacheKey] = {
        rates,
        timestamp: now
      };

      return rates;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      throw error;
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    const rates = await this.getLatestRates(fromCurrency);
    const rate = rates.rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Currency ${toCurrency} not supported`);
    }

    return amount * rate;
  }

  /**
   * Format currency amount with proper symbol and decimal places
   */
  formatCurrency(
    amount: number,
    currency: string,
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD',
      'CHF', 'CNY', 'INR', 'SGD', 'HKD', 'NZD',
      'MXN', 'BRL', 'RUB', 'ZAR', 'TRY', 'SEK'
    ];
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'CHF',
      CNY: '¥',
      SGD: 'S$',
      HKD: 'HK$',
      NZD: 'NZ$',
      MXN: 'MX$',
      BRL: 'R$',
      RUB: '₽',
      ZAR: 'R',
      TRY: '₺',
      SEK: 'kr'
    };

    return symbols[currency] || currency;
  }

  /**
   * Get currency name in user's language
   */
  getCurrencyName(currency: string, locale: string): string {
    const formatter = new Intl.DisplayNames([locale], { type: 'currency' });
    return formatter.of(currency) || currency;
  }
}
