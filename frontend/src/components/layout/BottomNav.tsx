import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Target, Brain, FolderKanban, Activity, Menu, X,
  User, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useInnovationContext } from '../../contexts/InnovationContext';
import { useDemo } from '../../contexts/DemoContext';
import { getMobileBottomNavItems, getMoreSections } from './navigationConfig';

export default function BottomNav() {
  const { user, logout } = useAuth();
  const { activeProblemId } = useInnovationContext();
  const { isDemoActive, isPanelOpen, setIsPanelOpen, togglePanel, startDemo } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const role = user?.role || 'student';
  const navItems = getMobileBottomNavItems(activeProblemId);
  const moreSections = getMoreSections(activeProblemId, role);

  // Close More sheet on route navigation or Escape key
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMore(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setShowMore(false);
    navigate('/login');
  };

  return (
    <>
      {/* Fixed Bottom Navigation Bar for Mobile (< 768px) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-1.5 py-1 flex items-center justify-around md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.matchPrefix || item.to);

          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setShowMore(false)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[54px] ${
                isActive
                  ? 'text-blue-600 font-bold bg-blue-50/80 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <Icon size={19} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}

        {/* ☰ More Button */}
        <button
          onClick={() => setShowMore(prev => !prev)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[54px] ${
            showMore
              ? 'text-blue-600 font-bold bg-blue-50/80 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 font-medium'
          }`}
          aria-label="Open more navigation options"
          aria-expanded={showMore}
        >
          <Menu size={19} className={showMore ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile "More" Bottom Sheet Modal */}
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            onClick={() => setShowMore(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Bottom Sheet Drawer */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2.5 flex-shrink-0" />

            {/* Sheet Header */}
            <div className="px-5 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                  <span className="font-extrabold text-white text-xs tracking-tighter">IQ</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">InnovateIQ Modules</h3>
                  <p className="text-[10px] text-gray-400">Complete Innovation & Evidence Suite</p>
                </div>
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Navigation Groups */}
            <div className="overflow-y-auto px-4 py-3 space-y-4 text-xs">
              {/* ⚡ Evaluation Demo Feature Card */}
              <button
                onClick={() => {
                  setShowMore(false);
                  if (isDemoActive) {
                    setIsPanelOpen(true);
                  } else {
                    startDemo();
                  }
                }}
                className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                  isDemoActive
                    ? 'bg-amber-500/15 border border-amber-400 text-amber-900'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDemoActive ? 'bg-amber-500 text-white' : 'bg-white/20 text-amber-300'}`}>
                    <Zap size={16} className="fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-xs">
                      {isDemoActive ? '⚡ SIH Demo Mode Active' : '⚡ Start Evaluation Demo'}
                    </div>
                    <div className={`text-[10px] ${isDemoActive ? 'text-amber-800' : 'text-blue-100'}`}>
                      1-Click End-to-End Problem-to-Impact
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDemoActive ? 'bg-amber-200 text-amber-900' : 'bg-white/20 text-white'}`}>
                  {isDemoActive ? 'Show' : 'Launch'}
                </span>
              </button>

              {moreSections.map(section => (
                <div key={section.title}>
                  <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
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

              {/* Account & Session Controls */}
              <div className="pt-2 border-t border-gray-100">
                <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
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
