import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { aiService } from '../services/aiService';
import { authenticateToken } from '../middleware/auth';
import { Problem } from '../types';

const router = Router();

// GET /api/problems
router.get('/', (req: Request, res: Response) => {
  const { domain, priority, status, search } = req.query;
  let results = (db as any).problems || [];

  if (domain && domain !== 'All') {
    results = results.filter((p: Problem) => p.domain.toLowerCase() === (domain as string).toLowerCase());
  }
  if (priority && priority !== 'All') {
    results = results.filter((p: Problem) => p.priority.toLowerCase() === (priority as string).toLowerCase());
  }
  if (status && status !== 'All') {
    results = results.filter((p: Problem) => p.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter((p: Problem) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.organization.toLowerCase().includes(q)
    );
  }

  return res.json(results);
});

// GET /api/problems/:id
router.get('/:id', (req: Request, res: Response) => {
  const problem = (db as any).problems?.find((p: Problem) => p.id === req.params.id);
  if (!problem) return res.status(404).json({ message: 'Problem statement not found' });
  return res.json(problem);
});

// POST /api/problems (Publish by Organization or Admin)
router.post('/', authenticateToken, (req: Request, res: Response) => {
  const newProblem: Problem = {
    id: `prob-${Date.now()}`,
    title: req.body.title || 'Untitled Problem',
    description: req.body.description || '',
    organization: req.body.organization || 'Independent Organization',
    organizationType: req.body.organizationType || 'NGO',
    location: req.body.location || 'Pan-India',
    domain: req.body.domain || 'Public Services',
    targetPopulation: req.body.targetPopulation || 'Citizens',
    currentSituation: req.body.currentSituation || '',
    expectedOutcome: req.body.expectedOutcome || '',
    constraints: req.body.constraints || [],
    availableResources: req.body.availableResources || [],
    requiredSkills: req.body.requiredSkills || [],
    priority: req.body.priority || 'High',
    status: 'Open for Innovation',
    submissionDeadline: req.body.submissionDeadline || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    postedDate: new Date().toISOString().split('T')[0],
    sourceQuality: 'High',
    verifiedSource: true,
  };

  (db as any).problems.unshift(newProblem);

  // Record audit log
  (db as any).auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: req.user?.id || 'org-user',
    userName: req.user?.email || 'Organization Lead',
    userRole: req.user?.role || 'admin',
    action: 'Problem Created',
    timestamp: new Date().toISOString(),
    entityType: 'Problem',
    entityId: newProblem.id,
    details: `Published real-world problem statement: "${newProblem.title}" in domain ${newProblem.domain}`,
  });

  return res.status(201).json(newProblem);
});

// GET /api/problems/:id/analysis
router.get('/:id/analysis', async (req: Request, res: Response) => {
  try {
    const analysis = await aiService.analyzeProblem(req.params.id);
    return res.json(analysis);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to retrieve problem analysis' });
  }
});

// POST /api/problems/:id/analyze
router.post('/:id/analyze', authenticateToken, async (req: Request, res: Response) => {
  try {
    const analysis = await aiService.analyzeProblem(req.params.id, req.body);
    const existingIdx = (db as any).problemAnalyses.findIndex((a: any) => a.problemId === req.params.id);
    if (existingIdx !== -1) {
      (db as any).problemAnalyses[existingIdx] = analysis;
    } else {
      (db as any).problemAnalyses.push(analysis);
    }

    // Record audit log
    (db as any).auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || 'student-1',
      userName: req.user?.email || 'Student Innovator',
      userRole: req.user?.role || 'student',
      action: 'AI Analysis Generated',
      timestamp: new Date().toISOString(),
      entityType: 'Analysis',
      entityId: analysis.id,
      details: `Generated Root Cause Map and Stakeholder Relationship Matrix for problem ${req.params.id}`,
    });

    return res.json(analysis);
  } catch (err: any) {
    return res.status(500).json({ message: 'Problem analysis generation failed' });
  }
});

// GET /api/problems/:id/solutions
router.get('/:id/solutions', (req: Request, res: Response) => {
  let solutions = (db as any).existingSolutions?.filter((s: any) => s.problemId === req.params.id);
  if (!solutions || solutions.length === 0) {
    solutions = (db as any).existingSolutions?.filter((s: any) => s.problemId === 'prob-water-01');
  }
  return res.json(solutions || []);
});

// GET /api/problems/:id/gaps
router.get('/:id/gaps', (req: Request, res: Response) => {
  let gaps = (db as any).innovationGaps?.filter((g: any) => g.problemId === req.params.id);
  if (!gaps || gaps.length === 0) {
    gaps = (db as any).innovationGaps?.filter((g: any) => g.problemId === 'prob-water-01');
  }
  return res.json(gaps || []);
});

// GET /api/problems/:id/tech-matrix
router.get('/:id/tech-matrix', (req: Request, res: Response) => {
  const matrix = (db as any).technologyTradeoffs || [];
  return res.json(matrix);
});

// GET /api/problems/:id/decision-brief
router.get('/:id/decision-brief', async (req: Request, res: Response) => {
  try {
    const brief = await aiService.getDecisionBrief(req.params.id);

    // Record audit log
    (db as any).auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || 'innovator-1',
      userName: req.user?.email || 'Innovator / Decision Maker',
      userRole: req.user?.role || 'student',
      action: 'AI Analysis Generated',
      timestamp: new Date().toISOString(),
      entityType: 'Analysis',
      entityId: brief.id,
      details: `Generated Executive AI Decision Brief for problem "${brief.problem.title}"`,
    });

    return res.json(brief);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to generate AI Decision Brief' });
  }
});

export default router;
