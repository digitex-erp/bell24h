/**
 * RevenueCat Integration API Routes
 * Complete backend integration for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { RevenueCatService } from '@/lib/revenuecat-config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/subscriptions/plans
 * Get available subscription plans
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching subscription plans...');
    
    // Get offerings from RevenueCat
    const offerings = await RevenueCatService.getOfferings();
    
    // Transform to our format
    const plans = offerings.current?.availablePackages?.map(pkg => ({
      identifier: pkg.identifier,
      displayName: pkg.product.title,
      description: pkg.product.description || 'Premium subscription plan',
      price: pkg.product.price,
      priceString: pkg.product.priceString,
      currencyCode: pkg.product.currencyCode,
      features: getPlanFeatures(pkg.identifier),
      isPopular: isPopularPlan(pkg.identifier)
    })) || [];

    return NextResponse.json({
      success: true,
      plans,
      totalPlans: plans.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to get subscription plans:', error);
    
    // Fallback to hardcoded plans if RevenueCat fails
    const fallbackPlans = Object.values(BELL24H_PLANS).map(plan => ({
      identifier: plan.identifier,
      displayName: plan.displayName,
      description: plan.features.join(', '),
      price: plan.price,
      priceString: plan.price > 0 ? `₹${plan.price.toLocaleString()}/month` : 'Free',
      currencyCode: 'INR',
      features: plan.features,
      isPopular: plan.isPopular
    }));

    return NextResponse.json({
      success: true,
      plans: fallbackPlans,
      fallback: true,
      message: 'Using fallback plans due to RevenueCat API error'
    });
  }
}

/**
 * POST /api/subscriptions/purchase
 * Process subscription purchase
 */
export async function POST(request: NextRequest) {
  try {
    const { packageId, userId } = await request.json();
    
    if (!packageId || !userId) {
      return NextResponse.json(
        { error: 'Package ID and User ID are required' },
        { status: 400 }
      );
    }

    console.log(`Processing purchase for user ${userId}, package ${packageId}`);

    // Process purchase through RevenueCat
    const purchaseResult = await RevenueCatService.purchasePackage(packageId);
    
    // Update user role in database
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        role: 'PREMIUM_USER',
        updatedAt: new Date()
      }
    });

    // Log subscription event
    await prisma.subscriptionEvent.create({
      data: {
        userId,
        action: 'purchased',
        plan: packageId,
        amount: purchaseResult.customerInfo?.price || 0,
        currency: 'INR',
        transactionId: purchaseResult.customerInfo?.transactionId,
        timestamp: new Date(),
        metadata: {
          revenuecatEvent: purchaseResult,
          environment: process.env.NODE_ENV
        }
      }
    });

    // Trigger n8n workflow for purchase confirmation
    await triggerN8NWorkflow('subscription-activated', {
      userId,
      plan: packageId,
      amount: purchaseResult.customerInfo?.price || 0,
      email: user.email,
      name: user.name
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription purchased successfully',
      data: {
        customerInfo: purchaseResult.customerInfo,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Purchase processing failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Purchase failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper functions
 */

function getPlanFeatures(packageIdentifier: string): string[] {
  const planMap: Record<string, string[]> = {
    'bell24h_free': ['3 RFQs/month', 'Basic matching', 'Email support'],
    'bell24h_starter_monthly': ['15 RFQs/month', 'AI matching', 'Voice RFQ', 'Priority support'],
    'bell24h_pro_monthly': ['Unlimited RFQs', 'Advanced AI', 'Voice & video', 'API access'],
    'bell24h_pro_yearly': ['Unlimited RFQs', 'Advanced AI', 'Voice & video', 'API access', '20% discount'],
    'bell24h_enterprise_yearly': ['Custom AI models', 'Full API', 'White-label', 'Dedicated support']
  };
  
  return planMap[packageIdentifier] || ['Basic features'];
}

function isPopularPlan(packageIdentifier: string): boolean {
  return packageIdentifier === 'bell24h_pro_monthly';
}

async function triggerN8NWorkflow(workflow: string, data: any) {
  try {
    const n8nWebhookUrl = `http://165.232.187.195:5678/webhook/${workflow}`;
    
    await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    console.log(`Triggered n8n workflow: ${workflow}`);
  } catch (error) {
    console.error(`Failed to trigger n8n workflow ${workflow}:`, error);
  }
}

/**
 * Fallback plans configuration
 */
const BELL24H_PLANS = {
  FREE: {
    identifier: 'bell24h_free',
    displayName: 'Free Plan',
    features: ['3 RFQs per month', 'Basic supplier matching', 'Email support'],
    price: 0,
    isPopular: false
  },
  STARTER_MONTHLY: {
    identifier: 'bell24h_starter_monthly',
    displayName: 'Starter Monthly',
    features: ['15 RFQs per month', 'AI-powered matching', 'Voice RFQ processing', 'Priority support'],
    price: 999,
    isPopular: false
  },
  PRO_MONTHLY: {
    identifier: 'bell24h_pro_monthly',
    displayName: 'Pro Monthly',
    features: ['Unlimited RFQs', 'Advanced AI matching', 'Voice & video RFQ', 'API access', 'Priority support'],
    price: 2999,
    isPopular: true
  },
  PRO_YEARLY: {
    identifier: 'bell24h_pro_yearly',
    displayName: 'Pro Yearly',
    features: ['Unlimited RFQs', 'Advanced AI matching', 'Voice & video RFQ', 'API access', '20% discount'],
    price: 29999,
    isPopular: false
  },
  ENTERPRISE_YEARLY: {
    identifier: 'bell24h_enterprise_yearly',
    displayName: 'Enterprise Yearly',
    features: ['Custom AI models', 'Full API access', 'White-label options', 'Dedicated support'],
    price: 299999,
    isPopular: false
  }
};