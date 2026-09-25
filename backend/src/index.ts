import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import resourceRoutes from './routes/resources';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';

// Advanced Modular Innovation Routes
import ideaRoutes from './routes/ideas';
import researchRoutes from './routes/research';
import quizRoutes from './routes/quizzes';
import learningRoutes from './routes/learning';
import teamRoutes from './routes/team';
import mentorRoutes from './routes/mentors';
import challengeRoutes from './routes/challenges';
import knowledgeGraphRoutes from './routes/knowledgeGraph';
import feasibilityRoutes from './routes/feasibility';
import notificationRoutes from './routes/notifications';
import portfolioRoutes from './routes/portfolio';
import githubRoutes from './routes/github';

// InnovateIQ Enterprise Innovation Routes
import problemRoutes from './routes/problems';
import evidenceRoutes from './routes/evidence';
import pilotRoutes from './routes/pilots';
import impactRoutes from './routes/impact';
import auditRoutes from './routes/audit';
import organizationRoutes from './routes/organizations';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (generous for local development)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: 'Too many requests' });
app.use('/api/', limiter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Core Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Upgraded Idea-to-Innovation Routes
app.use('/api/ideas', ideaRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/knowledge-graph', knowledgeGraphRoutes);
app.use('/api/feasibility', feasibilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/github', githubRoutes);

// InnovateIQ Enterprise Problem-to-Impact Routes
app.use('/api/problems', problemRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/pilots', pilotRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/organizations', organizationRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 InnovateAI Backend running on http://localhost:${PORT}`);
  console.log(`📊 API health: http://localhost:${PORT}/api/health`);
  console.log(`\nDemo credentials:`);
  console.log(`  Student : aarav@sih.dev / demo123`);
  console.log(`  Mentor  : mentor@sih.dev / demo123`);
  console.log(`  Admin   : admin@sih.dev / demo123\n`);
});

export default app;
