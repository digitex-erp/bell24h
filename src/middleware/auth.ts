import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; username: string; role: string };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'bell24h-development-secret-key';

/**
 * Verify JWT token and attach user to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Get token from header or cookie
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  
  if (!token) {
    return next(); // No token, proceed as unauthenticated
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, username: string, role: string };
    req.user = decoded;
    next();
  } catch (error) {
    next(); // Invalid token, proceed as unauthenticated
  }
}

/**
 * Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * Require supplier role
 */
export function requireSupplier(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'supplier') {
    return res.status(403).json({ error: 'Supplier access required' });
  }
  
  next();
}

/**
 * Require buyer role
 */
export function requireBuyer(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Buyer access required' });
  }
  
  next();
}