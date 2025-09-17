import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Create NextAuth handler with production-grade configuration
const handler = NextAuth(authOptions)

// Export GET and POST handlers for NextAuth
export { handler as GET, handler as POST }

// Additional security headers for production
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Security headers middleware
export async function middleware(request: Request) {
  const response = new Response()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CORS headers for API routes
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:3000')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}
