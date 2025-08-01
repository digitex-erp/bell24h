import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Mock payment methods data (replace with actual database query)
    const paymentMethods = [
      {
        id: 1,
        type: 'Credit Card',
        last4: '1234',
        brand: 'Visa',
        isDefault: true
      },
      {
        id: 2,
        type: 'Debit Card',
        last4: '5678',
        brand: 'Mastercard',
        isDefault: false
      }
    ];

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Payment methods API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Here you would typically:
    // 1. Validate payment method data
    // 2. Process payment method with payment processor
    // 3. Store payment method in database
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment method added successfully' 
    });
  } catch (error) {
    console.error('Add payment method API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
