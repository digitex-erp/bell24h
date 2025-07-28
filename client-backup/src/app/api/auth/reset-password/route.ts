import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { rateLimit } from '@/middleware/rateLimit';
import { checkPasswordStrength } from '@/utils/passwordUtils';
import { sendPasswordResetSuccessEmail } from '@/utils/emailService';

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

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Check password strength
    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json(
        { message: 'Password does not meet strength requirements', feedback: strength.feedback },
        { status: 400 }
      );
    }

    // Verify the reset token
    try {
      const decoded = verify(token, JWT_SECRET) as { email: string };
      const storedToken = resetTokens.get(token);

      if (!storedToken || storedToken.email !== decoded.email || storedToken.expires < Date.now()) {
        return NextResponse.json(
          { message: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      // Find the user
      const user = users.find((u) => u.email === decoded.email);
      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      // Update the password (in a real app, this would be hashed)
      user.password = password;

      // Remove the used token
      resetTokens.delete(token);

      // Send success email
      try {
        const loginLink = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
        await sendPasswordResetSuccessEmail(user.email, loginLink, user.name);
      } catch (error) {
        console.error('Failed to send password reset success email:', error);
        // Don't expose the error to the client
      }

      return NextResponse.json(
        { message: 'Password reset successful' },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid reset token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 