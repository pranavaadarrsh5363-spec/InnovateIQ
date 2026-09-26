import { Request, Response, NextFunction } from 'express';

/**
 * Attaches essential security headers to all HTTP responses
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection (allow framing only by same origin)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cross-Site Scripting protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security for production HTTPS environments
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}
