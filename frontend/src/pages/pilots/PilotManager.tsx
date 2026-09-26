import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket, MapPin, Users, Calendar, AlertTriangle, MessageSquare,
  CheckCircle2, PlusCircle, Clock, ShieldAlert, ArrowRight,
  TrendingUp, RefreshCw, Layers, CheckSquare, ShieldCheck
} from 'lucide-react';
import { pilotsApi } from '../../services/api';
import { PilotProgram, PilotIssue, PilotFeedback } from '../../types';
import Layout from '../../components/layout/Layout';
import { useInnovation } from '../../contexts/InnovationContext';

export default function PilotManager() {
  const { activeProblem, activeProject } = useInnovation();
  const [pilots, setPilots] = useState<PilotProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPilot, setSelectedPilot] = useState<PilotProgram | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackRole, setFeedbackRole] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSentiment, setFeedbackSentiment] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPilots();
  }, [activeProblem, activeProject]);

  const fetchPilots = async () => {
    setLoading(true);
    try {
      const res = await pilotsApi.getAll();
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setPilots(data);
      if (data.length > 0) {
        // Auto-select pilot matching active problem or project
        const match = data.find((p: any) => 
          (activeProblem && p.problemId === activeProblem.id) ||
          (activeProject && p.projectId === activeProject.id) ||
          (p.id === 'pilot-alwar-01')
        );
        setSelectedPilot(match || data[0]);
      }
    } catch (err) {
      console.error('Failed to load pilots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (pilotId: string, newStatus: string) => {
    try {
      await pilotsApi.updateStatus(pilotId, newStatus);
      fetchPilots();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot || !issueDescription) return;
    setSubmitting(true);
    try {
      await pilotsApi.logIssue(selectedPilot.id, {
        description: issueDescription,
        severity: issueSeverity
      });
      setIssueDescription('');
      fetchPilots();
    } catch (err) {
      console.error('Failed to log issue:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot || !feedbackContent || !feedbackAuthor) return;
    setSubmitting(true);
    try {
      await pilotsApi.addFeedback(selectedPilot.id, {
        authorName: feedbackAuthor,
        role: feedbackRole || 'Field Observer',
        content: feedbackContent,
        sentiment: feedbackSentiment
      });
      setFeedbackAuthor('');
      setFeedbackRole('');
      setFeedbackContent('');
      fetchPilots();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Active Field Trial</span>;
      case 'deploying':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Deploying Sensors</span>;
      case 'evaluating':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Evaluating Results</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">Pilot Completed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">{status}</span>;
    }
  };

  return (
    <Layout title="Pilot Deployments" subtitle="Field trial tracking, site telemetry, obstacle logs & frontline sentiment">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <Rocket size={13} className="text-emerald-400" />
              Real-World Deployments
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[VALIDATION IN THE FIELD]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pilot Program Operations & Field Trials
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Ideas mean nothing without physical deployment in real operating conditions. Track field testbeds, community cohorts, sensor reliability, on-ground obstacles, and frontline stakeholder sentiment.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw size={32} className="animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading pilot deployments...</p>
        </div>
      ) : pilots.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <Rocket size={48} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold">No Pilot Deployments Active</h3>
          <p className="text-sm text-slate-500 mt-1">Start a pilot from an approved innovation project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pilots List */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Deployments ({pilots.length})
            </h3>
            <div className="space-y-3">
              {pilots.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPilot(p)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedPilot?.id === p.id
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      {p.name}
                    </h4>
                    {getStatusBadge(p.status)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                    <MapPin size={13} className="text-red-500 flex-shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Cohort: {p.cohortSize}</span>
                    <span>Issues: {p.issues?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Pilot Detail View */}
          {selectedPilot && (
            <div className="lg:col-span-2 space-y-6">
              {/* Pilot Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">[FIELD TESTBED]</span>
                      {getStatusBadge(selectedPilot.status)}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {selectedPilot.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPilot.status}
                      onChange={(e) => handleStatusChange(selectedPilot.id, e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="site_scouted">Site Scouted</option>
                      <option value="deploying">Deploying</option>
                      <option value="active">Active Field Trial</option>
                      <option value="evaluating">Evaluating</option>
                      <option value="completed">Completed</option>
                      <option value="scaled">Nationally Scaled</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                    <strong className="text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{selectedPilot.location}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cohort / Testbed</span>
                    <strong className="text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{selectedPilot.cohortSize}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Partner Body</span>
                    <strong className="text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{selectedPilot.partnerOrganization}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration</span>
                    <strong className="text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{selectedPilot.startDate} – {selectedPilot.endDate}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPilot.description}
                </p>

                {/* Success Criteria */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Success Thresholds:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPilot.successCriteria?.map((crit, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        {crit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field Issues Logged */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Field Obstacles & Technical Failure Logs ({selectedPilot.issues?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">[AUDIT RECORD]</span>
                </div>

                <div className="space-y-2">
                  {selectedPilot.issues && selectedPilot.issues.length > 0 ? (
                    selectedPilot.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                              issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              issue.severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                            }`}>
                              {issue.severity}
                            </span>
                            <span className="text-[11px] text-slate-400">{issue.loggedAt}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{issue.description}</p>
                          {issue.resolutionNotes && (
                            <p className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                              Resolution: {issue.resolutionNotes}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {issue.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No field issues currently reported.</p>
                  )}
                </div>

                {/* Add Issue Form */}
                <form onSubmit={handleAddIssue} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Log real-world obstacle (e.g. sensor fouling, power outage)..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <select
                      value={issueSeverity}
                      onChange={(e: any) => setIssueSeverity(e.target.value)}
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <button
                      type="submit"
                      disabled={submitting || !issueDescription}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      Log Issue
                    </button>
                  </div>
                </form>
              </div>

              {/* Frontline Qualitative Feedback */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-600" />
                    Frontline Community & Operator Feedback ({selectedPilot.feedback?.length || 0})
                  </h3>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:inline">[STAKEHOLDER VOICES]</span>
                </div>

                <div className="space-y-3">
                  {selectedPilot.feedback && selectedPilot.feedback.length > 0 ? (
                    selectedPilot.feedback.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {fb.authorName} <span className="text-slate-400 font-normal">({fb.role})</span>
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-semibold uppercase ${
                            fb.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' :
                            fb.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {fb.sentiment}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 italic">
                          "{fb.content}"
                        </p>
                        <span className="text-[10px] text-slate-400 block">{fb.submittedAt}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No feedback entries recorded yet.</p>
                  )}
                </div>

                {/* Add Feedback Form */}
                <form onSubmit={handleAddFeedback} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Stakeholder Name (e.g. Sarpanch, ASHA Worker, Lab Tech)"
                      value={feedbackAuthor}
                      onChange={(e) => setFeedbackAuthor(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Village Health Committee)"
                      value={feedbackRole}
                      onChange={(e) => setFeedbackRole(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      placeholder="Verbatim quote or qualitative observation from community..."
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <div className="flex sm:flex-col justify-between gap-1.5">
                      <select
                        value={feedbackSentiment}
                        onChange={(e: any) => setFeedbackSentiment(e.target.value)}
                        className="flex-1 sm:flex-initial px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                      </select>
                      <button
                        type="submit"
                        disabled={submitting || !feedbackContent || !feedbackAuthor}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </Layout>
  );
}
