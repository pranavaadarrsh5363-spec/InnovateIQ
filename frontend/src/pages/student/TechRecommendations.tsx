import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { aiApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useInnovation } from '../../contexts/InnovationContext';
import { TechRecommendation } from '../../types';
import { Cpu, Loader2, CheckCircle, Sparkles, Layers, ShieldCheck, ArrowRight, RefreshCw, Link2 } from 'lucide-react';

const DIFF_COLOR: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: 'from-blue-500 to-cyan-500',
  Backend: 'from-emerald-500 to-green-600',
  Database: 'from-amber-500 to-orange-500',
  'AI/ML': 'from-violet-500 to-purple-600',
  Cloud: 'from-sky-500 to-blue-500',
  APIs: 'from-indigo-500 to-violet-500',
  Hardware: 'from-teal-500 to-emerald-600',
  Security: 'from-rose-500 to-red-600',
  Deployment: 'from-slate-600 to-gray-700',
};

export default function TechRecommendations() {
  const { user } = useAuth();
  const { activeProblem } = useInnovation();
  const [form, setForm] = useState({
    description: activeProblem ? `${activeProblem.title}: ${activeProblem.description}` : 'Smart IoT + AI system to detect contaminated drinking water in rural communities with automated alerts.',
    domain: activeProblem?.domain || user?.domain || 'IoT',
  });
  const [techs, setTechs] = useState<TechRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    if (activeProblem) {
      const updated = {
        description: `${activeProblem.title}: ${activeProblem.description}`,
        domain: activeProblem.domain || 'IoT',
      };
      setForm(updated);
      fetchRecommendations(updated);
    }
  }, [activeProblem]);

  const fetchRecommendations = async (overrideForm?: typeof form) => {
    setLoading(true);
    try {
      const res = await aiApi.recommendTechnologies(overrideForm || form);
      setTechs(res.data);
      setAnalyzed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const analyze = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations();
  };

  const categories = ['Frontend', 'Backend', 'Database', 'AI/ML', 'Cloud', 'APIs', 'Hardware', 'Security', 'Deployment'];

  return (
    <Layout title="Technology Recommendation Engine" subtitle="AI-architected full-stack technology stack tailored to your project requirements">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <form onSubmit={analyze} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">Project Description & Scope</label>
              <button
                type="button"
                onClick={() => {
                  const defaultForm = {
                    description: 'Smart IoT + AI system to detect contaminated drinking water in rural communities with automated alerts.',
                    domain: 'IoT',
                  };
                  setForm(defaultForm);
                  fetchRecommendations(defaultForm);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Sparkles size={12} /> Use Demo Project
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe your project: what it does, hardware involved, data scale, target users..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Domain</label>
            <select
              value={form.domain}
              onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white mb-3"
            >
              {['IoT', 'AI/ML', 'Healthcare', 'Agriculture', 'FinTech', 'Smart Cities', 'Education', 'Environment', 'Cybersecurity', 'Robotics'].map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 gradient-bg text-white font-semibold rounded-xl shadow hover:shadow-lg disabled:opacity-60 transition-all text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {loading ? 'Analyzing Architecture...' : 'Re-Analyze Stack'}
            </button>
          </div>
        </form>
      </div>

      {analyzed && techs.length > 0 && (
        <div className="space-y-6 animate-in">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} className="text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">
                AI recommended 9 architectural tiers for high reliability, minimal latency, and low Bill of Materials (BOM).
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">
              {techs.length} Layers Recommended
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map(cat => {
              const tech = techs.find(t => t.category.toLowerCase() === cat.toLowerCase());
              if (!tech) return null;

              return (
                <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[cat] || 'from-blue-500 to-indigo-500'}`} />
                        {cat}
                      </span>
                      {tech.relevance && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {tech.relevance}% Match
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[cat] || 'from-gray-500 to-gray-700'} flex items-center justify-center text-white font-bold text-sm shadow`}>
                        {tech.name.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">{tech.name}</h4>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${DIFF_COLOR[tech.difficulty]}`}>
                          Learning: {tech.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{tech.reason}</p>

                    {/* Advantages */}
                    {tech.advantages && tech.advantages.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[11px] font-semibold text-gray-500 mb-1">Key Advantages:</div>
                        <ul className="space-y-1">
                          {tech.advantages.map((adv, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                              <span className="text-green-500 font-bold mt-0.5">✓</span> {adv}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Alternatives */}
                  {tech.alternatives && tech.alternatives.length > 0 && (
                    <div className="pt-3 border-t border-gray-50">
                      <div className="text-[11px] text-gray-400 font-medium">
                        Alternatives:{' '}
                        <span className="text-gray-600 font-normal">{tech.alternatives.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}
