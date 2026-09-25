import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { aiApi, projectsApi } from '../../services/api';
import { IdeaAnalysisResult } from '../../types';
import {
  Brain, Lightbulb, Code, Database, BookOpen, AlertTriangle,
  CheckCircle, Loader2, ChevronDown, ChevronUp, Zap, ArrowRight,
  Globe, Cpu, Shield, Wrench, Users, Star, ExternalLink,
  FolderPlus, Printer
} from 'lucide-react';

const DOMAINS = ['AI/ML', 'IoT', 'Healthcare', 'Agriculture', 'Education', 'Environment', 'Smart Cities', 'FinTech', 'Cybersecurity', 'Robotics', 'Blockchain', 'Data Science', 'GIS', 'Cloud Computing', 'Sustainability'];

const EXAMPLE_IDEA = {
  title: 'AI-Powered Water Quality Monitoring',
  problemStatement: 'Develop an AI-powered system for early detection of water-borne diseases in rural communities.',
  description: 'Rural communities lack affordable tools to test drinking water quality in real-time. This system uses IoT sensors and machine learning to detect contamination and alert community members via SMS.',
  domain: 'IoT',
  targetUsers: 'Rural community members, local health workers, government water departments',
  technologies: 'Python, TensorFlow, IoT sensors, MQTT, AWS, React',
  expectedOutcome: 'Real-time contamination alerts, 90%+ accuracy, deployment-ready in 6 months',
};

function Section({ title, icon: Icon, color, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o: boolean) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 flex-1 text-left">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-50">{children}</div>}
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 pt-3">
      {items.map(item => (
        <span key={item} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-100">{item}</span>
      ))}
    </div>
  );
}

