import jwt from 'jsonwebtoken';

/**
 * Middleware to handle authentication and user context
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authMiddleware = (req, res, next) => {
  // Skip auth for certain paths
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health',
    '/api/auth/reset-password',
    '/api/auth/forgot-password'
  ];
  
  if (publicPaths.includes(req.path) || req.path.startsWith('/api/public/')) {
    return next();
  }

  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No auth needed for general static content
    if (!req.path.startsWith('/api/')) {
      return next();
    }
    
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'your-default-secret-key';
    
    // Verify token
    const decoded = jwt.verify(token, secret);
    
    // Set user info in request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Authentication middleware for protected routes
 * This is an alias for authMiddleware to maintain compatibility with existing code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticate = authMiddleware;
