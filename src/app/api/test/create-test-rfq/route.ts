import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, quantity, unit, targetPrice, deadline, buyerId } = body;

    // Get or create a test category
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: 'test-category',
          icon: '🧪'
        }
      });
    }

    // Create a test RFQ
    const rfq = await prisma.rfq.create({
      data: {
        title,
        description,
        quantity,
        unit,
        targetPrice,
        deadline: new Date(deadline),
        status: 'ACTIVE',
        buyerId,
        categoryId: category.id,
      }
    });

    return NextResponse.json({ success: true, rfqId: rfq.id });
  } catch (error) {
    console.error('Test RFQ creation error:', error);
    return NextResponse.json({ error: 'Failed to create test RFQ' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}