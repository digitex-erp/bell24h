import { NextRequest, NextResponse } from 'next/server';

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

    // In production, send SMS using Twilio, AWS SNS, or similar service
    console.log(`📱 OTP for ${mobile}: ${otp}`);

    // For development, we'll just log the OTP
    // In production, integrate with SMS service:
    /*
    await sendSMS({
      to: `+91${mobile}`,
      message: `Your Bell24h verification code is: ${otp}. Valid for 5 minutes.`
    });
    */

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Don't send OTP in production response
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