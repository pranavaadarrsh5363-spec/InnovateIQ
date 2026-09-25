import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';
import { Project } from '../types';

const router = Router();

// GET /api/challenges
router.get('/', (req: Request, res: Response) => {
  const { domain, difficulty, orgType, search } = req.query;
  let list = db.challenges;

  if (domain && domain !== 'All') {
    list = list.filter(c => c.domain.toLowerCase().includes((domain as string).toLowerCase()));
  }
  if (difficulty && difficulty !== 'All') {
    list = list.filter(c => c.difficulty === difficulty);
  }
  if (orgType && orgType !== 'All') {
    list = list.filter(c => c.organizationType === orgType);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.organization.toLowerCase().includes(q)
    );
  }

  return res.json(list);
});

// GET /api/challenges/:id
router.get('/:id', (req: Request, res: Response) => {
  const challenge = db.challenges.find(c => c.id === req.params.id);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
  return res.json(challenge);
});

// POST /api/challenges/:id/start-project
router.post('/:id/start-project', authenticateToken, (req: Request, res: Response) => {
  const challenge = db.challenges.find(c => c.id === req.params.id);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

  const project: Project = {
    id: `proj-chal-${Date.now()}`,
    studentId: req.user?.id || 'student-1',
    title: `Solution: ${challenge.title}`,
    problemStatement: challenge.problemStatement,
    description: challenge.description,
    domain: challenge.domain,
    status: 'planning',
    progress: 5,
    technologies: challenge.requiredSkills.map(s => s.split(' ')[0]),
    objectives: [
      `Solve ${challenge.organization} innovation challenge`,
      'Build functional prototype adhering to public evaluation rubrics',
      'Submit deployment package before ' + challenge.deadline,
    ],
    targetUsers: `${challenge.organization} stakeholders and end beneficiaries`,
    requiredSkills: challenge.requiredSkills,
    tasks: [
      { id: 't-1', title: 'Review challenge specifications and referenced technical materials', status: 'done', priority: 'high' },
      { id: 't-2', title: 'Draft project architecture blueprint and system flow', status: 'in-progress', priority: 'high' },
      { id: 't-3', title: 'Assemble hardware/software minimum viable prototype', status: 'todo', priority: 'high' },
    ],
    milestones: [
      { id: 'm-1', title: 'Challenge Ideation & Architecture', description: 'Complete system architecture aligned with challenge guidelines', dueDate: '2024-03-01', completed: false },
      { id: 'm-2', title: 'Prototype Submission', description: 'Submit working prototype link and documentation to jury', dueDate: challenge.deadline, completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(project);

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: req.user?.id || 'student-1',
    type: 'challenge_alert',
    title: 'Project Initiated for Challenge',
    message: `You started a new project for "${challenge.title}". Good luck!`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/projects/${project.id}`,
  });

  return res.json({ message: 'Project initialized for challenge', project });
});

export default router;
