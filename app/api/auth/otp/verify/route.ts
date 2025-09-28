import { NextRequest, NextResponse } from 'next/server';

// Mock OTP storage (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string, timestamp: number }>();

// Mock user database (in production, use real database)
const users = new Map<string, any>([
  ['9876543210', {
    id: '1',
    mobile: '9876543210',
    name: 'Test User',
    companyName: 'Test Company',
    businessType: 'manufacturer',
    verified: true
  }]
]);

export async function POST(request: NextRequest) {
  try {
    const { mobile, otp } = await request.json();

    // Validate inputs
    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number format' },
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
    const storedOtp = otpStorage.get(mobile);
    
    if (!storedOtp) {
      return NextResponse.json(
        { success: false, error: 'OTP not found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired (5 minutes)
    const isExpired = Date.now() - storedOtp.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      otpStorage.delete(mobile);
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
    otpStorage.delete(mobile);

    // Check if user exists
    const existingUser = users.get(mobile);
    
    if (existingUser) {
      // Existing user - login successful
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        isNewUser: false,
        user: existingUser,
        redirectUrl: '/dashboard'
      });
    } else {
      // New user - need registration
      return NextResponse.json({
        success: true,
        message: 'OTP verified. Please complete registration.',
        isNewUser: true,
        mobile
      });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'OTP verification failed' },
      { status: 500 }
    );
  }
}