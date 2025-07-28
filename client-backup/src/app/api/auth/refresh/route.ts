import { NextResponse } from 'next/server';
import { verify, sign } from 'jsonwebtoken';
import { TokenPayload } from '@/lib/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify the refresh token
    const decoded = verify(refreshToken, JWT_SECRET) as TokenPayload;

    // In a real app, you would check if the refresh token exists in your database
    // and is not revoked

    // Generate new tokens
    const accessToken = sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}
