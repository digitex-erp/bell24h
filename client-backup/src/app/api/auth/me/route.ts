import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { TokenPayload } from '@/lib/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock database - replace with your actual database queries
const users = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'Test User',
    password: 'password', // In production, store hashed passwords
    role: 'user',
  },
];

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verify(token, JWT_SECRET) as TokenPayload;

    // Find user in database
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
