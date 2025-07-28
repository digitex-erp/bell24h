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
    const { rfqId, productId, price, quantity, deliveryDays, description, attachments = [] } = body;

    // Validate required fields
    if (!rfqId || !price || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if RFQ exists and is open
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.status !== 'OPEN') {
      return NextResponse.json({ error: 'RFQ is not open for quotes' }, { status: 400 });
    }

    // Check if supplier already submitted a quote for this RFQ
    const existingQuote = await prisma.quote.findUnique({
      where: {
        rfqId_supplierId: {
          rfqId,
          supplierId: session.user.id,
        },
      },
    });

    if (existingQuote) {
      return NextResponse.json(
        { error: 'You have already submitted a quote for this RFQ' },
        { status: 400 }
      );
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId: session.user.id,
        productId,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        deliveryDays: deliveryDays ? parseInt(deliveryDays) : null,
        description,
        attachments,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        rfq: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        product: true,
      },
    });

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('Quote creation error:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (rfqId) {
      where.rfqId = rfqId;
    }

    if (status) {
      where.status = status;
    }

    // If user is a supplier, show their quotes
    // If user is a buyer, show quotes for their RFQs
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role === 'SUPPLIER') {
      where.supplierId = session.user.id;
    } else if (user?.role === 'BUYER') {
      where.rfq = {
        buyerId: session.user.id,
      };
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          rfq: {
            include: {
              buyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          product: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Quote fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
