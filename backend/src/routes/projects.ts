import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken, requireRole } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/projects — get projects for current user
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const { role, id } = req.user!;
  let result = db.projects;

  if (role === 'student') {
    result = db.projects.filter(p => p.studentId === id);
  } else if (role === 'mentor') {
    const mentorProfile = db.mentorProfiles[id];
    if (mentorProfile) {
      result = db.projects.filter(p => mentorProfile.assignedStudents.includes(p.studentId));
    }
  }

  return res.json(result);
});

// GET /api/projects/:id
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  return res.json(project);
});

// POST /api/projects
router.post('/', authenticateToken, requireRole('student'), (req: Request, res: Response) => {
  const {
    title, description, problemStatement, domain, technologies, objectives,
    problemId, targetUsers, targetPopulation, requiredSkills, expectedImpact, expectedOutcome,
    hardwareRequirements, softwareRequirements, datasetRequirements
  } = req.body;

  if (!title || !problemStatement) {
    return res.status(400).json({ message: 'Title and problem statement required' });
  }

  const newProject = {
    id: `proj-${uuidv4().slice(0, 8)}`,
    problemId: problemId || undefined,
    title,
    description: description || '',
    problemStatement,
    domain: domain || 'General',
    status: 'idea' as const,
    progress: 10,
    studentId: req.user!.id,
    technologies: technologies || [],
    objectives: objectives && objectives.length > 0 ? objectives : [
      'Engineer functional edge prototype within target BOM constraints',
      'Validate telemetry latency and sensor precision in controlled environment',
      'Deploy frontline community pilot and track measurable impact metrics'
    ],
    targetUsers: targetUsers || targetPopulation || 'Target Community Stakeholders',
    requiredSkills: requiredSkills || [],
    expectedImpact: expectedImpact || expectedOutcome || 'Measurable reduction in problem severity',
    hardwareRequirements: hardwareRequirements || [],
    softwareRequirements: softwareRequirements || [],
    datasetRequirements: datasetRequirements || [],
    tasks: [
      { id: `t-init-1`, title: 'Review problem intelligence, root causes and verified empirical evidence', status: 'done' as const, priority: 'high' as const },
      { id: `t-init-2`, title: 'Procure sensors and assemble initial breadboard prototype', status: 'in-progress' as const, priority: 'high' as const },
      { id: `t-init-3`, title: 'Develop edge firmware with offline-first failover data queue', status: 'todo' as const, priority: 'medium' as const },
    ],
    milestones: [
      { id: `m-init-1`, title: 'Architecture & Tech Trade-off Finalization', description: 'Align with mentor on BOM cost and sensor selections', dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], completed: true },
      { id: `m-init-2`, title: 'Benchtop Sensor Validation & Calibration', description: 'Run test buffer solutions and record drift curve', dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], completed: false },
      { id: `m-init-3`, title: 'Field Pilot Deployment Initiation', description: 'Deploy telemetry unit at active pilot testbed location', dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0], completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject as any);

  // Record audit log
  (db as any).auditLogs.unshift({
    id: `audit-${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.email,
    userRole: req.user!.role,
    action: 'Project Created',
    timestamp: new Date().toISOString(),
    entityType: 'Project',
    entityId: newProject.id,
    details: `Created project "${newProject.title}"${newProject.problemId ? ` inherited from problem ${newProject.problemId}` : ''}`,
  });

  return res.status(201).json(newProject);
});

// PUT /api/projects/:id
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  const idx = db.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Project not found' });

  const project = db.projects[idx];
  if (req.user!.role === 'student' && project.studentId !== req.user!.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  db.projects[idx] = {
    ...project,
    ...req.body,
    id: project.id,
    studentId: project.studentId,
    updatedAt: new Date().toISOString(),
  };

  return res.json(db.projects[idx]);
});

// POST /api/projects/:id/tasks
router.post('/:id/tasks', authenticateToken, (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const task = {
    id: `t-${uuidv4().slice(0, 8)}`,
    title: req.body.title,
    description: req.body.description || '',
    status: 'todo' as const,
    priority: req.body.priority || 'medium',
  };

  project.tasks.push(task);
  return res.status(201).json(task);
});

// GET /api/projects/:id/feedback
router.get('/:id/feedback', authenticateToken, (req: Request, res: Response) => {
  const feedback = db.mentorFeedback.filter(f => f.projectId === req.params.id);
  return res.json(feedback);
});

// POST /api/projects/:id/feedback
router.post('/:id/feedback', authenticateToken, requireRole('mentor', 'admin'), (req: Request, res: Response) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const fb = {
    id: `fb-${uuidv4().slice(0, 8)}`,
    projectId: req.params.id,
    mentorId: req.user!.id,
    studentId: project.studentId,
    content: req.body.content,
    rating: req.body.rating || 5,
    createdAt: new Date().toISOString(),
  };

  db.mentorFeedback.push(fb);
  return res.status(201).json(fb);
});

export default router;
