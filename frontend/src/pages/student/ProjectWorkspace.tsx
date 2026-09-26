import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { projectsApi, resourcesApi, aiApi } from '../../services/api';
import { Project, Task, MentorFeedback, Resource, AIInsight } from '../../types';
import {
  ArrowLeft, CheckCircle, Circle, Clock, Plus, Star,
  Flag, MessageSquare, ChevronRight, Zap, Users, BookOpen,
  FileCode, Sparkles, ExternalLink, ShieldCheck, Database
} from 'lucide-react';

const STATUS_STEPS = ['idea', 'research', 'planning', 'prototype', 'testing', 'deployment'];
const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-green-600 bg-green-50 border-green-200',
};
const TASK_STATUS_COLORS: Record<string, string> = {
  todo: 'text-gray-500',
  'in-progress': 'text-blue-500 font-semibold',
  done: 'text-green-600 font-semibold',
};

const DEFAULT_TEAM = [
  { name: 'Aarav Kumar (Lead)', role: 'AI / ML & IoT Firmware', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aarav' },
  { name: 'Priya Sharma', role: 'Data Pipeline & Cloud Ingestion', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
  { name: 'Rohit Verma', role: 'Hardware Sensor Calibration', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohit' },
];

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<MentorFeedback[]>([]);
  const [projectResources, setProjectResources] = useState<Resource[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'resources' | 'ai-insights' | 'feedback' | 'docs'>('overview');
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectsApi.getById(id),
      projectsApi.getFeedback(id),
      resourcesApi.getAll({ q: 'water', limit: 6 }),
      aiApi.insights(),
    ]).then(([pRes, fRes, rRes, insRes]) => {
      setProject(pRes.data);
      setFeedback(fRes.data);
      setProjectResources(rRes.data.data);
      setAiInsights(insRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const addTask = async () => {
    if (!newTask.title.trim() || !project) return;
    const res = await projectsApi.addTask(project.id, newTask).catch(() => null);
    if (res) {
      setProject(p => p ? { ...p, tasks: [...p.tasks, res.data] } : p);
      setNewTask({ title: '', priority: 'medium' });
      setAddingTask(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!project) return;
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;
    const nextStatus: Record<string, Task['status']> = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' };
    const updatedTasks = project.tasks.map(t => t.id === taskId ? { ...t, status: nextStatus[t.status] } : t);
    const doneCount = updatedTasks.filter(t => t.status === 'done').length;
    const progress = Math.round((doneCount / (updatedTasks.length || 1)) * 100);
    setProject(p => p ? { ...p, tasks: updatedTasks, progress } : p);
    await projectsApi.update(project.id, { tasks: updatedTasks, progress }).catch(() => {});
  };

  if (loading) {
    return (
      <Layout title="Project Workspace">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout title="Project Workspace">
        <div className="text-center py-20 text-gray-400">
          Project not found. <Link to="/projects" className="text-blue-600">Go back</Link>
        </div>
      </Layout>
    );
  }

  const stepIdx = STATUS_STEPS.indexOf(project.status);
  const doneTasks = project.tasks.filter(t => t.status === 'done').length;
  const completedMilestones = project.milestones.filter(m => m.completed).length;

  const tabs = [
    { id: 'overview', label: 'Project Overview' },
    { id: 'tasks', label: `Tasks (${project.tasks.length})` },
    { id: 'milestones', label: `Milestones (${project.milestones.length})` },
    { id: 'resources', label: `Resources (${projectResources.length})` },
    { id: 'ai-insights', label: 'AI Recommendations' },
    { id: 'feedback', label: `Mentor Feedback (${feedback.length})` },
    { id: 'docs', label: 'Documentation' },
  ];

  return (
    <Layout title="Project Workspace" subtitle="Collaborate, track milestones, and manage tasks from idea to deployment">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors font-medium">
        <ArrowLeft size={14} /> Back to All Projects
      </Link>

      {/* Header Banner with Stage Progression */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 rounded-2xl p-4 sm:p-6 text-white mb-5 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-blue-200 text-xs font-semibold px-2.5 py-0.5 bg-white/10 rounded-full">{project.domain}</span>
            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
            <span className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Stage: {project.status}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words">{project.title}</h1>
          <p className="text-blue-100 text-xs max-w-2xl leading-relaxed">{project.problemStatement}</p>

          {/* 6-Stage Lifecycle Tracker */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/15 overflow-x-auto scrollbar-thin pb-2 whitespace-nowrap">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  i <= stepIdx ? 'bg-white/20 border-white/30 text-white' : 'border-white/10 text-white/40'
                }`}>
                  {i < stepIdx ? <CheckCircle size={12} className="text-emerald-300" /> : i === stepIdx ? <Zap size={12} className="text-amber-300" /> : <Circle size={12} />}
                  <span className="capitalize">{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && <ChevronRight size={13} className={i < stepIdx ? 'text-white/60' : 'text-white/20'} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress & Milestone KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { label: 'Overall Completion', value: `${project.progress}%`, sub: `${doneTasks}/${project.tasks.length} Tasks Finished` },
          { label: 'Task Execution', value: `${doneTasks}/${project.tasks.length}`, sub: 'Active Sprints' },
          { label: 'Milestones Reached', value: `${completedMilestones}/${project.milestones.length}`, sub: 'Key Deliverables' },
          { label: 'Mentor Reviews', value: feedback.length.toString(), sub: 'Evaluations logged' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold gradient-text">{s.value}</div>
            <div className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</div>
            <div className="text-[10px] sm:text-[11px] text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: 1. Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Problem Statement</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                {project.problemStatement}
              </p>

              <h3 className="font-semibold text-gray-900 text-sm mt-4 mb-2">Project Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {project.description || project.problemStatement}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Project Objectives</h3>
              <ul className="space-y-2.5">
                {project.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                    <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-5">
            {/* Tech Stack */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Adopted Technologies</h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map(t => (
                  <span key={t} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
                <Users size={16} className="text-blue-600" /> Team Members
              </h3>
              <div className="space-y-3">
                {DEFAULT_TEAM.map(member => (
                  <div key={member.name} className="flex items-center gap-2.5">
                    <img src={member.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                    <div>
                      <div className="text-xs font-bold text-gray-800">{member.name}</div>
                      <div className="text-[11px] text-gray-400">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: 2. Tasks */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-50">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Interactive Task Board</h3>
              <p className="text-xs text-gray-400">Click circle or checkmark to advance task status</p>
            </div>
            <button
              onClick={() => setAddingTask(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all w-full sm:w-auto"
            >
              <Plus size={14} /> Add New Task
            </button>
          </div>

          {addingTask && (
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-blue-50/60">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  value={newTask.title}
                  onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))}
                  placeholder="Task title (e.g. Calibrate turbidity probe analog threshold)..."
                  className="flex-1 w-full px-4 py-2 border border-blue-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                />
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(n => ({ ...n, priority: e.target.value }))}
                    className="flex-1 sm:flex-initial px-3 py-2 border border-blue-200 rounded-xl text-xs bg-white focus:outline-none"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  <button onClick={addTask} className="px-4 py-2 gradient-bg text-white text-xs font-semibold rounded-xl">Save</button>
                  <button onClick={() => setAddingTask(false)} className="px-3 py-2 text-gray-500 text-xs border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-50">
            {project.tasks.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400 text-xs">No tasks recorded yet. Click "Add New Task" above.</div>
            ) : project.tasks.map(task => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 p-0.5 mt-0.5 sm:mt-0">
                    {task.status === 'done' ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : task.status === 'in-progress' ? (
                      <Clock size={18} className="text-blue-500" />
                    ) : (
                      <Circle size={18} className="text-gray-300 hover:text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium block ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                    {task.description && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{task.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pl-7 sm:pl-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${PRIORITY_COLORS[task.priority]}`}>
                    <Flag size={9} className="inline mr-1" />{task.priority}
                  </span>
                  <span className={`text-[11px] capitalize ${TASK_STATUS_COLORS[task.status]}`}>{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: 3. Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-3 animate-in">
          {project.milestones.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs bg-white rounded-2xl border border-gray-100">No milestones defined yet.</div>
          ) : project.milestones.map((m, i) => (
            <div key={m.id} className={`bg-white rounded-2xl border p-4 ${m.completed ? 'border-green-200 bg-green-50/20' : 'border-gray-100'} shadow-sm`}>
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                  m.completed ? 'border-green-500 bg-green-100 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}>
                  {m.completed ? <CheckCircle size={18} /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{m.title}</h3>
                    {m.completed && <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">Completed</span>}
                  </div>
                  <p className="text-xs text-gray-600 mb-1.5">{m.description}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock size={11} /> Target Due Date: {new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: 4. Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-4 animate-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Discovered & Linked Resources</h3>
            <Link to="/resources" className="text-xs text-blue-600 font-semibold hover:underline">
              Explore More Resources →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectResources.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{r.category}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{r.relevanceScore}% Match</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs mb-1">{r.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{r.description}</p>
                </div>
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">{r.source}</span>
                  <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                    View <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: 5. AI Recommendations */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-4 animate-in">
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <Sparkles size={14} className="text-amber-600 flex-shrink-0" />
            <span>AI continually analyzes current sensor telemetry benchmarks and research papers to generate suggestions for this project.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.slice(0, 4).map(ins => (
              <div key={ins.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">{ins.type}</span>
                  <span className="text-xs text-gray-400 font-medium">{ins.confidence}% Confidence</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1.5">{ins.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{ins.content}</p>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-[11px] font-bold text-gray-700 mb-0.5">Recommendation:</div>
                  <div className="text-xs text-blue-700">{ins.recommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: 6. Mentor Feedback */}
      {activeTab === 'feedback' && (
        <div className="space-y-4 animate-in">
          {feedback.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-xs">No mentor feedback submitted for this project yet.</p>
            </div>
          ) : feedback.map(fb => (
            <div key={fb.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <MessageSquare size={14} className="text-violet-600" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900">Dr. Meena Iyer (Assigned Mentor)</span>
                    <div className="text-[10px] text-gray-400">IIT Delhi AI Research Lab</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < fb.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">{fb.content}</p>
              <p className="text-[11px] text-gray-400 mt-2.5">Submitted on {new Date(fb.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: 7. Documentation */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 animate-in">
          <h3 className="font-bold text-gray-900 text-sm">Project Specifications & Artifacts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'System Architecture Specification', type: 'PDF Architecture Document', size: '2.4 MB' },
              { title: 'Hardware Bill of Materials (BOM)', type: 'Component Pricing Spreadsheet', size: '145 KB' },
              { title: 'Sensor Calibration Protocol v1.2', type: 'Laboratory Standard Operating Procedure', size: '820 KB' },
              { title: 'Model Training & Evaluation Report', type: 'Jupyter Notebook & Checkpoints', size: '12.8 MB' },
            ].map(doc => (
              <div key={doc.title} className="p-3.5 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">{doc.title}</div>
                  <div className="text-[11px] text-gray-400">{doc.type} · {doc.size}</div>
                </div>
                <button className="text-xs font-semibold text-blue-600 hover:underline">Download</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
