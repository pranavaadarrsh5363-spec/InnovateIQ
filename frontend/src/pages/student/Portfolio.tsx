import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { portfolioApi, githubApi } from '../../services/api';
import { StudentPortfolio, GitHubRepoSummary } from '../../types';
import {
  Award, Github, Globe, Star, GitFork, CheckCircle2,
  ExternalLink, Sparkles, FolderKanban, Shield, Code,
  BookOpen, Trophy, ArrowRight, Loader2, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<StudentPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null);
  const [repoReview, setRepoReview] = useState<any>(null);

  useEffect(() => {
    portfolioApi.getMyPortfolio()
      .then(res => {
        setPortfolio(res.data);
        setIsPublic(res.data.isPublic);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAnalyzeRepo = async (repoName: string) => {
    setAnalyzingRepo(repoName);
    try {
      const res = await githubApi.analyze({ repoName });
      setRepoReview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingRepo(null);
    }
  };

  if (loading || !portfolio) {
    return (
      <Layout title="Innovation Portfolio">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Student Innovation Portfolio"
      subtitle="Comprehensive showcase of your projects, technical certifications, GitHub code audits, and achievements"
    >
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={portfolio.student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${portfolio.student.name}`}
              alt={portfolio.student.name}
              className="w-16 h-16 rounded-full border-4 border-white/20 shadow-lg object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{portfolio.student.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur">
                  SIH Innovator
                </span>
              </div>
              <p className="text-xs text-blue-100">{portfolio.student.profile?.university}</p>
              <p className="text-xs text-blue-200 mt-1">{portfolio.student.profile?.domain}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPublic(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold backdrop-blur transition-all"
            >
              {isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
              {isPublic ? 'Public Portfolio' : 'Private Portfolio'}
            </button>
            <button
              onClick={() => alert('Portfolio link copied to clipboard!')}
              className="px-4 py-1.5 bg-white text-blue-700 rounded-xl text-xs font-bold shadow hover:bg-blue-50 transition-all"
            >
              Share Portfolio
            </button>
          </div>
        </div>

        <p className="text-xs text-blue-100/90 mt-4 max-w-3xl leading-relaxed border-t border-white/10 pt-3">
          {portfolio.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skills & Certifications & Achievements */}
        <div className="space-y-6">
          {/* Skills & Endorsements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <Award size={14} className="text-blue-600" /> Endorsed Skills ({portfolio.skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map(s => (
                <div key={s.name} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-xl text-xs flex items-center gap-1.5 font-medium text-gray-800">
                  <span>{s.name}</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 rounded-full">
                    ★ {s.endorsementsCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen size={14} className="text-emerald-600" /> Verified Certifications
            </h3>
            <div className="space-y-2.5">
              {portfolio.certifications.map(c => (
                <div key={c.title} className="p-3 bg-emerald-50/50 border border-emerald-100/70 rounded-xl text-xs">
                  <span className="font-bold text-gray-900 block">{c.title}</span>
                  <div className="flex items-center justify-between text-[11px] text-emerald-800 mt-1">
                    <span>{c.issuer}</span>
                    <span>{c.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" /> Honors & Awards
            </h3>
            <div className="space-y-2 text-xs text-gray-700">
              {portfolio.achievements.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-gray-50">
                  <Trophy size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Projects & GitHub Code Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <FolderKanban size={14} className="text-blue-600" /> Innovation Projects ({portfolio.projects.length})
              </h3>
            </div>

            <div className="space-y-4">
              {portfolio.projects.map(proj => (
                <div key={proj.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/40 hover:bg-gray-50 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                        {proj.domain}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1">{proj.title}</h4>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">{proj.progress}% Done</span>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div className="h-full gradient-bg rounded-full" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.technologies.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-semibold text-gray-700">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-400">Target: {proj.targetUsers}</span>
                    <button
                      onClick={() => navigate(`/projects/${proj.id}`)}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      Workspace <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Repositories & AI Code Review */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <Github size={14} className="text-gray-900" /> Connected GitHub Repositories
              </h3>
              <span className="text-[11px] text-gray-400">Mock Integration Layer</span>
            </div>

            <div className="space-y-4">
              {portfolio.githubRepositories.map(repo => (
                <div key={repo.name} className="p-4 border border-gray-200 rounded-2xl bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <Code size={14} className="text-blue-600" /> {repo.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{repo.description}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Star size={12} className="text-amber-500" /> {repo.stars}</span>
                      <span className="flex items-center gap-1"><GitFork size={12} /> {repo.forks}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold">{repo.primaryLanguage}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleAnalyzeRepo(repo.name)}
                      disabled={analyzingRepo === repo.name}
                      className="px-3 py-1.5 gradient-bg text-white rounded-xl text-xs font-bold shadow hover:shadow-md flex items-center gap-1.5"
                    >
                      {analyzingRepo === repo.name ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Analyze Repository with AI
                    </button>

                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 font-semibold"
                    >
                      View on GitHub <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Repository Review Panel */}
            {repoReview && (
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 animate-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      AI Code Review: {repoReview.repoName}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">Quality Score: {repoReview.qualityScore}/100</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      Architecture Strengths:
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {repoReview.strengths.map((s: string, i: number) => (
                        <li key={i}>✓ {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Recommended Code Improvements:
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {repoReview.improvements.map((im: string, i: number) => (
                        <li key={i}>⚡ {im}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                    System Architecture Suggestions:
                  </span>
                  <p className="text-slate-300">{repoReview.architectureSuggestions[0]}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
