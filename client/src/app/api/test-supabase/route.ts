import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.auth.getSession();
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection test',
      data: {
        hasSession: !!data.session,
        error: error?.message || null,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Supabase test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();
    
    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        }
      });
      
      return NextResponse.json({
        success: !error,
        message: error?.message || 'Signup successful',
        data: {
          user: data.user ? { id: data.user.id, email: data.user.email } : null,
          session: data.session ? 'Session created' : null
        }
      });
    }
    
    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return NextResponse.json({
        success: !error,
        message: error?.message || 'Signin successful',
        data: {
          user: data.user ? { id: data.user.id, email: data.user.email } : null,
          session: data.session ? 'Session created' : null
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 