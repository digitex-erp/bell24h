# Multi-Currency Support

This document outlines the implementation of multi-currency support in the Bell24H Marketplace application.

## Features

- Support for multiple currencies (INR, USD, EUR, GBP, JPY, etc.)
- Real-time currency conversion
- User preference persistence
- Price formatting based on locale
- Exchange rate caching for better performance
- Support for both client-side and server-side rendering

## Implementation Details

### Currency Service (`currencyService.ts`)

Handles currency conversion, formatting, and exchange rate management.

Key functions:
- `convertCurrency`: Converts between currencies
- `formatCurrency`: Formats numbers as currency strings
- `getExchangeRate`: Gets the exchange rate between two currencies
- `fetchExchangeRates`: Fetches latest exchange rates from the API

### Currency Context (`CurrencyContext.tsx`)

Provides currency-related state and functions to the entire application.

### Components

1. **CurrencySelector**
   - Allows users to select their preferred currency
   - Displays currency code and symbol

2. **PriceDisplay**
   - Displays prices in the user's preferred currency
   - Shows tooltips with original price and exchange rate
   - Handles conversion automatically

3. **Product Showcase**
   - Updated to support multi-currency pricing
   - Shows prices in both base currency and user's currency
   - Handles currency conversion in real-time

## Data Model Updates

### Product Interface

```typescript
interface ProductShowcase {
  // ... existing fields ...
  price?: number;  // Price in base currency
  base_currency: string;  // Base currency code (e.g., 'INR')
  prices?: {
    [currency: string]: number | undefined;  // Cached prices in different currencies
  };
  // ... other fields ...
}
```

## Usage

### Setting the User's Currency

```typescript
const { setCurrency } = useCurrency();

// Set user's preferred currency
setCurrency('USD');
```

### Displaying Prices

```typescript
import { useCurrency } from '../contexts/CurrencyContext';

function ProductPrice({ price, originalCurrency }) {
  const { formatPrice } = useCurrency();
  
  return (
    <div>
      <span>{formatPrice(price, originalCurrency)}</span>
    </div>
  );
}
```

### Converting Currencies

```typescript
const { convertCurrency } = useCurrency();

// Convert 1000 INR to USD
const amountInUSD = convertCurrency(1000, 'INR', 'USD');
```

## Configuration

### Environment Variables

```env
# Exchange rates API key (if using a paid service)
EXCHANGE_RATES_API_KEY=your_api_key_here

# Base currency (default: 'INR')
NEXT_PUBLIC_BASE_CURRENCY=INR

# Cache duration for exchange rates in milliseconds (default: 24 hours)
EXCHANGE_RATES_CACHE_DURATION=86400000
```

## Testing

Run the test suite to verify currency functionality:

```bash
npm test currency
```

## Future Enhancements

1. Add support for more currencies
2. Implement currency formatting based on locale
3. Add historical exchange rate data
4. Support for cryptocurrency pricing
5. Bulk currency conversion for product listings

## Known Issues

- Exchange rates are currently mocked and don't update in real-time
- No support for currency formatting in input fields
- Limited error handling for API failures
