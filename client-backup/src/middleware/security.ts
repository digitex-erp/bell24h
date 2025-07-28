import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { UnifiedUser } from '../../../server/types/express';

declare global {
  namespace Express {
    interface Request {
      user?: UnifiedUser;
    }
  }
}

const prisma = new PrismaClient();

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

const createRateLimit = (config: RateLimitConfig) => {
  const hits = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();
    const record = hits.get(ip);

    if (!record || now >= record.resetTime) {
      hits.set(ip, { count: 1, resetTime: now + config.windowMs });
      return next();
    }

    if (record.count >= config.max) {
      return res.status(429).json({ error: config.message });
    }

    record.count++;
    return next();
  };
};

export const configureSecurityMiddleware = () => (app: any) => {
  // Basic security headers
  app.use(helmet());

  // CORS middleware
  app.use(cors());

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // IP blocking middleware
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress;

      if (!ip) {
        return next();
      }

      const blockedIp = await prisma.blockedIp.findUnique({
        where: { ip }
      });

      if (blockedIp) {
        return res.status(403).json({ error: 'Access denied from this IP address' });
      }

      next();
    } catch (error) {
      console.error('IP blocking middleware error:', error);
      next();
    }
  });

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });

  // Apply rate limiting to API routes
  app.use('/api', apiLimiter);

  // Stricter rate limits for authentication routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 login attempts per hour
    message: 'Too many login attempts from this IP, please try again after an hour'
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // JWT verification middleware
  app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
    if (
      req.path.includes('/auth/login') ||
      req.path.includes('/auth/register') ||
      req.path.includes('/health')
    ) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: string, companyId?: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          company: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });
};
