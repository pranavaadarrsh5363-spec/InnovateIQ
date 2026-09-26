import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Search, Lightbulb, BarChart3, Menu, X,
  LayoutDashboard, Target, Brain, FileText, FileCheck2,
  Database, Cpu, TrendingUp, Layers, Network,
  FolderKanban, Flag, Activity, Users, Star,
  Building2, GraduationCap, Briefcase, ShieldCheck,
  MessageSquare, User, LogOut, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useInnovationContext } from '../../contexts/InnovationContext';

export default function BottomNav() {
  const { user, logout } = useAuth();
  const { activeProblemId } = useInnovationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const role = user?.role || 'student';

  const handleLogout = () => {
    logout();
    setShowMore(false);
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home, matchPrefix: '/dashboard' },
    { to: '/problems', label: 'Problems', icon: Search, matchPrefix: '/problems' },
    { to: '/projects', label: 'Projects', icon: Lightbulb, matchPrefix: '/projects' },
    { to: `/impact?problemId=${activeProblemId}`, label: 'Impact', icon: BarChart3, matchPrefix: '/impact' },
  ];

  const moreSections = [
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
    <>
      {/* Fixed Bottom Navigation Bar (Hidden on desktop lg+) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.matchPrefix);

          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setShowMore(false)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive
                  ? 'text-blue-600 font-bold bg-blue-50/70'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}

        {/* ☰ More Button */}
        <button
          onClick={() => setShowMore(prev => !prev)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 min-w-[60px] ${
            showMore
              ? 'text-blue-600 font-bold bg-blue-50/70'
              : 'text-gray-500 hover:text-gray-900 font-medium'
          }`}
          aria-label="Toggle full navigation drawer"
          aria-expanded={showMore}
        >
          <Menu size={20} className={showMore ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* "More" Bottom Sheet Drawer */}
      {showMore && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setShowMore(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2.5 flex-shrink-0" />

            {/* Header */}
            <div className="px-5 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                  <span className="font-extrabold text-white text-xs tracking-tighter">IQ</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">All InnovateIQ Modules</h3>
                  <p className="text-[10px] text-gray-400">Complete Innovation & Evidence Suite</p>
                </div>
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Navigation Groups */}
            <div className="overflow-y-auto px-4 py-3 space-y-5 text-xs">
              {moreSections.map(section => (
                <div key={section.title}>
                  <div className="px-2 mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    {section.title}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {section.items.map(item => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to || location.pathname + location.search === item.to;

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setShowMore(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                              : 'text-gray-700 hover:bg-gray-50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon size={16} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100/70 text-blue-700 font-semibold flex-shrink-0 ml-1">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Account & Profile Section */}
              <div className="pt-2 border-t border-gray-100">
                <div className="px-2 mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  ACCOUNT & SESSION
                </div>
                <div className="grid grid-cols-1 gap-1">
                  <NavLink
                    to="/portfolio"
                    onClick={() => setShowMore(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <User size={16} className="text-gray-400" />
                      <span>Profile & Portfolio</span>
                    </div>
                    <span className="text-[10px] text-gray-400 truncate">{user?.name}</span>
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium text-left"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
