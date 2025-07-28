import rateLimit from 'express-rate-limit';
import { log } from '../utils';

/**
 * Rate limiting middleware for password reset requests
 * Limits to 5 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 password reset requests per windowMs
  message: { error: 'Too many password reset requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    log(`Rate limit exceeded for IP: ${req.ip} on path: ${req.path}`, 'warn');
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * General rate limiting for API endpoints
 * Limits to 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    log(`API rate limit exceeded for IP: ${req.ip} on path: ${req.path}`, 'warn');
    res.status(options.statusCode).json(options.message);
  }
});
