import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get Supabase session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rfqId, productId, price, quantity, deliveryTime, notes } = body;

    // Validate required fields
    if (!rfqId || !productId || !price || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if RFQ exists and is still open
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: { buyer: true },
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.status !== 'OPEN') {
      return NextResponse.json({ error: 'RFQ is no longer accepting quotes' }, { status: 400 });
    }

    // Check if user is a supplier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Only suppliers can submit quotes' }, { status: 403 });
    }

    // Check if supplier has already quoted for this RFQ
    const existingQuote = await prisma.quote.findFirst({
      where: {
        rfqId,
        supplierId: session.user.id,
      },
    });

    if (existingQuote) {
      return NextResponse.json({ error: 'You have already submitted a quote for this RFQ' }, { status: 400 });
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        rfqId,
        supplierId: session.user.id,
        productId,
        price,
        quantity,
        deliveryTime,
        notes,
        status: 'SUBMITTED',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        rfq: true,
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
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
    // Get Supabase session
    const { data: { session } } = await supabase.auth.getSession();

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

    // Get user role to filter quotes
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role === 'BUYER') {
      // Buyers can see quotes for their RFQs
      where.rfq = {
        buyerId: session.user.id,
      };
    } else if (user?.role === 'SUPPLIER') {
      // Suppliers can see their own quotes
      where.supplierId = session.user.id;
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
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
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
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
