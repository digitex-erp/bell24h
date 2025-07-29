import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
    } catch (error) {
      if (error.code === 'P2021') {
        return NextResponse.json({
          success: false,
          message: 'Database tables not created yet. Run: npx prisma db push',
          error: 'Tables missing',
          timestamp: new Date().toISOString()
        }, { status: 503 });
      }
      throw error;
    }
    
    // Test session creation (this was failing before)
    let sessionTest = 'SKIPPED';
    try {
      const testSession = await prisma.session.create({
        data: {
          sessionToken: `test_${Date.now()}`,
          userId: null,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      });
      await prisma.session.delete({ where: { id: testSession.id } });
      sessionTest = 'PASSED';
    } catch (error) {
      sessionTest = `FAILED: ${error.message}`;
    }

    // Test user creation
    let userTest = 'SKIPPED';
    try {
      const testUser = await prisma.user.create({
        data: {
          email: `test_${Date.now()}@bell24h.com`,
          name: 'Test User',
          companyname: 'Test Company',
          role: 'SUPPLIER',
        }
      });
      await prisma.user.delete({ where: { id: testUser.id } });
      userTest = 'PASSED';
    } catch (error) {
      userTest = `FAILED: ${error.message}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection working perfectly!',
      userCount,
      sessionTest,
      userTest,
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