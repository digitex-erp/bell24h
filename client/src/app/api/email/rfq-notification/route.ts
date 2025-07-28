import { NextRequest, NextResponse } from 'next/server';
import { sendRFQNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, supplierName, rfqDetails } = await request.json();

    if (!email || !supplierName || !rfqDetails) {
      return NextResponse.json(
        { error: 'Email, supplier name, and RFQ details are required' },
        { status: 400 }
      );
    }

    const result = await sendRFQNotification(email, supplierName, rfqDetails);

    if (result.success) {
      return NextResponse.json({ 
        message: 'RFQ notification sent successfully',
        data: result.data 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send RFQ notification', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('RFQ notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 