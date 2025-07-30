export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Prevent build-time execution
    if (typeof window !== 'undefined' || !process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service not available during build',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // First, create a test user for the session
    const testUser = await prisma.user.upsert({
      where: { email: 'test-session@bell24h.com' },
      update: {},
      create: {
        email: 'test-session@bell24h.com',
        name: 'Test Session User',
        hashedPassword: 'test_password',
        role: 'BUYER',
      },
    });

    // Test session creation with all required fields
    const testSession = await prisma.session.create({
      data: {
        sessionToken: `test_session_${Date.now()}`,
        userId: testUser.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    // Test session upsert
    const testUpsert = await prisma.session.upsert({
      where: { id: testSession.id },
      update: {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      create: {
        sessionToken: `test_upsert_${Date.now()}`,
        userId: testUser.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Clean up test data (handle gracefully if records don't exist)
    try {
      await prisma.session.delete({ where: { id: testSession.id } });
    } catch (error) {
      console.log('Test session already cleaned up');
    }

    try {
      await prisma.session.delete({ where: { id: testUpsert.id } });
    } catch (error) {
      console.log('Test upsert session already cleaned up');
    }

    return NextResponse.json({
      success: true,
      message: 'Session operations working correctly!',
      testSession: testSession.id,
      testUpsert: testUpsert.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Session test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
