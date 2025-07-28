import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Configuration, OpenAIApi } from 'openai';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

  // Only allow POST requests for semantic search
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, filters = {}, limit = 10, offset = 0 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Step 1: Generate search embeddings using OpenAI
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data.data[0].embedding;

    // Step 2: Search for similar products using vector similarity
    // Note: This requires pgvector extension and the appropriate vector column in your database
    const products = await prisma.$queryRaw`
      SELECT 
        id, 
        name as title,
        description,
        category,
        images[1] as imageUrl,
        price,
        'product' as type,
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
      FROM "Product"
      WHERE ${queryEmbedding}::vector IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Step 3: Search for similar suppliers
    const suppliers = await prisma.$queryRaw`
      SELECT 
        id, 
        "companyName" as title,
        description,
        categories[1] as category,
        "logoUrl" as imageUrl,
        rating,
        'supplier' as type,
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
      FROM "Supplier"
      WHERE ${queryEmbedding}::vector IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Combine and sort results by similarity score
    const results = [...products, ...suppliers]
      .map(item => ({
        ...item,
        similarity: parseFloat(item.similarity),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    // Get total count for pagination
    const totalCount = results.length;

    return res.status(200).json({
      results,
      total: totalCount,
      hasMore: offset + results.length < totalCount,
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your semantic search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}
