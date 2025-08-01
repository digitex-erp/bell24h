import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Run raw SQL to fix column names
    await prisma.$executeRaw`ALTER TABLE "User" RENAME COLUMN "createdat" TO "createdAt"`;
    await prisma.$executeRaw`ALTER TABLE "User" RENAME COLUMN "updatedat" TO "updatedAt"`;
    await prisma.$executeRaw`ALTER TABLE "Wallet" RENAME COLUMN "createdat" TO "createdAt"`;
    await prisma.$executeRaw`ALTER TABLE "Wallet" RENAME COLUMN "updatedat" TO "updatedAt"`;
    await prisma.$executeRaw`ALTER TABLE "Profile" RENAME COLUMN "createdat" TO "createdAt"`;
    await prisma.$executeRaw`ALTER TABLE "Profile" RENAME COLUMN "updatedat" TO "updatedAt"`;

    return NextResponse.json({
      success: true,
      message: 'Column names fixed successfully!',
    });
  } catch (error) {
    console.error('Fix columns error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fix columns',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
