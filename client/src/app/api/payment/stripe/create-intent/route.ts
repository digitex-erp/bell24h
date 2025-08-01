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
    const { amount, currency = 'inr', customerEmail, metadata = {} } = body;

    // Validate required fields
    if (!amount || !customerEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: amount, customerEmail' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      customer_email: customerEmail,
      metadata: {
        platform: 'BELL24H',
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error: any) {
    console.error('Stripe payment intent creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to create payment intent' 
      },
      { status: 500 }
    );
  }
} 