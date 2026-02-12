import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService, RevenueCatWebhookEvent } from '@/lib/subscription-service';
import crypto from 'crypto';

/**
 * RevenueCat Webhook Handler
 * POST /api/webhooks/revenuecat
 * 
 * Handles subscription events from RevenueCat
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('authorization');
    const body = await request.text();
    
    if (!verifyWebhookSignature(signature, body)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse webhook event
    let event: RevenueCatWebhookEvent;
    try {
      event = JSON.parse(body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    console.log(`Processing RevenueCat webhook: ${event.type} for user ${event.app_user_id}`);

    // Process the webhook event
    await subscriptionService.handleWebhook(event);

    // Log successful webhook processing
    console.log(`Successfully processed webhook: ${event.type}`);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('RevenueCat webhook error:', error);
    
    // Return 200 to prevent RevenueCat from retrying immediately
    // Log the error for monitoring
    return NextResponse.json(
      { 
        success: false, 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 }
    );
  }
}

/**
 * Verify webhook signature from RevenueCat
 */
function verifyWebhookSignature(signature: string | null, body: string): boolean {
  if (!signature) {
    console.warn('No webhook signature provided');
    return false;
  }

  // In production, verify against RevenueCat's webhook secret
  // For now, we'll accept webhooks without strict verification for development
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('No webhook secret configured - accepting webhook for development');
    return true;
  }

  try {
    // Extract signature from Authorization header
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    // RevenueCat uses Bearer token format
    const providedSignature = signature.replace('Bearer ', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Handle GET requests for webhook configuration
 * Used for webhook verification/setup
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    
    if (mode === 'verify') {
      // RevenueCat webhook verification endpoint
      return NextResponse.json({
        success: true,
        message: 'Webhook endpoint is active',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid request mode' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Webhook GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}