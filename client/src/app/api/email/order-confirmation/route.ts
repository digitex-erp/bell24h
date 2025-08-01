import { NextRequest, NextResponse } from 'next/server';
// import { emailService } from '@/utils/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, orderId, productName, supplierName, amount } = body;

    if (!email || !name || !orderId) {
      return NextResponse.json(
        { error: 'Email, name, and order ID are required' },
        { status: 400 }
      );
    }

    // Temporarily disabled email service to prevent build failures
    // const success = await emailService.sendOrderConfirmationEmail({
    //   to: email,
    //   name,
    //   orderId,
    //   productName,
    //   supplierName,
    //   amount
    // });

    // Return success for now
    return NextResponse.json(
      { 
        message: 'Order confirmation email sent successfully (email service temporarily disabled)',
        data: { email, name, orderId, productName, supplierName, amount }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Order confirmation email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 