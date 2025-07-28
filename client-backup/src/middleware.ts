import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  // Do not run middleware on API routes - critical for NextAuth to work properly
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Do not run middleware on Next.js internal routes
  if (request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Get the token to check authentication
  const token = await getToken({ req: request });

  // Redirect to login if trying to access a protected route without authentication
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Apply middleware to all routes
// The explicit checks within the middleware function will prevent it from running on API routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
