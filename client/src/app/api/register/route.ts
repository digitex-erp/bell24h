import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Handle GET requests (prevent 405 errors)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Please use POST method for registration',
      allowedMethods: ['POST'],
    },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, companyName, businessType, name, phone, gstin, pan } =
      await request.json();

    // Validate input
    if (!email || !password || !companyName || !businessType) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and company name are required' },
        { status: 400 }
      );
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `https://bell24h-v1.vercel.app/dashboard`,
        data: {
          company_name: companyName,
          business_type: businessType,
          name: name || '',
          phone: phone || '',
          gstin: gstin || '',
          pan: pan || '',
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ success: false, error: 'User creation failed' }, { status: 500 });
    }

    // Create profile in profiles table
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      company_name: companyName,
      business_type: businessType,
      contact_email: email,
      contact_name: name || '',
      phone: phone || '',
      gstin: gstin || '',
      pan: pan || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Profile error:', profileError);
      // User was created but profile failed - we'll handle this gracefully
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        company_name: companyName,
        business_type: businessType,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
