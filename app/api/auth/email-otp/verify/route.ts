import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // In production, retrieve from Redis or database
    const otpStore = new Map();
    const storedData = otpStore.get(email);

    if (!storedData) {
      return NextResponse.json(
        { success: false, error: 'OTP not found or expired' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      otpStore.delete(email);
      return NextResponse.json(
        { success: false, error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Check attempt limit
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      return NextResponse.json(
        { success: false, error: 'Maximum OTP attempts exceeded' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStore.set(email, storedData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid OTP. ${3 - storedData.attempts} attempts remaining` 
        },
        { status: 400 }
      );
    }

    // OTP verified successfully
    otpStore.delete(email);

    return NextResponse.json({
      success: true,
      message: 'Email OTP verified successfully'
    });

  } catch (error) {
    console.error('Email OTP verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify email OTP' },
      { status: 500 }
    );
  }
}