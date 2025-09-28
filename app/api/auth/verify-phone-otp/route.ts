// app/api/auth/verify-phone-otp/route.ts - Mock OTP verification
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock OTP storage (in production, this would be in a database)
const mockOTPStorage = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    // Validate inputs
    if (!phone || !otp) {
      return NextResponse.json({
        success: false,
        error: 'Phone number and OTP are required'
      }, { status: 400 });
    }

    // Mock OTP verification - accept any 6-digit OTP for testing
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OTP format. Please enter a 6-digit code.'
      }, { status: 400 });
    }

    // For testing: Accept any valid 6-digit OTP
    // In production, you would verify against stored OTP
    const storedOTP = mockOTPStorage.get(phone);
    const currentTime = Date.now();

    if (storedOTP && storedOTP.expiresAt > currentTime) {
      if (storedOTP.otp !== otp) {
        return NextResponse.json({
          success: false,
          error: 'Invalid OTP. Please check and try again.'
        }, { status: 400 });
      }
    } else if (storedOTP && storedOTP.expiresAt <= currentTime) {
      return NextResponse.json({
        success: false,
        error: 'OTP expired. Please request a new OTP.'
      }, { status: 400 });
    }
    // If no stored OTP, accept any 6-digit code for testing

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userRole = 'BUYER'; // Default role

    // Generate JWT token
    const token = jwt.sign(
      { userId, phone, role: userRole },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Clean up used OTP
    mockOTPStorage.delete(phone);

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        phone,
        role: userRole,
        trustScore: 50,
        isVerified: true
      },
      token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    }, { status: 500 });
  }
}