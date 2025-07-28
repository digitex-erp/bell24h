import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Mock user database (same as in login route)
const users = [
  {
    id: '1',
    email: 'admin@bell24h.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@bell24h.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
  },
];

export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: string;
      role: string;
    };

    // Find user
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { message: 'Invalid session' },
      { status: 401 }
    );
  }
} 