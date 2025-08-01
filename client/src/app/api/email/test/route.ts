import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail, sendWelcomeEmail } from '@/lib/email';

export async function GET() {
  try {
    const result = await sendTestEmail();

    if (result.success) {
      return NextResponse.json({ 
        message: 'Test email sent successfully',
        status: 'Email service is working!',
        data: result.data 
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Test email failed', 
          details: result.error,
          status: 'Email service needs configuration'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json(
      { error: 'Email service configuration error', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Test welcome email
    const result = await sendWelcomeEmail(email, name || 'Test User', 'buyer');

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
