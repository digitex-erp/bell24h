import helmet from 'helmet';

/**
 * Configures and returns security middleware for the Express application
 * @returns {Function} Express middleware function
 */
export function configureSecurityMiddleware() {
  return (req, res, next) => {
    // Apply standard security headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://*"],
          connectSrc: ["'self'", "https://api.bell24h.com", "wss://*.bell24h.com"]
        }
      },
      // Configurations for other security features
      xssFilter: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    })(req, res, next);
  };
}
