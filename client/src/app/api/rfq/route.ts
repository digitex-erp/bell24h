import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      quantity,
      unit,
      budget,
      deliveryDate,
      deliveryLocation,
      specifications,
      categoryId,
      attachments = [],
    } = body;

    // Validate required fields
    if (!title || !description || !quantity || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create RFQ
    const rfq = await prisma.rFQ.create({
      data: {
        title,
        description,
        quantity: parseInt(quantity),
        unit,
        budget: budget ? parseFloat(budget) : null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryLocation,
        specifications: specifications ? JSON.parse(JSON.stringify(specifications)) : null,
        attachments,
        buyerId: session.user.id,
        categoryId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json({ success: true, rfq });
  } catch (error) {
    console.error('RFQ creation error:', error);
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
          quotes: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rFQ.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      rfqs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('RFQ fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch RFQs' }, { status: 500 });
  }
}
