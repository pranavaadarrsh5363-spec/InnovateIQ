import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { resourcesApi, researchApi, challengesApi, projectsApi } from '../../services/api';
import { Search, Sparkles, BookOpen, Cpu, Trophy, FolderKanban, ExternalLink, ArrowRight } from 'lucide-react';

export default function GlobalSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'resources' | 'research' | 'challenges' | 'projects'>('all');
  const [loading, setLoading] = useState(false);

  const [resources, setResources] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const performSearch = async (term: string) => {
    setLoading(true);
    try {
      const [rRes, pRes, cRes, prRes] = await Promise.all([
        resourcesApi.getAll({ search: term }),
        researchApi.getPapers({ search: term }),
        challengesApi.getAll({ search: term }),
        projectsApi.getAll(),
      ]);
      setResources(rRes.data.resources || []);
      setPapers(pRes.data || []);
      setChallenges(cRes.data || []);
      const qLower = term.toLowerCase();
      setProjects((prRes.data || []).filter((p: any) =>
        p.title.toLowerCase().includes(qLower) || p.description.toLowerCase().includes(qLower)
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    } else {
      performSearch('water');
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) performSearch(query.trim());
  };

  const totalResults = resources.length + papers.length + challenges.length + projects.length;

  return (
    <Layout
      title="Intelligent Global Search"
      subtitle="Semantic natural language search spanning resources, research, challenges, and projects"
    >
      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. 'water sensors', 'crop disease models', 'offline healthcare systems'..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md flex-shrink-0"
          >
            Search Intelligence
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="text-[11px] font-semibold text-gray-400">Quick queries:</span>
          {['water quality sensors', 'crop disease detection', 'TinyML', 'offline healthcare'].map(q => (
            <button
              key={q}
              onClick={() => { setQuery(q); performSearch(q); }}
              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 font-medium transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6 text-xs font-bold">
        {[
          { id: 'all', label: `All Results (${totalResults})` },
          { id: 'resources', label: `Resources (${resources.length})` },
          { id: 'research', label: `Research Papers (${papers.length})` },
          { id: 'challenges', label: `Challenges (${challenges.length})` },
          { id: 'projects', label: `Projects (${projects.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 relative transition-all ${
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

      {/* Results presentation */}
      <div className="space-y-6 animate-in">
        {/* Research Papers Group */}
        {(activeTab === 'all' || activeTab === 'research') && papers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-600" /> Research Papers & Benchmarks ({papers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 card-hover">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span className="font-semibold text-blue-600">{p.domain}</span>
                    <span>{p.venue} ({p.publishedYear})</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs mb-1 line-clamp-2">{p.title}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{p.abstract}</p>
                  <button
                    onClick={() => navigate('/research')}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    Open in Explainer <ArrowRight size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources Group */}
        {(activeTab === 'all' || activeTab === 'resources') && resources.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={14} className="text-emerald-600" /> Datasets, APIs & Hardware ({resources.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((r: any) => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 card-hover">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {r.category}
                  </span>
                  <h4 className="font-bold text-gray-900 text-xs mt-2 mb-1">{r.name}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{r.description}</p>
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                  >
                    Visit Resource <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenges Group */}
        {(activeTab === 'all' || activeTab === 'challenges') && challenges.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" /> Innovation Challenges ({challenges.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((c: any) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 card-hover">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {c.organization}
                  </span>
                  <h4 className="font-bold text-gray-900 text-xs mt-2 mb-1">{c.title}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{c.description}</p>
                  <button
                    onClick={() => navigate('/challenges')}
                    className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1"
                  >
                    View Challenge <ArrowRight size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
