import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();

    if (!email || !phone) {
      return NextResponse.json({ error: 'Email and phone are required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.oTP.create({
      data: {
        email,
        phone,
        otp,
        type: 'email',
        expiresAt
      }
    });

    // In development, return the OTP for testing
    // In production, you would send email here
    console.log(`📧 Email OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      demoOTP: otp // Only for development
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
