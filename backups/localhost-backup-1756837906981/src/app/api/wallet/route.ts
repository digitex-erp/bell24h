import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'transactions') {
      // Mock transaction data
      const transactions = [
        {
          id: 1,
          type: 'credit',
          amount: 50000,
          description: 'Payment received for RFQ #1234',
          date: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: 2,
          type: 'debit',
          amount: 15000,
          description: 'Escrow payment for supplier order',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed'
        }
      ];

      return NextResponse.json({
        success: true,
        data: transactions,
        message: 'Transactions retrieved successfully'
      });
    }

    // Default wallet balance response
    const walletData = {
      balance: 125000,
      currency: 'INR',
      status: 'active',
      lastUpdated: new Date().toISOString(),
      pendingTransactions: 2,
      totalTransactions: 45
    };

    return NextResponse.json({
      success: true,
      data: walletData,
      message: 'Wallet information retrieved successfully'
    });

  } catch (error) {
    console.error('Wallet API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve wallet information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, description } = body;

    // Mock wallet action processing
    const result = {
      action,
      amount,
      description,
      transactionId: `TXN_${Date.now()}`,
      status: 'processing',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Wallet action processed successfully'
    });

  } catch (error) {
    console.error('Wallet POST API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process wallet action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
