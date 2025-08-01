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
    const { title, description, category, quantity, unit, budget, deliveryLocation, deadline, requirements } = body;

    // Validate required fields
    if (!title || !description || !category || !quantity || !unit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is a buyer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'BUYER') {
      return NextResponse.json({ error: 'Only buyers can create RFQs' }, { status: 403 });
    }

    // Generate RFQ number
    const rfqNumber = `RFQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create RFQ
    const rfq = await prisma.rfq.create({
      data: {
        rfqNumber,
        title,
        description,
        category,
        quantity,
        unit,
        budget,
        deliveryLocation,
        deadline: deadline ? new Date(deadline) : null,
        requirements,
        buyerId: session.user.id,
        status: 'OPEN',
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
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
    // Get Supabase session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (location) {
      where.deliveryLocation = location;
    }

    // Get user role to filter RFQs
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role === 'BUYER') {
      // Buyers can see their own RFQs
      where.buyerId = session.user.id;
    } else if (user?.role === 'SUPPLIER') {
      // Suppliers can see open RFQs in their category
      where.status = 'OPEN';
      // Add category filtering based on supplier's categories
      // This would need to be implemented based on supplier profile
    }

    const [rfqs, total] = await Promise.all([
      prisma.rfq.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
          quotes: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rfq.count({ where }),
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
