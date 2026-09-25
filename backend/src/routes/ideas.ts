import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';
import { Project } from '../types';

const router = Router();

// POST /api/ideas/blueprint
router.post('/blueprint', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, problemStatement, domain } = req.body;
    const blueprint = await aiService.generateProjectBlueprint({ title, problemStatement, domain });
    db.blueprints.push(blueprint);
    return res.json(blueprint);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to generate blueprint', error: err.message });
  }
});

// GET /api/ideas/blueprints
router.get('/blueprints', authenticateToken, (req: Request, res: Response) => {
  return res.json(db.blueprints);
});

// PUT /api/ideas/blueprints/:id
router.put('/blueprints/:id', authenticateToken, (req: Request, res: Response) => {
  const idx = db.blueprints.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Blueprint not found' });
  db.blueprints[idx] = { ...db.blueprints[idx], ...req.body };
  return res.json(db.blueprints[idx]);
});

// POST /api/ideas/blueprints/:id/convert
router.post('/blueprints/:id/convert', authenticateToken, (req: Request, res: Response) => {
  const bp = db.blueprints.find(b => b.id === req.params.id);
  if (!bp) return res.status(404).json({ message: 'Blueprint not found' });

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    studentId: req.user?.id || 'student-1',
    title: bp.title,
    problemStatement: bp.problemStatement,
    description: bp.proposedSolution,
    domain: bp.domain,
    status: 'planning',
    progress: 10,
    technologies: bp.requiredTechnologies,
    objectives: bp.objectives,
    targetUsers: bp.targetUsers,
    hardwareRequirements: bp.requiredHardware,
    softwareRequirements: bp.requiredSoftware,
    datasetRequirements: bp.requiredDatasets,
    requiredSkills: bp.requiredSkills,
    teamRoles: bp.suggestedTeamRoles,
    expectedImpact: bp.expectedImpact,
    challenges: bp.challenges,
    risks: bp.risks,
    futureEnhancements: bp.futureEnhancements,
    tasks: bp.developmentRoadmap.flatMap((r, i) =>
      r.deliverables.map((d, di) => ({
        id: `task-gen-${i}-${di}`,
        title: d,
        description: `${r.phase}: ${r.title}`,
        status: 'todo' as const,
        priority: (di === 0 ? 'high' : 'medium') as any,
      }))
    ),
    milestones: bp.developmentRoadmap.map((r, i) => ({
      id: `m-gen-${i}`,
      title: `${r.phase}: ${r.title}`,
      description: r.description,
      dueDate: new Date(Date.now() + (i + 1) * 21 * 86400000).toISOString().split('T')[0],
      completed: false,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);
  bp.isConvertedToProject = true;

  // Add notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: req.user?.id || 'student-1',
    type: 'resource_found',
    title: 'Project Created from Blueprint',
    message: `Your blueprint "${bp.title}" has been successfully converted into an active workspace project!`,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/projects/${newProject.id}`,
  });

  return res.json({ message: 'Blueprint successfully converted into project', project: newProject });
});

// POST /api/ideas/similarity
router.post('/similarity', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { idea } = req.body;
    const similar = await aiService.findSimilarSolutions(idea);
    const gaps = await aiService.identifyInnovationGaps(similar);
    return res.json({ similarSolutions: similar, existingSolutions: similar, innovationGaps: gaps });
  } catch (err: any) {
    return res.status(500).json({ message: 'Similarity analysis failed' });
  }
});

export default router;
