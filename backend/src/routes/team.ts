import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/team/matches or /api/team/match
router.get(['/match', '/matches'], authenticateToken, async (req: Request, res: Response) => {
  try {
    const candidates = await aiService.matchTeamMembers(['IoT', 'Machine Learning', 'React', 'Embedded C++']);
    return res.json(candidates);
  } catch (err: any) {
    return res.status(500).json({ message: 'Team matching failed' });
  }
});

// POST /api/team/match
router.post(['/match', '/matches'], authenticateToken, async (req: Request, res: Response) => {
  try {
    const { requirements = ['IoT', 'Machine Learning', 'React', 'Embedded C++'], domain } = req.body;
    const candidates = await aiService.matchTeamMembers(requirements, domain);
    return res.json(candidates);
  } catch (err: any) {
    return res.status(500).json({ message: 'Team matching failed' });
  }
});

// POST /api/team/invite
router.post('/invite', authenticateToken, (req: Request, res: Response) => {
  const { candidateId, projectId, message } = req.body;
  const invite = {
    id: `invite-${Date.now()}`,
    senderId: req.user?.id || 'student-1',
    recipientId: candidateId,
    projectId: projectId || 'proj-1',
    message: message || 'Would love to invite you to collaborate on our SIH innovation project!',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.teamInvitations.push(invite);

  // Send notification to recipient
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: candidateId,
    type: 'team_invite',
    title: 'Project Invitation Received',
    message: `Aarav Kumar invited you to join "AI-Based Water Quality Monitoring" as a team collaborator.`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: '/team',
  });

  return res.json({ message: 'Invitation dispatched successfully', invite });
});

export default router;
