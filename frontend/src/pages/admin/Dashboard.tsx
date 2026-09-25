import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { analyticsApi, usersApi, projectsApi, resourcesApi } from '../../services/api';
import { Users, FolderKanban, Database, BarChart3, Activity, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#7c3aed', '#f59e0b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.dashboard().then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Admin Dashboard"><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></Layout>;

  return (
    <Layout title="Admin Dashboard" subtitle="Platform overview and management">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-blue-500 to-blue-600' },
          { label: 'Students', value: stats?.totalStudents ?? 0, icon: Users, color: 'from-violet-500 to-violet-600' },
          { label: 'Mentors', value: stats?.totalMentors ?? 0, icon: Shield, color: 'from-emerald-500 to-green-600' },
          { label: 'Projects', value: stats?.totalProjects ?? 0, icon: FolderKanban, color: 'from-amber-500 to-orange-500' },
          { label: 'Resources', value: stats?.totalResources ?? 0, icon: Database, color: 'from-cyan-500 to-blue-500' },
          { label: 'Active', value: stats?.activeProjects ?? 0, icon: Activity, color: 'from-pink-500 to-rose-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2 shadow`}>
              <Icon size={16} className="text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Platform activity chart */}
      {stats?.platformActivity && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-semibold text-gray-900 mb-4">Platform Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.platformActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="users" name="Users" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="projects" name="Projects" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="insights" name="Insights" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top domains */}
      {stats?.topDomains && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Innovation Domains</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topDomains.map((d: string, i: number) => (
              <span key={d} className="px-4 py-2 rounded-full text-sm font-semibold border" style={{ background: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length], borderColor: COLORS[i % COLORS.length] + '40' }}>
                #{i + 1} {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
