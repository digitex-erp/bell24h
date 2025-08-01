import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    // Get user count
    const userCount = await prisma.user.count();
    return NextResponse.json({
      success: true,
      message: 'Registration API is working!',
      database: 'Connected',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Registration test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Registration API has issues',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Registration POST endpoint is working!',
  });
}
