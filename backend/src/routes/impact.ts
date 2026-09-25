import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';
import { ImpactKPI, FeedbackLoopItem } from '../types';

const router = Router();

// GET /api/impact/kpis
router.get('/kpis', (req: Request, res: Response) => {
  const { projectId, problemId, category } = req.query;
  let list: ImpactKPI[] = (db as any).impactKPIs || [];

  if (projectId) {
    list = list.filter(k => k.projectId === projectId);
  } else if (problemId) {
    const linkedProjects = (db as any).projects?.filter((p: any) => p.problemId === problemId).map((p: any) => p.id) || [];
    if (linkedProjects.length > 0) {
      list = list.filter(k => linkedProjects.includes(k.projectId));
    }
  }
  if (category && category !== 'All') {
    list = list.filter(k => k.category.toLowerCase() === (category as string).toLowerCase());
  }

  return res.json(list);
});

// POST /api/impact/kpis (Define new KPI)
router.post('/kpis', authenticateToken, (req: Request, res: Response) => {
  const baseline = Number(req.body.baselineValue) || 100;
  const target = Number(req.body.targetValue) || 20;
  const current = Number(req.body.currentValue) || baseline;

  // Calculate progress percentage toward target
  let progress = 0;
  if (baseline !== target) {
    progress = Math.min(100, Math.max(0, Math.round(((baseline - current) / (baseline - target)) * 100)));
  }

  const newKPI: ImpactKPI = {
    id: `kpi-${Date.now()}`,
    projectId: req.body.projectId || 'proj-1',
    metricName: req.body.metricName || 'Operational Efficiency',
    category: req.body.category || 'Operational',
    baselineValue: baseline,
    targetValue: target,
    currentValue: current,
    unit: req.body.unit || '%',
    progressPercent: progress,
    sourceOfTruth: req.body.sourceOfTruth || 'Field Sensor Telemetry Logs',
    lastUpdated: new Date().toISOString(),
    isDemoData: true,
  };

  (db as any).impactKPIs.unshift(newKPI);

  // Record audit log
  (db as any).auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: req.user?.id || 'student-1',
    userName: req.user?.email || 'User',
    userRole: req.user?.role || 'student',
    action: 'Impact Updated',
    timestamp: new Date().toISOString(),
    entityType: 'Evidence',
    entityId: newKPI.id,
    details: `Defined measurable impact KPI "${newKPI.metricName}" (Target: ${newKPI.targetValue} ${newKPI.unit})`,
  });

  return res.status(201).json(newKPI);
});

// PUT /api/impact/kpis/:id
router.put('/kpis/:id', authenticateToken, (req: Request, res: Response) => {
  const kpi = (db as any).impactKPIs?.find((k: ImpactKPI) => k.id === req.params.id);
  if (!kpi) return res.status(404).json({ message: 'KPI not found' });

  if (req.body.currentValue !== undefined) {
    kpi.currentValue = Number(req.body.currentValue);
    const { baselineValue, targetValue, currentValue } = kpi;
    if (baselineValue !== targetValue) {
      kpi.progressPercent = Math.min(100, Math.max(0, Math.round(((baselineValue - currentValue) / (baselineValue - targetValue)) * 100)));
    }
  }
  if (req.body.sourceOfTruth) kpi.sourceOfTruth = req.body.sourceOfTruth;
  kpi.lastUpdated = new Date().toISOString();

  return res.json(kpi);
});

// GET /api/impact/feedback-loops
router.get('/feedback-loops', (req: Request, res: Response) => {
  const { projectId } = req.query;
  let loops: FeedbackLoopItem[] = (db as any).feedbackLoops || [];
  if (projectId) {
    loops = loops.filter(l => l.projectId === projectId);
  }
  return res.json(loops);
});

// POST /api/impact/feedback-loops
router.post('/feedback-loops', authenticateToken, (req: Request, res: Response) => {
  const newLoop: FeedbackLoopItem = {
    id: `fbl-${Date.now()}`,
    projectId: req.body.projectId || 'proj-1',
    cycleNumber: ((db as any).feedbackLoops?.length || 0) + 1,
    phase: req.body.phase || 'User Feedback',
    observation: req.body.observation || '',
    suggestedAction: req.body.suggestedAction || '',
    status: req.body.status || 'Under Review',
    recordedAt: new Date().toISOString(),
  };

  (db as any).feedbackLoops.push(newLoop);
  return res.status(201).json(newLoop);
});

export default router;
