import axios from 'axios';

/**
 * Resolves the API base URL dynamically:
 * - If VITE_API_URL is provided, normalizes it (ensuring the /api subpath is included).
 *   Supports:
 *   - "https://innovateiq-backend.onrender.com" -> "https://innovateiq-backend.onrender.com/api"
 *   - "https://innovateiq-backend.onrender.com/api" -> "https://innovateiq-backend.onrender.com/api"
 * - Defaults to '/api' for local development (which Vite proxies to http://localhost:5000).
 */
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '' || envUrl.trim() === '/api') {
    return '/api';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Projects
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  addTask: (id: string, task: any) => api.post(`/projects/${id}/tasks`, task),
  getFeedback: (id: string) => api.get(`/projects/${id}/feedback`),
  addFeedback: (id: string, data: any) => api.post(`/projects/${id}/feedback`, data),
};

// Resources
export const resourcesApi = {
  getAll: (params?: any) => api.get('/resources', { params }),
  getById: (id: string) => api.get(`/resources/${id}`),
  getSaved: () => api.get('/resources/saved'),
  save: (id: string, notes?: string) => api.post(`/resources/save/${id}`, { notes }),
  unsave: (id: string) => api.delete(`/resources/save/${id}`),
};

// AI Core
export const aiApi = {
  analyze: (data: any) => api.post('/ai/analyze', data),
  chat: (messages: any[], context?: any) => api.post('/ai/chat', { messages, ...context }),
  insights: () => api.get('/ai/insights'),
  recommendTechnologies: (data: any) => api.post('/ai/recommend-technologies', data),
  skillGap: (currentSkills: string[], domain: string) => api.post('/ai/skill-gap', { currentSkills, domain }),
};

// Ideas & Blueprints
export const ideasApi = {
  generateBlueprint: (data: { title: string; problemStatement: string; domain?: string }) => api.post('/ideas/blueprint', data),
  getBlueprints: () => api.get('/ideas/blueprints'),
  updateBlueprint: (id: string, data: any) => api.put(`/ideas/blueprints/${id}`, data),
  convertBlueprint: (id: string) => api.post(`/ideas/blueprints/${id}/convert`),
  checkSimilarity: (idea: string) => api.post('/ideas/similarity', { idea }),
};

// Research Papers & Explainer
export const researchApi = {
  getPapers: (params?: { domain?: string; search?: string }) => api.get('/research/papers', { params }),
  getPaper: (id: string) => api.get(`/research/papers/${id}`),
  explain: (paperId?: string, customText?: string) => api.post('/research/explain', { paperId, customText }),
  chatWithPaper: (paperId: string, query: string) => api.post('/research/chat', { paperId, query }),
};

// Quizzes
export const quizzesApi = {
  generate: (data: { documentTitle: string; difficulty?: string; count?: number }) => api.post('/quizzes/generate', data),
  getById: (id: string) => api.get(`/quizzes/${id}`),
  submit: (id: string, answers: any[]) => api.post(`/quizzes/${id}/submit`, { answers }),
  getHistory: () => api.get('/quizzes/history/attempts'),
};

// Learning Roadmaps
export const learningApi = {
  getRoadmaps: () => api.get('/learning/roadmaps'),
  generate: (data: { skillName: string; currentLevel?: string; targetLevel?: string }) => api.post('/learning/generate', data),
  toggleStep: (roadmapId: string, stepNumber: number) => api.put(`/learning/roadmaps/${roadmapId}/steps/${stepNumber}`),
};

// Team Matching & Invitations
export const teamApi = {
  match: (data?: { requirements?: string[]; domain?: string }) => api.post('/team/match', data || {}),
  invite: (candidateId: string, projectId?: string, message?: string) => api.post('/team/invite', { candidateId, projectId, message }),
};

// Mentors
export const mentorsApi = {
  getAll: () => api.get('/mentors'),
  match: (data?: { requirements?: string[]; domain?: string }) => api.post('/mentors/match', data || {}),
  request: (mentorId: string, projectId?: string, note?: string) => api.post('/mentors/request', { mentorId, projectId, note }),
};

// Challenges Hub
export const challengesApi = {
  getAll: (params?: any) => api.get('/challenges', { params }),
  getById: (id: string) => api.get(`/challenges/${id}`),
  startProject: (challengeId: string) => api.post(`/challenges/${challengeId}/start-project`),
};

// Knowledge Graph
export const knowledgeGraphApi = {
  getGraph: () => api.get('/knowledge-graph'),
};

// Feasibility & Cost Estimator
export const feasibilityApi = {
  analyze: (projectData?: any) => api.post('/feasibility/analyze', projectData || {}),
  estimateCosts: (projectData?: any) => api.post('/feasibility/costs', projectData || {}),
};

// Notifications
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Innovation Portfolio
export const portfolioApi = {
  getMyPortfolio: () => api.get('/portfolio/me'),
  getStudentPortfolio: (studentId: string) => api.get(`/portfolio/${studentId}`),
};

