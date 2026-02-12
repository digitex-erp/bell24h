import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { error: 'paymentId or orderId is required' },
        { status: 400 }
      );
    }

    // Find payment by ID or order ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: paymentId || undefined },
          { orderId: orderId || undefined }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        rfq: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        escrowEnabled: payment.escrowEnabled,
        escrowReleasedAt: payment.escrowReleasedAt,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt,
        refundedAt: payment.refundedAt,
        refundAmount: payment.refundAmount,
        refundReason: payment.refundReason,
        createdAt: payment.createdAt,
        user: payment.user,
        rfq: payment.rfq,
      }
    });

  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}