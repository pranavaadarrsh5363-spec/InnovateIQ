import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/ai/analyze
router.post('/analyze', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await aiService.analyzeIdea(req.body);
    return res.json(result);
  } catch {
    return res.status(500).json({ message: 'AI analysis failed' });
  }
});

// POST /api/ai/chat
router.post('/chat', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { messages, domain } = req.body;
    const response = await aiService.chat(messages, domain);
    return res.json({ response });
  } catch {
    return res.status(500).json({ message: 'Chat failed' });
  }
});

// GET /api/ai/insights
router.get('/insights', authenticateToken, (req: Request, res: Response) => {
  return res.json(db.aiInsights);
});

// POST /api/ai/recommend-technologies
router.post('/recommend-technologies', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { description, domain } = req.body;
    const result = await aiService.recommendTechnologies(description, domain);
    return res.json(result);
  } catch {
    return res.status(500).json({ message: 'Recommendation failed' });
  }
});

// POST /api/ai/skill-gap
router.post('/skill-gap', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { currentSkills, domain } = req.body;
    const result = await aiService.analyzeSkillGap(currentSkills, domain);
    return res.json(result);
  } catch {
    return res.status(500).json({ message: 'Skill gap analysis failed' });
  }
});

export default router;
