import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { researchApi } from '../../services/api';
import { ResearchPaper } from '../../types';
import {
  FileText, Sparkles, MessageSquare, BookOpen, Search,
  Send, Loader2, ArrowRight, CheckCircle2, AlertTriangle,
  ExternalLink, Layers, Lightbulb, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResearchExplainer() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [explainSimply, setExplainSimply] = useState(false);
  const [searchDomain, setSearchDomain] = useState('All');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! Ask me any technical question about this research paper, its methodology, limitations, or how to implement it in your student project.' }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    researchApi.getPapers().then(res => {
      setPapers(res.data);
      if (res.data.length > 0) setSelectedPaper(res.data[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || !selectedPaper) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setChatMessages(prev => [...prev, { role: 'user', content: userText }]);
    setChatLoading(true);

    try {
      const res = await researchApi.chatWithPaper(selectedPaper.id, userText);
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an issue analyzing this paper. Please try asking again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredPapers = searchDomain === 'All'
    ? papers
    : papers.filter(p => p.domain.toLowerCase().includes(searchDomain.toLowerCase()));

  return (
    <Layout
      title="Research Paper Explainer"
      subtitle="Deconstruct academic papers into student-friendly insights and interact via document chat"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Paper Selector & Upload Mock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-[calc(100vh-180px)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <FileText size={14} className="text-blue-600" /> Research Library ({filteredPapers.length})
            </h3>
            <select
              value={searchDomain}
              onChange={e => setSearchDomain(e.target.value)}
              className="text-[11px] px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
            >
              {['All', 'IoT', 'Agriculture', 'Healthcare', 'Smart Cities', 'Environment', 'FinTech', 'Energy', 'Robotics'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Paper list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredPapers.map(paper => (
              <div
                key={paper.id}
                onClick={() => {
                  setSelectedPaper(paper);
                  setChatMessages([
                    { role: 'assistant', content: `Ready to answer questions about "${paper.title}". What would you like to explore?` }
                  ]);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                  selectedPaper?.id === paper.id
                    ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span className="font-semibold text-blue-600">{paper.domain}</span>
                  <span>{paper.publishedYear}</span>
                </div>
                <h4 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{paper.title}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-1">{paper.authors.join(', ')}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <label className="cursor-pointer block text-xs px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl text-gray-600 font-medium">
              📄 Upload Custom PDF Paper
              <input type="file" accept=".pdf" className="hidden" onChange={() => alert('PDF uploaded! Paper analysis complete.')} />
            </label>
          </div>
        </div>

        {/* Right 2 Columns: Paper Breakdown & Document Chat */}
        {selectedPaper && (
          <div className="lg:col-span-2 space-y-5">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {selectedPaper.venue} ({selectedPaper.publishedYear})
                    </span>
                    <span className="text-[11px] text-gray-400">{selectedPaper.domain}</span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">{selectedPaper.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">Authors: {selectedPaper.authors.join(', ')}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Explain Simply Toggle */}
                  <button
                    onClick={() => setExplainSimply(s => !s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      explainSimply
                        ? 'bg-amber-500 text-white shadow-amber-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Sparkles size={13} />
                    {explainSimply ? 'Explain Simply: ON' : 'Explain Simply: OFF'}
                  </button>

                  <button
                    onClick={() => navigate('/quizzes')}
                    className="flex items-center gap-1 px-3 py-1.5 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md"
                  >
                    Generate Quiz <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Explain Simply Banner */}
              {explainSimply ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 animate-in mb-4">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                    💡 Plain Language Student Explanation
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    {selectedPaper.simpleExplanation}
                  </p>
                </div>
              ) : null}

              {/* Structured Section Grid */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">Abstract</h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    {selectedPaper.abstract}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/30">
                    <h5 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1 text-blue-700">
                      🎯 Core Problem Addressed
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{selectedPaper.problem}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/30">
                    <h5 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1 text-emerald-700">
                      ⚙️ Methodology & Architecture
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{selectedPaper.methodology}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/30">
                    <h5 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1 text-violet-700">
                      📊 Key Results & Metrics
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">{selectedPaper.results}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/30">
                    <h5 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1 text-amber-700">
                      ⚠️ Limitations & Bottlenecks
                    </h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {selectedPaper.limitations.map((l, i) => (
                        <li key={i}>• {l}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tech & Datasets */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-gray-500 text-[11px]">Technologies:</span>
                    {selectedPaper.technologies.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-gray-500 text-[11px]">Datasets:</span>
                    {selectedPaper.datasets.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[11px] font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Chatbot Interface */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-600" />
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Ask Questions About This Paper
                  </h4>
                </div>
                <span className="text-[11px] text-gray-400">Context: {selectedPaper.title.slice(0, 35)}...</span>
              </div>

              {/* Chat history */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center text-white text-[10px] flex-shrink-0 mt-0.5">
                        AI
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                        msg.role === 'user'
                          ? 'gradient-bg text-white rounded-tr-none'
                          : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2 items-center text-xs text-gray-400">
                    <Loader2 size={13} className="animate-spin" /> Analyzing document context...
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleAsk} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="e.g. How does this paper handle sensor calibration? What dataset did they use?"
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputQuery.trim()}
                  className="px-4 py-2 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send size={12} /> Ask
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
