import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/feasibility/analyze
router.post('/analyze', authenticateToken, async (req: Request, res: Response) => {
  try {
    const report = await aiService.analyzeFeasibility(req.body);
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ message: 'Feasibility analysis failed' });
  }
});

// POST /api/feasibility/costs or /cost
router.post(['/costs', '/cost'], authenticateToken, async (req: Request, res: Response) => {
  try {
    const estimate = await aiService.estimateProjectCosts(req.body);
    return res.json(estimate);
  } catch (err: any) {
    return res.status(500).json({ message: 'Cost estimation failed' });
  }
});

export default router;
