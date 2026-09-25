import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { aiApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SkillGapItem } from '../../types';
import { useInnovation } from '../../contexts/InnovationContext';
import { TrendingUp, BookOpen, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const GAP_CONFIG: Record<string, { color: string; bar: string; badge: string }> = {
  high: { color: 'text-red-600', bar: '#ef4444', badge: 'bg-red-100 text-red-700' },
  medium: { color: 'text-yellow-600', bar: '#f59e0b', badge: 'bg-yellow-100 text-yellow-700' },
  low: { color: 'text-green-600', bar: '#10b981', badge: 'bg-green-100 text-green-700' },
};

const LEVEL_MAP: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
const LEVEL_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced'];

export default function SkillGap() {
  const { user } = useAuth();
  const { activeProblem } = useInnovation();
  const [skills, setSkills] = useState<SkillGapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [domain, setDomain] = useState(activeProblem?.domain || user?.domain || 'IoT');
  const [currentSkills, setCurrentSkills] = useState(user?.skills?.join(', ') || 'Python, React, SQL');

  useEffect(() => {
    if (activeProblem?.domain) {
      setDomain(activeProblem.domain);
    }
  }, [activeProblem]);

  const analyze = async () => {
    setLoading(true);
    try {
      const skillList = currentSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
      const res = await aiApi.skillGap(skillList, domain);
      setSkills(res.data);
      setAnalyzed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyze();
  }, []);

  const chartData = skills.map(s => ({
    name: s.skill,
    current: LEVEL_MAP[s.current] || 1,
    required: LEVEL_MAP[s.required] || 2,
    gap: s.gap,
  }));

  const highGap = skills.filter(s => s.gap === 'high').length;
  const medGap = skills.filter(s => s.gap === 'medium').length;
  const lowGap = skills.filter(s => s.gap === 'low').length;

  return (
    <Layout title="Skill Gap Analyzer" subtitle="Identify and bridge the gap between your current and required skills">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        {activeProblem && (
          <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-blue-900">
              <Sparkles size={14} className="text-blue-600 flex-shrink-0" />
              <span>Target Problem: <strong className="font-semibold">{activeProblem.title}</strong></span>
              <span className="text-blue-500 font-mono">[{activeProblem.domain}]</span>
            </div>
            {activeProblem.requiredSkills && activeProblem.requiredSkills.length > 0 && (
              <span className="text-[11px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                {activeProblem.requiredSkills.length} required competencies identified
              </span>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Current Skills</label>
            <input value={currentSkills} onChange={e => setCurrentSkills(e.target.value)}
              placeholder="Python, React, SQL, Machine Learning..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Domain</label>
            <select value={domain} onChange={e => setDomain(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
              {['AI/ML', 'IoT', 'Healthcare', 'Agriculture', 'FinTech', 'Smart Cities', 'Education', 'Environment', 'Cybersecurity'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <button onClick={analyze} disabled={loading}
          className="flex items-center gap-2 px-6 py-3 gradient-bg text-white font-semibold rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-60">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><TrendingUp size={16} /> Analyze Skill Gap</>}
        </button>
      </div>

      {analyzed && skills.length > 0 && (
        <div className="space-y-5 animate-in">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Critical Gaps', value: highGap, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
              { label: 'Medium Gaps', value: medGap, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
              { label: 'Covered Skills', value: lowGap, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.bg}`}>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Current vs Required Level</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[0, 3]} tickFormatter={v => LEVEL_LABELS[v] || ''} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip formatter={(v: any) => LEVEL_LABELS[v] || v} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="current" name="Current Level" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="required" name="Required Level" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map(skill => {
              const cfg = GAP_CONFIG[skill.gap];
              return (
                <div key={skill.skill} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">{skill.skill}</h4>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.badge}`}>
                      {skill.gap === 'high' ? '🔴 High Gap' : skill.gap === 'medium' ? '🟡 Medium Gap' : '🟢 Covered'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-center">
                      <p className="text-xs text-gray-500 mb-0.5">Current</p>
                      <p className="text-sm font-bold text-blue-700 capitalize">{skill.current}</p>
                    </div>
                    <div className="p-2.5 bg-violet-50 rounded-xl text-center">
                      <p className="text-xs text-gray-500 mb-0.5">Required</p>
                      <p className="text-sm font-bold text-violet-700 capitalize">{skill.required}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2.5">{skill.reason}</p>
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                    <BookOpen size={12} className="text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{skill.learningResource}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}
