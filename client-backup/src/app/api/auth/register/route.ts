import { NextResponse } from 'next/server';
import { generateTokens } from '@/lib/jwt';
import { RegisterRequest, AuthResponse, ErrorResponse } from '@/types/auth';

import db from '@/lib/mock-db'; // Correct default import of singleton instance

export async function POST(request: Request) {
  try {
    const { email, password, name } = (await request.json()) as RegisterRequest;

    console.log('Registering user:', { email, name });

    // Input validation
    if (!email || !password || !name) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (db.findUserByEmail(email)) {
      console.log('User already exists:', email);
      return NextResponse.json<ErrorResponse>(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // In production, hash the password before storing
    const newUserDetails = {
      email,
      name,
      password, // In production, store hashed password
      role: 'user', // Default role
    };

    console.log('New user details:', newUserDetails);

    const addedUser = db.addUser(newUserDetails);

    // NextAuth.js will handle session creation upon subsequent login.
    // We don't need to return custom tokens from registration if relying on NextAuth for sessions.
    const { password: _, ...userToReturn } = addedUser;

    const response = {
      user: userToReturn,
    };

    console.log('Registration response:', response);

    return NextResponse.json<AuthResponse>(response, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ErrorResponse>(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
