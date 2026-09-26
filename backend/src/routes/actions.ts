import { Router, Request, Response } from 'express';
import { actionRepository } from '../repositories/actionRepository';
import { auditRepository } from '../repositories/auditRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { authenticateToken } from '../middleware/auth';
import { OperationalAction } from '../types';

const router = Router();

// GET /api/actions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { pilotId, problemId, organizationId, status, search, page, pageSize, isDemo } = req.query;
    const isDemoBool = isDemo !== undefined ? isDemo === 'true' : undefined;
    let actions = await actionRepository.findAll({
      pilotId: pilotId as string,
      problemId: problemId as string,
      organizationId: organizationId as string,
      status: status as string,
      isDemo: isDemoBool,
    });

    if (search) {
      const q = (search as string).toLowerCase();
      actions = actions.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.assignedToName || '').toLowerCase().includes(q)
      );
    }

    if (page !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const pageSizeNum = Math.max(1, parseInt(pageSize as string) || 25);
      const total = actions.length;
      const totalPages = Math.ceil(total / pageSizeNum);
      const paginated = actions.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum);
      return res.json({ items: paginated, total, page: pageNum, pageSize: pageSizeNum, totalPages });
    }

    return res.json(actions);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch operational actions' } });
  }
});

// GET /api/actions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const action = await actionRepository.findById(req.params.id);
    if (!action) return res.status(404).json({ success: false, error: { message: 'Operational action not found' } });
    return res.json(action);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch action' } });
  }
});

// POST /api/actions (Create new operational action)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      organizationId,
      problemId,
      pilotId,
      alertId,
      title,
      description,
      assignedTo,
      assignedToName,
      priority,
      dueDate,
    } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Action title is required' } });
    }

    const orgId = organizationId || (req.user as any)?.organizationId || 'org-rajasthan-phed';

    const newAction: OperationalAction = {
      id: `act-${Date.now().toString().slice(-6)}`,
      organizationId: orgId,
      problemId: problemId || 'prob-water-01',
      pilotId: pilotId || 'pilot-alwar-01',
      alertId: alertId || null,
      title: title.trim(),
      description: description || '',
      assignedTo: assignedTo || req.user?.id || 'u1',
      assignedToName: assignedToName || req.user?.email || 'Field Operator',
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await actionRepository.create(newAction);

    // Notify assignee
    if (newAction.assignedTo) {
      await notificationRepository.create({
        id: `notif-${Date.now()}`,
        userId: newAction.assignedTo,
        organizationId: newAction.organizationId,
        title: 'New Operational Action Assigned',
        message: `You have been assigned task: "${newAction.title}" (Priority: ${newAction.priority})`,
        type: 'ACTION_ASSIGNED',
        link: `/actions`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Audit log
    await auditRepository.create({
      id: `audit-act-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'Field Lead',
      userRole: req.user?.role || 'student',
      action: 'OPERATIONAL_ACTION_CREATED',
      timestamp: new Date().toISOString(),
      entityType: 'Action',
      entityId: saved.id,
      organizationId: saved.organizationId,
      details: `Created operational action "${saved.title}" (Priority: ${saved.priority}) for pilot ${saved.pilotId}`,
    });

    return res.status(201).json({ success: true, action: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message || 'Failed to create action' } });
  }
});

// PATCH /api/actions/:id (Update action status, priority, resolution notes with Tenant Check)
router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, priority, resolutionNotes, assignedTo, assignedToName } = req.body;
    const existing = await actionRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Action not found' } });
    }

    if (
      req.user?.role !== 'admin' &&
      existing.organizationId &&
      req.user?.organizationId &&
      existing.organizationId !== req.user.organizationId
    ) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized across organization boundaries' } });
    }

    const updated = await actionRepository.update(req.params.id, {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(resolutionNotes !== undefined && { resolutionNotes }),
      ...(assignedTo && { assignedTo }),
      ...(assignedToName && { assignedToName }),
    });

    // Audit log
    await auditRepository.create({
      id: `audit-act-upd-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'student',
      action: 'OPERATIONAL_ACTION_UPDATED',
      timestamp: new Date().toISOString(),
      entityType: 'Action',
      entityId: req.params.id,
      organizationId: existing.organizationId,
      details: `Updated action "${existing.title}" status to ${status || existing.status}${resolutionNotes ? ' with resolution notes' : ''}`,
    });

    return res.json({ success: true, action: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to update action' } });
  }
});

// DELETE /api/actions/:id (Delete Action with Tenant Check)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existing = await actionRepository.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: { message: 'Action not found' } });

    if (
      req.user?.role !== 'admin' &&
      existing.organizationId &&
      req.user?.organizationId &&
      existing.organizationId !== req.user.organizationId
    ) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized across organization boundaries' } });
    }

    await actionRepository.delete(req.params.id);

    await auditRepository.create({
      id: `audit-act-del-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'admin',
      action: 'OPERATIONAL_ACTION_DELETED',
      timestamp: new Date().toISOString(),
      entityType: 'Action',
      entityId: req.params.id,
      organizationId: existing.organizationId,
      details: `Deleted operational action "${existing.title}"`,
    });

    return res.json({ success: true, message: 'Operational action deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to delete action' } });
  }
});

export default router;
