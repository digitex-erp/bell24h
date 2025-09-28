import { NextRequest, NextResponse } from 'next/server';

<<<<<<< HEAD
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
=======
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
<<<<<<< HEAD

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
=======
    
    // Store OTP in session/cache (in production, use Redis or database)
    // For now, we'll use a simple in-memory store
    const otpStore = new Map();
    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Email OTP for ${email}: ${otp}`);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Email OTP sent successfully'
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
    });

  } catch (error) {
    console.error('Email OTP send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email OTP' },
      { status: 500 }
    );
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 7813a143b0b346893399a3e35fed46879897398a
