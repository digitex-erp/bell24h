import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: {
        rfq: true,
        buyer: true,
        supplier: true
      }
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json({ error: 'Failed to get payment' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}