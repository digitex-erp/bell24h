import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'transactions') {
      // Get real transactions from database - using Payment model instead
      const transactions = await prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          date: t.createdAt,
          status: t.status,
          currency: t.currency
        })),
        message: 'Transactions retrieved successfully'
      });
    }

    // Get real wallet data from database
    const walletData = await prisma.wallet.findFirst({
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!walletData) {
      // Create default wallet if none exists
      const defaultWallet = await prisma.wallet.create({
        data: {
          balance: 0,
          totalbalance: 0,
          availablebalance: 0,
          userid: 'default-user-id' // This will be updated when user auth is implemented
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          balance: defaultWallet.balance,
          currency: 'INR',
          status: 'active',
          lastUpdated: defaultWallet.updatedAt,
          pendingTransactions: 0,
          totalTransactions: 0
        },
        message: 'Wallet information retrieved successfully'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: walletData.balance,
        currency: 'INR',
        status: 'active',
        lastUpdated: walletData.updatedAt,
        pendingTransactions: await prisma.transaction.count({
          where: { status: 'PENDING' }
        }),
        totalTransactions: await prisma.transaction.count()
      },
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

    // Create real transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        transactionid: `TXN_${Date.now()}`,
        amount: parseFloat(amount),
        type: action,
        description: description,
        status: 'COMPLETED',
        currency: 'INR',
        walletid: 'default-wallet-id' // This will be updated when user auth is implemented
      }
    });

    // Update wallet balance if it's a deposit
    if (action === 'DEPOSIT') {
      await prisma.wallet.updateMany({
        where: { id: 'default-wallet-id' },
        data: {
          balance: { increment: parseFloat(amount) },
          totalbalance: { increment: parseFloat(amount) },
          availablebalance: { increment: parseFloat(amount) }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        amount,
        description,
        transactionId: transaction.transactionid,
        status: transaction.status,
        timestamp: transaction.createdAt
      },
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
