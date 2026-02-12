import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rfqId, amount, currency = 'INR', supplierId } = body;

    if (!rfqId || !amount) {
      return NextResponse.json({ error: 'Missing rfqId or amount' }, { status: 400 });
    }

    // Get the RFQ to verify it exists and get buyer info
    const rfq = await prisma.rfq.findUnique({
      where: { id: parseInt(rfqId) },
      include: { buyer: true }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // In test mode, we'll create a mock Razorpay order
    // In production, this would call Razorpay API
    const mockOrderId = `order_test_${Date.now()}`;
    const mockAmount = amount * 100; // Convert to paise

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        rfqId: parseInt(rfqId),
        buyerId: rfq.buyerId,
        supplierId: supplierId || 1, // Default to supplier ID 1 for testing
        amount: amount,
        currency: currency,
        razorpayOrderId: mockOrderId,
        status: 'PENDING',
        escrowStatus: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: mockAmount,
      currency: currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_example_key',
      paymentId: payment.id
    });

  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}