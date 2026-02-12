import { NextRequest, NextResponse } from 'next/server';
import { msg91Service } from '@/lib/msg91';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number. Please enter a valid 10-digit number.' },
        { status: 400 }
      );
    }

    // Send OTP via MSG91
    console.log(`📱 Sending OTP to +91${phoneNumber}...`);

    const result = await msg91Service.sendOTP(phoneNumber);

    if (!result.success) {
      throw new Error(result.message);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}

