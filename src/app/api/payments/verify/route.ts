import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyRazorpayPayment, getRazorpayPayment } from '@/lib/razorpay';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, paymentId, signature' },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const isValidSignature = verifyRazorpayPayment(orderId, paymentId, signature);
    
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const razorpayPayment = await getRazorpayPayment(paymentId);

    // Find the payment record in our database
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        rfq: true,
        buyer: true,
        supplier: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment order not found' },
        { status: 404 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: razorpayPayment.status.toUpperCase(),
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        method: razorpayPayment.method,
        amountPaid: razorpayPayment.amount / 100, // Convert from paise
        fee: razorpayPayment.fee ? razorpayPayment.fee / 100 : null,
        tax: razorpayPayment.tax ? razorpayPayment.tax / 100 : null,
        updatedAt: new Date()
      }
    });

    // If payment is successful, update RFQ status and create success record
    if (razorpayPayment.status === 'captured') {
      // Update RFQ status to indicate payment completed
      await prisma.rfq.update({
        where: { id: payment.rfqId },
        data: { 
          status: 'CLOSED',
          updatedAt: new Date()
        }
      });

      // Create a success/completion record (you can customize this based on your business logic)
      // This could trigger notifications, update supplier ratings, etc.
      
      // Send webhook to n8n for payment success notification
      if (process.env.N8N_WEBHOOK_URL) {
        try {
          await fetch(`${process.env.N8N_WEBHOOK_URL}/payment-success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'payment_success',
              paymentId: payment.id,
              rfqId: payment.rfqId,
              buyerId: payment.buyerId,
              supplierId: payment.supplierId,
              amount: payment.amount,
              razorpayPaymentId: paymentId
            })
          });
        } catch (webhookError) {
          console.error('Failed to send webhook notification:', webhookError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        method: updatedPayment.method,
        razorpayPaymentId: updatedPayment.razorpayPaymentId,
        rfqId: updatedPayment.rfqId
      },
      razorpayPayment: {
        id: razorpayPayment.id,
        status: razorpayPayment.status,
        amount: razorpayPayment.amount,
        method: razorpayPayment.method,
        captured: razorpayPayment.captured
      }
    });

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}