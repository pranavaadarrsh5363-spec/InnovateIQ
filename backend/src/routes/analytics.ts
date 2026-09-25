import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticateToken, (req: Request, res: Response) => {
  const { id, role } = req.user!;

  if (role === 'student') {
    const myProjects = db.projects.filter(p => p.studentId === id);
    const mySaved = db.savedResources.filter(s => s.studentId === id);
    const myFeedback = db.mentorFeedback.filter(f => f.studentId === id);

    return res.json({
      totalProjects: myProjects.length,
      activeProjects: myProjects.filter(p => !['idea', 'deployment'].includes(p.status)).length,
      resourcesDiscovered: 42,
      aiInsightsGenerated: 18,
      savedResources: mySaved.length,
      mentorFeedback: myFeedback.length,
      recentInsights: db.aiInsights.slice(0, 3),
      projectProgress: myProjects.map(p => ({ name: p.title, progress: p.progress, status: p.status })),
      domainDistribution: [
        { domain: 'AI/ML', count: 8 },
        { domain: 'IoT', count: 6 },
        { domain: 'Healthcare', count: 5 },
        { domain: 'Agriculture', count: 4 },
        { domain: 'FinTech', count: 3 },
      ],
      activityTimeline: [
        { date: '2024-03-01', ideas: 2, resources: 8, insights: 3 },
        { date: '2024-03-08', ideas: 1, resources: 12, insights: 5 },
        { date: '2024-03-15', ideas: 3, resources: 10, insights: 4 },
        { date: '2024-03-22', ideas: 1, resources: 7, insights: 6 },
      ],
    });
  }

  if (role === 'admin') {
    return res.json({
      totalUsers: db.users.length,
      totalStudents: db.users.filter(u => u.role === 'student').length,
      totalMentors: db.users.filter(u => u.role === 'mentor').length,
      totalProjects: db.projects.length,
      totalResources: db.resources.length,
      activeProjects: db.projects.filter(p => p.status === 'prototype').length,
      topDomains: ['AI/ML', 'IoT', 'Healthcare', 'Agriculture', 'FinTech'],
      platformActivity: [
        { month: 'Jan', users: 12, projects: 4, insights: 25 },
        { month: 'Feb', users: 18, projects: 7, insights: 42 },
        { month: 'Mar', users: 25, projects: 10, insights: 68 },
      ],
    });
  }

  // Mentor
  const mentorProfile = db.mentorProfiles[id];
  const assignedStudents = mentorProfile ? mentorProfile.assignedStudents : [];
  const assignedProjects = db.projects.filter(p => assignedStudents.includes(p.studentId));

  return res.json({
    totalStudents: assignedStudents.length,
    totalProjects: assignedProjects.length,
    pendingFeedback: 2,
    completedReviews: db.mentorFeedback.filter(f => f.mentorId === id).length,
    studentProgress: assignedProjects.map(p => ({ name: p.title, progress: p.progress, status: p.status })),
  });
});

// GET /api/analytics/technologies
router.get('/technologies', authenticateToken, (_req: Request, res: Response) => {
  return res.json([
    { name: 'Python', count: 45, trend: 'up' },
    { name: 'TensorFlow', count: 38, trend: 'up' },
    { name: 'React', count: 32, trend: 'stable' },
    { name: 'IoT/Arduino', count: 28, trend: 'up' },
    { name: 'Node.js', count: 25, trend: 'stable' },
    { name: 'PyTorch', count: 22, trend: 'up' },
    { name: 'PostgreSQL', count: 20, trend: 'stable' },
    { name: 'Docker', count: 18, trend: 'up' },
    { name: 'AWS', count: 15, trend: 'up' },
    { name: 'Blockchain', count: 12, trend: 'down' },
  ]);
});

export default router;
