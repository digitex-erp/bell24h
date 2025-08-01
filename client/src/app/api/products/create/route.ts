import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateTrafficPricing } from '@/lib/traffic-pricing';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      brand,
      description,
      images,
      basePrice,
      category,
      subcategory,
      specifications,
      userId,
    } = body;

    // Validate required fields
    if (!name || !brand || !basePrice || !category || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        trafficTier: true,
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate traffic-based pricing
    const pricingConfig = {
      basePrice: parseFloat(basePrice),
      impressions: 0, // New product starts with 0 impressions
      clicks: 0,
      conversions: 0,
      trafficTier: user.trafficTier,
      category,
      msmeDiscount: user.roles.includes('msme'),
    };

    const pricing = calculateTrafficPricing(pricingConfig);

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        brand,
        description,
        images: images || [],
        basePrice: pricingConfig.basePrice,
        trafficPrice: pricing.trafficPrice,
        msmePrice: pricing.msmePrice,
        category,
        subcategory: subcategory || '',
        specifications: specifications || {},
        userId,
        userRole: user.roles.includes('supplier') ? 'SUPPLIER' : 'BUYER',
        views: 0,
        impressions: 0,
        rfqCount: 0,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            brandName: true,
            logoUrl: true,
            trafficTier: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        description: product.description,
        images: product.images,
        basePrice: product.basePrice,
        trafficPrice: product.trafficPrice,
        msmePrice: product.msmePrice,
        category: product.category,
        subcategory: product.subcategory,
        specifications: product.specifications,
        views: product.views,
        impressions: product.impressions,
        rfqCount: product.rfqCount,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        user: product.user,
        pricing: {
          basePrice: pricing.basePrice,
          trafficPrice: pricing.trafficPrice,
          msmePrice: pricing.msmePrice,
          cpm: pricing.cpm,
          conversionRate: pricing.conversionRate,
          trafficMultiplier: pricing.trafficMultiplier,
          tierMultiplier: pricing.tierMultiplier,
        },
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      isActive: true,
    };

    if (userId) {
      where.userId = userId;
    }

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            brandName: true,
            logoUrl: true,
            trafficTier: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}