import { NextRequest, NextResponse } from 'next/server';
import { msg91Service } from '@/lib/msg91';

// Mock OTP storage (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string, timestamp: number }>();

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();

    // Validate mobile number
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with timestamp (valid for 5 minutes)
    otpStorage.set(mobile, {
      otp,
      timestamp: Date.now()
    });

    // Send OTP via your shared MSG91 API
    let smsResult;
    if (process.env.MSG91_API_URL && process.env.MSG91_API_KEY) {
      // Production: Use your shared MSG91 API
      smsResult = await msg91Service.sendOTP(mobile, otp);
    } else {
      // Development: Use mock service
      smsResult = await msg91Service.sendOTPDev(mobile, otp);
    }

    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, error: smsResult.error || 'Failed to send OTP' },
        { status: 500 }
      );
    }

    console.log(`📱 OTP sent to +91${mobile} via MSG91`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      messageId: smsResult.messageId,
      // Only include OTP in development
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}