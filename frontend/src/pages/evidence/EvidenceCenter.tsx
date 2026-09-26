import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSearch, Search, Database, ShieldCheck, ExternalLink,
  RefreshCw, CheckCircle2, AlertCircle, Layers, Filter,
  Building2, Globe, Cpu, ArrowUpRight
} from 'lucide-react';
import { evidenceApi } from '../../services/api';
import { EvidenceItem, SourceConnector } from '../../types';
import Layout from '../../components/layout/Layout';
import { useInnovation } from '../../contexts/InnovationContext';

export default function EvidenceCenter() {
  const [searchParams] = useSearchParams();
  const domainFromUrl = searchParams.get('domain');
  const { activeProblem } = useInnovation();

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [connectors, setConnectors] = useState<SourceConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(domainFromUrl || activeProblem?.domain || 'all');
  const [selectedConnector, setSelectedConnector] = useState('all');

  useEffect(() => {
    fetchData();
  }, [selectedDomain, selectedConnector]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, connRes] = await Promise.all([
        evidenceApi.search({
          query: searchQuery || undefined,
          domain: selectedDomain !== 'all' ? selectedDomain : undefined,
          connectorId: selectedConnector !== 'all' ? selectedConnector : undefined
        }),
        evidenceApi.getConnectors()
      ]);
      setEvidenceList(Array.isArray(evRes.data) ? evRes.data : (evRes.data.data || []));
      setConnectors(Array.isArray(connRes.data) ? connRes.data : (connRes.data.data || []));
    } catch (err) {
      console.error('Failed to load evidence data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <Layout title="Evidence & Sources" subtitle="Multi-source empirical citations with transparent 4-dimension quality scoring">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <FileSearch size={13} className="text-blue-400" />
              Evidence Quality Engine
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[MULTI-CONNECTOR AGGREGATOR]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Transparent Evidence, Open Data & Literature
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Every problem and intervention in InnovateIQ is grounded in verified citations with transparent 4-dimension quality scoring: Authority, Recency, Relevance, and Completeness.
          </p>
        </div>
      </div>

      {/* Connectors Status Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Database size={14} className="text-blue-600" />
            Active Source Connectors & Sync Status
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:inline">[LIVE OR EMULATED]</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
          {connectors.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedConnector(selectedConnector === c.id ? 'all' : c.id)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                selectedConnector === c.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Connected" />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 uppercase font-mono truncate">
                {c.isMock ? '[MOCK]' : '[CONNECTED]'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{c.recordCount?.toLocaleString() || '10,000+'} items</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-center">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search verified evidence by title, publisher, DOI, methodology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="flex-1 md:flex-initial px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Domains</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Education">Education</option>
            <option value="Environment">Environment</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Evidence Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw size={32} className="animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Querying evidence connectors...</p>
        </div>
      ) : evidenceList.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <FileSearch size={48} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold">No Evidence Items Found</h3>
          <p className="text-sm text-slate-500 mt-1">Try resetting the connector or domain filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evidenceList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      [VERIFIED SOURCE]
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {item.sourceType}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                    Quality: {item.qualityScore?.compositeScore || item.sourceQuality?.rating || 'High'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.summary || item.evidenceSummary}
                </p>

                {/* Score breakdown */}
                {item.qualityScore && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center text-[10px]">
                    <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                      <span className="text-slate-400 block font-medium">Authority</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-xs">{item.qualityScore.authority}/10</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                      <span className="text-slate-400 block font-medium">Recency</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-xs">{item.qualityScore.recency}/10</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                      <span className="text-slate-400 block font-medium">Relevance</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-xs">{item.qualityScore.relevance}/10</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                      <span className="text-slate-400 block font-medium">Completeness</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-xs">{item.qualityScore.completeness}/10</strong>
                    </div>
                  </div>
                )}

                {item.qualityScore?.rationale && (
                  <p className="text-[11px] text-slate-500 italic">
                    "{item.qualityScore.rationale}"
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <span className="truncate">Source: {item.publisher || item.sourceName} ({item.publishedDate || item.publicationDate})</span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium flex-shrink-0"
                >
                  Inspect Source <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
}
