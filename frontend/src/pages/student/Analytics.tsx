import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { analyticsApi } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLORS = ['#3b82f6', '#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#8b5cf6', '#f97316', '#84cc16', '#ec4899'];

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.dashboard(), analyticsApi.technologies()])
      .then(([s, t]) => { setStats(s.data); setTechnologies(t.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Analytics"><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></Layout>;

  return (
    <Layout title="Analytics" subtitle="Your innovation activity and platform insights">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Projects', value: stats?.totalProjects ?? 0 },
          { label: 'Resources Explored', value: stats?.resourcesDiscovered ?? 0 },
          { label: 'AI Insights', value: stats?.aiInsightsGenerated ?? 0 },
          { label: 'Saved Resources', value: stats?.savedResources ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 sm:p-5 text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5">
        {/* Activity timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 w-full min-w-0">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Innovation Activity Timeline</h3>
          <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats?.activityTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="resources" stroke="#3b82f6" strokeWidth={2.5} name="Resources" dot={{ fill: '#3b82f6', r: 3 }} />
                <Line type="monotone" dataKey="insights" stroke="#8b5cf6" strokeWidth={2.5} name="Insights" dot={{ fill: '#8b5cf6', r: 3 }} />
                <Line type="monotone" dataKey="ideas" stroke="#f59e0b" strokeWidth={2.5} name="Ideas" dot={{ fill: '#f59e0b', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 w-full min-w-0">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Domain Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-full sm:w-3/5 h-[200px] flex items-center justify-center min-w-0">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats?.domainDistribution || []} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                    {(stats?.domainDistribution || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:flex-1 space-y-2">
              {(stats?.domainDistribution || []).map((d: any, i: number) => (
                <div key={d.domain} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                  <span className="text-gray-600 flex-1 truncate">{d.domain}</span>
                  <span className="font-bold text-gray-800">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project progress */}
      {stats?.projectProgress && stats.projectProgress.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5 w-full min-w-0">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Project Progress</h3>
          <div className="space-y-3">
            {stats.projectProgress.map((p: any) => (
              <div key={p.name} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-700 sm:w-48 truncate flex-shrink-0 font-medium">{p.name}</span>
                <div className="flex items-center gap-3 w-full sm:flex-1">
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full gradient-bg rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 w-10 text-right">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending technologies */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 w-full min-w-0">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Most Searched Technologies</h3>
        <div className="w-full min-w-0 overflow-x-auto scrollbar-thin">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={technologies} layout="vertical" margin={{ left: 50, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" name="Usage Count" radius={[0, 6, 6, 0]} maxBarSize={20}>
                {technologies.map((t, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {technologies.map(t => (
            <span key={t.name} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full font-medium text-gray-600">
              {t.name}
              {t.trend === 'up' ? <TrendingUp size={11} className="text-green-500" /> : t.trend === 'down' ? <TrendingDown size={11} className="text-red-500" /> : <Minus size={11} className="text-gray-400" />}
            </span>
          ))}
        </div>
      </div>
    </Layout>
  );
}
