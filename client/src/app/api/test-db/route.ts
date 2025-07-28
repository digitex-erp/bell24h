import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    const userCount = await prisma.user.count();
    
    // Test session creation (this was failing before)
    const testSession = await prisma.session.create({
      data: {
        sessionToken: `test_${Date.now()}`,
        userId: null,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    // Test user creation
    const testUser = await prisma.user.create({
      data: {
        email: `test_${Date.now()}@bell24h.com`,
        name: 'Test User',
        companyname: 'Test Company',
        role: 'SUPPLIER',
      }
    });

    // Clean up test data
    await prisma.session.delete({ where: { id: testSession.id } });
    await prisma.user.delete({ where: { id: testUser.id } });

    return NextResponse.json({
      success: true,
      message: 'Database connection working perfectly!',
      userCount,
      sessionTest: 'PASSED',
      userTest: 'PASSED',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 