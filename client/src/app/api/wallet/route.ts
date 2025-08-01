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

    // Mock wallet data (replace with actual database query)
    const walletData = {
      balance: 1500.00,
      currency: 'INR',
      transactions: [
        {
          id: 1,
          type: 'credit',
          amount: 500.00,
          description: 'Payment received',
          date: '2024-01-15'
        },
        {
          id: 2,
          type: 'debit',
          amount: 200.00,
          description: 'Service fee',
          date: '2024-01-14'
        }
      ]
    };

    return NextResponse.json(walletData);
  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
