import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/learning/roadmaps
router.get('/roadmaps', authenticateToken, (req: Request, res: Response) => {
  const roadmaps = db.learningRoadmaps.filter(r => r.studentId === (req.user?.id || 'student-1'));
  return res.json(roadmaps);
});

// POST /api/learning/generate
router.post('/generate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { skillName, currentLevel, targetLevel } = req.body;
    const roadmap = await aiService.generateLearningRoadmap(skillName || 'Machine Learning', currentLevel || 'beginner', targetLevel || 'advanced');
    db.learningRoadmaps.unshift(roadmap);
    return res.json(roadmap);
  } catch (err: any) {
    return res.status(500).json({ message: 'Roadmap generation failed' });
  }
});

// PUT /api/learning/roadmaps/:id/steps/:stepNumber
router.put('/roadmaps/:id/steps/:stepNumber', authenticateToken, (req: Request, res: Response) => {
  const roadmap = db.learningRoadmaps.find(r => r.id === req.params.id);
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const stepIdx = roadmap.steps.findIndex(s => s.stepNumber === Number(req.params.stepNumber));
  if (stepIdx === -1) return res.status(404).json({ message: 'Step not found' });

  roadmap.steps[stepIdx].completed = !roadmap.steps[stepIdx].completed;
  const completedCount = roadmap.steps.filter(s => s.completed).length;
  roadmap.progress = Math.round((completedCount / roadmap.steps.length) * 100);

  return res.json(roadmap);
});

export default router;
