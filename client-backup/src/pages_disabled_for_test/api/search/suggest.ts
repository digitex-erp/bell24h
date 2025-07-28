import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Cache for popular searches (in-memory, could be replaced with Redis in production)
let popularSearches: Array<{ term: string; count: number }> = [];
let lastPopularUpdate = 0;
const POPULAR_UPDATE_INTERVAL = 3600000; // 1 hour

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests for suggestions
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q: query, limit = '5' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 5, 10);

    // Get recent searches from the database (you might want to implement this in a real app)
    const recentSearches = await getRecentSearches(limitNum);

    // Get popular searches (cached)
    const popular = await getPopularSearches(limitNum);

    // If we have a query, also get autocomplete suggestions
    let suggestions: Array<{ text: string; type: 'suggestion' | 'recent' | 'popular' }> = [];

    if (query) {
      // Add recent searches that match the query
      const recentMatches = recentSearches
        .filter(term => term.toLowerCase().includes((query as string).toLowerCase()))
        .map(term => ({ text: term, type: 'recent' as const }));

      // Add popular searches that match the query
      const popularMatches = popular
        .filter(item => item.term.toLowerCase().includes((query as string).toLowerCase()))
        .map(item => ({ text: item.term, type: 'popular' as const, count: item.count }));

      // Combine and deduplicate
      const allMatches = [...recentMatches, ...popularMatches];
      const seen = new Set();
      const uniqueMatches = allMatches.filter(item => {
        const key = item.text.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // If we don't have enough matches, generate some suggestions
      if (uniqueMatches.length < limitNum) {
        const productSuggestions = await getProductSuggestions(query as string, limitNum - uniqueMatches.length);
        uniqueMatches.push(...productSuggestions);
      }

      suggestions = uniqueMatches.slice(0, limitNum);
    } else {
      // If no query, return recent and popular searches
      suggestions = [
        ...recentSearches.map(term => ({ text: term, type: 'recent' as const })),
        ...popular.map(item => ({ text: item.term, type: 'popular' as const, count: item.count })),
      ].slice(0, limitNum);
    }

    return res.status(200).json({
      suggestions,
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    return res.status(500).json({ 
      error: 'An error occurred while fetching suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get recent searches (in a real app, this would be user-specific)
async function getRecentSearches(limit: number): Promise<string[]> {
  try {
    // In a real app, you would query a search history table
    // This is a simplified version that returns some recent searches
    return [
      'smartphone',
      'laptop',
      'wireless earbuds',
      'smartwatch',
      'bluetooth speaker',
    ].slice(0, limit);
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
}

// Helper function to get popular searches (cached)
async function getPopularSearches(limit: number): Promise<Array<{ term: string; count: number }>> {
  const now = Date.now();
  
  // Return cached results if still valid
  if (now - lastPopularUpdate < POPULAR_UPDATE_INTERVAL && popularSearches.length > 0) {
    return popularSearches.slice(0, limit);
  }

  try {
    // In a real app, you would query a search analytics table
    // This is a simplified version that returns some popular searches
    popularSearches = [
      { term: 'smartphone', count: 1250 },
      { term: 'laptop', count: 980 },
      { term: 'wireless earbuds', count: 750 },
      { term: 'smartwatch', count: 620 },
      { term: 'bluetooth speaker', count: 540 },
      { term: 'fitness tracker', count: 480 },
      { term: 'tablet', count: 420 },
      { term: 'gaming console', count: 390 },
      { term: 'wireless charger', count: 360 },
      { term: 'power bank', count: 330 },
    ];
    
    lastPopularUpdate = now;
    return popularSearches.slice(0, limit);
  } catch (error) {
    console.error('Error getting popular searches:', error);
    return [];
  }
}

// Helper function to generate product suggestions based on the query
async function getProductSuggestions(query: string, limit: number) {
  try {
    // Search for products that match the query
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        name: true,
        category: true,
      },
    });

    // Generate suggestions from product names and categories
    const suggestions = new Set<string>();
    
    // Add product names
    products.forEach(product => {
      if (product.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(product.name);
      }
    });
    
    // Add categories
    products.forEach(product => {
      if (product.category && product.category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(product.category);
      }
    });

    return Array.from(suggestions)
      .slice(0, limit)
      .map(text => ({ text, type: 'suggestion' as const }));
  } catch (error) {
    console.error('Error generating product suggestions:', error);
    return [];
  }
}
