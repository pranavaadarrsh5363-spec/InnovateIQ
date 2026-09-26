import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Globe, Brain, FileText, FileSearch, Search, Cpu,
  TrendingUp, Layers, FolderKanban, Users, Star, Rocket,
  BarChart3, ShieldCheck, ChevronRight, Sparkles, ChevronDown,
  Building2, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useInnovationContext } from '../../contexts/InnovationContext';

export default function ContextIndicator() {
  const location = useLocation();
  const { activeProblem, activeProblemId, activeProject, allProblems, selectProblem } = useInnovationContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 14-stage Innovation Lifecycle
  const STAGES = [
    { key: 'problem-hub', path: '/problems', label: '1. Problem Hub', icon: Globe },
    { key: 'analyze', path: `/problems/${activeProblemId}/analyze`, label: '2. Intelligence', icon: Brain },
    { key: 'brief', path: `/problems/${activeProblemId}/decision-brief`, label: '3. Decision Brief', icon: FileText },
    { key: 'evidence', path: `/evidence?problemId=${activeProblemId}`, label: '4. Evidence', icon: FileSearch },
    { key: 'gaps', path: `/similarity-checker?problemId=${activeProblemId}`, label: '5. Solutions & Gaps', icon: Search },
    { key: 'tech', path: `/tech-recommendations?problemId=${activeProblemId}`, label: '6. Tech Matrix', icon: Cpu },
    { key: 'skills', path: `/skill-gap?problemId=${activeProblemId}`, label: '7. Skill Gap', icon: TrendingUp },
    { key: 'resources', path: `/resources?problemId=${activeProblemId}`, label: '8. Resources', icon: Layers },
    { key: 'project', path: activeProject ? `/projects/${activeProject.id}` : `/projects?problemId=${activeProblemId}`, label: '9. Project', icon: FolderKanban },
    { key: 'team', path: `/team?problemId=${activeProblemId}`, label: '10. Team', icon: Users },
    { key: 'mentors', path: `/mentors?problemId=${activeProblemId}`, label: '11. Mentors', icon: Star },
    { key: 'pilots', path: `/pilots?problemId=${activeProblemId}`, label: '12. Field Pilots', icon: Rocket },
    { key: 'impact', path: `/impact?problemId=${activeProblemId}`, label: '13. Impact KPIs', icon: BarChart3 },
    { key: 'audit', path: '/audit', label: '14. Audit Ledger', icon: ShieldCheck },
  ];

  // Helper to check if a stage is active
  const isStageActive = (stagePath: string, key: string) => {
    const current = location.pathname;
    if (key === 'problem-hub' && current === '/problems') return true;
    if (key === 'analyze' && current.includes('/analyze')) return true;
    if (key === 'brief' && current.includes('/decision-brief')) return true;
    if (key === 'evidence' && current === '/evidence') return true;
    if (key === 'gaps' && current === '/similarity-checker') return true;
    if (key === 'tech' && current === '/tech-recommendations') return true;
    if (key === 'skills' && current === '/skill-gap') return true;
    if (key === 'resources' && current === '/resources') return true;
    if (key === 'project' && current.startsWith('/projects')) return true;
    if (key === 'team' && current === '/team') return true;
    if (key === 'mentors' && current === '/mentors') return true;
    if (key === 'pilots' && current === '/pilots') return true;
    if (key === 'impact' && current === '/impact') return true;
    if (key === 'audit' && current === '/audit') return true;
    return false;
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs shadow-md">
      {/* Context Top Bar */}
      <div className="px-3 sm:px-4 py-2 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/70">
        <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 min-w-0 w-full sm:w-auto">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-shrink-0 self-start xs:self-auto">
            <Sparkles size={11} className="text-blue-400" />
            ACTIVE CONTEXT:
          </span>

          <div className="relative min-w-0 w-full xs:w-auto flex-1">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between gap-1.5 text-xs font-semibold text-white hover:text-blue-300 transition-colors bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 w-full sm:max-w-md"
            >
              <span className="truncate">{activeProblem?.title || 'Early Detection of Water Contamination in Rural Communities'}</span>
              <ChevronDown size={13} className="text-slate-400 flex-shrink-0 ml-1" />
            </button>

            {dropdownOpen && (
              <div className="fixed sm:absolute left-2 sm:left-0 right-2 sm:right-auto mt-1 w-auto sm:w-96 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Active Problem (18 Domains)
                </div>
                {allProblems.map((prob) => (
                  <button
                    key={prob.id}
                    onClick={() => {
                      selectProblem(prob);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition flex flex-col gap-0.5 ${
                      prob.id === activeProblemId
                        ? 'bg-blue-600/30 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{prob.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 ml-1 flex-shrink-0">
                        {prob.domain}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">{prob.organization} • {prob.location}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeProblem && (
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {activeProblem.domain}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/60 text-red-300 border border-red-800/40">
                {activeProblem.priority}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                ({activeProblem.organization})
              </span>
            </div>
          )}
        </div>

        {activeProject && (
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-slate-500">Linked Workspace:</span>
            <Link
              to={`/projects/${activeProject.id}`}
              className="font-medium text-blue-400 hover:text-blue-300 truncate max-w-xs flex items-center gap-1"
            >
              <FolderKanban size={12} />
              {activeProject.title}
            </Link>
          </div>
        )}
      </div>

      {/* 14-Stage Breadcrumb Ribbon */}
      <div className="w-full max-w-full overflow-x-auto px-3 sm:px-4 py-2 scrollbar-thin">
        <div className="flex items-center gap-1 min-w-max">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1 flex-shrink-0">
            Lifecycle:
          </span>
        {STAGES.map((step, idx) => {
          const active = isStageActive(step.path, step.key);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <Link
                to={step.path}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={12} className={active ? 'text-white' : 'text-slate-400'} />
                <span>{step.label}</span>
              </Link>
              {idx < STAGES.length - 1 && (
                <ChevronRight size={11} className="text-slate-600 mx-0.5 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
        </div>
      </div>
    </div>
  );
}
