import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Brain, Globe, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2,
  Clock, Database, Layers, Sparkles, Building2, Users, FileText,
  ChevronDown, ChevronUp, ExternalLink, RefreshCw, Cpu, Award,
  Scale, AlertCircle, Compass, Target, HelpCircle, GitFork
} from 'lucide-react';
import { problemsApi, evidenceApi } from '../../services/api';
import {
  Problem, ProblemAnalysis, RootCauseNode, StakeholderMapItem,
  ExistingSolution, InnovationGapHypothesis, TechnologyTradeoff, EvidenceItem
} from '../../types';
import Layout from '../../components/layout/Layout';
import { useInnovationContext } from '../../contexts/InnovationContext';

export default function ProblemAnalyzer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectProblem } = useInnovationContext();
  const problemId = id || 'prob-water-01';

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [analysis, setAnalysis] = useState<ProblemAnalysis | null>(null);
  const [rootCauses, setRootCauses] = useState<RootCauseNode[]>([]);
  const [stakeholders, setStakeholders] = useState<StakeholderMapItem[]>([]);
  const [solutions, setSolutions] = useState<ExistingSolution[]>([]);
  const [gaps, setGaps] = useState<InnovationGapHypothesis[]>([]);
  const [tradeoffs, setTradeoffs] = useState<TechnologyTradeoff[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'rootcauses' | 'stakeholders' | 'evidence' | 'solutions' | 'tradeoffs'>('overview');

  useEffect(() => {
    loadProblemData();
  }, [problemId]);

  const loadProblemData = async () => {
    setLoading(true);
    try {
      const probRes = await problemsApi.getById(problemId);
      const pData = probRes.data.data || probRes.data;
      setProblem(pData);
      if (pData) selectProblem(pData);

      try {
        const analysisRes = await problemsApi.getAnalysis(problemId);
        setAnalysis(analysisRes.data.data || analysisRes.data);
      } catch (e) {
        console.warn('No analysis found');
      }

      try {
        const rootsRes = await problemsApi.getRootCauses(problemId);
        setRootCauses(Array.isArray(rootsRes.data) ? rootsRes.data : (rootsRes.data.data || []));
      } catch (e) {}

      try {
        const stRes = await problemsApi.getStakeholders(problemId);
        setStakeholders(Array.isArray(stRes.data) ? stRes.data : (stRes.data.data || []));
      } catch (e) {}

      try {
        const solRes = await problemsApi.getSolutions(problemId);
        setSolutions(Array.isArray(solRes.data) ? solRes.data : (solRes.data.data || []));
      } catch (e) {}

      try {
        const gapRes = await problemsApi.getGaps(problemId);
        setGaps(Array.isArray(gapRes.data) ? gapRes.data : (gapRes.data.data || []));
      } catch (e) {}

      try {
        const techRes = await problemsApi.getTechTradeoffs(problemId);
        setTradeoffs(Array.isArray(techRes.data) ? techRes.data : (techRes.data.data || []));
      } catch (e) {}

      try {
        const evRes = await evidenceApi.search({ problemId });
        setEvidenceList(Array.isArray(evRes.data) ? evRes.data : (evRes.data.data || []));
      } catch (e) {}

    } catch (err) {
      console.error('Failed to load problem data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!problem) return;
    setAnalyzing(true);
    try {
      const res = await problemsApi.runAnalysis(problem.id);
      setAnalysis(res.data.data);
      loadProblemData();
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getNodeTypeBadge = (type: string) => {
    switch (type) {
      case 'root_cause':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-red-100 text-red-800 border border-red-200">Root Cause</span>;
      case 'contributing_factor':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">Contributing Factor</span>;
      case 'symptom':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">Observed Symptom</span>;
      case 'constraint':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-800 border border-purple-200">Structural Constraint</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout title="Problem Intelligence" subtitle="Hierarchical root causes, stakeholder dynamics, verified citations & trade-off analysis">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <RefreshCw size={36} className="animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Aggregating problem intelligence and evidence...</p>
        </div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout title="Problem Intelligence" subtitle="Hierarchical root causes, stakeholder dynamics, verified citations & trade-off analysis">
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-3" />
          <h3 className="text-lg font-bold">Problem Not Found</h3>
          <p className="text-sm text-slate-500 mt-1">The requested problem could not be found or has been archived.</p>
          <Link to="/problems" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
            Return to Problem Hub
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Problem Intelligence" subtitle="Hierarchical root causes, stakeholder dynamics, verified citations & trade-off analysis">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
            <Link to="/problems" className="hover:text-blue-600 flex items-center gap-1 flex-shrink-0">
              <Globe size={13} /> Problem Hub
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[120px] xs:max-w-xs">{problem.title}</span>
            <span>/</span>
            <span className="text-blue-600 font-bold flex-shrink-0">Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link
              to={`/problems/${problem.id}/decision-brief`}
              className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm transition"
            >
              <FileText size={14} className="text-blue-400" />
              AI Decision Brief
            </Link>
            <button
              onClick={handleRunAiAnalysis}
              disabled={analyzing}
              className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles size={14} className={analyzing ? 'animate-spin' : ''} />
              {analyzing ? 'Synthesizing...' : 'Re-Run Intelligence'}
            </button>
            <Link
              to={`/projects?create=true&problemId=${problem.id}`}
              className="w-full sm:w-auto justify-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <GitFork size={14} />
              Project Workspace
            </Link>
          </div>
        </div>

        {/* Problem Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-blue-100 text-blue-800">
                  {problem.domain}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-red-100 text-red-800">
                  {problem.priority} URGENCY
                </span>
                <span className="text-xs font-mono text-slate-400">
                  [SOURCE: {problem.sourceQuality || 'HIGH'} QUALITY]
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {problem.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {problem.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{problem.organization || 'Government Body'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Geography:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{problem.location}</span>
                </div>
                <div>
                  <span className="text-slate-400">Beneficiaries:</span> <span className="font-medium text-slate-700 dark:text-slate-300">{problem.targetPopulation}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs w-full md:w-auto min-w-0 md:min-w-[220px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Intelligence Summary</span>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Root Causes:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{rootCauses.length} Identified</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Stakeholder Groups:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{stakeholders.length} Mapped</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Verified Evidence:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{evidenceList.length} Citations</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Innovation Gaps:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{gaps.length} Hypotheses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-thin pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers size={14} /> Problem Overview & Scope
          </button>
          <button
            onClick={() => setActiveTab('rootcauses')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rootcauses'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Target size={14} /> Root Cause Map ({rootCauses.length})
          </button>
          <button
            onClick={() => setActiveTab('stakeholders')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stakeholders'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users size={14} /> Stakeholder Matrix ({stakeholders.length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={14} /> Evidence & Data ({evidenceList.length})
          </button>
          <button
            onClick={() => setActiveTab('solutions')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'solutions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Compass size={14} /> Existing Solutions & Gaps ({solutions.length})
          </button>
          <button
            onClick={() => setActiveTab('tradeoffs')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tradeoffs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Scale size={14} /> Tech Decision Matrix
          </button>
        </div>

        {/* TAB CONTENT: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Executive Breakdown */}
            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Brain size={16} className="text-blue-600" />
                    Core Problem Breakdown & Target Population
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {analysis.problemSummary}
                  </p>
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Target Beneficiary Demographic Breakdown:</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 italic bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      "{analysis.targetPopulationBreakdown}"
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale size={16} className="text-emerald-600" />
                    Infrastructure Constraints & Operational Risks
                  </h3>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Key Constraints:</span>
                    <div className="space-y-1">
                      {analysis.infrastructureConstraints?.map((c: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 size={13} className="text-blue-500 flex-shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Critical Risks to Mitigate:</span>
                    <div className="space-y-1.5">
                      {analysis.potentialRisks?.map((riskItem: { risk: string; severity: string; mitigation: string }, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{riskItem.risk}</span>: {riskItem.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Promising Interventions */}
            {analysis?.potentialInterventions && analysis.potentialInterventions.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    Recommended Intervention Pathways (AI-Synthesized)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">[AI-GENERATED HYPOTHESIS]</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysis.potentialInterventions.map((inv: { title: string; description: string; complexity: string; timeframe: string }, idx: number) => (
                    <div key={idx} className="p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{inv.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {inv.description}
                      </p>
                      <div className="pt-2 text-[10px] space-y-1 text-slate-500">
                        <div><strong className="text-slate-700 dark:text-slate-300">Complexity:</strong> {inv.complexity}</div>
                        <div><strong className="text-slate-700 dark:text-slate-300">Timeframe:</strong> {inv.timeframe}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Root Causes */}
        {activeTab === 'rootcauses' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target size={18} className="text-red-500" />
                    Hierarchical Root Cause Tree
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Differentiating underlying causes from superficial symptoms and environmental constraints.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">[GOVT INCIDENT LOGS & FIELD DATA]</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {rootCauses.map((node) => (
                  <div
                    key={node.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {node.text}
                      </span>
                      {getNodeTypeBadge(node.type)}
                    </div>
                    {node.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {node.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: Stakeholders */}
        {activeTab === 'stakeholders' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  Multi-Stakeholder Dynamics & Incentive Map
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mapping incentives, pain points, and institutional adoption barriers across the delivery chain.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">[STAKEHOLDER GOVERNANCE MATRIX]</span>
            </div>

            <div className="overflow-x-auto pt-2 scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    <th className="p-3 rounded-l-lg">Stakeholder Role</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Core Need</th>
                    <th className="p-3">Pain Point</th>
                    <th className="p-3 rounded-r-lg">Expected Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stakeholders.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{s.role}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">{s.need}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">{s.painPoint}</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-400 font-medium max-w-xs">{s.expectedBenefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT: Evidence & Sources */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                Verified Empirical Evidence & Open Data Connectors
              </h3>
              <span className="text-xs text-slate-400 font-mono">[QUALITY-SCORED EMPIRICAL DATA]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidenceList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        [VERIFIED SOURCE]
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-1.5">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                      Quality: {item.sourceQuality?.rating || 'High'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.evidenceSummary}
                  </p>

                  {/* Score breakdown */}
                  {item.sourceQuality && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-[10px]">
                      <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                        <span className="text-slate-400 block">Authority</span>
                        <strong className="text-slate-800 dark:text-slate-200">{item.sourceQuality.authority}</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                        <span className="text-slate-400 block">Recency</span>
                        <strong className="text-slate-800 dark:text-slate-200">{item.sourceQuality.recency}</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                        <span className="text-slate-400 block">Relevance</span>
                        <strong className="text-slate-800 dark:text-slate-200">{item.sourceQuality.relevance}</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                        <span className="text-slate-400 block">Completeness</span>
                        <strong className="text-slate-800 dark:text-slate-200">{item.sourceQuality.completeness}</strong>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <span>Source: {item.sourceName} ({item.publicationDate})</span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Source <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: Solutions & Gaps */}
        {activeTab === 'solutions' && (
          <div className="space-y-6">
            {/* Solutions Comparative Matrix */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass size={18} className="text-indigo-600" />
                Existing State-of-the-Art Solutions & Critical Limitations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {solutions.map((sol) => (
                  <div
                    key={sol.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{sol.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 font-mono">
                        {sol.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{sol.description}</p>
                    <div className="p-2.5 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-red-700 dark:text-red-400 block text-[11px]">Unresolved Bottleneck / Why It Fails in Rural Field:</span>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px]">{sol.limitations?.join(', ')}</p>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1">
                      <strong>Tech Stack:</strong> {sol.technology?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Innovation Gaps */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  Innovation Gap Hypotheses (Where Breakthroughs Live)
                </h3>
                <span className="text-xs text-slate-400 font-mono">[AI-GENERATED HYPOTHESIS]</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gaps.map((gap) => (
                  <div
                    key={gap.id}
                    className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{gap.category}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                        Impact: {gap.potentialImpactScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{gap.opportunityHypothesis}</p>
                    <div className="pt-2 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                      <div><strong>Unmet Need:</strong> {gap.unmetNeed}</div>
                      <div><strong>Identified Limitation:</strong> {gap.identifiedLimitation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: Tech Tradeoffs */}
        {activeTab === 'tradeoffs' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale size={18} className="text-blue-600" />
                  Technology Decision Matrix & Engineering Trade-Offs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Balancing unit economics, offline resilience, sensor fouling, and village field maintenance.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">[ENGINEERING TRADE-OFF ANALYSIS]</span>
            </div>

            <div className="overflow-x-auto pt-2 scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    <th className="p-3 rounded-l-lg">Approach</th>
                    <th className="p-3">Cost Rating</th>
                    <th className="p-3">Complexity</th>
                    <th className="p-3">Offline Resilience</th>
                    <th className="p-3">Scalability</th>
                    <th className="p-3 rounded-r-lg">Critical Engineering Trade-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tradeoffs.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{t.technology}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{t.costRating}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800">
                          {t.complexityRating}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{t.offlineCapability}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{t.scalabilityRating}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 italic max-w-sm">{t.tradeOffAnalysis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom CTA to Action */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm sm:text-base">Ready to engineer an intervention for this problem?</h4>
            <p className="text-xs text-blue-200 mt-0.5">
              Initialize an end-to-end Project Workspace pre-seeded with these root causes, datasets, and stakeholder requirements.
            </p>
          </div>
          <Link
            to={`/projects?create=true&problemId=${problem.id}`}
            className="w-full sm:w-auto justify-center px-5 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-lg hover:bg-blue-50 transition shadow whitespace-nowrap flex items-center gap-1.5"
          >
            <GitFork size={14} className="text-blue-600" />
            Create Project from Problem
          </Link>
        </div>
      </div>
    </Layout>
  );
}
