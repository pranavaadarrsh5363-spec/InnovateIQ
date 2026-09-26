import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText, Brain, ShieldCheck, CheckCircle2, AlertTriangle,
  ArrowRight, Printer, Share2, Layers, Cpu, Scale,
  FolderKanban, Sparkles, Building2, MapPin, Users, Globe,
  Clock, Award, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import { problemsApi } from '../../services/api';
import { DecisionBrief as DecisionBriefType } from '../../types';
import Layout from '../../components/layout/Layout';
import { useInnovationContext } from '../../contexts/InnovationContext';

export default function DecisionBrief() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeProblemId, selectProblem } = useInnovationContext();
  const targetId = id || activeProblemId || 'prob-water-01';

  const [brief, setBrief] = useState<DecisionBriefType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBrief();
  }, [targetId]);

  const fetchBrief = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await problemsApi.getDecisionBrief(targetId);
      const data = res.data.data || res.data;
      setBrief(data);
      if (data.problem) {
        selectProblem(data.problem.id);
      }
    } catch (err: any) {
      console.error('Failed to load Decision Brief:', err);
      setError('Unable to load Decision Brief for the requested problem statement.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout
      title="AI Decision Brief"
      subtitle="Executive synthesis: problem, evidence, existing solutions, tech trade-offs, feasibility, and actionable roadmap"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-16 print:p-0 print:space-y-4">
        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                  <FileText size={12} className="text-blue-400" />
                  EXECUTIVE BRIEF
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  🟢 VERIFIED EVIDENCE
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  DOC-ID: {brief?.id || 'BRIEF-INIT'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {brief?.problem.title || 'Loading Problem Decision Brief...'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1"><Building2 size={13} className="text-blue-400" /> {brief?.problem.organization}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={13} className="text-red-400" /> {brief?.problem.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={13} className="text-slate-400" /> Generated: {brief?.generatedAt ? new Date(brief.generatedAt).toLocaleDateString() : 'Active'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 print:hidden w-full sm:w-auto">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer size={14} />
                Print / PDF
              </button>
              <Link
                to={`/projects/new?problemId=${targetId}`}
                className="flex-1 sm:flex-initial justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <FolderKanban size={14} />
                Create Project
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          {brief && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Target Beneficiaries</span>
                <span className="font-semibold text-white mt-0.5 block truncate">{brief.problem.targetPopulation}</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Overall Feasibility</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">{brief.feasibility.overallScore}/100</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Verified Sources</span>
                <span className="font-bold text-blue-400 mt-0.5 block">{brief.evidenceSummary.verifiedSourcesCount} Sources</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Target Timeframe</span>
                <span className="font-semibold text-amber-300 mt-0.5 block">{brief.recommendedIntervention.timeframe}</span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <RefreshCw size={28} className="animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Synthesizing Contextual AI Decision Brief...</p>
            <p className="text-xs text-slate-400 mt-1">Cross-referencing root causes, evidence quality scores, and technology trade-offs.</p>
          </div>
        ) : error || !brief ? (
          <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-700 text-sm">
            {error || 'Failed to load Decision Brief.'}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section 1: Problem Understanding */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Problem Context: What is Happening?</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Ground Truth Context
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Current Situation & Operational Pain:</span>
                  <p className="text-slate-600 leading-relaxed">{brief.problem.currentSituation}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="font-bold text-blue-900 block mb-1">Expected Outcome & Target Impact:</span>
                  <p className="text-slate-700 leading-relaxed">{brief.problem.expectedOutcome}</p>
                </div>
              </div>

              {brief.problem.constraints && brief.problem.constraints.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 mb-2 block">Key Ground Constraints:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {brief.problem.constraints.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                        <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Root Causes Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">2</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Root Cause Analysis: Why is it Happening?</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  [SYSTEMIC RCA CLASSIFICATION]
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-red-50/80 rounded-xl border border-red-200 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600 text-white flex-shrink-0">
                    CORE ROOT CAUSE
                  </span>
                  <p className="font-semibold text-red-900 leading-relaxed">{brief.rootCausesSummary.coreRootCause}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block mb-1.5">Contributing Factors</span>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {brief.rootCausesSummary.contributingFactors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block mb-1.5">Observable Symptoms</span>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {brief.rootCausesSummary.symptoms.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Supporting Evidence */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">3</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Empirical Evidence Base: What Supports the Analysis?</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  🟢 {brief.evidenceSummary.verifiedSourcesCount} Verified Sources
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brief.evidenceSummary.topCitations.map((cite, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {cite.sourceType}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Quality: {cite.qualityRating}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">{cite.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 italic leading-relaxed">"{cite.keyInsight}"</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>{cite.sourceName} • {cite.publicationDate}</span>
                      <a href={cite.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                        Source Link <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Existing Solutions & Innovation Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">4</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">What Already Exists?</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">[PRIOR ART REVIEW]</span>
                </div>
                <div className="space-y-3">
                  {brief.existingSolutionsSummary.map((sol, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{sol.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">{sol.category}</span>
                      </div>
                      <div className="mt-2 space-y-1 text-[11px]">
                        <p className="text-emerald-700"><span className="font-semibold">Strength:</span> {sol.advantages[0] || 'Standard benchmark'}</p>
                        <p className="text-red-700"><span className="font-semibold">Limitation:</span> {sol.limitations[0] || 'Cost / accessibility hurdle'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">5</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Innovation White Spaces</h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    🟡 [AI-GENERATED HYPOTHESIS]
                  </span>
                </div>
                <div className="space-y-3">
                  {brief.innovationGaps.map((gap, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">{gap.category}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded">
                          Impact: {gap.impactScore}/100
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs mt-1.5 leading-snug">{gap.opportunityHypothesis}</p>
                      <div className="text-[10px] text-slate-500 mt-1"><strong>Unmet Need:</strong> {gap.unmetNeed}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5: Recommended Intervention & Technology Options */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">6</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recommended Intervention & Architecture</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  🟡 [PROPOSED TECHNICAL INTERVENTION]
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="font-extrabold text-blue-950 text-sm">{brief.recommendedIntervention.title}</h4>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-semibold">Complexity: {brief.recommendedIntervention.complexity}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 font-semibold">Timeframe: {brief.recommendedIntervention.timeframe}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{brief.recommendedIntervention.description}</p>
                <div className="mt-3 pt-2 border-t border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <span className="text-slate-600">Expected Field Benchmark: <strong>{brief.recommendedIntervention.expectedKPI}</strong></span>
                  <span className="text-slate-600">Target Population: <strong>{brief.recommendedIntervention.targetBeneficiaries}</strong></span>
                </div>
              </div>

              {/* Technology Decision Matrix Table */}
              <div className="overflow-x-auto pt-1 scrollbar-thin">
                <span className="text-xs font-bold text-slate-700 mb-2 block">Evaluated Technology Architecture Options:</span>
                <table className="w-full text-left text-xs border-collapse min-w-[580px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px]">
                      <th className="p-2.5 rounded-l">Component</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Cost</th>
                      <th className="p-2.5">Offline Capability</th>
                      <th className="p-2.5 rounded-r">Trade-Off Analysis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {brief.technologyOptions.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-bold text-slate-800">{t.technology}</td>
                        <td className="p-2.5 text-slate-600">{t.category}</td>
                        <td className="p-2.5 font-semibold text-slate-700">{t.costRating}</td>
                        <td className="p-2.5 text-slate-700">{t.offlineCapability}</td>
                        <td className="p-2.5 text-slate-600 italic text-[11px] max-w-sm">{t.tradeOffAnalysis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 6: Six-Dimension Feasibility Scorecard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">7</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Multi-Dimensional Feasibility Scorecard</h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  Overall Score: {brief.feasibility.overallScore}/100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { label: 'Technical Feasibility', ...brief.feasibility.technical },
                  { label: 'Financial / BOM Feasibility', ...brief.feasibility.financial },
                  { label: 'Infrastructure Resilience', ...brief.feasibility.infrastructure },
                  { label: 'Operational Adoption', ...brief.feasibility.operational },
                  { label: 'Deployment Scalability', ...brief.feasibility.scalability },
                  { label: 'Empirical Data Availability', ...brief.feasibility.dataAvailability },
                ].map((dim, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{dim.label}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dim.rating === 'High' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {dim.score}/100 ({dim.rating})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{dim.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 7: Risks & Suggested Next Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risks */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">8</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Critical Risks & Mitigations</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">[RISK REGISTER]</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {brief.risksAndMitigations.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{r.risk}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>{r.severity} Severity</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1"><strong className="text-slate-700">Mitigation:</strong> {r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">9</span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Suggested Next Actions</h3>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Action Sequence</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {brief.suggestedNextActions.map((act) => (
                    <div key={act.step} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {act.step}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{act.action}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span>Owner: {act.ownerRole}</span>
                          <span className="font-mono text-blue-600">{act.timeline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Provenance Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">InnovateIQ Evidence & Decision Governance Notice</p>
              <p>
                This Decision Brief was compiled using contextual problem parameters and verified empirical citations from ICMR, NEERI, BIS, and WHO open data. All AI hypotheses are explicitly flagged for human expert validation.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
