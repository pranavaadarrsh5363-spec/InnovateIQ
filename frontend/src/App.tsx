import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReactNode } from 'react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import AIAnalyzer from './pages/student/AIAnalyzer';
import ResourceExplorer from './pages/student/ResourceExplorer';
import AIInsights from './pages/student/AIInsights';
import Projects from './pages/student/Projects';
import ProjectWorkspace from './pages/student/ProjectWorkspace';
import SkillGap from './pages/student/SkillGap';
import TechRecommendations from './pages/student/TechRecommendations';
import SavedResources from './pages/student/SavedResources';
import InnoAI from './pages/student/InnoAI';
import Analytics from './pages/student/Analytics';
import Profile from './pages/student/Profile';

// New Upgraded Student Pages
import AIProjectGenerator from './pages/student/AIProjectGenerator';
import SolutionChecker from './pages/student/SolutionChecker';
import ResearchExplainer from './pages/student/ResearchExplainer';
import QuizGenerator from './pages/student/QuizGenerator';
import LearningRoadmap from './pages/student/LearningRoadmap';
import TeamFormation from './pages/student/TeamFormation';
import MentorFinder from './pages/student/MentorFinder';
import ChallengesHub from './pages/student/ChallengesHub';
import KnowledgeGraphView from './pages/student/KnowledgeGraphView';
import FeasibilityAndCost from './pages/student/FeasibilityAndCost';
import Portfolio from './pages/student/Portfolio';
import GlobalSearch from './pages/student/GlobalSearch';

// Enterprise InnovateIQ Pages
import ProblemHub from './pages/problems/ProblemHub';
import ProblemAnalyzer from './pages/problems/ProblemAnalyzer';
import DecisionBrief from './pages/problems/DecisionBrief';
import SolutionsManager from './pages/solutions/SolutionsManager';
import ActionsManager from './pages/actions/ActionsManager';
import OrganizationsList from './pages/organizations/OrganizationsList';
import PilotManager from './pages/pilots/PilotManager';
import ImpactDashboard from './pages/impact/ImpactDashboard';
import EvidenceCenter from './pages/evidence/EvidenceCenter';
import AuditLogView from './pages/audit/AuditLogView';
import OrganizationDashboard from './pages/dashboards/OrganizationDashboard';
import UniversityDashboard from './pages/dashboards/UniversityDashboard';
import IndustryDashboard from './pages/dashboards/IndustryDashboard';
import { InnovationProvider } from './contexts/InnovationContext';
import { DemoProvider } from './contexts/DemoContext';

// Mentor pages
import MentorDashboard from './pages/mentor/Dashboard';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-gray-500 text-sm">Loading InnovateIQ...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/organization/dashboard' : user.role === 'mentor' ? '/university/dashboard' : '/dashboard'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected — shared */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? <AdminDashboard /> : user?.role === 'mentor' ? <MentorDashboard /> : <StudentDashboard />}
        </ProtectedRoute>
      } />

      <Route path="/resources" element={<ProtectedRoute><ResourceExplorer /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><GlobalSearch /></ProtectedRoute>} />

      {/* Enterprise InnovateIQ Problem-to-Impact Pipeline */}
      <Route path="/problems" element={<ProtectedRoute><ProblemHub /></ProtectedRoute>} />
      <Route path="/problems/:id/analyze" element={<ProtectedRoute><ProblemAnalyzer /></ProtectedRoute>} />
      <Route path="/problems/analyze" element={<ProtectedRoute><ProblemAnalyzer /></ProtectedRoute>} />
      <Route path="/problems/:id/decision-brief" element={<ProtectedRoute><DecisionBrief /></ProtectedRoute>} />
      <Route path="/problems/decision-brief" element={<ProtectedRoute><DecisionBrief /></ProtectedRoute>} />
      <Route path="/solutions" element={<ProtectedRoute><SolutionsManager /></ProtectedRoute>} />
      <Route path="/evidence" element={<ProtectedRoute><EvidenceCenter /></ProtectedRoute>} />
      <Route path="/pilots" element={<ProtectedRoute><PilotManager /></ProtectedRoute>} />
      <Route path="/actions" element={<ProtectedRoute><ActionsManager /></ProtectedRoute>} />
      <Route path="/impact" element={<ProtectedRoute><ImpactDashboard /></ProtectedRoute>} />
      <Route path="/organizations" element={<ProtectedRoute><OrganizationsList /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute roles={['admin', 'mentor']}><AuditLogView /></ProtectedRoute>} />
      <Route path="/organization/dashboard" element={<ProtectedRoute roles={['admin']}><OrganizationDashboard /></ProtectedRoute>} />
      <Route path="/university/dashboard" element={<ProtectedRoute roles={['mentor', 'admin']}><UniversityDashboard /></ProtectedRoute>} />
      <Route path="/industry/dashboard" element={<ProtectedRoute roles={['admin']}><IndustryDashboard /></ProtectedRoute>} />

      {/* Student only */}
      <Route path="/project-generator" element={<ProtectedRoute roles={['student']}><AIProjectGenerator /></ProtectedRoute>} />
      <Route path="/analyzer" element={<ProtectedRoute roles={['student']}><AIAnalyzer /></ProtectedRoute>} />
      <Route path="/similarity-checker" element={<ProtectedRoute roles={['student']}><SolutionChecker /></ProtectedRoute>} />
      <Route path="/research" element={<ProtectedRoute roles={['student']}><ResearchExplainer /></ProtectedRoute>} />
      <Route path="/quizzes" element={<ProtectedRoute roles={['student']}><QuizGenerator /></ProtectedRoute>} />
      <Route path="/learning" element={<ProtectedRoute roles={['student']}><LearningRoadmap /></ProtectedRoute>} />
      <Route path="/knowledge-graph" element={<ProtectedRoute roles={['student']}><KnowledgeGraphView /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute roles={['student']}><TeamFormation /></ProtectedRoute>} />
      <Route path="/mentors" element={<ProtectedRoute roles={['student']}><MentorFinder /></ProtectedRoute>} />
      <Route path="/challenges" element={<ProtectedRoute roles={['student']}><ChallengesHub /></ProtectedRoute>} />
      <Route path="/feasibility" element={<ProtectedRoute roles={['student']}><FeasibilityAndCost /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute roles={['student']}><Portfolio /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute roles={['student']}><AIInsights /></ProtectedRoute>} />
      <Route path="/skill-gap" element={<ProtectedRoute roles={['student']}><SkillGap /></ProtectedRoute>} />
      <Route path="/tech-recommendations" element={<ProtectedRoute roles={['student']}><TechRecommendations /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute roles={['student']}><SavedResources /></ProtectedRoute>} />
      <Route path="/innoai" element={<ProtectedRoute roles={['student']}><InnoAI /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute roles={['student']}><Profile /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InnovationProvider>
          <DemoProvider>
            <AppRoutes />
          </DemoProvider>
        </InnovationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
