import axios from 'axios';
import { storage } from './storage';
import { InsertMarketData } from '@shared/schema';

// This would use a real market data API like Alpha Vantage in production
const API_KEY = process.env.ALPHAVANTAGE_API_KEY || 'demo';

// Category-to-commodity mapping
const categorySymbolsMap: Record<string, string[]> = {
  'Electronics & Automation': ['INTC', 'AMD', 'TSM', 'NVDA'],
  'Metals & Mining': ['X', 'FCX', 'BHP', 'RIO'],
  'Chemicals': ['DOW', 'DD', 'LYB', 'APD'],
  'Packaging & Materials': ['IP', 'PKG', 'GPK', 'SEE'],
  'Agricultural Products': ['ADM', 'BG', 'INGR', 'DAR'],
  'Textiles': ['GIII', 'PVH', 'VFC', 'HBI']
};

export async function fetchMarketData(): Promise<void> {
  try {
    // Process each category
    for (const [category, symbols] of Object.entries(categorySymbolsMap)) {
      await processCategory(category, symbols);
    }
    
    console.log('Market data update complete');
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}

async function processCategory(category: string, symbols: string[]): Promise<void> {
  for (const symbol of symbols) {
    try {
      const data = await fetchSymbolData(symbol);
      
      if (!data) continue;
      
      // Save to database
      await storage.updateMarketData({
        symbol: data.symbol,
        name: data.name,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        category,
        relatedCategories: getRelatedCategories(category)
      });
      
      // Rate limiting - avoid hitting API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${symbol}:`, error);
    }
  }
}

async function fetchSymbolData(symbol: string): Promise<InsertMarketData | null> {
  try {
    // In a real implementation, this would call the Alpha Vantage API
    // For demo purposes, we'll generate mock data
    
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    const quoteData = response.data['Global Quote'] || mockQuoteData(symbol);
    
    if (!quoteData || Object.keys(quoteData).length === 0) {
      return mockQuoteData(symbol);
    }
    
    return {
      symbol,
      name: getCompanyName(symbol),
      price: parseFloat(quoteData['05. price']) || generateRandomPrice(),
      change: parseFloat(quoteData['09. change']) || generateRandomChange(),
      changePercent: parseFloat((quoteData['10. change percent'] || '0%').replace('%', '')) / 100 || generateRandomChangePercent(),
      volume: parseInt(quoteData['06. volume']) || generateRandomVolume(),
      category: '',
      relatedCategories: {}
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return mockQuoteData(symbol);
  }
}

function mockQuoteData(symbol: string): InsertMarketData {
  return {
    symbol,
    name: getCompanyName(symbol),
    price: generateRandomPrice(),
    change: generateRandomChange(),
    changePercent: generateRandomChangePercent(),
    volume: generateRandomVolume(),
    category: '',
    relatedCategories: {}
  };
}

function getCompanyName(symbol: string): string {
  const companyNames: Record<string, string> = {
    'INTC': 'Intel Corporation',
    'AMD': 'Advanced Micro Devices, Inc.',
    'TSM': 'Taiwan Semiconductor Manufacturing Company',
    'NVDA': 'NVIDIA Corporation',
    'X': 'United States Steel Corporation',
    'FCX': 'Freeport-McMoRan Inc.',
    'BHP': 'BHP Group Limited',
    'RIO': 'Rio Tinto Group',
    'DOW': 'Dow Inc.',
    'DD': 'DuPont de Nemours, Inc.',
    'LYB': 'LyondellBasell Industries N.V.',
    'APD': 'Air Products and Chemicals, Inc.',
    'IP': 'International Paper Company',
    'PKG': 'Packaging Corporation of America',
    'GPK': 'Graphic Packaging Holding Company',
    'SEE': 'Sealed Air Corporation',
    'ADM': 'Archer-Daniels-Midland Company',
    'BG': 'Bunge Limited',
    'INGR': 'Ingredion Incorporated',
    'DAR': 'Darling Ingredients Inc.',
    'GIII': 'G-III Apparel Group, Ltd.',
    'PVH': 'PVH Corp.',
    'VFC': 'V.F. Corporation',
    'HBI': 'Hanesbrands Inc.'
  };
  
  return companyNames[symbol] || `${symbol} Inc.`;
}

function getRelatedCategories(category: string): Record<string, any> {
  // In a real implementation, this would be more sophisticated
  const relatedCategories = Object.keys(categorySymbolsMap)
    .filter(cat => cat !== category)
    .slice(0, 2);
  
  return { categories: relatedCategories };
}

// Helper functions to generate random market data
function generateRandomPrice(): number {
  return Math.round(10 + Math.random() * 190 * 100) / 100;
}

function generateRandomChange(): number {
  return Math.round((Math.random() * 10 - 5) * 100) / 100;
}

function generateRandomChangePercent(): number {
  return Math.round((Math.random() * 0.1 - 0.05) * 10000) / 10000;
}

function generateRandomVolume(): number {
  return Math.floor(100000 + Math.random() * 10000000);
}
