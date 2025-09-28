import { NextRequest, NextResponse } from 'next/server';

// Mock email OTP storage (in production, use Redis or database)
const emailOtpStorage = new Map<string, { otp: string, timestamp: number }>();

// Mock user database (in production, use real database)
const users = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { mobile, email, otp } = await request.json();

    // Validate inputs
    if (!mobile || !email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Mobile number, email, and OTP are required' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // Check if OTP exists and is valid
    const storedOtp = emailOtpStorage.get(`${mobile}-${email}`);
    
    if (!storedOtp) {
      return NextResponse.json(
        { success: false, error: 'OTP not found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired (5 minutes)
    const isExpired = Date.now() - storedOtp.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      emailOtpStorage.delete(`${mobile}-${email}`);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOtp.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - remove it
    emailOtpStorage.delete(`${mobile}-${email}`);

    // Find user by mobile number
    const user = users.get(mobile);
    
    if (user) {
      // Update user with verified email
      const updatedUser = {
        ...user,
        email,
        emailVerified: true,
        verifiedAt: new Date().toISOString()
      };
      
      users.set(mobile, updatedUser);

      return NextResponse.json({
        success: true,
        message: 'Email verification successful',
        user: updatedUser,
        redirectUrl: '/dashboard'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Email OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Email OTP verification failed' },
      { status: 500 }
    );
  }
}
