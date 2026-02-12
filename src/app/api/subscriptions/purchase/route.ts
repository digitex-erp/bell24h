import { NextRequest, NextResponse } from 'next/server';
import { getRevenueCatClient } from '@/lib/revenuecat';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * Purchase a subscription
 * POST /api/subscriptions/purchase
 * 
 * Body: { packageId: string, userId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const { packageId, userId } = await request.json();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Purchase subscription through RevenueCat
    const revenueCat = getRevenueCatClient(
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    );
    
    const result = await revenueCat.purchaseSubscription(packageId, user.id);
    
    // Update user role if needed
    if (result.subscriptionStatus === 'active') {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          role: 'PREMIUM_USER',
          updatedAt: new Date()
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      subscription: result,
      user: {
        id: user.id,
        email: user.email,
        role: 'PREMIUM_USER'
      }
    });

  } catch (error) {
    console.error('Purchase Subscription API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to purchase subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Restore purchases
 * PUT /api/subscriptions/purchase
 */
export async function PUT(request: NextRequest) {
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
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Restore purchases through RevenueCat
    const revenueCat = getRevenueCatClient(
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    );
    
    const result = await revenueCat.restorePurchases();
    
    return NextResponse.json({
      success: true,
      subscription: result
    });

  } catch (error) {
    console.error('Restore Purchases API Error:', error);
    return NextResponse.json(
      { error: 'Failed to restore purchases' },
      { status: 500 }
    );
  }
}