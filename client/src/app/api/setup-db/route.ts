import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Set the correct DATABASE_URL
const correctDbUrl = "postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require";
process.env.DATABASE_URL = correctDbUrl;

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('Setting up database tables...');

    // Create tables manually using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        companyName TEXT,
        role TEXT DEFAULT 'BUYER',
        isEmailVerified BOOLEAN DEFAULT false,
        gstin TEXT,
        pan TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        businessType TEXT,
        annualTurnover TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Wallet" (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        availableBalance DECIMAL(10,2) DEFAULT 0,
        totalBalance DECIMAL(10,2) DEFAULT 0,
        primaryCurrency TEXT DEFAULT 'INR',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Profile" (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        categories TEXT[],
        isVerified BOOLEAN DEFAULT false,
        verificationStatus TEXT DEFAULT 'PENDING',
        businessDescription TEXT,
        yearEstablished INTEGER,
        employeeCount INTEGER,
        certifications TEXT[],
        tradeReferences TEXT[],
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
      )
    `;

    console.log('Database tables created successfully');

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      timestamp: new Date().toISOString(),
      tables: ['User', 'Wallet', 'Profile']
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 