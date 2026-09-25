import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, Brain, FileCheck2, Search,
  Database, Cpu, TrendingUp, Users, Star, FolderKanban,
  Flag, Activity, Network, ShieldCheck, MessageSquare,
  Building2, GraduationCap, Briefcase, LogOut, Sparkles, Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useInnovationContext } from '../../contexts/InnovationContext';
import { FileText } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { activeProblemId } = useInnovationContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'student';

  const navSections = [
    {
      title: 'CORE INTELLIGENCE',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/problems', icon: Target, label: 'Problem Hub', badge: '18 Domains' },
        { to: `/problems/${activeProblemId}/analyze`, icon: Brain, label: 'Problem Intelligence' },
        { to: `/problems/${activeProblemId}/decision-brief`, icon: FileText, label: 'AI Decision Brief' },
        { to: `/evidence?problemId=${activeProblemId}`, icon: FileCheck2, label: 'Evidence & Sources' },
        { to: `/similarity-checker?problemId=${activeProblemId}`, icon: Search, label: 'Solutions & Gaps' },
      ],
    },
    ...(role === 'student' ? [
      {
        title: 'RESOURCES & TECH',
        items: [
          { to: `/resources?problemId=${activeProblemId}`, icon: Database, label: 'Resource Center' },
          { to: `/tech-recommendations?problemId=${activeProblemId}`, icon: Cpu, label: 'Tech Decision Matrix' },
          { to: `/skill-gap?problemId=${activeProblemId}`, icon: TrendingUp, label: 'Skill Intelligence' },
          { to: '/learning', icon: Layers, label: 'Learning Roadmaps' },
          { to: '/knowledge-graph', icon: Network, label: 'Knowledge Graph' },
        ],
      },
    ] : []),
    {
      title: 'EXECUTION & IMPACT',
      items: [
        { to: '/projects', icon: FolderKanban, label: 'Project Workspaces' },
        { to: `/pilots?problemId=${activeProblemId}`, icon: Flag, label: 'Pilot Management', badge: 'Field Trials' },
        { to: `/impact?problemId=${activeProblemId}`, icon: Activity, label: 'Impact Dashboard', badge: 'KPIs' },
        ...(role === 'student' ? [
          { to: `/team?problemId=${activeProblemId}`, icon: Users, label: 'Team Matching' },
          { to: `/mentors?problemId=${activeProblemId}`, icon: Star, label: 'Expert Mentors' },
        ] : []),
      ],
    },
    {
      title: 'ENTERPRISE & PORTALS',
      items: [
        ...(role === 'admin' ? [
          { to: '/organization/dashboard', icon: Building2, label: 'Government & Org' },
        ] : []),
        ...(role === 'admin' || role === 'mentor' ? [
          { to: '/university/dashboard', icon: GraduationCap, label: 'University Incubator' },
        ] : []),
        ...(role === 'admin' ? [
          { to: '/industry/dashboard', icon: Briefcase, label: 'Industry Partner' },
        ] : []),
        ...(role === 'admin' || role === 'mentor' ? [
          { to: '/audit', icon: ShieldCheck, label: 'Audit Trail' },
        ] : []),
        { to: '/innoai', icon: MessageSquare, label: 'InnoIQ Assistant' },
      ],
    },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40 shadow-xl text-slate-300">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex-shrink-0 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="font-extrabold text-white text-base tracking-tighter">IQ</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white tracking-tight">InnovateIQ</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold border border-blue-800">SaaS</span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal">Evidence & Impact Platform</div>
          </div>
        </div>
      </div>

      {/* User Context */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt=""
            className="w-8 h-8 rounded-full border border-slate-600 bg-slate-700"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-blue-400 font-medium capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {user?.role === 'admin' ? 'System Administrator' : user?.role === 'mentor' ? 'Senior Research Mentor' : 'Student Innovator'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-xs font-medium">
        {navSections.map(section => (
          <div key={section.title}>
            <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon size={15} className="flex-shrink-0 text-slate-400 group-hover:text-white transition-colors" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-normal">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors text-xs"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
