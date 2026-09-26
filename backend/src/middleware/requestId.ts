import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Assigns or validates an incoming X-Request-ID correlation header
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingId = req.headers['x-request-id'];
  const requestId = (typeof incomingId === 'string' && incomingId.trim().length > 0)
    ? incomingId.trim()
    : `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
