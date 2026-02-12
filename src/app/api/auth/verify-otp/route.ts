import { NextRequest, NextResponse } from 'next/server';
import { msg91Service } from '@/lib/msg91';
import { insforge } from '@/lib/insforge';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please enter a 6-digit code.' },
        { status: 400 }
      );
    }

    // Verify OTP with MSG91
    console.log(`✅ Verifying OTP for +91${phoneNumber}...`);

    const result = await msg91Service.verifyOTP(phoneNumber, otp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Check if user exists in database
    const { data: existingUser } = await insforge.database
      .from('users')
      .select('*')
      .eq('phone', `+91${phoneNumber}`)
      .single();

    let user;

    if (!existingUser) {
      // Create new user
      const { data: newUser, error } = await insforge.database
        .from('users')
        .insert([{
          phone: `+91${phoneNumber}`,
          role: 'buyer',
          is_verified: true,
          auth_method: 'phone_otp',
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user account');
      }

      user = newUser;
    } else {
      user = existingUser;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'bell24h-default-secret-change-in-production';
    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phone,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phone,
          name: user.name || 'Bell24h User',
          email: user.email || null,
          role: user.role,
          isVerified: user.is_verified,
          loginMethod: 'otp',
        },
      },
    });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'OTP verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

