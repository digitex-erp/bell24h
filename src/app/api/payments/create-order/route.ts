import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createRazorpayOrder } from '@/lib/razorpay';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency = 'INR', 
      receipt, 
      rfqId, 
      buyerId, 
      supplierId,
      notes = {}
    } = body;

    // Validate required fields
    if (!amount || !rfqId || !buyerId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, rfqId, buyerId' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify RFQ exists and belongs to the buyer
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: { buyer: true }
    });

    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      );
    }

    if (rfq.buyerId !== buyerId) {
      return NextResponse.json(
        { error: 'RFQ does not belong to this buyer' },
        { status: 403 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(
      amount,
      currency,
      receipt || `rfq-${rfqId}-${Date.now()}`,
      {
        rfqId: rfqId.toString(),
        buyerId: buyerId.toString(),
        supplierId: supplierId?.toString() || '',
        ...notes
      }
    );

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency,
        orderId: razorpayOrder.id,
        status: 'PENDING',
        rfqId,
        buyerId,
        supplierId: supplierId || null,
        razorpayOrderId: razorpayOrder.id,
        notes: JSON.stringify(notes),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        orderId: payment.orderId
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}