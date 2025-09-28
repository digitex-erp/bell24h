import { NextRequest, NextResponse } from 'next/server';

// Mock email OTP storage (in production, use Redis or database)
const emailOtpStorage = new Map<string, { otp: string, timestamp: number }>();

export async function POST(request: NextRequest) {
  try {
    const { mobile, email } = await request.json();

    // Validate inputs
    if (!mobile || !email) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with timestamp (valid for 5 minutes)
    emailOtpStorage.set(`${mobile}-${email}`, {
      otp,
      timestamp: Date.now()
    });

    // In production, send email using your email service
    console.log(`📧 Email OTP for ${email}: ${otp}`);

    // For development, we'll just log the OTP
    // In production, integrate with email service:
    /*
    await sendEmail({
      to: email,
      subject: 'Bell24h Email Verification',
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Email OTP sent successfully',
      // Only include OTP in development
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('Email OTP send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email OTP' },
      { status: 500 }
    );
  }
}
