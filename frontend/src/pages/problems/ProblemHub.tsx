import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe, Search, Filter, AlertTriangle, ArrowRight, Brain,
  Sparkles, CheckCircle2, Building2, Tag, ShieldAlert,
  Layers, PlusCircle, BarChart3, ChevronRight, RefreshCw, FileText
} from 'lucide-react';
import { problemsApi } from '../../services/api';
import { Problem } from '../../types';
import Layout from '../../components/layout/Layout';
import { useInnovationContext } from '../../contexts/InnovationContext';

const DOMAINS = [
  'All Domains',
  'Water & Sanitation',
  'Healthcare',
  'Agriculture',
  'Education',
  'Environment',
  'Waste Management',
  'Transportation',
  'Smart Cities',
  'Rural Development',
  'Public Services',
  'Cybersecurity',
  'Financial Inclusion',
  'Energy',
  'Climate',
  'Accessibility',
  'Governance',
  'Industry',
  'Manufacturing'
];

export default function ProblemHub() {
  const navigate = useNavigate();
  const { selectProblem } = useInnovationContext();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [stats, setStats] = useState({ total: 0, critical: 0, pilotActive: 0, verifiedSources: 0 });

  useEffect(() => {
    fetchProblems();
  }, [selectedDomain, selectedUrgency]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedDomain !== 'All Domains') params.domain = selectedDomain;
      if (selectedUrgency !== 'all') params.priority = selectedUrgency;
      if (searchQuery) params.search = searchQuery;

      const res = await problemsApi.getAll(params);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setProblems(data);

      setStats({
        total: data.length,
        critical: data.length > 0 ? data.filter((p: Problem) => p.priority === 'Critical').length : 3,
        pilotActive: data.length > 0 ? data.filter((p: Problem) => p.status === 'Active Pilots').length : 2,
        verifiedSources: 68
      });
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProblems();
  };

  const getUrgencyBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><ShieldAlert size={12} /> CRITICAL</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">HIGH URGENCY</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">MEDIUM</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">STANDARD</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active Pilots':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Active Pilots</span>;
      case 'Open for Innovation':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Open for Innovation</span>;
      case 'Under Review':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Under Review</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <Layout title="National Problem Hub" subtitle="Explore ground-truth challenges across 18 strategic domains">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Mission Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <Globe size={13} className="text-blue-400" />
              National & Enterprise Problem Hub
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[GOVT OPEN DATA & ENTERPRISE PARTNERS]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Real-World Problems Seeking AI & Deep-Tech Interventions
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Move beyond hypothetical ideation. InnovateIQ bridges national departments, state agencies, and enterprise sponsors with student researchers and innovators. Explore ground truth challenges with transparent evidence, root cause structures, and active field pilot opportunities.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5 sm:gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-white text-sm sm:text-base">{stats.total}</span>
              <span className="text-slate-400">Validated Problems</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-red-400 text-sm sm:text-base">{stats.critical}</span>
              <span className="text-slate-400">Critical Urgency</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-emerald-400 text-sm sm:text-base">{stats.pilotActive}</span>
              <span className="text-slate-400">Active Field Pilots</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-blue-400 text-sm sm:text-base">18</span>
              <span className="text-slate-400">Strategic Domains</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagship Case Study Callout */}
      <div className="bg-gradient-to-r from-blue-900/10 via-slate-900 to-indigo-900/20 border-2 border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-blue-600 text-white tracking-wider">
                Flagship Problem Scenario
              </span>
              <span className="text-xs text-blue-300 font-mono">Ministry of Jal Shakti / Jal Jeevan Mission</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Early Detection of Water Contamination & Disease Risks in Rural Communities
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
              Waterborne diarrheal outbreaks cause 200,000+ pediatric deaths annually in rural districts due to 7-14 day delays in manual laboratory bacteriological testing. Explore the complete root cause hierarchy, 4 verified datasets, existing sensor limitations, and an active pilot in Alwar, Rajasthan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/problems/prob-water-01/analyze"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <Brain size={16} />
              Launch Intelligence Analysis
            </Link>
            <Link
              to="/pilots"
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-medium text-sm flex items-center justify-center gap-1.5 transition"
            >
              View Active Pilot <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems by keywords, organization, symptoms, root cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">Critical Urgency</option>
              <option value="high">High Urgency</option>
              <option value="medium">Medium Urgency</option>
            </select>

            <button
              onClick={fetchProblems}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Domain Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {DOMAINS.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedDomain === domain
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <Globe size={48} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No problems found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search keywords, domain filter, or urgency selector to explore other challenges.
          </p>
          <button
            onClick={() => { setSelectedDomain('All Domains'); setSelectedUrgency('all'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {problem.domain}
                    </span>
                    {getUrgencyBadge(problem.priority)}
                  </div>
                  {getStatusBadge(problem.status)}
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 hover:text-blue-600 transition">
                    <Link to={`/problems/${problem.id}/analyze`}>
                      {problem.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 size={13} className="text-slate-400" />
                    <span>{problem.organization || 'Government / Research Agency'}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {problem.description}
                </p>

                {/* Target Beneficiaries & Scope */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Beneficiaries:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {problem.targetPopulation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Geographic Scope:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {problem.location}
                    </span>
                  </div>
                </div>

                {/* Required Skills */}
                {problem.requiredSkills && problem.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {problem.requiredSkills.slice(0, 3).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{skill}
                      </span>
                    ))}
                    {problem.requiredSkills.length > 3 && (
                      <span className="text-[11px] text-slate-400">+{problem.requiredSkills.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 rounded-b-xl flex flex-wrap items-center justify-between gap-2">
                <Link
                  to={`/problems/${problem.id}/analyze`}
                  onClick={() => selectProblem(problem)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5"
                >
                  <Brain size={14} />
                  Analyze Problem & Roots
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/problems/${problem.id}/decision-brief`}
                    onClick={() => selectProblem(problem)}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex items-center gap-1"
                    title="View Executive AI Decision Brief"
                  >
                    <FileText size={12} className="text-blue-500" />
                    Brief
                  </Link>
                  <Link
                    to={`/evidence?problemId=${problem.id}`}
                    onClick={() => selectProblem(problem)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                    title="View Evidence & Datasets"
                  >
                    <Search size={14} />
                  </Link>
                  <Link
                    to={`/projects?create=true&problemId=${problem.id}`}
                    onClick={() => selectProblem(problem)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md hover:bg-slate-800 transition"
                  >
                    Intervene
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
}
