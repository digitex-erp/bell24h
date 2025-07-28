import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create different rate limiters for various purposes
const logisticsApiLimiter = new RateLimiterMemory({
  keyPrefix: 'logistics-api',
  points: 30, // Number of points
  duration: 60, // Per 60 seconds
});

const trackingRefreshLimiter = new RateLimiterMemory({
  keyPrefix: 'tracking-refresh',
  points: 5, // Number of points
  duration: 60, // Per 60 seconds
});

const documentGenerationLimiter = new RateLimiterMemory({
  keyPrefix: 'document-generation',
  points: 10, // Number of points
  duration: 60, // Per 60 seconds
});

/**
 * Rate limiting middleware for API routes
 * 
 * @param req Next.js API request
 * @param res Next.js API response
 * @param limiterType The type of rate limiter to use
 * @returns Whether the request was rate limited
 */
export async function rateLimiter(
  req: NextApiRequest,
  res: NextApiResponse,
  limiterType: 'logistics-api' | 'tracking-refresh' | 'document-generation' = 'logistics-api'
): Promise<boolean> {
  // Determine which limiter to use
  let limiter: RateLimiterMemory;
  switch (limiterType) {
    case 'tracking-refresh':
      limiter = trackingRefreshLimiter;
      break;
    case 'document-generation':
      limiter = documentGenerationLimiter;
      break;
    case 'logistics-api':
    default:
      limiter = logisticsApiLimiter;
      break;
  }

  // Get a unique identifier for the user
  // Use IP for non-authenticated users, or combine with user ID if available
  const userIdentifier = req.headers['x-forwarded-for'] || 
                        req.socket.remoteAddress || 
                        'unknown';
  
  try {
    // Consume points
    await limiter.consume(userIdentifier.toString());
    return false; // Not rate limited
  } catch (error) {
    // Rate limit exceeded
    res.status(429).json({ 
      message: 'Too many requests, please try again later.',
      retryAfter: error instanceof Error && 'msBeforeNext' in error ? 
        Math.ceil((error as any).msBeforeNext / 1000) : 60
    });
    return true; // Rate limited
  }
}
