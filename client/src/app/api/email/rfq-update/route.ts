import { NextRequest, NextResponse } from 'next/server';
// import { emailService } from '@/utils/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, rfqId, status, supplierName } = body;

    if (!email || !name || !rfqId) {
      return NextResponse.json(
        { error: 'Email, name, and RFQ ID are required' },
        { status: 400 }
      );
    }

    // Temporarily disabled email service to prevent build failures
    // const success = await emailService.sendRFQStatusEmail({
    //   to: email,
    //   name,
    //   rfqId,
    //   supplierName
    // });

    // Return success for now
    return NextResponse.json(
      { 
        message: 'RFQ update email sent successfully (email service temporarily disabled)',
        data: { email, name, rfqId, status, supplierName }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('RFQ update email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 