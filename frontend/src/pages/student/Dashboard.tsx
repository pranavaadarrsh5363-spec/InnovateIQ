import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import OnboardingGuide from '../../components/common/OnboardingGuide';
import { analyticsApi, projectsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardStats, Project } from '../../types';
import { Link } from 'react-router-dom';
import {
  Brain, FolderKanban, Database, Lightbulb, Bookmark, MessageSquare,
  ArrowRight, TrendingUp, CheckCircle, Clock, Zap, Star, AlertCircle,
  Globe, Rocket, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-gray-100 text-gray-700',
  research: 'bg-blue-100 text-blue-700',
  planning: 'bg-yellow-100 text-yellow-700',
  prototype: 'bg-violet-100 text-violet-700',
  testing: 'bg-orange-100 text-orange-700',
  deployment: 'bg-green-100 text-green-700',
};

const PIE_COLORS = ['#3b82f6', '#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.dashboard(),
      projectsApi.getAll(),
    ]).then(([statsRes, projRes]) => {
      setStats(statsRes.data);
      setProjects(projRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects ?? 0, icon: FolderKanban, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Resources Found', value: stats?.resourcesDiscovered ?? 0, icon: Database, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
    { label: 'AI Insights', value: stats?.aiInsightsGenerated ?? 0, icon: Lightbulb, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    { label: 'Saved Resources', value: stats?.savedResources ?? 0, icon: Bookmark, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50' },
    { label: 'Active Projects', value: stats?.activeProjects ?? 0, icon: Zap, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50' },
    { label: 'Mentor Feedback', value: stats?.mentorFeedback ?? 0, icon: MessageSquare, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
  ];

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0]}! 🎉`}>
      {/* Dashboard Heading */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-500 font-medium mt-0.5">
          Welcome back, <span className="text-gray-900 font-semibold">{user?.name?.split(' ')[0] || 'Innovator'}!</span> 🎉
        </p>
      </div>

      {/* Welcome banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-16 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-1">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="" className="w-10 h-10 rounded-full border-2 border-white/30" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">{user?.name}</h2>
              <p className="text-blue-200 text-xs sm:text-sm">{user?.university} · {user?.domain}</p>
            </div>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm mt-3 max-w-lg leading-relaxed">Your InnovateIQ innovation workspace is active. Ground your engineering projects in verified evidence and real-world national problems.</p>
          <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-4">
            <Link to="/problems" className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-white text-blue-700 font-semibold rounded-xl text-xs hover:shadow transition-all">
              <Globe size={13} /> Problem Hub (18 Domains)
            </Link>
            <Link to="/problems/prob-water-01/analyze" className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-blue-700/80 border border-blue-400 text-white font-medium rounded-xl text-xs hover:bg-blue-800 transition-all">
              <Brain size={13} /> Flagship Case Study
            </Link>
            <Link to="/pilots" className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-white/10 border border-white/20 text-white font-medium rounded-xl text-xs hover:bg-white/20 transition-all">
              <Rocket size={13} /> Field Pilots
            </Link>
            <Link to="/impact" className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-white/10 border border-white/20 text-white font-medium rounded-xl text-xs hover:bg-white/20 transition-all">
              <BarChart3 size={13} /> Measurable Impact
            </Link>
            <Link to="/projects" className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-white/10 border border-white/20 text-white font-medium rounded-xl text-xs hover:bg-white/20 transition-all">
              <FolderKanban size={13} /> Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-sm card-hover">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2.5 sm:mb-3 shadow`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">{label}</div>
          </div>
        ))}
      </div>

      {/* Onboarding Guide */}
      <div className="mb-6">
        <OnboardingGuide
          organizationName={user?.university || user?.name || 'Student Workspace'}
          hasProblems={true}
          hasEvidence={true}
          hasSolutions={(projects || []).length > 0}
          hasPilots={(stats?.activeProjects || 0) > 0}
          hasDevices={(stats?.activeProjects || 0) > 0}
          hasTelemetry={(stats?.activeProjects || 0) > 0}
          hasImpact={(stats?.activeProjects || 0) > 0}
        />
      </div>

      {/* Charts & Projects row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
        {/* Activity timeline chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm w-full min-w-0">
          <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Weekly Activity</h3>
          <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={stats?.activityTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="resources" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} name="Resources" />
                <Line type="monotone" dataKey="insights" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 3 }} name="Insights" />
                <Line type="monotone" dataKey="ideas" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} name="Ideas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain distribution donut */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm w-full min-w-0 flex flex-col justify-between">
          <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Domain Focus</h3>
          <div className="w-full flex justify-center items-center py-1 min-w-0">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={stats?.domainDistribution || []} dataKey="count" nameKey="domain" cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={4}>
                  {(stats?.domainDistribution || []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2 pt-2 border-t border-gray-50">
            {(stats?.domainDistribution || []).slice(0, 4).map((d, i) => (
              <div key={d.domain} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-600 truncate">{d.domain}</span>
                </div>
                <span className="font-bold text-gray-800 ml-2 bg-gray-50 px-2 py-0.5 rounded text-[11px]">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Active projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Active Projects</h3>
            <Link to="/projects" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {projects.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                <FolderKanban size={24} className="mx-auto mb-2 opacity-40" />
                No projects yet. <Link to="/analyzer" className="text-blue-600">Analyze an idea</Link> to get started.
              </div>
            ) : projects.slice(0, 3).map(project => (
              <Link to={`/projects/${project.id}`} key={project.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm truncate">{project.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${STATUS_COLORS[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-bg rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{project.progress}%</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.slice(0, 3).map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">{t}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent AI insights */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Recent Insights</h3>
            <Link to="/insights" className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentInsights || []).map(insight => (
              <div key={insight.id} className="px-5 py-4">
                <div className="flex items-start gap-2 mb-1.5">
                  <Lightbulb size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs font-semibold text-amber-700">{insight.type}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{insight.title}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${insight.confidence}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{insight.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions - Upgraded Modules */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <Zap size={16} className="text-amber-500" /> Complete Innovation Intelligence Suite
          </h3>
          <span className="text-xs text-blue-600 font-medium">15-Step SIH 2024 Workflow</span>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
          {[
            { to: '/project-generator', icon: Brain, label: 'Project Generator', desc: '17-Point AI Blueprint', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/60' },
            { to: '/similarity-checker', icon: AlertCircle, label: 'Similarity & Gaps', desc: 'Patents & Novelty Gap', color: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50/60' },
            { to: '/research', icon: Lightbulb, label: 'Research Explainer', desc: 'Deep paper breakdown', color: 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/60' },
            { to: '/quizzes', icon: CheckCircle, label: 'AI Quiz Checkpoint', desc: 'Test mastery on papers', color: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/60' },
            { to: '/learning', icon: TrendingUp, label: 'Learning Roadmap', desc: 'Step-by-step progress', color: 'border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50/60' },
            { to: '/team', icon: Star, label: 'Team Formation', desc: 'Match complementary peers', color: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50/60' },
            { to: '/mentors', icon: Star, label: 'Mentor Matcher', desc: 'Domain expert matching', color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/60' },
            { to: '/challenges', icon: FolderKanban, label: 'Challenges Hub', desc: 'Govt & SIH Problem Stmts', color: 'border-green-200 hover:border-green-400 hover:bg-green-50/60' },
            { to: '/feasibility', icon: Clock, label: 'Feasibility & BOM', desc: 'Scorecard & INR ₹ BOM', color: 'border-teal-200 hover:border-teal-400 hover:bg-teal-50/60' },
            { to: '/portfolio', icon: Zap, label: 'Portfolio & Code', desc: 'GitHub audit & badges', color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/60' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className={`bg-white rounded-xl p-3.5 border transition-all card-hover ${color} group flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                <ArrowRight size={13} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <div className="font-semibold text-xs text-gray-900 group-hover:text-blue-700">{label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
