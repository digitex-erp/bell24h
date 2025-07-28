import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// CORS headers
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone, companyName, gstin, pan } = body;

    console.log('Registration attempt:', { email, name, phone, companyName });

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { 
        status: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user with correct field mapping
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        companyname: companyName, // Map to correct database field
        gstin,
        pan,
        role: 'SUPPLIER'
      }
    });

    console.log('User created successfully:', user.id);

    return NextResponse.json({ success: true, userId: user.id }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (e) {
    console.error('Registration error:', e);
    return NextResponse.json({
      error: 'Server error',
      details: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}
