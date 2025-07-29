import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 Middleware: ${request.method} ${pathname}`);
  
  // Get authentication tokens
  const token = request.cookies.get('bell24h-token');
  const session = request.cookies.get('bell24h-session');
  
  // Dashboard route handling
  if (pathname.startsWith('/dashboard')) {
    console.log('🏠 Dashboard access attempt:', {
      hasToken: !!token,
      hasSession: !!session,
      pathname
    });
    
    // Allow dashboard access even without authentication for testing
    // In production, you might want to redirect to login
    if (!token && !session) {
      console.log('⚠️ No authentication found, but allowing dashboard access for testing');
      // Uncomment next line for production authentication enforcement:
      // return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    return NextResponse.next();
  }
  
  // API routes - no special handling needed
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Auth routes - redirect to dashboard if already logged in
  if (pathname.startsWith('/auth/login') && (token || session)) {
    console.log('🔄 Already authenticated, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
