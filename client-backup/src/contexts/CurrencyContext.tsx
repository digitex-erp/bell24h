import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import currencyService, { type CurrencyInfo } from '../services/currencyService.js';

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  availableCurrencies: CurrencyInfo[];
  formatCurrency: (amount: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  getExchangeRate: (fromCurrency: string, toCurrency?: string) => number;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

type CurrencyProviderProps = {
  children: ReactNode;
  defaultCurrency?: string;
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
  children,
  defaultCurrency = currencyService.BASE_CURRENCY,
}) => {
  const [currency, setCurrency] = useState<string>(() => {
    // Try to get currency from localStorage, otherwise use default
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredCurrency') || defaultCurrency;
    }
    return defaultCurrency;
  });

  const availableCurrencies = currencyService.getAvailableCurrencies();

  // Save currency preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredCurrency', currency);
    }
  }, [currency]);

  // Format amount in the user's selected currency
  const formatCurrency = (
    amount: number,
    targetCurrency?: string,
    options?: Intl.NumberFormatOptions
  ): string => {
    const target = targetCurrency || currency;
    return currencyService.formatCurrency(amount, target, options);
  };

  // Convert amount between currencies
  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency?: string
  ): number => {
    const target = toCurrency || currency;
    return currencyService.convertCurrency(amount, fromCurrency, target);
  };

  // Get exchange rate between currencies
  const getExchangeRate = (fromCurrency: string, toCurrency?: string): number => {
    const target = toCurrency || currency;
    return currencyService.getExchangeRate(fromCurrency, target);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        availableCurrencies,
        formatCurrency,
        convertCurrency,
        getExchangeRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
