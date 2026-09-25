import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { projectsApi } from '../../services/api';
import { Project } from '../../types';
import { useInnovation } from '../../contexts/InnovationContext';
import { Plus, FolderKanban, ArrowRight, CheckCircle, Clock, Zap, ChevronRight, Link2, Sparkles } from 'lucide-react';

const STATUS_STEPS = ['idea', 'research', 'planning', 'prototype', 'testing', 'deployment'];
const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-gray-100 text-gray-700 border-gray-200',
  research: 'bg-blue-100 text-blue-700 border-blue-200',
  planning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  prototype: 'bg-violet-100 text-violet-700 border-violet-200',
  testing: 'bg-orange-100 text-orange-700 border-orange-200',
  deployment: 'bg-green-100 text-green-700 border-green-200',
};

function CreateProjectModal({ 
  onClose, 
  onCreate, 
  initialProblem 
}: { 
  onClose: () => void; 
  onCreate: (p: Project) => void;
  initialProblem?: any;
}) {
  const [form, setForm] = useState({
    title: initialProblem?.title ? `Implementation: ${initialProblem.title}` : '',
    problemStatement: initialProblem?.description || '',
    description: initialProblem?.background || initialProblem?.description || '',
    domain: initialProblem?.domain || 'AI/ML',
    technologies: initialProblem?.requiredSkills ? initialProblem.requiredSkills.join(', ') : '',
    problemId: initialProblem?.id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.problemStatement) { setError('Title and problem statement are required'); return; }
    setLoading(true);
    try {
      const res = await projectsApi.create({
        ...form,
        technologies: form.technologies.split(',').map((t: string) => t.trim()).filter(Boolean),
        problemId: form.problemId || undefined,
      });
      onCreate(res.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
            {initialProblem && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">
                <Link2 size={12} /> Linked to Problem
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {initialProblem ? `Auto-inheriting intelligence & metrics from "${initialProblem.title}"` : 'Convert your idea into a tracked project'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
          
          {initialProblem && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
              <Sparkles size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Problem Context Attached: </span>
                <span className="text-slate-600">{initialProblem.title} ({initialProblem.domain})</span>
                <p className="text-slate-500 mt-0.5">Tasks, milestones, hardware, and feasibility targets will be auto-generated.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="AI Water Quality Monitor"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Problem Statement *</label>
            <textarea value={form.problemStatement} onChange={e => setForm(f => ({ ...f, problemStatement: e.target.value }))} required rows={2} placeholder="What problem are you solving?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description of your solution..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Domain</label>
              <select value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                {['AI/ML', 'IoT', 'Healthcare', 'Agriculture', 'FinTech', 'Smart Cities', 'Education', 'Environment', 'Water & Sanitation'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Technologies</label>
              <input value={form.technologies} onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))} placeholder="Python, React, TensorFlow..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 gradient-bg text-white font-semibold rounded-xl text-sm shadow hover:shadow-lg transition-all disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeProblem, selectProject, allProblems, selectProblem } = useInnovation();

  useEffect(() => {
    projectsApi.getAll().then(res => setProjects(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Handle ?create=true&problemId=... query param
  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true';
    const problemId = searchParams.get('problemId');
    if (shouldCreate) {
      if (problemId && (!activeProblem || activeProblem.id !== problemId)) {
        const found = allProblems.find((p: any) => p.id === problemId);
        if (found) selectProblem(problemId);
      }
      setShowCreate(true);
    }
  }, [searchParams, allProblems, activeProblem]);

  const handleCreate = (p: Project) => {
    setProjects(prev => [p, ...prev]);
    selectProject(p);
    navigate(`/projects/${p.id}`);
  };

  return (
    <Layout title="Projects" subtitle="Manage your innovation projects">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {STATUS_STEPS.map(s => (
            <span key={s} className={`text-xs px-3 py-1 rounded-full border font-medium capitalize ${STATUS_COLORS[s]}`}>{s}</span>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-bg text-white font-semibold rounded-xl shadow text-sm hover:shadow-lg transition-all">
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-32 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FolderKanban size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold text-gray-500 text-lg mb-2">No projects yet</h3>
          <p className="text-sm mb-4">Start by analyzing an idea or creating a project directly.</p>
          <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 gradient-bg text-white font-semibold rounded-xl shadow text-sm">
            Create First Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{project.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize flex-shrink-0 ${STATUS_COLORS[project.status]}`}>{project.status}</span>
                    {project.problemId && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                        <Link2 size={10} /> Linked Problem: {project.problemId}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1 mb-3">{project.problemStatement}</p>

                  {/* Status timeline */}
                  <div className="flex items-center gap-1 mb-3">
                    {STATUS_STEPS.map((step, i) => {
                      const stepIdx = STATUS_STEPS.indexOf(project.status);
                      const isDone = i <= stepIdx;
                      return (
                        <div key={step} className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${isDone ? 'gradient-bg border-blue-600 text-white' : 'border-gray-200 text-gray-400 bg-white'}`}>
                            {isDone ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
                          </div>
                          {i < STATUS_STEPS.length - 1 && <div className={`w-6 h-0.5 ${isDone ? 'bg-blue-400' : 'bg-gray-200'}`} />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-bold text-gray-700">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full gradient-bg rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} initialProblem={activeProblem} />}
    </Layout>
  );
}
