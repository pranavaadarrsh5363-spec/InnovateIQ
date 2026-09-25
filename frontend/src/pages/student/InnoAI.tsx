import { useEffect, useState, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import { aiApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from '../../types';
import { Brain, Send, User, Sparkles, MessageSquare, ChevronRight, Loader2 } from 'lucide-react';

function uuidSimple() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SUGGESTED_QUESTIONS = [
  'How do I detect plant diseases using AI?',
  'What datasets exist for water quality monitoring?',
  'Compare TensorFlow vs PyTorch for my project',
  'Build a technology roadmap for my IoT project',
  'What skills do I need for ML engineering?',
  'Suggest implementation approach for my idea',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: "Hi! I'm **InnoAI**, your AI innovation assistant 🚀\n\nI can help you with:\n- Understanding your problem statement\n- Finding technologies, datasets & APIs\n- Creating a development roadmap\n- Comparing technology options\n- Identifying skill requirements\n\nWhat would you like to explore today?",
  timestamp: new Date(),
};

function formatMessage(text: string) {
  // Very basic markdown-like renderer
  const parts = text.split('\n');
  return parts.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-gray-900 mb-1">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4 list-disc text-gray-700 text-sm">{line.slice(2)}</li>;
    }
    if (line.match(/^\d+\./)) {
      return <li key={i} className="ml-4 list-decimal text-gray-700 text-sm">{line.replace(/^\d+\.\s*/, '')}</li>;
    }
    // Bold inline
    const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
  });
}

export default function InnoAI() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: uuidSimple(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await aiApi.chat(history, user?.domain);
      const aiMsg: ChatMessage = { id: uuidSimple(), role: 'assistant', content: res.data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: ChatMessage = { id: uuidSimple(), role: 'assistant', content: "I'm having trouble responding right now. Please try again in a moment.", timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  return (
    <Layout title="InnoAI Assistant" subtitle="Your AI-powered innovation guide">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-5 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-1">InnoAI</h3>
            <p className="text-blue-100 text-sm leading-relaxed">Your AI innovation guide, powered by smart NLP and domain knowledge.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Sparkles size={12} /> Suggested Questions
            </h4>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-gray-700 hover:text-blue-700 flex items-start gap-1.5 p-2 rounded-lg hover:bg-blue-50 transition-colors group">
                  <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-gray-400 group-hover:text-blue-500" />
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1"><Sparkles size={11} /> Capabilities</p>
            {['Find datasets & APIs', 'Recommend technologies', 'Create project roadmaps', 'Explain research topics', 'Compare tech options', 'Identify skill gaps'].map(cap => (
              <div key={cap} className="text-xs text-amber-700 py-0.5">✓ {cap}</div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-900">InnoAI</span>
              <span className="text-xs text-emerald-600 ml-2 flex items-center gap-1 inline-flex">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'gradient-bg' : 'bg-gray-100'}`}>
                  {msg.role === 'user' ? (
                    <User size={15} className="text-white" />
                  ) : (
                    <Brain size={15} className="text-blue-600" />
                  )}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'gradient-bg text-white rounded-tr-sm' : 'bg-gray-50 border border-gray-100 rounded-tl-sm'}`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm text-white">{msg.content}</p>
                  ) : (
                    <div className="space-y-1">{formatMessage(msg.content)}</div>
                  )}
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Brain size={15} className="text-blue-600" />
                </div>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Actions Bar */}
          <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-gray-400 font-medium flex-shrink-0 flex items-center gap-1">
              <Sparkles size={11} className="text-blue-500" /> Quick Actions:
            </span>
            {[
              { label: '🚀 Generate Blueprint', query: 'Help me generate a 17-point project blueprint for an AI healthcare triage system' },
              { label: '🔍 Check Similarity', query: 'What existing solutions and patents exist for crop disease detection?' },
              { label: '📊 Estimate BOM Cost', query: 'Estimate the hardware and cloud bill of materials for an IoT smart grid in INR ₹' },
              { label: '🎯 Roadmaps & Skills', query: 'What is the recommended 5-stage learning roadmap for computer vision and edge AI?' },
              { label: '👥 Team Matcher', query: 'What complementary roles do I need for a Smart India Hackathon IoT project?' },
            ].map(pill => (
              <button
                key={pill.label}
                type="button"
                onClick={() => sendMessage(pill.query)}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-full text-gray-600 transition-colors shadow-2xs font-medium"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-end gap-3 p-4 border-t border-gray-100">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              placeholder="Ask InnoAI anything about your innovation, technologies, or roadmap..."
              rows={2}
              className="flex-1 resize-none px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <button type="submit" disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 gradient-bg rounded-xl flex items-center justify-center shadow disabled:opacity-40 hover:shadow-lg transition-all">
              {loading ? <Loader2 size={18} className="text-white animate-spin" /> : <Send size={18} className="text-white" />}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
