import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare, Plus, Clock, AlertTriangle, CheckCircle2,
  Filter, Search, User, ArrowUpRight, ShieldCheck, X
} from 'lucide-react';
import { actionsApi, pilotsApi, problemsApi } from '../../services/api';
import { OperationalAction, PilotProgram, Problem } from '../../types';
import Layout from '../../components/layout/Layout';

export default function ActionsManager() {
  const [searchParams] = useSearchParams();
  const pilotIdParam = searchParams.get('pilotId') || '';

  const [actions, setActions] = useState<OperationalAction[]>([]);
  const [pilots, setPilots] = useState<PilotProgram[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New action modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalPilotId, setModalPilotId] = useState(pilotIdParam || 'pilot-alwar-01');
  const [modalPriority, setModalPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [modalAssignedToName, setModalAssignedToName] = useState('Aarav Sharma (Field Lead)');
  const [modalDueDate, setModalDueDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Resolution modal
  const [resolvingAction, setResolvingAction] = useState<OperationalAction | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [actionsRes, pilotsRes, problemsRes] = await Promise.all([
        actionsApi.getAll({ isDemo: false }),
        pilotsApi.getAll(),
        problemsApi.getAll(),
      ]);
      setActions(actionsRes.data || []);
      setPilots(pilotsRes.data || []);
      setProblems(problemsRes.data || []);
    } catch (err) {
      console.error('Failed to load operational actions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;
    setSubmitting(true);
    try {
      await actionsApi.create({
        title: modalTitle,
        description: modalDescription,
        pilotId: modalPilotId,
        priority: modalPriority,
        assignedToName: modalAssignedToName,
        dueDate: modalDueDate,
      });
      setShowCreateModal(false);
      setModalTitle('');
      setModalDescription('');
      loadData();
    } catch (err) {
      console.error('Failed to create action', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, notes?: string) => {
    try {
      await actionsApi.update(id, {
        status: newStatus,
        ...(notes !== undefined && { resolutionNotes: notes }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to update action status', err);
    }
  };

  const filteredActions = actions.filter((a) => {
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && a.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchDesc = (a.description || '').toLowerCase().includes(q);
      const matchAssignee = (a.assignedToName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }
    return true;
  });

  const counts = {
    total: actions.length,
    open: actions.filter(a => a.status === 'OPEN').length,
    inProgress: actions.filter(a => a.status === 'IN_PROGRESS').length,
    resolved: actions.filter(a => a.status === 'RESOLVED' || a.status === 'VERIFIED').length,
    critical: actions.filter(a => a.priority === 'CRITICAL' && a.status !== 'RESOLVED' && a.status !== 'VERIFIED').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Operational Execution
              </span>
              <span className="text-xs text-slate-500 font-mono">Enterprise Workspace</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Operational Action & Intervention Center</h1>
            <p className="text-sm text-slate-600">
              Manage field interventions, maintenance dispatches, sensor recalibrations, and mitigation tasks.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Field Action
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{counts.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Open</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{counts.open}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{counts.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{counts.resolved}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/50 shadow-sm">
            <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Critical Priority</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{counts.critical}</p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions or assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="VERIFIED">Verified</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Actions List */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: 3 }} />
            <p className="text-sm text-slate-500">Loading operational actions...</p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No operational actions found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              {searchQuery || selectedStatus !== 'ALL' || selectedPriority !== 'ALL'
                ? 'Try adjusting your filters or search terms.'
                : 'No field intervention tasks currently logged. Click "Create Field Action" to dispatch tasks.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Create First Action
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActions.map((action) => {
              const priorityColors = {
                CRITICAL: 'bg-red-100 text-red-800 border-red-200',
                HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
                MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
                LOW: 'bg-slate-100 text-slate-800 border-slate-200',
              }[action.priority] || 'bg-slate-100 text-slate-800';

              const statusColors = {
                OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
                IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
                RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                VERIFIED: 'bg-purple-50 text-purple-700 border-purple-200',
              }[action.status] || 'bg-slate-50 text-slate-700';

              return (
                <div
                  key={action.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${priorityColors}`}>
                          {action.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors}`}>
                          {action.status.replace('_', ' ')}
                        </span>
                        {action.pilotId && (
                          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {action.pilotId}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          Created {new Date(action.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900">{action.title}</h3>
                      {action.description && (
                        <p className="text-sm text-slate-600 leading-relaxed">{action.description}</p>
                      )}

                      {action.resolutionNotes && (
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-900">
                          <span className="font-semibold">Resolution Notes: </span>
                          {action.resolutionNotes}
                        </div>
                      )}
                    </div>

                    {/* Meta & Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{action.assignedToName || 'Unassigned'}</span>
                        </div>
                        {action.dueDate && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Due: {action.dueDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {action.status === 'OPEN' && (
                          <button
                            onClick={() => handleUpdateStatus(action.id, 'IN_PROGRESS')}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                          >
                            Start Task
                          </button>
                        )}
                        {action.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => {
                              setResolvingAction(action);
                              setResolutionNotes('');
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Task
                          </button>
                        )}
                        {action.status === 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(action.id, 'VERIFIED')}
                            className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Action */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Create Operational Action</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAction} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Action Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Replace Primary Sand Filter at Thanagazi Well #3"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Field Protocol
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detailed steps for the field technician or operations team..."
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Pilot Program
                    </label>
                    <select
                      value={modalPilotId}
                      onChange={(e) => setModalPilotId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                    >
                      {pilots.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                      {pilots.length === 0 && <option value="pilot-alwar-01">Alwar Pilot #1</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={modalPriority}
                      onChange={(e) => setModalPriority(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assignee Name
                    </label>
                    <input
                      type="text"
                      value={modalAssignedToName}
                      onChange={(e) => setModalAssignedToName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={modalDueDate}
                      onChange={(e) => setModalDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !modalTitle.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Dispatch Action'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Resolve Action */}
        {resolvingAction && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Resolve Operational Action</h3>
              <p className="text-xs text-slate-500 mt-1">"{resolvingAction.title}"</p>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Notes & Field Observations *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the completed work, part replacements, or sensor calibrations..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolvingAction(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(resolvingAction.id, 'RESOLVED', resolutionNotes);
                    setResolvingAction(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
