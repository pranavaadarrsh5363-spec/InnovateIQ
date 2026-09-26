import { Router, Request, Response } from 'express';
import { solutionRepository } from '../repositories/solutionRepository';
import { problemRepository } from '../repositories/problemRepository';
import { auditRepository } from '../repositories/auditRepository';
import { authenticateToken } from '../middleware/auth';
import { Solution } from '../types';

const router = Router();

// GET /api/solutions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { problemId, organizationId, search, page, pageSize, isDemo } = req.query;
    const isDemoBool = isDemo !== undefined ? isDemo === 'true' : undefined;
    let solutions = await solutionRepository.findAll({
      problemId: problemId as string,
      organizationId: organizationId as string,
      isDemo: isDemoBool,
    });

    if (search) {
      const q = (search as string).toLowerCase();
      solutions = solutions.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.technologyStack.some(t => t.toLowerCase().includes(q))
      );
    }

    if (page !== undefined) {
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const pageSizeNum = Math.max(1, parseInt(pageSize as string) || 25);
      const total = solutions.length;
      const totalPages = Math.ceil(total / pageSizeNum);
      const paginated = solutions.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum);
      return res.json({ items: paginated, total, page: pageNum, pageSize: pageSizeNum, totalPages });
    }

    return res.json(solutions);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch solutions' } });
  }
});

// GET /api/solutions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const solution = await solutionRepository.findById(req.params.id);
    if (!solution) return res.status(404).json({ success: false, error: { message: 'Solution not found' } });
    return res.json(solution);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch solution' } });
  }
});

// POST /api/solutions (Propose / Register new solution)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      problemId,
      organizationId,
      title,
      description,
      technologyStack,
      maturityLevel,
      feasibilityScore,
      estimatedCostInr,
      timelineWeeks,
      risks,
    } = req.body;

    if (!problemId || !title || !description) {
      return res.status(400).json({
        success: false,
        error: { message: 'problemId, title, and description are required' },
      });
    }

    // Verify problem exists
    const problem = await problemRepository.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, error: { message: `Problem ${problemId} does not exist` } });
    }

    const orgId = organizationId || (problem as any).organizationId || (req.user as any)?.organizationId || 'org-rajasthan-phed';

    const newSolution: Solution = {
      id: `sol-${Date.now().toString().slice(-6)}`,
      problemId,
      organizationId: orgId,
      title: title.trim(),
      description: description.trim(),
      technologyStack: Array.isArray(technologyStack) ? technologyStack : ['IoT', 'Edge Computing', 'Microcontrollers'],
      maturityLevel: maturityLevel || 'TRL-4',
      feasibilityScore: typeof feasibilityScore === 'number' ? feasibilityScore : 80,
      estimatedCostInr: typeof estimatedCostInr === 'number' ? estimatedCostInr : 5000,
      timelineWeeks: typeof timelineWeeks === 'number' ? timelineWeeks : 12,
      risks: Array.isArray(risks) ? risks : [],
      createdBy: req.user?.id || 'u1',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    const created = await solutionRepository.create(newSolution);

    // Audit log
    await auditRepository.create({
      id: `audit-sol-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'Innovator',
      userRole: req.user?.role || 'student',
      action: 'SOLUTION_REGISTERED',
      timestamp: new Date().toISOString(),
      entityType: 'Solution',
      entityId: created.id,
      organizationId: created.organizationId,
      details: `Registered candidate solution "${created.title}" for problem ${created.problemId}`,
    });

    return res.status(201).json({ success: true, solution: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message || 'Failed to create solution' } });
  }
});

// PATCH /api/solutions/:id (Update Solution with Tenant Check)
router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existing = await solutionRepository.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: { message: 'Solution not found' } });

    if (
      req.user?.role !== 'admin' &&
      existing.organizationId &&
      req.user?.organizationId &&
      existing.organizationId !== req.user.organizationId
    ) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized across organization boundaries' } });
    }

    const updated = await solutionRepository.update(req.params.id, req.body);
    return res.json({ success: true, solution: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to update solution' } });
  }
});

// DELETE /api/solutions/:id (Delete Solution with Tenant Check)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const existing = await solutionRepository.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: { message: 'Solution not found' } });

    if (
      req.user?.role !== 'admin' &&
      existing.organizationId &&
      req.user?.organizationId &&
      existing.organizationId !== req.user.organizationId
    ) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized across organization boundaries' } });
    }

    await solutionRepository.delete(req.params.id);

    await auditRepository.create({
      id: `audit-sol-del-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'User',
      userRole: req.user?.role || 'admin',
      action: 'SOLUTION_DELETED',
      timestamp: new Date().toISOString(),
      entityType: 'Solution',
      entityId: req.params.id,
      organizationId: existing.organizationId,
      details: `Deleted candidate solution "${existing.title}"`,
    });

    return res.json({ success: true, message: 'Solution deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to delete solution' } });
  }
});

// POST /api/solutions/compare
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { solutionIds, problemId } = req.body;
    let solutions: Solution[] = [];

    if (Array.isArray(solutionIds) && solutionIds.length > 0) {
      const all = await solutionRepository.findAll();
      solutions = all.filter(s => solutionIds.includes(s.id));
    } else if (problemId) {
      solutions = await solutionRepository.findAll({ problemId });
    }

    if (solutions.length < 2) {
      return res.status(400).json({
        success: false,
        error: { message: 'Minimum 2 candidate solutions required for comparative analysis' },
      });
    }

    const comparison = {
      evaluatedAt: new Date().toISOString(),
      candidateCount: solutions.length,
      solutions: solutions.map(s => ({
        id: s.id,
        title: s.title,
        maturityLevel: s.maturityLevel,
        feasibilityScore: s.feasibilityScore,
        estimatedCostInr: s.estimatedCostInr,
        timelineWeeks: s.timelineWeeks,
        technologyCount: s.technologyStack.length,
        riskCount: s.risks?.length || 0,
      })),
      recommendedSolutionId: solutions.reduce((best, cur) =>
        (cur.feasibilityScore / (cur.estimatedCostInr || 1)) > (best.feasibilityScore / (best.estimatedCostInr || 1)) ? cur : best
      ).id,
    };

    return res.json({ success: true, comparison });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to compare solutions' } });
  }
});

export default router;
