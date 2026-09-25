import { Link, useNavigate } from 'react-router-dom';
import {
  Brain, Globe, ArrowRight, CheckCircle, Database, Shield,
  Cpu, Rocket, BarChart3, ChevronRight, Sparkles, Building2,
  FileSearch, Search, Layers, Scale, Award
} from 'lucide-react';

const pipelineStages = [
  { step: '01', title: 'Problem Discovery', desc: 'Sourced from ministries, state departments, and field challenges across 18 domains.' },
  { step: '02', title: 'Root Cause Hierarchy', desc: 'Deconstruct symptoms from true systemic root causes with citation backing.' },
  { step: '03', title: 'Evidence Discovery', desc: 'Cross-reference verified open data, Kaggle telemetry, PubMed, and arXiv literature.' },
  { step: '04', title: 'Existing Solutions & Gaps', desc: 'Audit state-of-the-art limitations and identify high-impact innovation white spaces.' },
  { step: '05', title: 'Engineering Trade-Offs', desc: 'Evaluate unit cost, offline resilience, and operational field complexity.' },
  { step: '06', title: 'Pilot Field Deployment', desc: 'Deploy prototypes in real-world testbeds with frontline community feedback.' },
  { step: '07', title: 'Measurable Impact', desc: 'Track baseline vs target KPIs, audit data, and run continuous feedback loops.' },
];

const enterprisePillars = [
  {
    icon: Globe,
    title: 'National Problem Hub',
    desc: 'Pre-seeded ground-truth challenges from Ministry of Jal Shakti, MoHFW, NITI Aayog, and state innovation agencies across 18 strategic domains.',
    link: '/problems'
  },
  {
    icon: Brain,
    title: 'Problem Intelligence Engine',
    desc: 'Hierarchical root cause trees, multi-stakeholder incentive maps, and qualitative feasibility scorecards.',
    link: '/problems/prob-water-01/analyze'
  },
  {
    icon: FileSearch,
    title: 'Evidence & Source Scoring',
    desc: 'Transparent 4-dimensional citation scoring: Authority, Recency, Relevance, and Completeness with data.gov.in integration.',
    link: '/evidence'
  },
  {
    icon: Scale,
    title: 'Technology Decision Matrix',
    desc: 'Cost-versus-complexity engineering trade-off evaluations designed for emerging-market and low-resource environments.',
    link: '/tech-recommendations'
  },
  {
    icon: Rocket,
    title: 'Field Pilot Operations',
    desc: 'Track physical cohorts, hardware sensor failures, power outages, and frontline community adoption in rural districts.',
    link: '/pilots'
  },
  {
    icon: BarChart3,
    title: 'Measurable Impact & Iteration',
    desc: 'Audited KPI dashboards tracking baseline vs field performance with continuous feedback loop commits.',
    link: '/impact'
  },
];

