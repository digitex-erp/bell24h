import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import session from 'express-session';
import { ExtendedUser, SessionData, AuthenticatedRequest } from '../types/express.js';

const prisma = new PrismaClient();

// JWT payload type
interface JwtPayload {
  id: string;
  email: string;
  role: string;
  companyId?: string;
}

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    userId: string;
    role: string;
    companyId?: string;
  }
}

// JWT Authentication Middleware
export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.get('authorization');

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      try {
        const userPayload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'your-secret-key'
        ) as JwtPayload;

        try {
          const user = await prisma.user.findUnique({
            where: { id: userPayload.id },
            include: {
              company: true,
              rfqs: true,
              bids: true,
              notifications: true
            }
          });

          if (!user) {
            return res.sendStatus(403);
          }

          req.user = user as ExtendedUser;

          req.session.userId = user.id;
          req.session.role = user.role;
          if (user.companyId) {
            req.session.companyId = user.companyId;
          }

          next();
        } catch (error: unknown) {
          console.error('User fetch error:', error);
          res.status(500).json({ error: 'Failed to fetch user data' });
        }
      } catch (error: unknown) {
        console.error('JWT verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      res.status(401).json({ error: 'No authorization header' });
    }
  } catch (error: any) {
    console.error('JWT auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Middleware to check if user is authenticated
export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to check user role
export const checkRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Session-based authentication
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user from database with related data
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        company: true,
        rfqs: true,
        bids: true,
        notifications: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user as ExtendedUser;
    next();
  } catch (error) {
    console.error('Session auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is already authenticated via session
    const sessionUser = req.session?.userId;
    if (sessionUser) {
      // Get user from database with related data
      const user = await prisma.user.findUnique({
        where: { id: sessionUser },
        include: {
          company: true,
          rfqs: true,
          bids: true,
          notifications: true
        }
      });

      if (user) {
        req.user = user as ExtendedUser;
      }
      return next();
    }

    // Check for JWT token in Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return next(); // Allow unauthenticated access
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as JwtPayload;

      // Verify user exists with all required data
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          company: true,
          rfqs: true,
          bids: true,
          notifications: true
        }
      });

      if (!user) {
        return next();
      }

      // Update session with user data
      req.session.userId = user.id;
      req.session.role = user.role;
      if (user.companyId) {
        req.session.companyId = user.companyId;
      }

      // Store user in request
      req.user = user as ExtendedUser;

      next();
    } catch (err) {
      console.error('JWT verification error:', err);
      next(); // Invalid token, allow unauthenticated access
    }
  } catch (error) {
    next();
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

export const generateToken = async (user: { id: string; role: string; email: string; companyId: string }) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      companyId: user.companyId 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return token;
};