// GitHub Integration
export const githubApi = {
  getRepos: () => api.get('/github/repos'),
  analyze: (data: { repoUrl?: string; repoName?: string }) => api.post('/github/analyze', data),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  technologies: () => api.get('/analytics/technologies'),
};

// Users
export const usersApi = {
  getAll: () => api.get('/users'),
  getStudents: () => api.get('/users/students'),
  getMentors: () => api.get('/users/mentors'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

// ==========================================
// InnovateIQ Enterprise Platform APIs
// ==========================================

// Problem Marketplace & Problem Intelligence Engine
export const problemsApi = {
  getAll: (params?: { domain?: string; priority?: string; status?: string; search?: string }) =>
    api.get('/problems', { params }),
  getById: (id: string) => api.get(`/problems/${id}`),
  publish: (data: any) => api.post('/problems', data),
  getAnalysis: (id: string) => api.get(`/problems/${id}/analysis`),
  analyze: (id: string, details?: any) => api.post(`/problems/${id}/analyze`, details || {}),
  runAnalysis: (id: string, details?: any) => api.post(`/problems/${id}/analyze`, details || {}),
  getRootCauses: (id: string) => api.get(`/problems/${id}/root-causes`),
  getStakeholders: (id: string) => api.get(`/problems/${id}/stakeholders`),
  getSolutions: (id: string) => api.get(`/problems/${id}/solutions`),
  getGaps: (id: string) => api.get(`/problems/${id}/gaps`),
  getTechMatrix: (id: string) => api.get(`/problems/${id}/tech-matrix`),
  getTechTradeoffs: (id: string) => api.get(`/problems/${id}/tech-matrix`),
  getDecisionBrief: (id: string) => api.get(`/problems/${id}/decision-brief`),
};

// Evidence & Source Quality Center
export const evidenceApi = {
  getAll: (params?: { problemId?: string; sourceType?: string; query?: string; rating?: string; domain?: string; connectorId?: string }) =>
    api.get('/evidence', { params }),
  search: (params?: any) => api.get('/evidence', { params }),
  getConnectors: () => api.get('/evidence/connectors'),
  evaluate: (sourceData: any) => api.post('/evidence/evaluate', sourceData),
};

// Pilot Program Manager
export const pilotsApi = {
  getAll: (params?: { status?: string; projectId?: string }) =>
    api.get('/pilots', { params }),
  getById: (id: string) => api.get(`/pilots/${id}`),
  create: (data: any) => api.post('/pilots', data),
  updateStatus: (id: string, status: string, resultsSummary?: string) =>
    api.put(`/pilots/${id}/status`, { status, resultsSummary }),
  reportIssue: (id: string, issue: { description: string; severity?: string }) =>
    api.post(`/pilots/${id}/issues`, issue),
  logIssue: (id: string, issue: { description: string; severity?: string }) =>
    api.post(`/pilots/${id}/issues`, issue),
  submitFeedback: (id: string, feedback: { authorRole: string; feedback: string; rating?: number; authorName?: string; content?: string; sentiment?: string; role?: string }) =>
    api.post(`/pilots/${id}/feedback`, feedback),
  addFeedback: (id: string, feedback: any) =>
    api.post(`/pilots/${id}/feedback`, feedback),
};

// Impact Measurement & Continuous Feedback Loop
export const impactApi = {
  getKPIs: (params?: { projectId?: string; category?: string }) =>
    api.get('/impact/kpis', { params }),
  getAllKpis: (params?: any) => api.get('/impact/kpis', { params }),
  createKPI: (data: any) => api.post('/impact/kpis', data),
  updateKPI: (id: string, data: { currentValue: number; sourceOfTruth?: string; verifiedDate?: string }) =>
    api.put(`/impact/kpis/${id}`, data),
  updateKpi: (id: string, data: { currentValue: number; sourceOfTruth?: string; verifiedDate?: string }) =>
    api.put(`/impact/kpis/${id}`, data),
  getFeedbackLoops: (params?: { projectId?: string }) =>
    api.get('/impact/feedback-loops', { params }),
  addFeedbackLoop: (data: any) => api.post('/impact/feedback-loops', data),
};

// Audit Logs & Governance
export const auditApi = {
  getLogs: (params?: { entityType?: string; action?: string }) =>
    api.get('/audit/logs', { params }),
  getAll: (params?: any) => api.get('/audit/logs', { params }),
  logAction: (data: any) => api.post('/audit/log', data),
};

// Organization Directory & Dashboards
export const organizationsApi = {
  getAll: () => api.get('/organizations'),
  getById: (id: string) => api.get(`/organizations/${id}`),
  getProblems: (id: string) => api.get('/problems', { params: { organizationId: id } }),
  getPilots: (id: string) => api.get('/pilots', { params: { organizationId: id } }),
};

