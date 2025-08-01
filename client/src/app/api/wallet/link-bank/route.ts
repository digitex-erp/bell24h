import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

// Initialize RazorpayX
const razorpayX = new Razorpay({
  key_id: process.env.RAZORPAYX_API_KEY || 'rzp_test_your_key_id',
  key_secret: process.env.RAZORPAYX_API_SECRET || 'your_razorpay_secret_key',
});

// POST - Link bank account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountNumber, ifscCode, accountHolderName, accountType = 'savings' } = body;

    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!accountNumber || !ifscCode || !accountHolderName) {
      return NextResponse.json(
        { success: false, error: 'Missing required bank details' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Create RazorpayX contact
    const contact = await razorpayX.contacts.create({
      name: accountHolderName,
      email: user.email,
      contact: user.phone || '',
      type: 'customer',
      reference_id: `contact_${userId}`,
    });

    // Create RazorpayX fund account
    const fundAccount = await razorpayX.fundAccounts.create({
      contact_id: contact.id,
      account_type: 'bank_account',
      bank_account: {
        name: accountHolderName,
        ifsc: ifscCode,
        account_number: accountNumber,
      },
    });

    // Update user with bank account details
    await prisma.user.update({
      where: { id: userId },
      data: {
        razorpay_contact_id: contact.id,
        razorpay_fund_account_id: fundAccount.id,
        bank_account_number: accountNumber,
        bank_ifsc_code: ifscCode,
        bank_account_holder: accountHolderName,
        bank_account_type: accountType,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        contactId: contact.id,
        fundAccountId: fundAccount.id,
        message: 'Bank account linked successfully',
      },
    });
  } catch (error: any) {
    console.error('Bank account linking error:', error);

    if (error.error?.description) {
      return NextResponse.json({ success: false, error: error.error.description }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to link bank account' },
      { status: 500 }
    );
  }
}

// GET - Get linked bank account details
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        razorpay_contact_id: true,
        razorpay_fund_account_id: true,
        bank_account_number: true,
        bank_ifsc_code: true,
        bank_account_holder: true,
        bank_account_type: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.razorpay_fund_account_id) {
      return NextResponse.json({
        success: true,
        data: {
          linked: false,
          message: 'No bank account linked',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        linked: true,
        contactId: user.razorpay_contact_id,
        fundAccountId: user.razorpay_fund_account_id,
        accountNumber: user.bank_account_number,
        ifscCode: user.bank_ifsc_code,
        accountHolder: user.bank_account_holder,
        accountType: user.bank_account_type,
      },
    });
  } catch (error) {
    console.error('Get bank account error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bank account details' },
      { status: 500 }
    );
  }
}
