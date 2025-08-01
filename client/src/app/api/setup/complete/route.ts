import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phoneNumber, city, state } = body;

    // Validate required fields
    if (!phoneNumber || !city || !state) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Update user profile with setup data
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: session.user.id,
        phone_number: phoneNumber,
        city: city,
        state: state,
        setup_completed: true,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        notifications_enabled: true,
        email_alerts: true,
        created_at: new Date().toISOString()
      });

    if (settingsError) {
      console.error('Settings creation error:', settingsError);
      // Don't fail the request for settings error
    }

    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully'
    });
  } catch (error) {
    console.error('Setup completion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
