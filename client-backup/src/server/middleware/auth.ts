import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { db } from '../db.js';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema.js';
import { User, JwtPayload } from '../../types/auth.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// JWT Secret from environment variables
const JWT_SECRET = Buffer.from(process.env.JWT_SECRET || 'bell24h-dashboard-secret-key');
const TOKEN_EXPIRY: string | number | undefined = process.env.TOKEN_EXPIRY || '24h';

/**
 * Authentication middleware (applies to all routes)
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header or cookie
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1] || '';
  
  if (!token) {
    // No token, proceed as unauthenticated
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    // Token is invalid, proceed as unauthenticated
    next();
  }
};

/**
 * Middleware to protect routes requiring authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  next();
};

/**
 * Middleware to restrict access to specific roles
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Require buyer role
 */
export const requireBuyer = requireRole(['buyer']);

/**
 * Require supplier role
 */
export const requireSupplier = requireRole(['supplier']);

/**
 * Generate JWT token
 */
export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    username: user.username || user.email.split('@')[0],
    email: user.email,
    role: user.role
  };
  
  const options: SignOptions = { expiresIn: TOKEN_EXPIRY };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Set JWT token cookie
 */
export const setTokenCookie = (res: Response, token: string) => {
  // Set cookie with secure options
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
};

/**
 * Clear JWT token cookie (for logout)
 */
export const clearTokenCookie = (res: Response) => {
  res.clearCookie('token');
};
