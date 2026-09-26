import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Centralized API Error Handling Middleware
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);
  const requestId = req.id || 'req_unknown';
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  // Server-side diagnostic log
  console.error(`❌ [Error Handler] [${requestId}] ${err.name || 'Error'}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const safeMessage = (statusCode >= 500 && isProduction)
    ? 'A server error occurred while processing your request. Please try again later.'
    : (err.message || 'An unexpected error occurred.');

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: safeMessage,
      ...(err.details ? { details: err.details } : {}),
    },
    requestId,
  });
}

/**
 * 404 Not Found Middleware Handler
 */
export function notFoundHandler(req: Request, res: Response) {
  const requestId = req.id || 'req_unknown';
  return res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `The requested resource endpoint was not found: ${req.method} ${req.path}`,
    },
    requestId,
  });
}
