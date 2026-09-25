import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/mentors
router.get('/', (req: Request, res: Response) => {
  const mentors = db.users.filter(u => u.role === 'mentor').map(m => {
    const profile = db.mentorProfiles[m.id] || {};
    return {
      ...m,
      mentorProfile: profile,
    };
  });
  return res.json(mentors);
});

// GET /api/mentors/match or /matches
router.get(['/match', '/matches'], authenticateToken, async (req: Request, res: Response) => {
  try {
    const mentors = await aiService.matchMentors(['IoT', 'Sensors', 'TinyML']);
    return res.json(mentors);
  } catch (err: any) {
    return res.status(500).json({ message: 'Mentor matching failed' });
  }
});

// POST /api/mentors/match
router.post(['/match', '/matches'], authenticateToken, async (req: Request, res: Response) => {
  try {
    const { requirements = ['IoT', 'Sensors', 'TinyML'], domain } = req.body;
    const mentors = await aiService.matchMentors(requirements, domain);
    return res.json(mentors);
  } catch (err: any) {
    return res.status(500).json({ message: 'Mentor matching failed' });
  }
});

// POST /api/mentors/request
router.post('/request', authenticateToken, (req: Request, res: Response) => {
  const { mentorId, projectId, note } = req.body;
  const request = {
    id: `req-${Date.now()}`,
    studentId: req.user?.id || 'student-1',
    mentorId,
    projectId: projectId || 'proj-1',
    note: note || 'Requesting mentorship for SIH prototype hardware validation.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.mentorRequests.push(request);

  return res.json({ message: 'Mentorship request submitted successfully', request });
});

export default router;
