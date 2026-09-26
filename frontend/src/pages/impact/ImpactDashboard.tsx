import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, CheckCircle2, AlertTriangle, RefreshCw,
  PlusCircle, Target, ArrowUpRight, ArrowDownRight, Layers,
  Calendar, RotateCcw, ShieldCheck, HelpCircle, Activity
} from 'lucide-react';
import { impactApi } from '../../services/api';
import { ImpactKPI, FeedbackLoopItem } from '../../types';
import Layout from '../../components/layout/Layout';
import { useInnovation } from '../../contexts/InnovationContext';

export default function ImpactDashboard() {
  const { activeProblem, activeProject } = useInnovation();
  const [kpis, setKpis] = useState<ImpactKPI[]>([]);
  const [loops, setLoops] = useState<FeedbackLoopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKpi, setSelectedKpi] = useState<ImpactKPI | null>(null);
  const [newCurrentValue, setNewCurrentValue] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // New feedback loop form
  const [newFinding, setNewFinding] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [newUpdatedTarget, setNewUpdatedTarget] = useState('');
  const [loopSubmitting, setLoopSubmitting] = useState(false);

  useEffect(() => {
    fetchImpactData();
  }, [activeProblem]);

  const fetchImpactData = async () => {
    setLoading(true);
    try {
      const [kpiRes, loopsRes] = await Promise.all([
        impactApi.getAllKpis(),
        impactApi.getFeedbackLoops()
      ]);
      const kpiData = Array.isArray(kpiRes.data) ? kpiRes.data : (kpiRes.data.data || []);
      const loopData = Array.isArray(loopsRes.data) ? loopsRes.data : (loopsRes.data.data || []);
      setKpis(kpiData);
      setLoops(loopData);
      if (kpiData.length > 0 && !selectedKpi) {
        setSelectedKpi(kpiData[0]);
      }
    } catch (err) {
      console.error('Failed to load impact data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKpi || !newCurrentValue) return;
    setUpdating(true);
    try {
      await impactApi.updateKpi(selectedKpi.id, {
        currentValue: parseFloat(newCurrentValue),
        verifiedDate: new Date().toISOString().split('T')[0]
      });
      setNewCurrentValue('');
      fetchImpactData();
    } catch (err) {
      console.error('Failed to update KPI:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddFeedbackLoop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinding || !newDecision) return;
    setLoopSubmitting(true);
    try {
      await impactApi.addFeedbackLoop({
        problemId: activeProblem?.id || selectedKpi?.problemId || 'prob-water-01',
        cycleNumber: loops.length + 1,
        date: new Date().toISOString().split('T')[0],
        finding: newFinding,
        decision: newDecision,
        updatedTarget: newUpdatedTarget || undefined,
        status: 'implemented'
      });
      setNewFinding('');
      setNewDecision('');
      setNewUpdatedTarget('');
      fetchImpactData();
    } catch (err) {
      console.error('Failed to add feedback loop:', err);
    } finally {
      setLoopSubmitting(false);
    }
  };

  const avgProgress = kpis.length > 0
    ? Math.round(kpis.reduce((acc, k) => acc + (k.progressPercent || 0), 0) / kpis.length)
    : 72;

  return (
    <Layout title="Measurable Impact" subtitle="Baseline vs target KPIs, progress verification & continuous feedback loops">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
              <BarChart3 size={13} className="text-indigo-400" />
              Measurable Outcomes
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[DEMO DATA & SIMULATED TELEMETRY]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Impact Measurement & Iterative Learning
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            True innovation is proven by hard evidence, not pitch decks. Track quantifiable baseline metrics versus field targets, audit progress percentages, and feed real-world operational findings directly back into technical iterations.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-white text-sm sm:text-base">{kpis.length}</span>
              <span className="text-slate-400">Tracked KPIs</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-emerald-400 text-sm sm:text-base">{avgProgress}%</span>
              <span className="text-slate-400">Mean Target Realization</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-blue-400 text-sm sm:text-base">{loops.length}</span>
              <span className="text-slate-400">Feedback Cycles</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw size={32} className="animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading outcome measurements...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-blue-600" />
                Measurable Key Performance Indicators (Baseline vs Field Targets)
              </h2>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">[VERIFIED METRICS]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  onClick={() => setSelectedKpi(kpi)}
                  className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 cursor-pointer transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                    selectedKpi?.id === kpi.id
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {kpi.direction === 'decrease' ? 'Target: Reduction' : 'Target: Increase'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {kpi.measurementFrequency}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {kpi.title}
                    </h3>

                    {/* Numbers Comparison */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold truncate">Baseline</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                          {kpi.baselineValue} {kpi.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold truncate">Current</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                          {kpi.currentValue} {kpi.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold truncate">Target</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                          {kpi.targetValue} {kpi.unit}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Goal Realization</span>
                        <span className="font-bold text-emerald-600 text-xs">
                          {kpi.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, kpi.progressPercent))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                    <span>Verified: {kpi.verifiedDate}</span>
                    <span className="text-blue-600 hover:underline">Log Reading</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metric Telemetry Updater */}
          {selectedKpi && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Submit Field Reading for: <span className="text-blue-600">{selectedKpi.title}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Current recorded metric is <strong className="text-slate-700 dark:text-slate-300">{selectedKpi.currentValue} {selectedKpi.unit}</strong> against target <strong className="text-emerald-600">{selectedKpi.targetValue} {selectedKpi.unit}</strong>.
                  </p>
                </div>
                <form onSubmit={handleUpdateKpi} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  <input
                    type="number"
                    step="any"
                    placeholder={`New value (${selectedKpi.unit})`}
                    value={newCurrentValue}
                    onChange={(e) => setNewCurrentValue(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full sm:w-48"
                  />
                  <button
                    type="submit"
                    disabled={updating || !newCurrentValue}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    Update Reading
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Continuous Feedback Loops Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCcw size={18} className="text-indigo-600" />
                  Continuous Feedback Loops & Adaptive Adjustments
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How real-world field results continuously alter product architecture and policy decisions.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">[ADAPTIVE REVISION LOG]</span>
            </div>

            <div className="space-y-3 pt-2">
              {loops.map((loop) => (
                <div
                  key={loop.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                        #{loop.cycleNumber}
                      </span>
                      Iteration Cycle {loop.cycleNumber}
                    </span>
                    <span className="text-slate-400 text-[11px]">{loop.date}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-amber-600 block">Empirical Field Finding:</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{loop.finding}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 block">Action / Architectural Decision:</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{loop.decision}</p>
                    </div>
                  </div>

                  {loop.updatedTarget && (
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-1">
                      Updated Benchmark: {loop.updatedTarget}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Feedback Loop Form */}
            <form onSubmit={handleAddFeedbackLoop} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Record New Empirical Iteration Cycle
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <textarea
                  placeholder="Empirical finding from current pilot (e.g. bio-fouling on turbidity probe every 14 days)..."
                  value={newFinding}
                  onChange={(e) => setNewFinding(e.target.value)}
                  rows={2}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <textarea
                  placeholder="Architectural or protocol adjustment (e.g. implemented mechanical wiper + changed reporting frequency)..."
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  rows={2}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Updated target or metric threshold (optional)..."
                  value={newUpdatedTarget}
                  onChange={(e) => setNewUpdatedTarget(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loopSubmitting || !newFinding || !newDecision}
                  className="w-full sm:w-auto px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap"
                >
                  Commit Feedback Cycle
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