export default function AIAnalyzer() {
  const [form, setForm] = useState({
    title: '', problemStatement: '', description: '', domain: 'AI/ML',
    targetUsers: '', technologies: '', expectedOutcome: '',
  });
  const [result, setResult] = useState<IdeaAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [converting, setConverting] = useState(false);
  const [projectCreated, setProjectCreated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const loadExample = () => setForm(EXAMPLE_IDEA);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.problemStatement) { setError('Title and problem statement are required'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await aiApi.analyze(form);
      setResult(res.data);
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setError('AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToProject = async () => {
    setConverting(true);
    try {
      const res = await projectsApi.create({
        title: form.title,
        problemStatement: form.problemStatement,
        description: form.description || form.problemStatement,
        domain: form.domain,
        technologies: result?.recommendedTechnologies.map(t => t.name) || ['Python', 'TensorFlow', 'React'],
        objectives: result?.nextSteps.slice(0, 4) || ['Build MVP prototype', 'Validate dataset accuracy'],
      });
      setProjectCreated(true);
      setTimeout(() => navigate(`/projects/${res.data.id}`), 600);
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  };

  const difficultyColor = (d: string) =>
    d === 'Easy' ? 'bg-green-100 text-green-700' : d === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <Layout title="AI Innovation Analyzer" subtitle="Enter your idea and let AI analyze it across 16 dimensions">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Describe Your Innovation</h2>
            <p className="text-sm text-gray-500">The more detail you provide, the more accurate the analysis</p>
          </div>
          <button onClick={loadExample} className="ml-auto text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-1.5">
            <Zap size={12} /> Load Example
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Innovation Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="Smart Water Quality Monitoring"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Domain</label>
              <select name="domain" value={form.domain} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Problem Statement *</label>
            <textarea name="problemStatement" value={form.problemStatement} onChange={handleChange} required rows={2}
              placeholder="How can rural communities detect contaminated drinking water at an early stage?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Detailed description of your solution approach..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Users</label>
              <input name="targetUsers" value={form.targetUsers} onChange={handleChange}
                placeholder="Rural community members..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Technologies Considering</label>
              <input name="technologies" value={form.technologies} onChange={handleChange}
                placeholder="Python, IoT, Machine Learning..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Outcome</label>
              <input name="expectedOutcome" value={form.expectedOutcome} onChange={handleChange}
                placeholder="Real-time contamination alerts..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-4 gradient-bg text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI is analyzing your idea... (this takes ~2 seconds)
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Analyze with AI
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div id="results" className="space-y-4 animate-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={18} className="text-green-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Analysis Complete</h2>
                <p className="text-xs text-gray-500">16 dimensions analyzed · Intelligent recommendations generated</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all"
              >
                <Printer size={14} /> Print Report
              </button>
              <button
                type="button"
                onClick={handleConvertToProject}
                disabled={converting || projectCreated}
                className="flex items-center gap-1.5 px-4 py-2 gradient-bg hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
              >
                {converting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : projectCreated ? (
                  <CheckCircle size={14} />
                ) : (
                  <FolderPlus size={14} />
                )}
                {projectCreated ? 'Project Created!' : converting ? 'Creating Project...' : 'Convert to Project Workspace'}
              </button>
            </div>
          </div>

          {/* 1. Problem Understanding */}
          <Section title="Problem Understanding" icon={Brain} color="bg-blue-500" defaultOpen>
            <p className="text-sm text-gray-700 leading-relaxed pt-3">{result.problemUnderstanding}</p>
          </Section>

          {/* 2. Key Challenges */}
          <Section title="Key Challenges" icon={AlertTriangle} color="bg-orange-500">
            <ul className="space-y-2 pt-3">
              {result.keyChallenges.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {c}
                </li>
              ))}
            </ul>
          </Section>

          {/* 3. Recommended Technologies */}
          <Section title="Recommended Technologies" icon={Cpu} color="bg-violet-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
              {result.recommendedTechnologies.map(tech => (
                <div key={tech.name} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{tech.name}</span>
                      <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">{tech.category}</span>
                      <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${difficultyColor(tech.difficulty)}`}>{tech.difficulty}</span>
                    </div>
                    <p className="text-xs text-gray-600">{tech.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 4 & 5. Skills & Hardware */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Required Skills" icon={Users} color="bg-emerald-500">
              <TagList items={result.requiredSkills} />
            </Section>
            <Section title="Required Hardware" icon={Cpu} color="bg-cyan-500">
              <TagList items={result.requiredHardware} />
            </Section>
          </div>

          {/* 6. Software */}
          <Section title="Required Software" icon={Code} color="bg-indigo-500">
            <TagList items={result.requiredSoftware} />
          </Section>

          {/* 7. Datasets */}
          <Section title="Required Datasets" icon={Database} color="bg-teal-500">
            <div className="space-y-3 pt-3">
              {result.requiredDatasets.map(ds => (
                <div key={ds.name} className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">{ds.name}</span>
                    <span className="text-xs text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">{ds.size}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-0.5">{ds.description}</p>
                  <p className="text-xs text-gray-400">Source: {ds.source}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 8. Research Areas */}
          <Section title="Research Areas" icon={BookOpen} color="bg-amber-500">
            <ul className="space-y-2 pt-3">
              {result.researchAreas.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <ArrowRight size={14} className="text-amber-500 flex-shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </Section>

          {/* 9. Similar Solutions */}
          <Section title="Similar Existing Solutions" icon={Globe} color="bg-pink-500">
            <div className="space-y-3 pt-3">
              {result.similarSolutions.map(sol => (
                <div key={sol.name} className="p-3 bg-pink-50 rounded-xl border border-pink-100">
                  <div className="font-semibold text-sm text-gray-900 mb-0.5">{sol.name} <span className="text-xs text-gray-500 font-normal">· {sol.source}</span></div>
                  <p className="text-xs text-gray-600 mb-1">{sol.description}</p>
                  <div className="flex items-start gap-1.5">
                    <Star size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">{sol.differentiator}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 10. APIs */}
          <Section title="Relevant APIs" icon={Globe} color="bg-sky-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
              {result.relevantAPIs.map(api => (
                <div key={api.name} className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">{api.name}</span>
                    {api.freeTier && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Free Tier</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-0.5">by {api.provider}</p>
                  <p className="text-xs text-gray-600">{api.description}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 11. Open Source Tools */}
          <Section title="Open-Source Tools" icon={Wrench} color="bg-lime-600">
            <TagList items={result.openSourceTools} />
          </Section>

          {/* 12. Learning Resources */}
          <Section title="Learning Resources" icon={BookOpen} color="bg-rose-500">
            <div className="space-y-2 pt-3">
              {result.learningResources.map(lr => (
                <a key={lr.title} href={lr.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-rose-50 transition-colors group">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 group-hover:text-rose-700">{lr.title}</div>
                    <div className="text-xs text-gray-500">{lr.platform} · {lr.type}</div>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-rose-500" />
                </a>
              ))}
            </div>
          </Section>

          {/* 13. Implementation */}
          <Section title="Implementation Approach" icon={Code} color="bg-blue-600">
            <p className="text-sm text-gray-700 leading-relaxed pt-3">{result.implementationApproach}</p>
          </Section>

          {/* 14. Opportunities */}
          <Section title="Innovation Opportunities" icon={Lightbulb} color="bg-yellow-500">
            <ul className="space-y-2 pt-3">
              {result.innovationOpportunities.map((op, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Lightbulb size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" /> {op}
                </li>
              ))}
            </ul>
          </Section>

          {/* 15. Risks */}
          <Section title="Potential Risks" icon={Shield} color="bg-red-500">
            <ul className="space-y-2 pt-3">
              {result.potentialRisks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </Section>

          {/* 16. Next Steps */}
          <Section title="Suggested Next Steps" icon={CheckCircle} color="bg-green-500">
            <ol className="space-y-2 pt-3">
              {result.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </Layout>
  );
}
