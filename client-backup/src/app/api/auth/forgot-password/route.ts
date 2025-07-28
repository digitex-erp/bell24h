import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { rateLimit } from '@/middleware/rateLimit';
import { sendPasswordResetEmail } from '@/utils/emailService';

// Mock user database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, this would be hashed
    role: 'admin',
    name: 'Admin User',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123', // In a real app, this would be hashed
    role: 'user',
    name: 'Regular User',
  },
];

// Mock reset tokens storage
const resetTokens = new Map<string, { email: string; expires: number }>();

// JWT secret - in a real app, this would be in environment variables
const JWT_SECRET = 'your-secret-key';

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request as any);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = users.find((u) => u.email === email);

    // Always return success to prevent email enumeration
    if (user) {
      // Generate reset token
      const token = sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      
      // Store token with expiration
      resetTokens.set(token, {
        email: user.email,
        expires: Date.now() + 3600000, // 1 hour
      });

      // Generate reset link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      try {
        // Send password reset email
        await sendPasswordResetEmail(user.email, resetLink, user.name);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        // Don't expose the error to the client
      }
    }

    return NextResponse.json(
      { message: 'If an account exists with that email, you will receive password reset instructions.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to verify reset token
export const verifyResetToken = (token: string) => {
  try {
    const tokenData = resetTokens.get(token);
    if (!tokenData) return null;

    // Check if token has expired
    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return null;
    }

    return tokenData.email;
  } catch {
    return null;
  }
}; 