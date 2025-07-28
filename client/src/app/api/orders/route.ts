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
    const { quoteId, deliveryAddress, notes } = body;

    // Validate required fields
    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    // Get quote details
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: {
          include: {
            buyer: true,
          },
        },
        supplier: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check if quote is still valid
    if (quote.status !== 'SUBMITTED' || (quote.validUntil && quote.validUntil < new Date())) {
      return NextResponse.json({ error: 'Quote is no longer valid' }, { status: 400 });
    }

    // Check if user is the buyer of the RFQ
    if (quote.rfq.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only place orders for your own RFQs' },
        { status: 403 }
      );
    }

    // Calculate total amount and commission
    const totalAmount = quote.price * quote.quantity;
    const commissionRate = 0.025; // 2.5% commission
    const commissionAmount = totalAmount * commissionRate;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        quoteId,
        buyerId: session.user.id,
        supplierId: quote.supplierId,
        totalAmount,
        commissionRate,
        commissionAmount,
        deliveryAddress,
        notes,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quote: {
          include: {
            rfq: true,
            product: true,
          },
        },
      },
    });

    // Update quote status
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        amount: totalAmount,
        type: 'ORDER_PAYMENT',
        status: 'PENDING',
        description: `Payment for order ${orderNumber}`,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Get user role to filter orders
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role === 'BUYER') {
      where.buyerId = session.user.id;
    } else if (user?.role === 'SUPPLIER') {
      where.supplierId = session.user.id;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quote: {
            include: {
              rfq: true,
              product: true,
            },
          },
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
