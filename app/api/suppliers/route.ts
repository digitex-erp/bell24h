import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const verified = searchParams.get('verified');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      role: 'SUPPLIER',
      isActive: true
    };
    
    if (category) {
      where.category = category;
    }
    
    if (verified === 'true') {
      where.verified = true;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch suppliers with pagination
    const [suppliers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          location: true,
          verified: true,
          createdAt: true,
          _count: {
            select: {
              rfqs: true,
              leads: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Add mock data for demonstration
    const suppliersWithMockData = suppliers.map(supplier => ({
      ...supplier,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      products: [
        'LED Bulbs',
        'Electrical Components',
        'Power Supplies',
        'Cables & Wires',
        'Switches & Outlets'
      ].slice(0, Math.floor(Math.random() * 5) + 1),
      category: category || 'electronics'
    }));

    const response = {
      suppliers: suppliersWithMockData,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch suppliers' 
    }, { status: 500 });
  }
}
