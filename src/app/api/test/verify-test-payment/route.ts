import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, amount } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: 'Missing orderId or paymentId' }, { status: 400 });
    }

    // Find the payment by Razorpay order ID
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: {
        rfq: true,
        buyer: true
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // In test mode, we'll simulate a successful payment verification
    // In production, this would verify the signature with Razorpay
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId: paymentId,
        razorpaySignature: signature || 'test_signature',
        amountPaid: amount || payment.amount,
        escrowStatus: 'PENDING'
      }
    });

    // Update RFQ status to indicate payment received
    await prisma.rfq.update({
      where: { id: payment.rfqId },
      data: { status: 'PAYMENT_COMPLETED' }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        escrowStatus: updatedPayment.escrowStatus
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}