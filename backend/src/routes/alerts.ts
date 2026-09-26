import { Router, Request, Response } from 'express';
import { alertRepository } from '../repositories/alertRepository';
import { auditRepository } from '../repositories/auditRepository';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/alerts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { pilotId, problemId, organizationId, status, isDemo } = req.query;
    const isDemoBool = isDemo !== undefined ? isDemo === 'true' : undefined;
    const alerts = await alertRepository.findAll({
      pilotId: pilotId as string,
      problemId: problemId as string,
      organizationId: organizationId as string,
      status: status as string,
      isDemo: isDemoBool,
    });
    return res.json(alerts);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch alerts' } });
  }
});

// GET /api/alerts/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const alert = await alertRepository.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: { message: 'Alert not found' } });
    return res.json(alert);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch alert' } });
  }
});

// POST /api/alerts/:id/acknowledge
router.post('/:id/acknowledge', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existing = await alertRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Alert not found' } });
    }

    const updated = await alertRepository.update(req.params.id, {
      status: 'ACKNOWLEDGED',
      acknowledgedBy: req.user?.id || 'u1',
      acknowledgedAt: new Date().toISOString(),
    });

    // Audit log
    await auditRepository.create({
      id: `audit-alert-ack-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'student',
      action: 'DECISION_ALERT_ACKNOWLEDGED',
      timestamp: new Date().toISOString(),
      entityType: 'Alert',
      entityId: req.params.id,
      organizationId: existing.organizationId,
      details: `Acknowledged decision alert "${existing.title}"`,
    });

    return res.json({ success: true, alert: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to acknowledge alert' } });
  }
});

// POST /api/alerts/:id/resolve
router.post('/:id/resolve', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existing = await alertRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Alert not found' } });
    }

    const updated = await alertRepository.update(req.params.id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
    });

    // Audit log
    await auditRepository.create({
      id: `audit-alert-res-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'student',
      action: 'DECISION_ALERT_RESOLVED',
      timestamp: new Date().toISOString(),
      entityType: 'Alert',
      entityId: req.params.id,
      organizationId: existing.organizationId,
      details: `Resolved decision alert "${existing.title}"`,
    });

    return res.json({ success: true, alert: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to resolve alert' } });
  }
});

export default router;
