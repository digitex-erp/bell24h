import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, company, role } = await request.json()

    // Validate required fields
    if (!name || !email || !phone || !password || !company) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // In production, save to database
    // For now, just return success
    const user = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      company,
      role,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          role: user.role
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
