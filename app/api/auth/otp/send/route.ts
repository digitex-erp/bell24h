import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
    // For now, just log it (in development)
    console.log(`OTP for ${phone}: ${otp}`)

    // Store OTP in session/database with expiration
    // For now, we'll just return success

    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        // In development, include OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp })
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json(
      { message: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