const domains = [
  'Water & Sanitation', 'Healthcare', 'Agriculture', 'Education', 'Environment',
  'Waste Management', 'Transportation', 'Smart Cities', 'Rural Development', 'Public Services',
  'Cybersecurity', 'Financial Inclusion', 'Energy', 'Climate', 'Accessibility',
  'Governance', 'Industry', 'Manufacturing'
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              IQ
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">InnovateIQ</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-blue-950 text-blue-300 border border-blue-800">
                Enterprise AI
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link to="/problems" className="hover:text-white transition">Problem Hub</Link>
            <Link to="/evidence" className="hover:text-white transition">Evidence Engine</Link>
            <Link to="/pilots" className="hover:text-white transition">Pilots</Link>
            <Link to="/impact" className="hover:text-white transition">Impact</Link>
            <Link to="/organization/dashboard" className="hover:text-white transition">Agencies</Link>
            <Link to="/audit" className="hover:text-white transition">Audit</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5">
              Sign In
            </Link>
            <Link
              to="/problems"
              className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition"
            >
              Explore Problems
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">From Problems to Evidence. From Ideas to Impact.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            The Enterprise AI Innovation Intelligence Platform
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Move past superficial hackathon pitches. InnovateIQ bridges national ministries, universities, and student researchers through rigorous root-cause analysis, verified empirical evidence, engineering trade-offs, and field-tested pilots.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/problems"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Globe size={16} />
              Explore National Problem Hub
            </Link>
            <Link
              to="/problems/prob-water-01/analyze"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-lg transition flex items-center gap-2"
            >
              <Brain size={16} className="text-blue-400" />
              Launch Flagship Case Study
            </Link>
          </div>

          {/* Transparent Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500">
            <span className="px-2.5 py-1 bg-slate-900 rounded border border-slate-800">[VERIFIED CITATIONS]</span>
            <span className="px-2.5 py-1 bg-slate-900 rounded border border-slate-800">[GOVT OPEN DATA CONNECTORS]</span>
            <span className="px-2.5 py-1 bg-slate-900 rounded border border-slate-800">[FIELD PILOT TRACKING]</span>
            <span className="px-2.5 py-1 bg-slate-900 rounded border border-slate-800">[IMMUTABLE AUDIT TRAIL]</span>
          </div>
        </div>
      </section>

      {/* Flagship Case Study Spotlight */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                  FLAGSHIP ENTERPRISE SCENARIO
                </span>
                <span className="text-xs font-mono text-blue-300">Ministry of Jal Shakti / Jal Jeevan Mission</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Early Detection of Water Contamination & Disease Risks in Rural Communities
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Waterborne diarrheal outbreaks cause 200,000+ pediatric deaths annually across rural districts due to 7-14 day delays in manual laboratory bacteriological testing. InnovateIQ delivers a 12-stage intelligence breakdown: root cause hierarchies, 4 verified empirical datasets, sensor limitation audits, and an active field pilot in Alwar, Rajasthan.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
                <div>• Baseline: <strong>9-12 day lab lag</strong></div>
                <div>• Target: <strong>&lt;4 hour edge detection</strong></div>
                <div>• Active Cohort: <strong>12 Villages / 45,000 Residents</strong></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <Link
                to="/problems/prob-water-01/analyze"
                className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs text-center flex items-center justify-center gap-2 transition"
              >
                <Brain size={14} />
                Explore Problem Intelligence
              </Link>
              <Link
                to="/pilots"
                className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs text-center flex items-center justify-center gap-2 transition"
              >
                <Rocket size={14} />
                Inspect Alwar Pilot Telemetry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The 7-Stage Problem-to-Impact Pipeline */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
            Structured Innovation Methodology
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            From Ground Truth to Measurable Impact
          </h2>
          <p className="text-sm text-slate-400">
            A linear, verifiable engineering workflow replacing vague ideation with verifiable evidence and on-ground deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineStages.map((stage, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2 relative"
            >
              <span className="text-xs font-mono font-bold text-blue-400">{stage.step}</span>
              <h3 className="text-sm font-bold text-white">{stage.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise Platform Pillars */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Built for National Stakeholders
          </h2>
          <p className="text-sm text-slate-400">
            Purpose-built intelligence tooling serving universities, government agencies, research institutions, and industry CSR initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enterprisePillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Link
                key={idx}
                to={p.link}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl space-y-3 transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs text-blue-400 font-medium gap-1">
                  <span>Explore Module</span>
                  <ChevronRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 18 Strategic Domains */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
            Cross-Sector Coverage
          </span>
          <h2 className="text-2xl font-bold text-white">
            18 National & Strategic Innovation Domains
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {domains.map((d) => (
            <Link
              key={d}
              to={`/problems?domain=${encodeURIComponent(d)}`}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition"
            >
              {d}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 px-6 text-xs text-slate-500 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">IQ</div>
          <span>InnovateIQ Platform</span>
        </div>
        <p>Enterprise Innovation Intelligence for Universities, Government Agencies & Research Centers.</p>
        <p className="text-slate-600 font-mono">From Problems to Evidence. From Ideas to Impact.</p>
      </footer>
    </div>
  );
}
