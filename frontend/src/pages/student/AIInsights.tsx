import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { aiApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { AIInsight } from '../../types';
import { Lightbulb, TrendingUp, Shield, AlertCircle, Zap, Star, Target, DollarSign, ArrowUpRight } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  'Technology Trend': { icon: TrendingUp, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  'Innovation Opportunity': { icon: Zap, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  'Skill Gap': { icon: Target, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  'Risk Analysis': { icon: Shield, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  'Implementation Approach': { icon: Lightbulb, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'Cost Consideration': { icon: DollarSign, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'Scalability': { icon: ArrowUpRight, color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  'Common Approach': { icon: Star, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  'Resource Gap': { icon: AlertCircle, color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200' },
  'Emerging Technology': { icon: Zap, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
};

const IMPACT_CONFIG: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

function InsightCard({ insight }: { insight: AIInsight }) {
  const cfg = TYPE_CONFIG[insight.type] || TYPE_CONFIG['Technology Trend'];
  const Icon = cfg.icon;

  return (
    <div className={`bg-white rounded-2xl border ${cfg.border} shadow-sm p-5 card-hover`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.border} border`}>
          <Icon size={14} className={cfg.color} />
          <span className={`text-xs font-semibold ${cfg.color}`}>{insight.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${IMPACT_CONFIG[insight.impact]}`}>
            {insight.impact.toUpperCase()} impact
          </span>
        </div>
      </div>

      <h3 className="font-bold text-gray-900 mb-2 leading-snug">{insight.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{insight.content}</p>

      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-3">
        <p className="text-xs font-semibold text-gray-500 mb-1.5">💡 Recommendation</p>
        <p className="text-sm text-gray-700">{insight.recommendation}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Confidence</span>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${insight.confidence >= 85 ? 'bg-emerald-500' : insight.confidence >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
              style={{ width: `${insight.confidence}%` }} />
          </div>
          <span className="text-xs font-semibold text-gray-700">{insight.confidence}%</span>
        </div>
        <span className="text-xs text-gray-400">{new Date(insight.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function AIInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    aiApi.insights().then(res => setInsights(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const types = ['All', ...Array.from(new Set(insights.map(i => i.type)))];
  const filtered = filter === 'All' ? insights : insights.filter(i => i.type === filter);
  const highCount = insights.filter(i => i.impact === 'high').length;
  const avgConfidence = insights.length ? Math.round(insights.reduce((a, i) => a + i.confidence, 0) / insights.length) : 0;

  return (
    <Layout title="AI Insights" subtitle="AI-generated insights from analyzing your innovation domain">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Insights', value: insights.length, color: 'from-blue-500 to-blue-600' },
          { label: 'High Impact', value: highCount, color: 'from-red-500 to-red-600' },
          { label: 'Avg. Confidence', value: `${avgConfidence}%`, color: 'from-emerald-500 to-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold gradient-text mb-1`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {types.map(type => (
          <button key={type} onClick={() => setFilter(type)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filter === type ? 'gradient-bg text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-52 animate-pulse">
              <div className="h-8 bg-gray-100 rounded-full w-40 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(insight => <InsightCard key={insight.id} insight={insight} />)}
        </div>
      )}
    </Layout>
  );
}
