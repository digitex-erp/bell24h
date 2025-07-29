import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

// Initialize RazorpayX
const razorpayX = new Razorpay({
  key_id: process.env.RAZORPAYX_API_KEY || 'rzp_test_your_key_id',
  key_secret: process.env.RAZORPAYX_API_SECRET || 'your_razorpay_secret_key',
});

// GET - Fetch wallet data and transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = request.headers.get('user-id'); // Get from JWT token

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userid: userId },
    });

    if (!wallet) {
      // Create wallet for new user
      wallet = await prisma.wallet.create({
        data: {
          userid: userId,
          availablebalance: 0,
          totalbalance: 0,
          primarycurrency: 'INR',
        },
      });
    }

    if (type === 'transactions') {
      // Fetch transactions (implement transaction model)
      const transactions = []; // TODO: Implement transaction fetching
      return NextResponse.json({
        success: true,
        data: transactions,
      });
    }

    // Return wallet data
    return NextResponse.json({
      success: true,
      data: {
        balance: wallet.availablebalance || 0,
        currency: wallet.primarycurrency || 'INR',
        dailyLimit: 100000, // ₹1 lakh daily limit
        monthlyLimit: 1000000, // ₹10 lakh monthly limit
        isVerified: true, // TODO: Implement KYC verification
        bankAccount: null, // TODO: Link bank account
        bankName: null,
      },
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}

// POST - Add funds or withdraw
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, description } = body;
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    // Get wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userid: userId },
    });

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    if (type === 'DEPOSIT') {
      // Create RazorpayX payment link for deposit
      const paymentLink = await createRazorpayXPaymentLink(amount, userId);

      return NextResponse.json({
        success: true,
        data: {
          paymentLink: paymentLink.url,
          paymentId: paymentLink.id,
          amount: amount,
          message: 'Payment link generated successfully',
        },
      });
    }

    if (type === 'WITHDRAWAL') {
      // Check sufficient balance
      if ((wallet.availablebalance || 0) < amount) {
        return NextResponse.json(
          { success: false, error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Process withdrawal to linked bank account
      const withdrawal = await processWithdrawal(userId, amount);

      return NextResponse.json({
        success: true,
        data: {
          withdrawalId: withdrawal.id,
          amount: amount,
          message: 'Withdrawal initiated successfully',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid transaction type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Wallet POST error:', error);
    return NextResponse.json({ success: false, error: 'Transaction failed' }, { status: 500 });
  }
}

// Helper function to create RazorpayX payment link
async function createRazorpayXPaymentLink(amount: number, userId: string) {
  try {
    // Create payment link for wallet top-up
    const paymentLink = await razorpayX.paymentLink.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      description: 'Bell24h Wallet Top-up',
      reference_id: `wallet_${userId}_${Date.now()}`,
      callback_url: `${process.env.NEXTAUTH_URL}/api/wallet/callback`,
      callback_method: 'get',
    });

    return paymentLink;
  } catch (error) {
    console.error('RazorpayX payment link creation error:', error);
    throw new Error('Failed to create payment link');
  }
}

// Helper function to process withdrawal
async function processWithdrawal(userId: string, amount: number) {
  try {
    // Get user's linked bank account
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // TODO: Implement actual RazorpayX payout
    // This would require:
    // 1. User's linked bank account details
    // 2. RazorpayX fund account creation
    // 3. Payout API call

    // For now, simulate withdrawal
    const withdrawal = {
      id: `withdrawal_${Date.now()}`,
      amount: amount,
      status: 'processing',
    };

    // Update wallet balance
    await prisma.wallet.update({
      where: { userid: userId },
      data: {
        availablebalance: {
          decrement: amount,
        },
        totalbalance: {
          decrement: amount,
        },
      },
    });

    return withdrawal;
  } catch (error) {
    console.error('Withdrawal processing error:', error);
    throw new Error('Withdrawal failed');
  }
}
