import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
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
    });

  } catch (error) {
    console.error('Email OTP send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email OTP' },
      { status: 500 }
    );
  }
}