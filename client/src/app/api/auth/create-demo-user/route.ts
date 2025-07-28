import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName } = await request.json();

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email || 'demo@bell24h.com' },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Demo user already exists',
        user: {
          email: existingUser.email,
          name: existingUser.name,
          companyName: existingUser.companyname,
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'Demo123!', 10);

    // Create demo user
    const demoUser = await prisma.user.create({
      data: {
        email: email || 'demo@bell24h.com',
        password: hashedPassword,
        name: name || 'Demo Supplier',
        companyname: companyName || 'Demo Company Ltd',
        role: 'SUPPLIER',
        phone: '9876543210',
        gstin: '22AAAAA0000A1Z5',
        pan: 'ABCDE1234F',
        isemailverified: true,
      },
    });

    // Create wallet for demo user
    await prisma.wallet.create({
      data: {
        userid: demoUser.id,
        availablebalance: 10000,
        totalbalance: 10000,
        primarycurrency: 'INR',
      },
    });

    // Create profile for demo user
    await prisma.profile.create({
      data: {
        userid: demoUser.id,
        isverified: true,
        verificationstatus: 'VERIFIED',
        businessdescription: 'Demo supplier for testing purposes',
        yearestablished: '2020',
        employeecount: '50-100',
      },
    });

    console.log('Demo user created successfully:', demoUser.id);

    return NextResponse.json({
      success: true,
      message: 'Demo user created successfully',
      user: {
        email: demoUser.email,
        name: demoUser.name,
        companyName: demoUser.companyname,
        password: password || 'Demo123!', // Return for testing
      },
    });
  } catch (error) {
    console.error('Demo user creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create demo user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
