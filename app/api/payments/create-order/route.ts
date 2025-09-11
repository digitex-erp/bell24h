// app/api/payments/create-order/route.ts - Production-ready Razorpay integration
import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '../../../../lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', description, orderId } = await request.json();

    // Validate inputs
    if (!amount || amount < 100) {
      return NextResponse.json({
        success: false,
        error: 'Minimum amount is ₹1.00'
      }, { status: 400 });
    }

    // Create Razorpay order using service
    const orderResult = await razorpayService.createOrder({
      amount,
      currency,
      receipt: orderId,
      notes: {
        description: description || 'Bell24h Service Payment'
      }
    });

    if (orderResult.success) {
      return NextResponse.json({
        success: true,
        order: orderResult.order,
        razorpayKey: razorpayService.getKeyId()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: orderResult.error,
        demoMode: true,
        demoOrder: {
          id: `order_demo_${Date.now()}`,
          amount: amount * 100,
          currency,
          status: 'created'
        }
      });
    }

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment order. Please try again.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Payment API Active',
    configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    currency: 'INR',
    minAmount: 100, // ₹1.00 in paise
    features: [
      'Order creation',
      'Payment verification',
      'Refund processing',
      'Webhook handling'
    ]
  });
}
