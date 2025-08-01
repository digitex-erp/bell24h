import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { NextResponse } from 'next/server';
import { promisify } from 'util';

// Set the correct DATABASE_URL
const correctDbUrl = "postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require";
process.env.DATABASE_URL = correctDbUrl;

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export async function POST() {
  try {
    // Push the schema to the database
    console.log('Pushing Prisma schema to Railway...');
    await execAsync('npx prisma db push');

    // Test the connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
      database: 'Railway PostgreSQL',
      status: 'initialized',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'Database initialization failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
