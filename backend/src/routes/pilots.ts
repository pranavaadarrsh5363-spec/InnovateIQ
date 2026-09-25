import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';
import { PilotProgram } from '../types';

const router = Router();

// GET /api/pilots
router.get('/', (req: Request, res: Response) => {
  const { status, projectId, problemId } = req.query;
  let list: PilotProgram[] = (db as any).pilotPrograms || [];

  if (status && status !== 'All') {
    list = list.filter(p => p.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (projectId) {
    list = list.filter(p => p.projectId === projectId);
  }
  if (problemId) {
    const matched = list.filter(p => p.problemId === problemId);
    if (matched.length > 0) list = matched;
  }

  return res.json(list);
});

// GET /api/pilots/:id
router.get('/:id', (req: Request, res: Response) => {
  const pilot = (db as any).pilotPrograms?.find((p: PilotProgram) => p.id === req.params.id);
  if (!pilot) return res.status(404).json({ message: 'Pilot program not found' });
  return res.json(pilot);
});

// POST /api/pilots (Create new pilot deployment)
router.post('/', authenticateToken, (req: Request, res: Response) => {
  const newPilot: PilotProgram = {
    id: `pilot-${Date.now()}`,
    projectId: req.body.projectId || 'proj-1',
    problemId: req.body.problemId || 'prob-water-01',
    title: req.body.title || 'New Field Pilot Program',
    organization: req.body.organization || 'Institutional Partner',
    location: req.body.location || 'Pilot Site',
    participantsCount: req.body.participantsCount || 50,
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    status: 'Planning',
    objectives: req.body.objectives || ['Validate hardware telemetry stability in field conditions'],
    kpis: req.body.kpis || [
      { name: 'Telemetry Packet Delivery Rate', target: '> 95%', current: '0%' },
      { name: 'Field Maintenance Call Frequency', target: '< 1 per month', current: '0' },
    ],
    reportedIssues: [],
    feedbackList: [],
    isDemoData: true,
  };

  (db as any).pilotPrograms.unshift(newPilot);

  // Record audit log
  (db as any).auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: req.user?.id || 'admin-1',
    userName: req.user?.email || 'Program Coordinator',
    userRole: req.user?.role || 'admin',
    action: 'Pilot Started',
    timestamp: new Date().toISOString(),
    entityType: 'Pilot',
    entityId: newPilot.id,
    details: `Initiated pilot program "${newPilot.title}" at ${newPilot.location}`,
  });

  return res.status(201).json(newPilot);
});

// PUT /api/pilots/:id/status
router.put('/:id/status', authenticateToken, (req: Request, res: Response) => {
  const pilot = (db as any).pilotPrograms?.find((p: PilotProgram) => p.id === req.params.id);
  if (!pilot) return res.status(404).json({ message: 'Pilot not found' });

  pilot.status = req.body.status || pilot.status;
  if (req.body.resultsSummary) pilot.resultsSummary = req.body.resultsSummary;

  return res.json(pilot);
});

// POST /api/pilots/:id/issues
router.post('/:id/issues', authenticateToken, (req: Request, res: Response) => {
  const pilot = (db as any).pilotPrograms?.find((p: PilotProgram) => p.id === req.params.id);
  if (!pilot) return res.status(404).json({ message: 'Pilot not found' });

  const issue = {
    id: `iss-${Date.now()}`,
    reportedAt: new Date().toISOString(),
    severity: req.body.severity || 'Medium',
    description: req.body.description || 'Hardware telemetry exception',
    resolved: false,
  };

  pilot.reportedIssues.unshift(issue);
  return res.status(201).json(issue);
});

// POST /api/pilots/:id/feedback
router.post('/:id/feedback', authenticateToken, (req: Request, res: Response) => {
  const pilot = (db as any).pilotPrograms?.find((p: PilotProgram) => p.id === req.params.id);
  if (!pilot) return res.status(404).json({ message: 'Pilot not found' });

  const fb = {
    id: `fb-${Date.now()}`,
    authorRole: req.body.authorRole || 'Community Stakeholder',
    feedback: req.body.feedback || '',
    rating: req.body.rating || 5,
    submittedAt: new Date().toISOString(),
  };

  pilot.feedbackList.unshift(fb);
  return res.status(201).json(fb);
});

export default router;
