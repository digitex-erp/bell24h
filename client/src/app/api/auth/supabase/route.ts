import { NextRequest, NextResponse } from 'next/server';
import { supabase, signInWithEmail, signUpWithEmail } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === 'login') {
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 401 }
        );
      }

      if (data.user) {
        return NextResponse.json({
          success: true,
          message: 'Login successful',
          user: {
            id: data.user.id,
            email: data.user.email,
            role: 'buyer' // Default role
          },
          session: data.session
        });
      }
    }

    if (action === 'register') {
      const { data, error } = await signUpWithEmail(email, password);

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }

      if (data.user) {
        return NextResponse.json({
          success: true,
          message: 'Registration successful',
          user: {
            id: data.user.id,
            email: data.user.email,
            role: 'buyer' // Default role
          },
          session: data.session
        });
      }
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Supabase auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 