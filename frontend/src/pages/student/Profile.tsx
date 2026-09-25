import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../services/api';
import { User, Github, Linkedin, Save, Loader2, CheckCircle } from 'lucide-react';

const DOMAINS = ['AI/ML', 'IoT', 'Healthcare', 'Agriculture', 'Education', 'Environment', 'Smart Cities', 'FinTech', 'Cybersecurity', 'Robotics', 'Blockchain', 'Data Science'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    domain: user?.domain || 'AI/ML',
    university: user?.university || '',
    year: user?.year?.toString() || '2',
    skills: user?.skills?.join(', ') || '',
    linkedIn: '',
    github: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await usersApi.updateProfile({
        name: form.name,
        bio: form.bio,
        domain: form.domain,
        university: form.university,
        year: parseInt(form.year),
        skills: form.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
      });
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { } finally { setSaving(false); }
  };

  return (
    <Layout title="Profile" subtitle="Manage your student profile">
      <div className="max-w-2xl mx-auto">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white mb-5 text-center">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-20 h-20 rounded-full border-4 border-white/30 mx-auto mb-3 shadow-xl"
          />
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-blue-200 text-sm">{user?.email}</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold capitalize">{user?.role}</span>
            {user?.domain && <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">{user?.domain}</span>}
            {user?.university && <span className="px-3 py-1 bg-white/20 rounded-full text-xs">{user?.university}</span>}
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          {saved && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <CheckCircle size={16} /> Profile saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input value={user?.email || ''} disabled
                className="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
              placeholder="Tell us about your innovation interests..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Domain</label>
              <select name="domain" value={form.domain} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">University</label>
              <input name="university" value={form.university} onChange={handleChange} placeholder="IIT Delhi"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
              <select name="year" value={form.year} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                {['1', '2', '3', '4', '5'].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="Python, TensorFlow, React, Node.js..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
          </div>

          {form.skills && (
            <div className="flex flex-wrap gap-2">
              {form.skills.split(',').map((s: string) => s.trim()).filter(Boolean).map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-medium">{skill}</span>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-3 gradient-bg text-white font-semibold rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
