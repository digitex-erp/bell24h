import { NextRequest, NextResponse } from 'next/server';
import { getRevenueCatClient, BELL24H_PLANS } from '@/lib/revenuecat';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * Get current user's subscription info
 * GET /api/subscriptions/current
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get subscription info from RevenueCat
    const revenueCat = getRevenueCatClient(
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    );
    
    const subscriptionInfo = await revenueCat.getSubscriberInfo(user.id);
    
    return NextResponse.json({
      success: true,
      subscription: subscriptionInfo,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Subscription API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get available subscription plans
 * GET /api/subscriptions/plans
 */
export async function getPlans(request: NextRequest) {
  try {
    const revenueCat = getRevenueCatClient(
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    );
    
    const products = await revenueCat.getProducts();
    
    return NextResponse.json({
      success: true,
      plans: BELL24H_PLANS,
      availableProducts: products
    });

  } catch (error) {
    console.error('Plans API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check RFQ creation limits
 * GET /api/subscriptions/check-rfq-limit
 */
export async function checkRfqLimit(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check RFQ limits
    const revenueCat = getRevenueCatClient(
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    );
    
    const rfqLimit = await revenueCat.canCreateRFQ(user.id);
    
    return NextResponse.json({
      success: true,
      rfqLimit
    });

  } catch (error) {
    console.error('RFQ Limit Check Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}