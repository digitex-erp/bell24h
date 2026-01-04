/**
 * ✅ PRODUCTION-READY Phone OTP API
 * Connected to InsForge database + MSG91 SMS service
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/insforge';

export async function POST(request: NextRequest) {
  try {
    const { phone, purpose = 'login' } = await request.json();

    // Validate phone number (international format)
    if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format. Use international format (e.g., +919876543210)'
      }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 🔥 SAVE OTP TO DATABASE (REAL OPERATION)
    const { data: otpRecord, error: insertError } = await db.otps()
      .insert({
        phone: phone,
        otp: otp,
        purpose: purpose,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate OTP. Please try again.'
      }, { status: 500 });
    }

    // 🔥 SEND SMS VIA MSG91 (or other SMS service)
    const smsResult = await sendSMS(phone, otp);

    if (!smsResult.success) {
      console.error('SMS sending failed:', smsResult.error);

      // Fallback: Return OTP in response for development/testing
      // REMOVE THIS IN PRODUCTION!
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'OTP generated (Development mode - SMS failed)',
          devOTP: otp, // Only in development
          warning: 'SMS service unavailable. Using development mode.'
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to send SMS. Please try again.'
      }, { status: 500 });
    }

    console.log(`✅ OTP sent to ${phone} via SMS (expires in 5 minutes)`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your phone',
      expiresIn: '5 minutes',
      // DO NOT send OTP in production response!
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send OTP. Please try again.'
    }, { status: 500 });
  }
}

/**
 * 🔥 SEND SMS via MSG91 or other SMS service
 */
async function sendSMS(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
  const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'BELL24';
  const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

  // If MSG91 not configured, return error
  if (!MSG91_AUTH_KEY) {
    console.warn('MSG91_AUTH_KEY not configured. Skipping SMS.');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    // MSG91 API endpoint
    const url = 'https://api.msg91.com/api/v5/otp';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      },
      body: JSON.stringify({
        mobile: phone.replace('+', ''), // Remove + prefix
        otp: otp,
        sender: MSG91_SENDER_ID,
        template_id: MSG91_TEMPLATE_ID,
        otp_expiry: 5, // minutes
        message: `Your Bell24h OTP is ${otp}. Valid for 5 minutes. Do not share this code.`
      })
    });

    const result = await response.json();

    if (response.ok && result.type === 'success') {
      return { success: true };
    } else {
      console.error('MSG91 API error:', result);
      return { success: false, error: result.message || 'SMS API error' };
    }

  } catch (error: any) {
    console.error('SMS sending exception:', error);
    return { success: false, error: error.message };
  }
}