import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if Stripe is properly configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payments will not work.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
}) : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' 
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { paymentIntentId, paymentMethodId } = body;

    // Validate required fields
    if (!paymentIntentId || !paymentMethodId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: paymentIntentId, paymentMethodId' },
        { status: 400 }
      );
    }

    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    });

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: paymentIntent.customer,
    });
  } catch (error: any) {
    console.error('Stripe payment confirmation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to confirm payment' 
      },
      { status: 500 }
    );
  }
} 