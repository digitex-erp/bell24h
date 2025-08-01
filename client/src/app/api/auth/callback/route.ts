import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=callback_failed&message=${encodeURIComponent(error.message)}`
        );
      }
    } catch (error) {
      console.error('Auth exchange error:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=session_exchange_failed&message=${encodeURIComponent('Authentication failed. Please try again.')}`
      );
    }
  }

  // Ensure clean redirect URL (handle both encoded and plain URLs)
  const cleanRedirectUrl = next.startsWith('/') ? next : '/dashboard';
  const redirectUrl = `${requestUrl.origin}${cleanRedirectUrl}`;

  console.log('Auth callback successful, redirecting to:', redirectUrl);
  return NextResponse.redirect(redirectUrl);
}
