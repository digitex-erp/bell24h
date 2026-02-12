import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyRazorpayWebhook, getRazorpayPayment } from '@/lib/razorpay';
import { RazorpayWebhookPayload } from '@/lib/razorpay';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Razorpay signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValidSignature = verifyRazorpayWebhook(body, signature);
    
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Parse the webhook payload
    const payload: RazorpayWebhookPayload = JSON.parse(body);
    const event = payload.event;
    const payment = payload.payload.payment.entity;

    console.log(`Processing Razorpay webhook: ${event}`, {
      paymentId: payment.id,
      orderId: payment.order_id,
      status: payment.status,
      amount: payment.amount
    });

    // Find the payment record in our database
    const dbPayment = await prisma.payment.findUnique({
      where: { orderId: payment.order_id },
      include: {
        rfq: true,
        buyer: true,
        supplier: true
      }
    });

    if (!dbPayment) {
      console.error('Payment order not found in database:', payment.order_id);
      return NextResponse.json(
        { error: 'Payment order not found' },
        { status: 404 }
      );
    }

    // Handle different payment events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payment, dbPayment);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(payment, dbPayment);
        break;
        
      case 'payment.refunded':
        await handlePaymentRefunded(payment, dbPayment);
        break;
        
      default:
        console.log(`Unhandled Razorpay event: ${event}`);
    }

    return NextResponse.json({ success: true, event: event });

  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(
  razorpayPayment: any,
  dbPayment: any
) {
  try {
    // Update payment status
    await prisma.payment.update({
      where: { id: dbPayment.id },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId: razorpayPayment.id,
        method: razorpayPayment.method,
        amountPaid: razorpayPayment.amount / 100,
        fee: razorpayPayment.fee ? razorpayPayment.fee / 100 : null,
        tax: razorpayPayment.tax ? razorpayPayment.tax / 100 : null,
        updatedAt: new Date()
      }
    });

    // Update RFQ status
    await prisma.rfq.update({
      where: { id: dbPayment.rfqId },
      data: { 
        status: 'CLOSED',
        updatedAt: new Date()
      }
    });

    // Send success notification to n8n
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/payment-captured`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'payment_captured',
            paymentId: dbPayment.id,
            rfqId: dbPayment.rfqId,
            buyerId: dbPayment.buyerId,
            supplierId: dbPayment.supplierId,
            amount: dbPayment.amount,
            razorpayPaymentId: razorpayPayment.id,
            method: razorpayPayment.method
          })
        });
      } catch (webhookError) {
        console.error('Failed to send webhook notification:', webhookError);
      }
    }

    console.log('Payment captured successfully:', razorpayPayment.id);

  } catch (error) {
    console.error('Error handling payment captured:', error);
    throw error;
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(
  razorpayPayment: any,
  dbPayment: any
) {
  try {
    // Update payment status
    await prisma.payment.update({
      where: { id: dbPayment.id },
      data: {
        status: 'FAILED',
        razorpayPaymentId: razorpayPayment.id,
        method: razorpayPayment.method,
        amountPaid: 0,
        updatedAt: new Date()
      }
    });

    // Send failure notification to n8n
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/payment-failed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'payment_failed',
            paymentId: dbPayment.id,
            rfqId: dbPayment.rfqId,
            buyerId: dbPayment.buyerId,
            amount: dbPayment.amount,
            razorpayPaymentId: razorpayPayment.id,
            errorCode: razorpayPayment.error_code,
            errorDescription: razorpayPayment.error_description
          })
        });
      } catch (webhookError) {
        console.error('Failed to send webhook notification:', webhookError);
      }
    }

    console.log('Payment failed:', razorpayPayment.id, razorpayPayment.error_description);

  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

/**
 * Handle payment refunded event
 */
async function handlePaymentRefunded(
  razorpayPayment: any,
  dbPayment: any
) {
  try {
    // Update payment status
    await prisma.payment.update({
      where: { id: dbPayment.id },
      data: {
        status: 'REFUNDED',
        updatedAt: new Date()
      }
    });

    // Send refund notification to n8n
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/payment-refunded`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'payment_refunded',
            paymentId: dbPayment.id,
            rfqId: dbPayment.rfqId,
            buyerId: dbPayment.buyerId,
            amount: dbPayment.amount,
            razorpayPaymentId: razorpayPayment.id
          })
        });
      } catch (webhookError) {
        console.error('Failed to send webhook notification:', webhookError);
      }
    }

    console.log('Payment refunded:', razorpayPayment.id);

  } catch (error) {
    console.error('Error handling payment refunded:', error);
    throw error;
  }
}