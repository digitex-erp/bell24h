import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Completely disabled middleware to prevent crashes
  // Only return the next response without any processing
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
