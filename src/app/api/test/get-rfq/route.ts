import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId');
    
    if (!rfqId) {
      return NextResponse.json({ error: 'Missing rfqId' }, { status: 400 });
    }

    const rfq = await prisma.rfq.findUnique({
      where: { id: parseInt(rfqId) },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            city: true,
            state: true
          }
        },
        quotes: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                companyName: true,
                city: true,
                state: true,
                rating: true,
                verified: true
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    return NextResponse.json({ rfq });
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    return NextResponse.json({ error: 'Failed to get RFQ' }, { status: 500 });
  }
}