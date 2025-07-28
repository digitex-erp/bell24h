import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for logging
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { term, filters, resultCount = 0 } = req.body;

    if (!term || typeof term !== 'string' || term.trim() === '') {
      return res.status(400).json({ error: 'Search term is required' });
    }

    // In a real implementation, you would:
    // 1. Get user ID from session/token if authenticated
    // 2. Log the search with user ID, IP, timestamp, etc.
    // 3. Update search analytics
    
    // For now, we'll just log to the console
    console.log(`Search logged: ${term}`, { 
      filters, 
      resultCount,
      timestamp: new Date().toISOString(),
      // userAgent: req.headers['user-agent'],
      // ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging search:', error);
    return res.status(500).json({ 
      error: 'An error occurred while logging the search',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to log a search (can be imported and used elsewhere)
export async function logSearch(term: string, filters: any = {}, resultCount: number = 0) {
  try {
    // In a real implementation, you would send this to your logging service
    // or save it to your database
    console.log(`Search logged: ${term}`, { 
      filters, 
      resultCount,
      timestamp: new Date().toISOString(),
    });
    
    // Example of saving to database (uncomment and implement as needed)
    /*
    await prisma.searchLog.create({
      data: {
        term,
        filters: JSON.stringify(filters),
        resultCount,
        // userId: userId || null,
        // ipAddress,
        // userAgent,
      },
    });
    */
  } catch (error) {
    console.error('Error in logSearch helper:', error);
  }
}
