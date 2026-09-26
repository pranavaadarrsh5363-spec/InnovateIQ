import { Router, Request, Response } from 'express';
import { pilotRepository } from '../repositories/pilotRepository';
import { auditRepository } from '../repositories/auditRepository';
import { authenticateToken } from '../middleware/auth';
import { PilotProgram } from '../types';

const router = Router();

// GET /api/pilots
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, projectId, problemId, organizationId, search, page, pageSize, isDemo } = req.query;
    const isDemoBool = isDemo !== undefined ? isDemo === 'true' : undefined;
    const pageNum = page ? parseInt(page as string) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize as string) : undefined;

    const list = await pilotRepository.findAll({
      status: status as string,
      projectId: projectId as string,
      problemId: problemId as string,
      organizationId: organizationId as string,
      search: search as string,
      page: pageNum,
      pageSize: pageSizeNum,
      isDemo: isDemoBool,
    });

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to retrieve pilots' } });
  }
});

// GET /api/pilots/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pilot = await pilotRepository.findById(req.params.id);
    if (!pilot) return res.status(404).json({ success: false, error: { message: 'Pilot program not found' } });
    return res.json(pilot);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to retrieve pilot' } });
  }
});

// POST /api/pilots (Create new pilot deployment)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      problemId,
      organizationId,
      name,
      title,
      organization,
      partnerOrganization,
      location,
      cohortSize,
      participantsCount,
      startDate,
      endDate,
      objectives,
      description,
      successCriteria,
    } = req.body;

    const pilotTitle = (name || title || 'New Field Pilot Program').trim();
    const orgId = organizationId || (req.user as any)?.organizationId || 'org-rajasthan-phed';

    const newPilot: PilotProgram = {
      id: `pilot-${Date.now().toString().slice(-6)}`,
      projectId: projectId || 'proj-cauvery-01',
      problemId: problemId || 'prob-water-01',
      title: pilotTitle,
      name: pilotTitle,
      organization: partnerOrganization || organization || 'Institutional Partner',
      partnerOrganization: partnerOrganization || organization || 'Institutional Partner',
      location: location || 'Pilot Site',
      cohortSize: cohortSize || (participantsCount ? `${participantsCount} Participants` : '100 Households'),
      participantsCount: participantsCount || 100,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      status: 'deploying',
      description: description || 'Field validation deployment of filtration and sensing nodes.',
      objectives: Array.isArray(objectives) ? objectives : ['Validate hardware telemetry stability in field conditions'],
      successCriteria: Array.isArray(successCriteria) ? successCriteria : ['TDS < 500 ppm', 'pH 6.5 - 8.5', 'Turbidity < 5 NTU'],
      kpis: [
        { name: 'Telemetry Packet Delivery Rate', target: '> 95%', current: '0%' },
        { name: 'Field Maintenance Call Frequency', target: '< 1 per month', current: '0' },
      ],
      issues: [],
      reportedIssues: [],
      feedback: [],
      feedbackList: [],
      isDemoData: false,
      ...(orgId && { organizationId: orgId }),
    } as any;

    const saved = await pilotRepository.create(newPilot);

    // Record audit log
    await auditRepository.create({
      id: `audit-pilot-${Date.now()}`,
      userId: req.user?.id || 'admin-1',
      userName: req.user?.email || 'Program Coordinator',
      userRole: req.user?.role || 'admin',
      action: 'PILOT_COMMISSIONED',
      timestamp: new Date().toISOString(),
      entityType: 'Pilot',
      entityId: saved.id,
      organizationId: orgId,
      details: `Initiated pilot program "${saved.title}" at ${saved.location}`,
    });

    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message || 'Failed to create pilot' } });
  }
});

// PUT /api/pilots/:id/status
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const pilot = await pilotRepository.findById(req.params.id);
    if (!pilot) return res.status(404).json({ success: false, error: { message: 'Pilot not found' } });

    // Tenant check
    if (
      req.user?.role !== 'admin' &&
      (pilot as any).organizationId &&
      req.user?.organizationId &&
      (pilot as any).organizationId !== req.user.organizationId
    ) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized across organization boundaries' } });
    }

    const updated = await pilotRepository.update(req.params.id, {
      status: req.body.status || pilot.status,
      ...(req.body.resultsSummary && { resultsSummary: req.body.resultsSummary }),
    });

    await auditRepository.create({
      id: `audit-pilot-stat-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'student',
      action: 'PILOT_STATUS_UPDATED',
      timestamp: new Date().toISOString(),
      entityType: 'Pilot',
      entityId: req.params.id,
      organizationId: (pilot as any).organizationId,
      details: `Updated pilot "${pilot.title}" status to ${req.body.status}`,
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to update pilot status' } });
  }
});

// DELETE /api/pilots/:id (Archive / Delete Pilot)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const pilot = await pilotRepository.findById(req.params.id);
    if (!pilot) return res.status(404).json({ success: false, error: { message: 'Pilot not found' } });

    if (
      req.user?.role !== 'admin' &&
      (pilot as any).organizationId &&
      req.user?.organizationId &&
      (pilot as any).organizationId !== req.user.organizationId
    ) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized across organization boundaries' } });
    }

    await pilotRepository.delete(req.params.id);

    await auditRepository.create({
      id: `audit-pilot-del-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'admin',
      action: 'PILOT_DELETED',
      timestamp: new Date().toISOString(),
      entityType: 'Pilot',
      entityId: req.params.id,
      organizationId: (pilot as any).organizationId,
      details: `Deleted pilot program "${pilot.title}"`,
    });

    return res.json({ success: true, message: 'Pilot successfully deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to delete pilot' } });
  }
});

// POST /api/pilots/:id/issues
router.post('/:id/issues', authenticateToken, async (req: Request, res: Response) => {
  try {
    const pilot = await pilotRepository.findById(req.params.id);
    if (!pilot) return res.status(404).json({ success: false, error: { message: 'Pilot not found' } });

    const issue = {
      id: `iss-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      loggedAt: new Date().toISOString().split('T')[0],
      severity: req.body.severity || 'medium',
      description: req.body.description || 'Hardware telemetry exception',
      status: 'Open',
      resolved: false,
    };

    const issues = [...(pilot.issues || (pilot as any).reportedIssues || []), issue];
    await pilotRepository.update(req.params.id, { issues: issues as any, reportedIssues: issues as any });

    return res.status(201).json(issue);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to log issue' } });
  }
});

// POST /api/pilots/:id/feedback
router.post('/:id/feedback', authenticateToken, async (req: Request, res: Response) => {
  try {
    const pilot = await pilotRepository.findById(req.params.id);
    if (!pilot) return res.status(404).json({ success: false, error: { message: 'Pilot not found' } });

    const fb = {
      id: `fb-${Date.now()}`,
      authorName: req.body.authorName || 'Community Stakeholder',
      authorRole: req.body.role || req.body.authorRole || 'Community Stakeholder',
      role: req.body.role || req.body.authorRole || 'Community Stakeholder',
      content: req.body.content || req.body.feedback || '',
      feedback: req.body.content || req.body.feedback || '',
      sentiment: req.body.sentiment || 'positive',
      rating: req.body.rating || 5,
      submittedAt: new Date().toISOString().split('T')[0],
    };

    const feedback = [...(pilot.feedback || (pilot as any).feedbackList || []), fb];
    await pilotRepository.update(req.params.id, { feedback: feedback as any, feedbackList: feedback as any });

    return res.status(201).json(fb);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to submit feedback' } });
  }
});

export default router;
