import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret_key')
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Payment is verified - you can now update your database
    // Here you would typically:
    // 1. Update order status to 'paid'
    // 2. Create transaction record
    // 3. Send confirmation email
    // 4. Update inventory

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      verified_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Payment verification failed' 
      },
      { status: 500 }
    );
  }
} 