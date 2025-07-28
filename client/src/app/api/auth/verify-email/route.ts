import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    console.log('Email verification attempt:', { email });

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and verification token are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, we'll use a simple token verification
    // In production, you'd want to store and verify actual verification tokens
    if (token === 'demo-verification-token') {
      // Update user as verified
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });

      console.log('Email verified successfully:', user.id);

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully! You can now sign in.',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Email verification failed. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 