import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { getRevenueCatClient } from '@/lib/revenuecat';

/**
 * Enhanced RFQ creation with subscription checks
 * POST /api/rfqs/create
 * 
 * Validates user subscription limits before creating RFQ
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      categoryId, 
      title, 
      description, 
      type, 
      location, 
      quantity,
      budget,
      deadline,
      attachments,
      requirements 
    } = body;

    // Validate required fields
    if (!categoryId || !title || !type || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: categoryId, title, type, location' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { 
        id: true, 
        email: true, 
        role: true,
        company: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check subscription limits
    const revenueCat = getRevenueCatClient(
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    );
    
    const rfqLimit = await revenueCat.canCreateRFQ(user.id);
    
    if (!rfqLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'RFQ limit exceeded',
          details: {
            limit: rfqLimit.limit,
            used: rfqLimit.used,
            remaining: rfqLimit.remaining,
            message: `You have reached your monthly RFQ limit of ${rfqLimit.limit}. Please upgrade your subscription to create more RFQs.`
          }
        },
        { status: 403 }
      );
    }

    // Get current plan for AI features
    const currentPlan = await revenueCat.getCurrentPlan(user.id);
    const hasAIFeatures = currentPlan.identifier !== 'bell24h_free';

    // Create RFQ
    const rfq = await prisma.rfq.create({
      data: {
        userId: user.id,
        categoryId,
        title,
        description: description || '',
        type,
        status: 'active',
        location,
        quantity: quantity || 1,
        budget: budget || null,
        deadline: deadline ? new Date(deadline) : null,
        attachments: attachments || [],
        requirements: requirements || {},
        // Track subscription-based features
        features: {
          aiProcessed: hasAIFeatures,
          voiceEnabled: currentPlan.identifier === 'bell24h_pro_monthly' || 
                       currentPlan.identifier === 'bell24h_enterprise_yearly',
          prioritySupport: currentPlan.identifier !== 'bell24h_free'
        }
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            company: true,
            role: true
          }
        }
      }
    });

    // Track RFQ creation for subscription analytics
    await revenueCat.trackRFQCreation(user.id, rfq.id);

    // Log webhook event for n8n (email notifications only)
    await prisma.webhook.create({
      data: { 
        eventType: 'rfq.created', 
        payload: {
          rfqId: rfq.id,
          userId: user.id,
          userEmail: user.email,
          userCompany: user.company,
          title: rfq.title,
          category: rfq.category.name,
          type: rfq.type,
          location: rfq.location,
          budget: rfq.budget,
          deadline: rfq.deadline,
          plan: currentPlan.identifier,
          hasAIFeatures
        }, 
        status: 'pending' 
      }
    });

    // Process with AI if user has premium features
    if (hasAIFeatures) {
      // Queue AI processing (non-blocking)
      setImmediate(async () => {
        try {
          await processRFQWithAI(rfq, currentPlan);
        } catch (error) {
          console.error('AI processing error:', error);
          // Don't fail the RFQ creation if AI processing fails
        }
      });
    }

    return NextResponse.json({
      success: true,
      rfq,
      subscription: {
        plan: currentPlan.identifier,
        remainingRfqs: rfqLimit.remaining,
        hasAIFeatures
      },
      message: 'RFQ created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Enhanced RFQ Creation Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create RFQ',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Process RFQ with AI features based on subscription plan
 */
async function processRFQWithAI(rfq: any, plan: any) {
  // Import AI services dynamically to avoid circular dependencies
  const { categorizeRFQ } = await import('@/lib/ai-services');
  
  try {
    // Categorize RFQ automatically
    const category = await categorizeRFQ(`${rfq.title} ${rfq.description}`);
    
    // Update RFQ with AI insights
    await prisma.rfq.update({
      where: { id: rfq.id },
      data: {
        aiInsights: {
          category,
          confidence: 0.85,
          processedAt: new Date(),
          features: ['categorization']
        }
      }
    });

    console.log(`AI processed RFQ ${rfq.id}: Category ${category}`);
  } catch (error) {
    console.error('AI processing failed for RFQ:', rfq.id, error);
  }
}

/**
 * Get user's RFQ usage statistics
 * GET /api/rfqs/create
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get subscription info
    const revenueCat = getRevenueCatClient(
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    );
    
    const [rfqLimit, currentPlan] = await Promise.all([
      revenueCat.canCreateRFQ(user.id),
      revenueCat.getCurrentPlan(user.id)
    ]);

    // Get this month's RFQ count
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const rfqsThisMonth = await prisma.rfq.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    return NextResponse.json({
      success: true,
      usage: {
        current: rfqsThisMonth,
        limit: rfqLimit.limit,
        remaining: Math.max(0, rfqLimit.limit - rfqsThisMonth),
        unlimited: rfqLimit.limit === -1
      },
      plan: currentPlan,
      canCreateRFQ: rfqLimit.allowed
    });

  } catch (error) {
    console.error('RFQ Usage Stats Error:', error);
    return NextResponse.json(
      { error: 'Failed to get usage statistics' },
      { status: 500 }
    );
  }
}