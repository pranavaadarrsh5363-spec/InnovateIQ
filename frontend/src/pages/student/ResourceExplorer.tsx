import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { resourcesApi } from '../../services/api';
import { Resource } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useInnovation } from '../../contexts/InnovationContext';
import {
  Search, Filter, Bookmark, BookmarkCheck, ExternalLink, Tag, Database,
  Code, Cpu, Globe, BookOpen, Layers, Sparkles, Activity, FileText,
  Radio, CheckCircle2, ChevronDown, ChevronUp, Share2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Research Papers',
  'Datasets',
  'APIs',
  'Open Source Projects',
  'AI/ML Framework',
  'Development Tools',
  'Cloud Services',
  'Government Resources',
  'Learning Materials',
  'Technical Documentation',
  'Hardware Components',
];

const DOMAINS = [
  'All',
  'AI/ML',
  'IoT',
  'Healthcare',
  'Agriculture',
  'Education',
  'Environment',
  'Smart Cities',
  'FinTech',
  'Cybersecurity',
  'Robotics',
  'Blockchain',
  'GIS',
  'Cloud',
];

const RECOMMENDATION_TABS = [
  { id: 'all', label: 'All Resources' },
  { id: 'recommended', label: '⭐ Recommended For You' },
  { id: 'trending', label: '🔥 Trending Resources' },
  { id: 'recent', label: '⚡ Recently Added' },
  { id: 'project', label: '🎯 Based on Your Project' },
];

const SOURCES_METRICS = [
  { name: 'Research Repositories (arXiv / IEEE)', status: 'Live', latency: '42ms', count: 18, color: 'text-emerald-500' },
  { name: 'Open Datasets (Kaggle / UCI / data.gov)', status: 'Live', latency: '65ms', count: 14, color: 'text-emerald-500' },
  { name: 'GitHub Open-Source Repositories', status: 'Live', latency: '54ms', count: 28, color: 'text-emerald-500' },
  { name: 'Government Portals (BIS / MoHFW / ISRO)', status: 'Live', latency: '78ms', count: 9, color: 'text-emerald-500' },
  { name: 'Educational Platforms (Coursera / NPTEL)', status: 'Live', latency: '50ms', count: 12, color: 'text-emerald-500' },
  { name: 'Developer APIs & Public Registries', status: 'Live', latency: '38ms', count: 22, color: 'text-emerald-500' },
];

const CATEGORY_ICONS: Record<string, any> = {
  'Research Papers': FileText,
  'Datasets': Database,
  'APIs': Globe,
  'Cloud Services': Layers,
  'Development Tools': Code,
  'Hardware Components': Cpu,
  'Learning Materials': BookOpen,
  'Government Resources': Radio,
  'AI/ML Framework': Cpu,
  'Open Source Projects': Code,
  'Technical Documentation': FileText,
  'Default': Tag,
};

function ResourceCard({ resource, saved, onSave }: { resource: Resource; saved: boolean; onSave: (id: string) => void }) {
  const Icon = CATEGORY_ICONS[resource.category] || CATEGORY_ICONS.Default;
  const scoreColor = resource.relevanceScore >= 90 ? 'text-green-600 bg-green-50' : resource.relevanceScore >= 80 ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 card-hover flex flex-col justify-between gap-3 group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow">
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                {resource.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{resource.category}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor}`}>{resource.relevanceScore}% match</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSave(resource.id)}
            className={`p-2 rounded-xl transition-all ${saved ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500'}`}
            title={saved ? 'Saved' : 'Save resource'}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mt-2">{resource.description}</p>

        <div className="p-3 bg-blue-50/70 border border-blue-100/50 rounded-xl mt-3">
          <p className="text-xs font-semibold text-blue-700 mb-0.5">Why it's useful</p>
          <p className="text-xs text-blue-600 leading-relaxed">{resource.whyUseful}</p>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {resource.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-100">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-400">{resource.source}</span>
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
          >
            Visit Resource <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResourceExplorer() {
  const { user } = useAuth();
  const { activeProblem, activeProject } = useInnovation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [domain, setDomain] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [showSources, setShowSources] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params: any = { page, limit: 12 };
    if (search) params.q = search;
    if (category !== 'All') params.category = category;
    if (domain !== 'All') params.domain = domain;

    if (activeTab === 'recommended') {
      params.domain = activeProblem?.domain || user?.domain || 'AI/ML';
    } else if (activeTab === 'project') {
      if (activeProblem) {
        params.domain = activeProblem.domain;
        // Use a key search term from active problem or project
        const keywords = activeProblem.title.toLowerCase().split(' ').filter((w: string) => w.length > 3);
        if (keywords.length > 0) params.q = keywords[0];
      } else {
        params.q = 'water';
      }
    }

    setLoading(true);
    resourcesApi.getAll(params).then(res => {
      let data = res.data.data;
      if (activeTab === 'trending') {
        data = [...data].sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
      setResources(data);
      setTotal(res.data.total);
    }).catch(console.error).finally(() => setLoading(false));
  }, [search, category, domain, activeTab, page, user, activeProblem, activeProject]);

  useEffect(() => {
    resourcesApi.getSaved().then(res => {
      setSavedIds(new Set(res.data.map((s: any) => s.resourceId)));
    }).catch(() => {});
  }, []);

  const handleSave = async (id: string) => {
    if (savedIds.has(id)) {
      await resourcesApi.unsave(id).catch(() => {});
      setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      await resourcesApi.save(id).catch(() => {});
      setSavedIds(prev => new Set([...prev, id]));
    }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); };

  return (
    <Layout title="Intelligent Resource Discovery" subtitle="AI-aggregated research papers, datasets, APIs, open-source code & tools">
      {/* Top Banner: Multi-Source Intelligence Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-blue-100 mb-2">
              <Sparkles size={12} className="text-blue-200" />
              Multi-Source Intelligence Mesh Connected
            </div>
            <h2 className="text-xl font-bold">Multi-Source Information Retrieval</h2>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl">
              Cross-references academic papers (arXiv, IEEE), national open data (data.gov.in), public APIs, and GitHub repositories with semantic ranking.
            </p>
          </div>
          <button
            onClick={() => setShowSources(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all self-start md:self-auto"
          >
            <Activity size={14} />
            {showSources ? 'Hide Source Status' : 'View Analyzed Sources'}
            {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Collapsible Source Intelligence Panel */}
        {showSources && (
          <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in">
            {SOURCES_METRICS.map(src => (
              <div key={src.name} className="bg-white/10 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white">{src.name}</div>
                  <div className="text-[11px] text-blue-200 mt-0.5">{src.count} indexed records retrieved</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                    <CheckCircle2 size={11} /> {src.status}
                  </span>
                  <div className="text-[10px] text-blue-200">{src.latency}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {RECOMMENDATION_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Semantic search across research papers, datasets, APIs, GitHub repos, models, tools..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mr-2">
            <Filter size={13} /> Categories:
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                category === cat ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 items-center pt-1 border-t border-gray-50">
          <span className="text-xs font-semibold text-gray-500 mr-2">Domains:</span>
          {DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => { setDomain(d); setPage(1); }}
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-all ${
                domain === d ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Results count & status */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-sm text-gray-500">
          Found <span className="font-semibold text-gray-900">{total}</span> intelligent resources
        </p>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          {savedIds.size} saved to workspace
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-64 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <Database size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium text-gray-700">No resources matched your criteria</p>
          <p className="text-sm mt-1">Try resetting filters or searching for terms like "water", "dataset", or "IoT"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              saved={savedIds.has(resource.id)}
              onSave={handleSave}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600 font-medium">
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 12)}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
}
