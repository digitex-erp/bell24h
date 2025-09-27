import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone number
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Generate demo OTP for testing
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, you would send this OTP via SMS service
    console.log(`📱 OTP for ${phone}: ${otp}`);
    
    // Store OTP in session/database for verification
    // For demo purposes, we'll use a simple approach
    const response = NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      demoOTP: otp, // Only for development
      phone: phone
    });

    // Set OTP in cookie for demo (in production, use proper session management)
    response.cookies.set('demo_otp', otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300, // 5 minutes
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('OTP Send Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send OTP',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}