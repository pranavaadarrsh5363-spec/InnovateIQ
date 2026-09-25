import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { analyticsApi, usersApi, projectsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users, FolderKanban, MessageSquare, Star, ArrowRight, CheckCircle,
  ExternalLink, Send, Sparkles, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    Promise.all([analyticsApi.dashboard(), usersApi.getStudents(), projectsApi.getAll()])
      .then(([s, st, p]) => {
        setStats(s.data);
        setStudents(st.data);
        setProjects(p.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !feedbackContent.trim()) return;
    setSubmittingFeedback(true);
    try {
      await projectsApi.addFeedback(selectedProject.id, {
        content: feedbackContent,
        rating: feedbackRating,
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackSuccess(false);
        setSelectedProject(null);
        setFeedbackContent('');
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <Layout title="Mentor Innovation Dashboard" subtitle={`Welcome, ${user?.name} · Guiding Student Innovators`}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Assigned Innovators', value: stats?.totalStudents ?? students.length, icon: Users, color: 'from-blue-500 to-blue-600' },
          { label: 'Monitored Projects', value: stats?.totalProjects ?? projects.length, icon: FolderKanban, color: 'from-violet-500 to-violet-600' },
          { label: 'Pending Evaluations', value: stats?.pendingFeedback ?? 2, icon: MessageSquare, color: 'from-amber-500 to-orange-500' },
          { label: 'Completed Reviews', value: stats?.completedReviews ?? 4, icon: Star, color: 'from-emerald-500 to-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow`}>
              <Icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Project progress & Review Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Assigned Student Projects & Progress</h3>
            <p className="text-xs text-gray-400">Track stage completion and provide mentorship guidance</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
            {projects.length} Active Prototypes
          </span>
        </div>

        <div className="space-y-3.5">
          {projects.map((p: any) => (
            <div key={p.id} className="p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 transition-all bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-900 truncate">{p.title}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs">
                    <div className="h-full gradient-bg rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{p.progress}%</span>
                  <span className="text-[11px] text-gray-400 truncate max-w-xs">{p.domain}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/projects/${p.id}`}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all flex items-center gap-1 shadow-sm"
                >
                  Workspace <ArrowRight size={12} />
                </Link>
                <button
                  onClick={() => setSelectedProject(p)}
                  className="px-3 py-1.5 gradient-bg text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
                >
                  <MessageSquare size={12} /> Give Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Students List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Assigned Innovators Portfolio</h3>
          <span className="text-xs text-gray-400">{students.length} students</span>
        </div>
        <div className="divide-y divide-gray-50">
          {students.slice(0, 6).map((student: any) => (
            <div key={student.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
              <img
                src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                alt=""
                className="w-10 h-10 rounded-full border border-gray-200"
              />
              <div className="flex-1">
                <div className="font-bold text-xs text-gray-900">{student.name}</div>
                <div className="text-[11px] text-gray-400">
                  {student.profile?.university || 'IIT Delhi'} · {student.profile?.domain || student.domain || 'Technology'}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {(student.profile?.skills || student.skills || ['Python', 'AI/ML']).slice(0, 3).map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 max-w-lg w-full">
            <h3 className="font-bold text-gray-900 text-base mb-1">Provide Mentor Evaluation</h3>
            <p className="text-xs text-gray-500 mb-4">Project: {selectedProject.title}</p>

            {feedbackSuccess ? (
              <div className="p-6 bg-green-50 rounded-xl text-center">
                <CheckCircle size={32} className="text-green-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-green-800">Feedback submitted successfully!</p>
                <p className="text-xs text-green-600 mt-1">Student has been notified in their workspace.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={22}
                          className={star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mentor Comments & Technical Guidance</label>
                  <textarea
                    rows={4}
                    value={feedbackContent}
                    onChange={e => setFeedbackContent(e.target.value)}
                    required
                    placeholder="Provide constructive feedback on model architecture, hardware selection, field testing plans, or suggest specific datasets..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback || !feedbackContent.trim()}
                    className="px-4 py-2 gradient-bg text-white text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-50"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
