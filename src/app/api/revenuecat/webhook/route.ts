/**
 * RevenueCat Webhook Handler
 * Securely process RevenueCat webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { subscriptionService } from '@/services/subscription-service';

/**
 * Verify webhook signature from RevenueCat
 */
function verifySignature(signature: string | null, body: string): boolean {
  if (!signature || !body) {
    console.error('Missing signature or body');
    return false;
  }

  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return false;
  }

  try {
    // RevenueCat uses HMAC-SHA256 for webhook verification
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    // Compare signatures (allow for different formats)
    const isValid = signature === expectedSignature || 
                   signature === `sha256=${expectedSignature}` ||
                   signature === `Bearer ${expectedSignature}`;

    console.log('Webhook signature verification:', isValid);
    return isValid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Handle RevenueCat webhook events
 */
async function handleRevenueCatEvent(event: any) {
  const { type, app_user_id, product_id } = event;
  
  console.log(`Processing RevenueCat event: ${type} for user ${app_user_id}`);
  
  // Process different event types
  switch (type) {
    case 'INITIAL_PURCHASE':
      await handleInitialPurchase(app_user_id, product_id, event);
      break;
      
    case 'RENEWAL':
      await handleRenewal(app_user_id, product_id, event);
      break;
      
    case 'CANCELLATION':
      await handleCancellation(app_user_id, product_id, event);
      break;
      
    case 'EXPIRATION':
      await handleExpiration(app_user_id, product_id, event);
      break;
      
    case 'BILLING_ISSUE':
      await handleBillingIssue(app_user_id, product_id, event);
      break;
      
    case 'PRODUCT_CHANGE':
      await handleProductChange(app_user_id, product_id, event);
      break;
      
    case 'UNCANCELLATION':
      await handleUncancellation(app_user_id, product_id, event);
      break;
      
    case 'NON_RENEWING_PURCHASE':
      await handleNonRenewingPurchase(app_user_id, product_id, event);
      break;
      
    default:
      console.log(`Unhandled event type: ${type}`);
  }
  
  // Trigger n8n workflow for analytics and notifications
  await triggerN8NWorkflow(event);
}

/**
 * Event-specific handlers
 */

async function handleInitialPurchase(userId: string, productId: string, event: any) {
  try {
    console.log(`Handling initial purchase for user ${userId}, product ${productId}`);
    
    // Update user subscription status
    await subscriptionService.handleWebhook(event);
    
    console.log(`Initial purchase completed for user ${userId}`);
    
  } catch (error) {
    console.error('Initial purchase handling failed:', error);
    throw error;
  }
}

async function handleRenewal(userId: string, productId: string, event: any) {
  try {
    console.log(`Handling renewal for user ${userId}, product ${productId}`);
    
    // Update user subscription status
    await subscriptionService.handleWebhook(event);
    
    console.log(`Renewal completed for user ${userId}`);
    
  } catch (error) {
    console.error('Renewal handling failed:', error);
    throw error;
  }
}

async function handleCancellation(userId: string, productId: string, event: any) {
  try {
    console.log(`Handling cancellation for user ${userId}, product ${productId}`);
    
    // Update user subscription status
    await subscriptionService.handleWebhook(event);
    
    console.log(`Cancellation completed for user ${userId}`);
    
  } catch (error) {
    console.error('Cancellation handling failed:', error);
    throw error;
  }
}

async function handleExpiration(userId: string, productId: string, event: any) {
  try {
    console.log(`Handling expiration for user ${userId}, product ${productId}`);
    
    // Update user subscription status
    await subscriptionService.handleWebhook(event);
    
    console.log(`Expiration completed for user ${userId}`);
    
  } catch (error) {
    console.error('Expiration handling failed:', error);
    throw error;
  }
}

async function handleBillingIssue(userId: string, productId: string, event: any) {
  try {
    console.log(`Handling billing issue for user ${userId}, product ${productId}`);
    
    // Update user subscription status
    await subscriptionService.handleWebhook(event);
    
    console.log(`Billing issue handled for user ${userId}`);
    
  } catch (error) {
    console.error('Billing issue handling failed:', error);
    throw error;
  }
}

async function handleProductChange(userId: string, productId: string, event: any) {
  try {
    console.log(`Handling product change for user ${userId}, new product ${productId}`);
    
    // Update user subscription status
    await subscriptionService.handleWebhook(event);
    
    console.log(`Product change completed for user ${userId}`);
    
  } catch (error) {
    console.error('Product change handling failed:', error);
    throw error;
  }
}

async function handleUncancellation(userId: string, productId: string, event: any) {
  try {
    console.log(`Handling uncancellation for user ${userId}, product ${productId}`);
    
    // Update user subscription status
    await subscriptionService.handleWebhook(event);
    
    console.log(`Uncancellation completed for user ${userId}`);
    
  } catch (error) {
    console.error('Uncancellation handling failed:', error);
    throw error;
  }
}

async function handleNonRenewingPurchase(userId: string, productId: string, event: any) {
  try {
    console.log(`Handling non-renewing purchase for user ${userId}, product ${productId}`);
    
    // Update user subscription status
    await subscriptionService.handleWebhook(event);
    
    console.log(`Non-renewing purchase completed for user ${userId}`);
    
  } catch (error) {
    console.error('Non-renewing purchase handling failed:', error);
    throw error;
  }
}

/**
 * Trigger n8n workflow for analytics and notifications
 */
async function triggerN8NWorkflow(event: any) {
  try {
    const workflowMap: Record<string, string> = {
      'INITIAL_PURCHASE': 'subscription-activated',
      'RENEWAL': 'subscription-renewed',
      'CANCELLATION': 'subscription-cancelled',
      'EXPIRATION': 'subscription-expired',
      'BILLING_ISSUE': 'billing-issue',
      'PRODUCT_CHANGE': 'subscription-changed',
      'UNCANCELLATION': 'subscription-reactivated',
      'NON_RENEWING_PURCHASE': 'one-time-purchase'
    };
    
    const workflowName = workflowMap[event.type];
    if (workflowName) {
      const n8nWebhookUrl = `http://165.232.187.195:5678/webhook/${workflowName}`;
      
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      console.log(`Triggered n8n workflow: ${workflowName}`);
    }
    
  } catch (error) {
    console.error(`Failed to trigger n8n workflow for event ${event.type}:`, error);
    // Don't throw error - workflow failure shouldn't break the main flow
  }
}

/**
 * POST /api/revenuecat/webhook
 * Main webhook endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('authorization') || 
                     request.headers.get('x-revenuecat-signature') ||
                     request.headers.get('RevenueCat-Signature');
    
    console.log('Received RevenueCat webhook');
    console.log('Signature:', signature);
    console.log('Body length:', body.length);

    // Verify webhook signature
    if (!verifySignature(signature, body)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event type:', event.type);
    console.log('Event data:', JSON.stringify(event, null, 2));

    // Process the webhook event
    await handleRevenueCatEvent(event);
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    });
    
  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Webhook failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}