import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { Zap, ArrowRight } from 'lucide-react';

const domains = ['AI/ML', 'Healthcare', 'Agriculture', 'Education', 'IoT', 'FinTech', 'Smart Cities', 'Cybersecurity', 'Environment', 'Robotics', 'Blockchain', 'Data Science'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', university: '', domain: 'AI/ML', year: '2' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authApi.register({ ...form, role: 'student', year: parseInt(form.year) });
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold gradient-text">InnovateIQ</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Create account</h2>
          <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6">Start your innovation journey</p>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input name="name" required value={form.name} onChange={handleChange} placeholder="Aarav Kumar"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••"
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Innovation Domain</label>
              <select name="domain" value={form.domain} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 gradient-bg text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight size={18} /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
