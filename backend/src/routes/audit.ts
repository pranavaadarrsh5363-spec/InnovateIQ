import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuditLog } from '../types';

const router = Router();

// GET /api/audit/logs
router.get('/logs', authenticateToken, requireRole('admin', 'mentor'), (req: Request, res: Response) => {
  const { entityType, action } = req.query;
  let logs: AuditLog[] = (db as any).auditLogs || [];

  if (entityType && entityType !== 'All') {
    logs = logs.filter(l => l.entityType.toLowerCase() === (entityType as string).toLowerCase());
  }
  if (action && action !== 'All') {
    logs = logs.filter(l => l.action.toLowerCase() === (action as string).toLowerCase());
  }

  return res.json(logs);
});

// POST /api/audit/log
router.post('/log', (req: Request, res: Response) => {
  const log: AuditLog = {
    id: `audit-${Date.now()}`,
    userId: req.body.userId || 'system',
    userName: req.body.userName || 'System Action',
    userRole: req.body.userRole || 'admin',
    action: req.body.action || 'Problem Created',
    timestamp: new Date().toISOString(),
    entityType: req.body.entityType || 'Problem',
    entityId: req.body.entityId || 'general',
    details: req.body.details || '',
  };

  (db as any).auditLogs.unshift(log);
  return res.status(201).json(log);
});

export default router;
