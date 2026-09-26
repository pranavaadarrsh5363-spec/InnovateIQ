import { Router, Request, Response } from 'express';
import { problemRepository } from '../repositories/problemRepository';
import { auditRepository } from '../repositories/auditRepository';
import { aiService } from '../services/aiService';
import { authenticateToken } from '../middleware/auth';
import { Problem } from '../types';
import { db } from '../data/seed';

const router = Router();

// GET /api/problems
router.get('/', async (req: Request, res: Response) => {
  try {
    const { domain, priority, status, search, organizationId, page, pageSize, isDemo } = req.query;
    const isDemoBool = isDemo !== undefined ? isDemo === 'true' : undefined;
    const pageNum = page ? parseInt(page as string) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize as string) : undefined;

    const results = await problemRepository.findAll({
      domain: domain as string,
      priority: priority as string,
      status: status as string,
      search: search as string,
      organizationId: organizationId as string,
      page: pageNum,
      pageSize: pageSizeNum,
      isDemo: isDemoBool,
    });

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to retrieve problems' } });
  }
});

// GET /api/problems/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await problemRepository.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, error: { message: 'Problem statement not found' } });
    }
    return res.json(problem);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to retrieve problem' } });
  }
});

// POST /api/problems (Publish by Organization or Authenticated User)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      organization,
      organizationId,
      organizationType,
      location,
      domain,
      targetPopulation,
      currentSituation,
      expectedOutcome,
      constraints,
      availableResources,
      requiredSkills,
      priority,
      submissionDeadline,
    } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Problem title is required' } });
    }

    const orgId = organizationId || (req.user as any)?.organizationId || 'org-rajasthan-phed';

    const newProblem: Problem = {
      id: `prob-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      description: description || '',
      organization: organization || 'Institutional Partner',
      organizationType: organizationType || 'Government',
      location: location || 'India',
      domain: domain || 'Public Services',
      targetPopulation: targetPopulation || 'Citizens',
      currentSituation: currentSituation || '',
      expectedOutcome: expectedOutcome || '',
      constraints: Array.isArray(constraints) ? constraints : [],
      availableResources: Array.isArray(availableResources) ? availableResources : [],
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      priority: priority || 'High',
      status: 'Open for Innovation',
      submissionDeadline: submissionDeadline || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      postedDate: new Date().toISOString().split('T')[0],
      sourceQuality: 'High',
      verifiedSource: true,
      ...(orgId && { organizationId: orgId }),
      isDemo: false,
    } as any;

    const saved = await problemRepository.create(newProblem);

    // Record audit log
    await auditRepository.create({
      id: `audit-prob-${Date.now()}`,
      userId: req.user?.id || 'org-user',
      userName: req.user?.email || 'Organization Lead',
      userRole: req.user?.role || 'student',
      action: 'PROBLEM_PUBLISHED',
      timestamp: new Date().toISOString(),
      entityType: 'Problem',
      entityId: saved.id,
      organizationId: orgId,
      details: `Published real-world problem statement: "${saved.title}" in domain ${saved.domain}`,
    });

    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message || 'Failed to create problem' } });
  }
});

// PATCH /api/problems/:id (Update Problem Details with Tenant Authorization)
router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existing = await problemRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Problem not found' } });
    }

    // Tenant check: Organization A cannot modify Organization B's problem
    if (
      req.user?.role !== 'admin' &&
      (existing as any).organizationId &&
      req.user?.organizationId &&
      (existing as any).organizationId !== req.user.organizationId
    ) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized across organization boundaries' } });
    }

    const updated = await problemRepository.update(req.params.id, req.body);

    await auditRepository.create({
      id: `audit-prob-upd-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'student',
      action: 'PROBLEM_UPDATED',
      timestamp: new Date().toISOString(),
      entityType: 'Problem',
      entityId: req.params.id,
      organizationId: (existing as any).organizationId,
      details: `Updated problem details for "${existing.title}"`,
    });

    return res.json({ success: true, problem: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to update problem' } });
  }
});

// DELETE /api/problems/:id (Archive / Delete Problem)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existing = await problemRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Problem not found' } });
    }

    if (
      req.user?.role !== 'admin' &&
      (existing as any).organizationId &&
      req.user?.organizationId &&
      (existing as any).organizationId !== req.user.organizationId
    ) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized across organization boundaries' } });
    }

    await problemRepository.delete(req.params.id);

    await auditRepository.create({
      id: `audit-prob-del-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'admin',
      action: 'PROBLEM_DELETED',
      timestamp: new Date().toISOString(),
      entityType: 'Problem',
      entityId: req.params.id,
      organizationId: (existing as any).organizationId,
      details: `Deleted problem statement "${existing.title}"`,
    });

    return res.json({ success: true, message: 'Problem successfully deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to delete problem' } });
  }
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
    const existingIdx = (db as any).problemAnalyses?.findIndex((a: any) => a.problemId === req.params.id) ?? -1;
    if (existingIdx !== -1) {
      (db as any).problemAnalyses[existingIdx] = analysis;
    } else {
      (db as any).problemAnalyses = (db as any).problemAnalyses || [];
      (db as any).problemAnalyses.push(analysis);
    }

    // Record audit log
    await auditRepository.create({
      id: `audit-an-${Date.now()}`,
      userId: req.user?.id || 'student-1',
      userName: req.user?.email || 'Student Innovator',
      userRole: req.user?.role || 'student',
      action: 'AI_ANALYSIS_GENERATED',
      timestamp: new Date().toISOString(),
      entityType: 'Analysis',
      entityId: analysis.id,
      details: `Generated Root Cause Map and Stakeholder Matrix for problem ${req.params.id}`,
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
router.get('/:id/tech-matrix', (_req: Request, res: Response) => {
  const matrix = (db as any).technologyTradeoffs || [];
  return res.json(matrix);
});

// GET /api/problems/:id/decision-brief
router.get('/:id/decision-brief', async (req: Request, res: Response) => {
  try {
    const brief = await aiService.getDecisionBrief(req.params.id);

    await auditRepository.create({
      id: `audit-brief-${Date.now()}`,
      userId: req.user?.id || 'innovator-1',
      userName: req.user?.email || 'Innovator / Decision Maker',
      userRole: req.user?.role || 'student',
      action: 'DECISION_BRIEF_GENERATED',
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
