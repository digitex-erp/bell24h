import { NextRequest, NextResponse } from 'next/server';

<<<<<<< HEAD
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
=======
export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
        { status: 400 }
      );
    }

<<<<<<< HEAD
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format' },
=======
    // In production, retrieve from Redis or database
    const otpStore = new Map();
    const storedData = otpStore.get(email);

    if (!storedData) {
      return NextResponse.json(
        { success: false, error: 'OTP not found or expired' },
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // Check if OTP exists and is valid
    const storedOtp = emailOtpStorage.get(`${mobile}-${email}`);
    
    if (!storedOtp) {
      return NextResponse.json(
        { success: false, error: 'OTP not found. Please request a new OTP.' },
=======
    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      otpStore.delete(email);
      return NextResponse.json(
        { success: false, error: 'OTP has expired' },
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // Check if OTP is expired (5 minutes)
    const isExpired = Date.now() - storedOtp.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      emailOtpStorage.delete(`${mobile}-${email}`);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new OTP.' },
=======
    // Check attempt limit
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      return NextResponse.json(
        { success: false, error: 'Maximum OTP attempts exceeded' },
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
        { status: 400 }
      );
    }

    // Verify OTP
<<<<<<< HEAD
    if (storedOtp.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
=======
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStore.set(email, storedData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid OTP. ${3 - storedData.attempts} attempts remaining` 
        },
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
        { status: 400 }
      );
    }

<<<<<<< HEAD
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
=======
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
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
