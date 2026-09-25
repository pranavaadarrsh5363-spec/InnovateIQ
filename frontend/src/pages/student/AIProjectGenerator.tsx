import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { ideasApi } from '../../services/api';
import { ProjectBlueprint } from '../../types';
import {
  Sparkles, Loader2, Save, Download, Share2, FolderPlus,
  CheckCircle2, AlertTriangle, ArrowRight, Layers, Cpu,
  HardDrive, Code, BookOpen, Users, Compass, ShieldAlert,
  ChevronDown, ChevronUp, Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SAMPLE_IDEAS = [
  {
    title: 'AI Crop Disease Detection & Localized Advisory',
    problemStatement: 'Farmers lose 35% of foliar harvests because agricultural officers cannot inspect remote fields in time to identify bacterial leaf blights.',
    domain: 'Agriculture',
  },
  {
    title: 'Autonomous Riverbank Micro-Pollution Telemetry',
    problemStatement: 'Industrial effluents secretly dumped into rural tributaries at night remain undetected until livestock or villagers fall severely ill.',
    domain: 'Environment',
  },
  {
    title: 'Decentralized Cold-Chain Vaccine Verification',
    problemStatement: 'Temperature-sensitive rabies and anti-venom vaccines spoil during rural transport without doctors knowing the cold chain was broken.',
    domain: 'Healthcare',
  },
];

export default function AIProjectGenerator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    problemStatement: '',
    domain: 'Environment',
  });
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [convertedProject, setConvertedProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'roadmap' | 'impact'>('overview');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.problemStatement.trim()) return;
    setLoading(true);
    try {
      const res = await ideasApi.generateBlueprint(form);
      setBlueprint(res.data);
      setConvertedProject(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToProject = async () => {
    if (!blueprint) return;
    setConverting(true);
    try {
      const res = await ideasApi.convertBlueprint(blueprint.id);
      setConvertedProject(res.data.project);
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  };

  const handleExport = () => {
    if (!blueprint) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blueprint, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `${blueprint.title.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Layout
      title="AI Project Generator"
      subtitle="Transform simple innovation prompts into comprehensive 17-point project blueprints"
    >
      {/* Input Formulation Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Idea-to-Blueprint AI Engine</h2>
              <p className="text-xs text-gray-500">Provide an innovation topic, and AI will structure the entire technical plan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Try an example:</span>
            {SAMPLE_IDEAS.map(s => (
              <button
                key={s.title}
                type="button"
                onClick={() => setForm(s)}
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-all"
              >
                {s.domain}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Project Title / Proposed Innovation Name
              </label>
              <input
                type="text"
                placeholder="e.g. AI-Based Early Water Contamination Warning System"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Domain / Sector
              </label>
              <select
                value={form.domain}
                onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              >
                {['Environment', 'Agriculture', 'Healthcare', 'Smart Cities', 'FinTech', 'Energy', 'Robotics', 'EdTech', 'Cybersecurity'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Problem Statement / Core Challenge to Solve <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe the challenge: What pain point exists? Who suffers? Why are existing methods failing?"
              value={form.problemStatement}
              onChange={e => setForm(f => ({ ...f, problemStatement: e.target.value }))}
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !form.problemStatement.trim()}
              className="flex items-center gap-2 px-6 py-2.5 gradient-bg text-white text-xs font-bold rounded-xl shadow hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? 'Synthesizing Architecture...' : 'Generate Project Blueprint'}
            </button>
          </div>
        </form>
      </div>

      {/* Blueprint Presentation Interface */}
      {blueprint && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-in space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                  {blueprint.domain}
                </span>
                <span className="text-xs text-gray-400">Blueprint ID: {blueprint.id}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{blueprint.title}</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">{blueprint.problemStatement}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-all"
              >
                <Download size={13} /> Export JSON
              </button>

              <button
                onClick={() => setIsEditing(e => !e)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-all"
              >
                <Edit3 size={13} /> {isEditing ? 'Done Editing' : 'Edit Blueprint'}
              </button>

              {convertedProject ? (
                <button
                  onClick={() => navigate(`/projects/${convertedProject.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-700 transition-all"
                >
                  <CheckCircle2 size={13} /> Open Project Workspace <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  onClick={handleConvertToProject}
                  disabled={converting}
                  className="flex items-center gap-1.5 px-4 py-2 gradient-bg text-white text-xs font-bold rounded-xl shadow hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {converting ? <Loader2 size={13} className="animate-spin" /> : <FolderPlus size={13} />}
                  Convert Blueprint to Project
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 space-x-6 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Proposed Solution & Objectives' },
              { id: 'tech', label: 'Tech Stack & Requirements' },
              { id: 'roadmap', label: 'Development Roadmap' },
              { id: 'impact', label: 'Impact, Challenges & Risks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 transition-colors relative ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 gradient-bg rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/60">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600" /> Proposed System Solution
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed">{blueprint.proposedSolution}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Core Project Objectives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {blueprint.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-xs text-gray-700">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Users size={13} className="text-blue-600" /> Target Users
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{blueprint.targetUsers}</p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Compass size={13} className="text-violet-600" /> Implementation Approach
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{blueprint.implementationApproach}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Suggested Team Roles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {blueprint.suggestedTeamRoles.map((role, i) => (
                    <div key={i} className="p-3 bg-violet-50/60 border border-violet-100 rounded-xl text-center">
                      <div className="text-xs font-bold text-violet-900">{role}</div>
                      <span className="text-[10px] text-violet-600">Core Contributor</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Tech & Requirements */}
          {activeTab === 'tech' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Cpu size={14} className="text-blue-600" /> Recommended Technology Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blueprint.requiredTechnologies.map(tech => (
                    <span key={tech} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <HardDrive size={13} className="text-amber-500" /> Required Hardware
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {blueprint.requiredHardware.map(h => (
                      <li key={h} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <Code size={13} className="text-emerald-500" /> Required Software & Frameworks
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {blueprint.requiredSoftware.map(s => (
                      <li key={s} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                    <BookOpen size={13} className="text-blue-500" /> Datasets & Standards
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {blueprint.requiredDatasets.map(d => (
                      <li key={d} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Required Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {blueprint.requiredSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-medium">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Development Roadmap & Milestones</h3>
              <div className="relative border-l-2 border-blue-100 ml-4 space-y-6 py-2">
                {blueprint.developmentRoadmap.map((stage, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-2 top-0.5 w-4 h-4 rounded-full gradient-bg border-2 border-white shadow" />
                    <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-blue-600 uppercase">{stage.phase} • {stage.duration}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{stage.title}</h4>
                      <p className="text-xs text-gray-600 mb-3">{stage.description}</p>
                      <div>
                        <span className="text-[11px] font-semibold text-gray-700 block mb-1">Key Deliverables:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {stage.deliverables.map((d, di) => (
                            <span key={di} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] text-gray-600">
                              📌 {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Impact, Challenges & Risks */}
          {activeTab === 'impact' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Expected Societal & Technical Impact
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">{blueprint.expectedImpact}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" /> Technical Challenges
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600">
                    {blueprint.challenges.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-red-900 mb-2 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-red-500" /> Potential Risks & Mitigations
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600">
                    {blueprint.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">Future Enhancements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {blueprint.futureEnhancements.map((fe, i) => (
                    <div key={i} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700">
                      🚀 {fe}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Action bar at bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-400">Ready for the next innovation phase?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/similarity-checker')}
                className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
              >
                Check Similar Solutions Next <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
