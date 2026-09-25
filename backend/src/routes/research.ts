import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/research/papers
router.get('/papers', (req: Request, res: Response) => {
  const { domain, search } = req.query;
  let papers = db.researchPapers;

  if (domain && domain !== 'All') {
    papers = papers.filter(p => p.domain.toLowerCase().includes((domain as string).toLowerCase()));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    papers = papers.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.abstract.toLowerCase().includes(q) ||
      p.technologies.some(t => t.toLowerCase().includes(q))
    );
  }

  return res.json(papers);
});

// GET /api/research/papers/:id
router.get('/papers/:id', (req: Request, res: Response) => {
  const paper = db.researchPapers.find(p => p.id === req.params.id);
  if (!paper) return res.status(404).json({ message: 'Paper not found' });
  return res.json(paper);
});

// POST /api/research/explain
router.post('/explain', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { paperId, customText } = req.body;
    const analysis = await aiService.analyzeResearchPaper(paperId);
    return res.json(analysis);
  } catch (err: any) {
    return res.status(500).json({ message: 'Research explanation failed' });
  }
});

// POST /api/research/chat
router.post('/chat', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { paperId, query } = req.body;
    const response = await aiService.analyzeResearchPaper(paperId, query);
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ message: 'Document chat failed' });
  }
});

export default router;
