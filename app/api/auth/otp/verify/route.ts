import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    // Validate inputs
    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // Get stored OTP from cookie (demo purposes)
    const cookieStore = cookies();
    const storedOTP = cookieStore.get('demo_otp')?.value;

    if (!storedOTP) {
      return NextResponse.json(
        { success: false, error: 'OTP expired or not found' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otp !== storedOTP) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid - create user session
    const user = {
      id: `user_${Date.now()}`,
      phone: phone,
      email: `${phone.replace(/\D/g, '')}@bell24h.com`,
      name: `User ${phone}`,
      verified: true,
      loginMethod: 'otp'
    };

    console.log('✅ OTP Verified Successfully:', user);

    // Clear OTP cookie
    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email
      }
    });

    // Clear OTP cookie
    response.cookies.set('demo_otp', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/'
    });

    // Set user session cookie
    response.cookies.set('user_session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'OTP verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}