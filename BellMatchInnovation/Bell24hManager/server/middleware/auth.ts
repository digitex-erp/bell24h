import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated via session
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  next();
}
