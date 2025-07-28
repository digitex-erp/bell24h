import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret_key',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, orderId, customerName, customerEmail, customerPhone } = body;

    // Validate required fields
    if (!amount || !currency || !orderId || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: currency,
      receipt: orderId,
      notes: {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        order_id: orderId,
        platform: 'BELL24H',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to create payment order' 
      },
      { status: 500 }
    );
  }
} 