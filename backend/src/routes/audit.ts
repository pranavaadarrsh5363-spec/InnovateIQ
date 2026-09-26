import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken, requireRole } from '../middleware/auth';
import { auditRepository } from '../repositories/auditRepository';
import { AuditLog } from '../types';

const router = Router();

// GET /api/audit/logs (Admin & Mentor RBAC Protected)
router.get('/logs', authenticateToken, requireRole('admin', 'mentor'), async (req: Request, res: Response) => {
  try {
    const { entityType, action, page, pageSize } = req.query;
    const result = await auditRepository.findAll({
      entityType: entityType ? String(entityType) : undefined,
      action: action ? String(action) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      pageSize: pageSize ? parseInt(String(pageSize), 10) : undefined,
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Database error', message: 'Failed to retrieve audit logs' });
  }
});

// POST /api/audit/log
router.post('/log', async (req: Request, res: Response) => {
  try {
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
      isDemo: req.body.isDemo ?? false,
    };

    (db as any).auditLogs.unshift(log);
    const saved = await auditRepository.create(log);
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: 'Database error', message: 'Failed to record audit log' });
  }
});

// GET /api/audit/verify-chain (Verify cryptographic hash chain integrity)
router.get('/verify-chain', authenticateToken, requireRole('admin', 'mentor'), async (_req: Request, res: Response) => {
  try {
    const result = await auditRepository.verifyChainIntegrity();
    return res.json({
      success: true,
      integrity: result.valid ? 'VALID' : 'COMPROMISED',
      totalChecked: result.totalChecked,
      brokenIndex: result.brokenIndex,
      algorithm: 'SHA-256',
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to verify audit ledger integrity' } });
  }
});

export default router;
