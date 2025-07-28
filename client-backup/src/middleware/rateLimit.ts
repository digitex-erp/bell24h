import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting
// In production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per window
};

export function rateLimit(request: NextRequest) {
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;

  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitStore.delete(key);
    }
  }

  // Get or create rate limit entry
  const entry = rateLimitStore.get(ip) || { count: 0, resetTime: now };
  
  // Check if we're in a new window
  if (entry.resetTime < windowStart) {
    entry.count = 0;
    entry.resetTime = now;
  }

  // Increment request count
  entry.count += 1;
  rateLimitStore.set(ip, entry);

  // Check if rate limit exceeded
  if (entry.count > RATE_LIMIT.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime + RATE_LIMIT.windowMs - now) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        message: 'Too many requests, please try again later',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  return null;
}

// Helper function to get remaining requests
export function getRemainingRequests(ip: string): number {
  const entry = rateLimitStore.get(ip);
  if (!entry) return RATE_LIMIT.maxRequests;
  
  const now = Date.now();
  if (entry.resetTime < now - RATE_LIMIT.windowMs) {
    return RATE_LIMIT.maxRequests;
  }
  
  return Math.max(0, RATE_LIMIT.maxRequests - entry.count);
}

// Helper function to get reset time
export function getResetTime(ip: string): number {
  const entry = rateLimitStore.get(ip);
  if (!entry) return Date.now() + RATE_LIMIT.windowMs;
  
  return entry.resetTime + RATE_LIMIT.windowMs;
}
