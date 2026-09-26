import { Request, Response, NextFunction } from 'express';

/**
 * Structured request logging middleware with performance metrics and correlation ID
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestId = req.id || 'req_unknown';
    const status = res.statusCode;
    const method = req.method;
    const path = req.originalUrl || req.url;

    // Filter out high-frequency polling from cluttering stdout unless error
    if (path === '/health/live' && status === 200) {
      return;
    }

    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    const timestamp = new Date().toISOString();

    if (process.env.NODE_ENV === 'production') {
      console.log(
        JSON.stringify({
          timestamp,
          level,
          requestId,
          method,
          path,
          status,
          durationMs: duration,
        })
      );
    } else {
      const statusColor = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢';
      console.log(`${statusColor} [${timestamp}] ${level} [${requestId}] ${method} ${path} ${status} - ${duration}ms`);
    }
  });

  next();
}
