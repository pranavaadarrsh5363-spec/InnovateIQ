import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';
import { StudentPortfolio } from '../types';

const router = Router();

// GET /api/portfolio/me
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id || 'student-1';
  const student = db.users.find(u => u.id === userId) || db.users[0];
  const userProjects = db.projects.filter(p => p.studentId === userId);

  const portfolio: StudentPortfolio = {
    student,
    summary: 'Third-year undergraduate developing autonomous hardware sensing and on-device TinyML machine learning for rural clean water security and environmental monitoring.',
    isPublic: true,
    projects: userProjects,
    skills: (student.profile?.skills || []).map((s, i) => ({
      name: s,
      level: i < 2 ? 'Advanced' : 'Intermediate',
      endorsementsCount: 12 + i * 4,
    })),
    completedChallenges: ['Smart Water Leakage & Potability Telemetry (Jal Jeevan Mission Finalist)'],
    certifications: [
      { title: 'Machine Learning Specialization', issuer: 'DeepLearning.AI / Coursera', date: '2023-11' },
      { title: 'TinyML on Microcontrollers', issuer: 'HarvardX / edX', date: '2024-01' },
    ],
    achievements: [
      'Smart India Hackathon 2024 Finalist (Water & Sanitation Category)',
      'IIT Delhi Hardware Hackathon 1st Runner Up (Sub-₹3500 Water Node)',
    ],
    githubRepositories: [
      {
        name: 'ai-water-quality-telemetry',
        description: 'ESP32 firmware, TinyML quantization scripts, and FastAPI backend for continuous well potability monitoring.',
        url: 'https://github.com/aaravkumar-dev/ai-water-quality-telemetry',
        stars: 38,
        forks: 14,
        primaryLanguage: 'C++ / Python',
        techStack: ['ESP32', 'TensorFlow Lite', 'FastAPI', 'TimescaleDB', 'MQTT'],
        recentCommitsCount: 42,
        openIssuesCount: 3,
        readmeSummary: 'Comprehensive open-source hardware wiring diagram, calibration scripts, and REST API deployment container.',
        aiCodeReview: {
          strengths: [
            'Clean separation of sensor driver firmware from MQTT network stack',
            'Safe float-to-int8 quantization preserves 94% accuracy',
          ],
          improvements: [
            'Add exponential backoff on GSM network socket reconnection',
            'Write integration tests for the FastAPI ingestion webhook',
          ],
          missingComponents: [
            'Dockerfile for Mosquitto broker setup',
            'Hardware watchdog timer to reboot MCU if sensor bus hangs',
          ],
          architectureSuggestions: [
            'Migrate to asynchronous database session pooling for high-throughput scaling',
          ],
        },
      },
    ],
    interests: student.profile?.interests || ['Clean Water', 'Embedded AI', 'Rural Technology'],
  };

  return res.json(portfolio);
});

// GET /api/portfolio/:studentId
router.get('/:studentId', (req: Request, res: Response) => {
  const student = db.users.find(u => u.id === req.params.studentId);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const userProjects = db.projects.filter(p => p.studentId === student.id);

  return res.json({
    student,
    isPublic: true,
    projects: userProjects,
    skills: (student.profile?.skills || []).map(s => ({ name: s, level: 'Intermediate', endorsementsCount: 8 })),
  });
});

export default router;
