import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Lightbulb, Plus, Cpu, Scale, CheckCircle, ArrowRight,
  TrendingUp, Shield, IndianRupee, Clock, Layers, X
} from 'lucide-react';
import { solutionsApi, problemsApi } from '../../services/api';
import { Solution, Problem } from '../../types';
import Layout from '../../components/layout/Layout';

export default function SolutionsManager() {
  const [searchParams] = useSearchParams();
  const problemIdParam = searchParams.get('problemId') || '';

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(problemIdParam || 'ALL');
  const [loading, setLoading] = useState(true);

  // Compare mode
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalProblemId, setModalProblemId] = useState(problemIdParam || 'prob-water-01');
  const [modalTechStack, setModalTechStack] = useState('ESP32, TinyML, LoRaWAN, Solar MPPT');
  const [modalTRL, setModalTRL] = useState('TRL-5');
  const [modalFeasibility, setModalFeasibility] = useState(85);
  const [modalCost, setModalCost] = useState(4800);
  const [modalWeeks, setModalWeeks] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [solRes, probRes] = await Promise.all([
        solutionsApi.getAll({ isDemo: false }),
        problemsApi.getAll(),
      ]);
      setSolutions(solRes.data || []);
      setProblems(probRes.data || []);
    } catch (err) {
      console.error('Failed to load solutions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalDescription.trim()) return;
    setSubmitting(true);
    try {
      const techArray = modalTechStack.split(',').map(s => s.trim()).filter(Boolean);
      await solutionsApi.create({
        problemId: modalProblemId,
        title: modalTitle,
        description: modalDescription,
        technologyStack: techArray,
        maturityLevel: modalTRL,
        feasibilityScore: Number(modalFeasibility),
        estimatedCostInr: Number(modalCost),
        timelineWeeks: Number(modalWeeks),
      });
      setShowCreateModal(false);
      setModalTitle('');
      setModalDescription('');
      loadData();
    } catch (err) {
      console.error('Failed to create solution', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCompare = (id: string) => {
    setSelectedForCompare(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleRunComparison = async () => {
    if (selectedForCompare.length < 2) return;
    try {
      const res = await solutionsApi.compare({ solutionIds: selectedForCompare });
      setComparisonResult(res.data?.comparison || null);
    } catch (err) {
      console.error('Failed to compare solutions', err);
    }
  };

  const filteredSolutions = solutions.filter(s => {
    if (selectedProblemId !== 'ALL' && s.problemId !== selectedProblemId) return false;
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Technology Evaluation
              </span>
              <span className="text-xs text-slate-500 font-mono">Solution Studio</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Candidate Innovations & Solutions</h1>
            <p className="text-sm text-slate-600">
              Evaluate candidate technology architectures, TRL maturity levels, and cost-benefit trade-offs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedForCompare.length >= 2 && (
              <button
                onClick={handleRunComparison}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
              >
                <Scale className="w-4 h-4" />
                Compare ({selectedForCompare.length})
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Propose Solution
            </button>
          </div>
        </div>

        {/* Problem Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Problem Statement:</span>
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Problems ({solutions.length} solutions)</option>
              {problems.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-500">
            Select up to 3 candidate solutions using checkboxes to view comparative trade-offs.
          </p>
        </div>

        {/* Comparison Result Drawer */}
        {comparisonResult && (
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Comparative Architecture & Cost Matrix</h3>
              </div>
              <button
                onClick={() => setComparisonResult(null)}
                className="text-xs text-indigo-300 hover:text-white"
              >
                Close Matrix
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonResult.solutions?.map((sol: any) => {
                const isRecommended = sol.id === comparisonResult.recommendedSolutionId;
                return (
                  <div
                    key={sol.id}
                    className={`p-4 rounded-xl border ${
                      isRecommended
                        ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-400/40'
                        : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    {isRecommended && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2 inline-block">
                        Recommended Option
                      </span>
                    )}
                    <h4 className="text-sm font-semibold text-white">{sol.title}</h4>
                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Maturity Level:</span>
                        <span className="font-mono text-indigo-300">{sol.maturityLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Feasibility Score:</span>
                        <span className="font-bold text-emerald-400">{sol.feasibilityScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Node Cost:</span>
                        <span className="font-mono text-amber-300">₹{sol.estimatedCostInr?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Implementation:</span>
                        <span>{sol.timelineWeeks} weeks</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Solutions Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: 3 }} />
            <p className="text-sm text-slate-500">Loading candidate solutions...</p>
          </div>
        ) : filteredSolutions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
            <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No candidate solutions registered</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Propose a candidate technology architecture or pilot approach for this problem statement.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Propose Solution
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSolutions.map((sol) => {
              const isSelected = selectedForCompare.includes(sol.id);
              const linkedProblem = problems.find(p => p.id === sol.problemId);

              return (
                <div
                  key={sol.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {sol.maturityLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {sol.feasibilityScore}% Feasibility
                        </span>
                      </div>

                      <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCompare(sol.id)}
                          className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span>Compare</span>
                      </label>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{sol.title}</h3>
                      {linkedProblem && (
                        <p className="text-xs text-slate-500 mt-1">
                          Problem: <span className="font-medium text-slate-700">{linkedProblem.title}</span>
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">{sol.description}</p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sol.technologyStack?.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                        ₹{sol.estimatedCostInr?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {sol.timelineWeeks}w build
                      </span>
                    </div>

                    <Link
                      to={`/pilots?problemId=${sol.problemId}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Pilots <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Propose Solution */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Propose Candidate Innovation</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSolution} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Problem Statement *</label>
                  <select
                    value={modalProblemId}
                    onChange={(e) => setModalProblemId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                  >
                    {problems.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                    {problems.length === 0 && <option value="prob-water-01">Rural Water Contamination</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Solution Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar-Powered Nephelometric Optical Sensor Node"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Architecture & Technical Approach *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the hardware components, firmware logic, power budget, and cloud ingestion approach..."
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Technology Stack (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="ESP32, TinyML, FreeRTOS, 4G-LTE, Solar MPPT"
                    value={modalTechStack}
                    onChange={(e) => setModalTechStack(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">TRL Level</label>
                    <select
                      value={modalTRL}
                      onChange={(e) => setModalTRL(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                    >
                      <option value="TRL-3">TRL-3 (Proof of Concept)</option>
                      <option value="TRL-4">TRL-4 (Lab Prototype)</option>
                      <option value="TRL-5">TRL-5 (Relevant Environment)</option>
                      <option value="TRL-6">TRL-6 (Field Prototype)</option>
                      <option value="TRL-7">TRL-7 (Operational Demo)</option>
                      <option value="TRL-8">TRL-8 (Qualified System)</option>
                      <option value="TRL-9">TRL-9 (Full Production)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Cost (₹)</label>
                    <input
                      type="number"
                      value={modalCost}
                      onChange={(e) => setModalCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Timeline (wks)</label>
                    <input
                      type="number"
                      value={modalWeeks}
                      onChange={(e) => setModalWeeks(Number(e.target.value))}
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
                    {submitting ? 'Registering...' : 'Register Solution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
