import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { challengesApi } from '../../services/api';
import { InnovationChallenge } from '../../types';
import {
  CheckCircle2, Search, Filter, Trophy, Calendar, Users,
  ArrowRight, ExternalLink, Sparkles, Building2, Bookmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChallengesHub() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<InnovationChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('All');
  const [orgFilter, setOrgFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    challengesApi.getAll().then(res => setChallenges(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStartProject = async (challengeId: string) => {
    setStartingId(challengeId);
    try {
      const res = await challengesApi.startProject(challengeId);
      navigate(`/projects/${res.data.project.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setStartingId(null);
    }
  };

  const filtered = challenges.filter(c => {
    const matchDomain = domainFilter === 'All' || c.domain.toLowerCase().includes(domainFilter.toLowerCase());
    const matchOrg = orgFilter === 'All' || c.organizationType === orgFilter;
    const matchDiff = diffFilter === 'All' || c.difficulty === diffFilter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.organization.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchOrg && matchDiff && matchSearch;
  });

  return (
    <Layout
      title="Innovation Challenges Hub"
      subtitle="Discover real-world problem statements from Government, Industry, and Research Ministries"
    >
      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search challenges or ministries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="All">All Domains</option>
            {['Environment', 'Agriculture', 'Smart Cities', 'Healthcare', 'FinTech', 'Energy', 'Robotics', 'Education'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={orgFilter}
            onChange={e => setOrgFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="All">All Organizers</option>
            {['Government', 'Industry', 'University', 'NGO', 'Research Organization', 'Hackathon'].map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            {['Beginner', 'Intermediate', 'Advanced'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(challenge => (
          <div
            key={challenge.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2">
                <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                  {challenge.organizationType}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-semibold ${
                  challenge.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700' :
                  challenge.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{challenge.title}</h3>
              <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                <Building2 size={12} /> {challenge.organization}
              </p>

              <p className="text-xs text-gray-600 line-clamp-3 mb-3 leading-relaxed">
                {challenge.description}
              </p>

              {challenge.prizeOrIncentive && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl mb-3 text-xs flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500 flex-shrink-0" />
                  <span className="font-bold text-amber-900 text-[11px] truncate">{challenge.prizeOrIncentive}</span>
                </div>
              )}

              {/* Skills */}
              <div className="mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Required Skillset:
                </span>
                <div className="flex flex-wrap gap-1">
                  {challenge.requiredSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-600">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> Due: {challenge.deadline}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {challenge.participantsCount} Teams
                </span>
              </div>

              <button
                onClick={() => handleStartProject(challenge.id)}
                disabled={startingId === challenge.id}
                className="w-full py-2 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles size={12} /> {startingId === challenge.id ? 'Initializing Project...' : 'Start Project on This Challenge'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
