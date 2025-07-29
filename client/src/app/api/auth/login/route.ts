import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Set the correct DATABASE_URL
const correctDbUrl =
  'postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require';
process.env.DATABASE_URL = correctDbUrl;

const prisma = new PrismaClient();

// Handle GET requests (prevent 405 errors)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Please use POST method for login',
      allowedMethods: ['POST'],
    },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: true,
        profile: true,
      },
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'bell24h-jwt-secret-key-32-chars-minimum',
      { expiresIn: '7d' }
    );

    console.log('Login successful:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.companyname, // Fix: use correct field name
        role: user.role,
        isEmailVerified: user.isemailverified,
        gstin: user.gstin,
        pan: user.pan,
        phone: user.phone,
        wallet: user.wallet,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
