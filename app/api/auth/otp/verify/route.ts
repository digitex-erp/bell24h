import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { message: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    // In production, verify OTP from database/cache
    // For now, accept any 6-digit OTP for development
    const isValidOtp = /^\d{6}$/.test(otp)

    if (!isValidOtp) {
      return NextResponse.json(
        { message: 'Invalid OTP format' },
        { status: 400 }
      )
    }

    // Mock user creation/login
    const user = {
      id: Date.now().toString(),
      name: 'User',
      email: `${phone}@Bell24h.com`,
      phone,
      role: 'buyer'
    }

    return NextResponse.json(
      { 
        message: 'OTP verified successfully',
        user
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json(
      { message: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}

