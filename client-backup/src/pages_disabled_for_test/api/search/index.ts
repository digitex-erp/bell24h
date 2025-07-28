import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q: query, category, limit = '10', offset = '0' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);
    const offsetNum = parseInt(offset as string, 10) || 0;

    // Search products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query as string, mode: 'insensitive' } },
          { description: { contains: query as string, mode: 'insensitive' } },
        ],
        ...(category && { category: { equals: category as string } }),
      },
      take: limitNum,
      skip: offsetNum,
      include: {
        supplier: true,
      },
    });

    // Search suppliers
    const suppliers = await prisma.supplier.findMany({
      where: {
        OR: [
          { companyName: { contains: query as string, mode: 'insensitive' } },
          { description: { contains: query as string, mode: 'insensitive' } },
        ],
        ...(category && { categories: { has: category as string } }),
      },
      take: limitNum,
      skip: offsetNum,
    });

    // Search RFQs (if applicable)
    const rfqs = await prisma.rFQ.findMany({
      where: {
        OR: [
          { title: { contains: query as string, mode: 'insensitive' } },
          { description: { contains: query as string, mode: 'insensitive' } },
        ],
        ...(category && { category: { equals: category as string } }),
      },
      take: limitNum,
      skip: offsetNum,
      include: {
        user: true,
      },
    });

    // Format results
    const results = [
      ...products.map((product) => ({
        id: product.id,
        type: 'product',
        title: product.name,
        description: product.description,
        category: product.category,
        imageUrl: product.images?.[0],
        price: product.price,
        supplier: product.supplier?.companyName,
        createdAt: product.createdAt,
      })),
      ...suppliers.map((supplier) => ({
        id: supplier.id,
        type: 'supplier',
        title: supplier.companyName,
        description: supplier.description,
        category: supplier.categories?.[0],
        imageUrl: supplier.logoUrl,
        rating: supplier.rating,
        location: supplier.location,
      })),
      ...rfqs.map((rfq) => ({
        id: rfq.id,
        type: 'rfq',
        title: rfq.title,
        description: rfq.description,
        category: rfq.category,
        status: rfq.status,
        user: rfq.user?.name,
        createdAt: rfq.createdAt,
      })),
    ];

    // Sort by relevance (simple implementation - could be enhanced with full-text search)
    results.sort((a, b) => {
      // Simple relevance scoring (could be enhanced)
      const getScore = (item: any) => {
        let score = 0;
        if (item.title?.toLowerCase().includes((query as string).toLowerCase())) {
          score += 2;
        }
        if (item.description?.toLowerCase().includes((query as string).toLowerCase())) {
          score += 1;
        }
        return score;
      };
      return getScore(b) - getScore(a);
    });

    // Get total count for pagination
    const totalCount = results.length;

    return res.status(200).json({
      results: results.slice(0, limitNum),
      total: totalCount,
      hasMore: offsetNum + results.length < totalCount,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to handle text search with Supabase (if using Postgres full-text search)
async function searchWithSupabase(query: string, category?: string, limit = 10, offset = 0) {
  try {
    // This is a placeholder for Supabase full-text search implementation
    // You would need to set up the appropriate tables and search functions in Supabase
    return [];
  } catch (error) {
    console.error('Supabase search error:', error);
    return [];
  }
}
