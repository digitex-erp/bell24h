import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// In-memory cache for popular searches
let cachedPopularSearches: Array<{ term: string; count: number }> = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 3600000; // 1 hour in milliseconds

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

  // Only allow GET requests for popular searches
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '10' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);

    // Check if we have a valid cache
    const now = Date.now();
    if (now - lastCacheUpdate < CACHE_TTL && cachedPopularSearches.length > 0) {
      return res.status(200).json({
        popularSearches: cachedPopularSearches.slice(0, limitNum),
        lastUpdated: new Date(lastCacheUpdate).toISOString(),
      });
    }

    // Fetch popular searches from the database
    // In a real implementation, you would query a search analytics table
    // This is a simplified version with mock data
    const popularSearches = await getPopularSearchesFromDB(limitNum);

    // Update cache
    cachedPopularSearches = popularSearches;
    lastCacheUpdate = now;

    return res.status(200).json({
      popularSearches,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    return res.status(500).json({ 
      error: 'An error occurred while fetching popular searches',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to get popular searches from the database
async function getPopularSearchesFromDB(limit: number): Promise<Array<{ term: string; count: number }>> {
  try {
    // In a production environment, you would query a search analytics table
    // This is a simplified mock implementation
    return [
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
    ].slice(0, limit);
  } catch (error) {
    console.error('Error getting popular searches from DB:', error);
    return [];
  }
}

// Helper function to log a search (call this when a search is performed)
export async function logSearch(term: string) {
  if (!term || typeof term !== 'string' || term.trim() === '') {
    return;
  }

  const normalizedTerm = term.trim().toLowerCase();
  
  try {
    // In a real implementation, you would increment a counter in your database
    // This is a simplified version that updates the in-memory cache
    const existingIndex = cachedPopularSearches.findIndex(item => item.term.toLowerCase() === normalizedTerm);
    
    if (existingIndex >= 0) {
      // Update existing term count
      cachedPopularSearches[existingIndex].count += 1;
    } else {
      // Add new term
      cachedPopularSearches.push({ term: normalizedTerm, count: 1 });
    }
    
    // Sort by count in descending order
    cachedPopularSearches.sort((a, b) => b.count - a.count);
    
    // Keep only the top N terms
    cachedPopularSearches = cachedPopularSearches.slice(0, 100);
    
    // Update last cache update time
    lastCacheUpdate = Date.now();
  } catch (error) {
    console.error('Error logging search:', error);
  }
}
