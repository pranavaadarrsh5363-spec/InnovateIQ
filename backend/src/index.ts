import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();

// Middlewares
import { requestIdMiddleware } from './middleware/requestId';
import { securityHeadersMiddleware } from './middleware/securityHeaders';
import { requestLoggerMiddleware } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { checkDbHealth, pgPool } from './db/connection';

// Core Application Routes
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

// InnovateIQ Enterprise Problem-to-Impact Routes
import problemRoutes from './routes/problems';
import solutionRoutes from './routes/solutions';
import actionRoutes from './routes/actions';
import alertRoutes from './routes/alerts';
import evidenceRoutes from './routes/evidence';
import pilotRoutes from './routes/pilots';
import impactRoutes from './routes/impact';
import auditRoutes from './routes/audit';
import organizationRoutes from './routes/organizations';
import demoRoutes from './routes/demo';
import telemetryRoutes from './routes/telemetry';

process.on('uncaughtException', (err) => {
  console.error('❌ [Critical] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [Critical] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Request ID & Security Headers
app.use(requestIdMiddleware);
app.use(securityHeadersMiddleware);

// 2. Structured Request Logging
app.use(requestLoggerMiddleware);

// 3. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://innovate-iq-liard.vercel.app',
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin === 'https://innovate-iq-liard.vercel.app' ||
      /^https:\/\/innovate-iq-[a-z0-9-]+\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS error: Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Rate Limiting with Structured JSON 429 Responses
const isTestOrLocal = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestOrLocal ? 10000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      },
      requestId: req.id,
    });
  },
});
app.use('/api/', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestOrLocal ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
      },
      requestId: req.id,
    });
  },
});
app.use('/api/auth/login', authLimiter);

// 5. Health, Liveness & Readiness Endpoints
const getHealthStatus = async () => {
  const dbHealth = await checkDbHealth();
  return {
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: dbHealth.status,
      telemetryIngestion: 'operational',
      anomalyDetection: 'operational',
      auth: 'operational',
      demoEngine: 'operational',
    },
    databaseEngine: dbHealth.dialect,
  };
};

app.get('/health', async (_req, res) => res.json(await getHealthStatus()));
app.get('/api/health', async (_req, res) => res.json(await getHealthStatus()));

// Liveness Check: process is running
const livenessHandler = (_req: express.Request, res: express.Response) => {
  res.json({ status: 'alive', uptimeSeconds: Math.floor(process.uptime()) });
};
app.get('/health/live', livenessHandler);
app.get('/api/health/live', livenessHandler);

// Readiness Check: service is ready to accept traffic
const readinessHandler = async (_req: express.Request, res: express.Response) => {
  const dbHealth = await checkDbHealth();
  const isReady = dbHealth.status === 'connected' || dbHealth.status === 'operational';
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'degraded',
    database: dbHealth.status,
    timestamp: new Date().toISOString(),
  });
};
app.get('/health/ready', readinessHandler);
app.get('/api/health/ready', readinessHandler);

// 6. Application Routes
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
app.use('/api/solutions', solutionRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/pilots', pilotRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/telemetry', telemetryRoutes);

// 7. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Server Listening & Graceful Shutdown
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`\n🚀 InnovateIQ Backend running on port ${PORT}`);
  console.log(`📊 API health: http://localhost:${PORT}/health and /api/health`);
  console.log(`🟢 Readiness: http://localhost:${PORT}/health/ready`);
  console.log(`\nDemo credentials:`);
  console.log(`  Student : aarav@sih.dev / demo123`);
  console.log(`  Mentor  : mentor@sih.dev / demo123`);
  console.log(`  Admin   : admin@sih.dev / demo123\n`);
});

// Graceful Shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 [Shutdown] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('🔒 [Shutdown] HTTP server closed.');
    if (pgPool) {
      try {
        await pgPool.end();
        console.log('🔒 [Shutdown] PostgreSQL pool drained.');
      } catch (err: any) {
        console.error('❌ [Shutdown] Error closing database pool:', err.message);
      }
    }
    console.log('👋 [Shutdown] Process exiting cleanly.');
    process.exit(0);
  });

  // Force close after 10 seconds if hanging
  setTimeout(() => {
    console.error('⚠️ [Shutdown] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
