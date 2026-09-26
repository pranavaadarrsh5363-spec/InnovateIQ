import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bell, Search, Check, ExternalLink, X, ChevronDown,
  User, LogOut, Sparkles, Shield, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useInnovationContext } from '../../contexts/InnovationContext';
import { useDemo } from '../../contexts/DemoContext';
import { notificationsApi } from '../../services/api';
import { NotificationItem } from '../../types';
import { getPrimaryNavItems, getMoreSections } from './navigationConfig';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { activeProblemId } = useInnovationContext();
  const { isDemoActive, isPanelOpen, togglePanel, startDemo } = useDemo();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'student';
  const primaryNavItems = getPrimaryNavItems(activeProblemId);
  const moreSections = getMoreSections(activeProblemId, role);

  useEffect(() => {
    if (user) {
      notificationsApi.getAll().then(res => setNotifications(res.data)).catch(() => {});
    }
  }, [user]);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMoreMenu(false);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowMoreMenu(false);
    setShowUserMenu(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Check if any item in More is currently active
  const isMoreActive = moreSections.some(section =>
    section.items.some(item => location.pathname === item.to || location.pathname + location.search === item.to)
  );

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <span className="font-extrabold text-white text-sm tracking-tighter">IQ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-gray-900 tracking-tight">InnovateIQ</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 hidden xs:inline">
                SaaS
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Top Navigation Links (hidden on mobile < 768px) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-medium">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.matchPrefix || item.to);

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-blue-600 stroke-[2.2]' : 'text-gray-400 stroke-[1.8]'} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {/* Desktop "More" Dropdown Menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(prev => !prev)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  showMoreMenu || isMoreActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
                aria-expanded={showMoreMenu}
                aria-label="More navigation modules"
              >
                <span>More</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Dropdown Panel */}
              {showMoreMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200/90 rounded-2xl shadow-xl z-50 p-3.5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 px-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">All Modules</span>
                    <button
                      onClick={() => setShowMoreMenu(false)}
                      className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-100"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1 text-xs">
                    {moreSections.map(section => (
                      <div key={section.title}>
                        <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                          {section.title}
                        </div>
                        <div className="space-y-0.5">
                          {section.items.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to || location.pathname + location.search === item.to;

                            return (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setShowMoreMenu(false)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-700 font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Icon size={14} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                  <span className="truncate">{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Demo Mode, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* ⚡ Start Evaluation Demo Button */}
          <button
            onClick={() => {
              if (isDemoActive) {
                togglePanel();
              } else {
                startDemo();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isDemoActive
                ? 'bg-amber-500/15 text-amber-700 border border-amber-400/60 ring-2 ring-amber-400/30 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
            }`}
            title="Launch 1-Click End-to-End Evaluation Demo"
          >
            <Zap size={14} className={isDemoActive ? 'text-amber-600 fill-amber-500' : 'text-amber-300 fill-amber-300'} />
            <span className="hidden sm:inline">
              {isDemoActive ? (isPanelOpen ? 'Hide Demo' : 'Show Demo') : '⚡ Start Evaluation Demo'}
            </span>
            <span className="sm:hidden font-mono text-[11px]">
              {isDemoActive ? 'Demo' : '⚡ Demo'}
            </span>
          </button>

          {/* Notifications button & dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifications(s => !s)}
              className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="View notifications"
              aria-expanded={showNotifications}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold leading-none shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Modal Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-auto sm:right-0 sm:mt-2 w-auto sm:w-96 bg-white border border-gray-200/90 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No notifications yet</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs transition-all ${
                          n.read
                            ? 'bg-white border-gray-100 text-gray-600'
                            : 'bg-blue-50/60 border-blue-100 text-gray-900 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-semibold text-gray-800">{n.title}</span>
                          {!n.read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="text-blue-600 hover:text-blue-800 p-0.5"
                              title="Mark read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">{n.message}</p>
                        {n.actionUrl && (
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              navigate(n.actionUrl!);
                            }}
                            className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
                          >
                            View details <ExternalLink size={10} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Button & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
              aria-label="User account menu"
              aria-expanded={showUserMenu}
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name || 'User'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200 object-cover"
              />
              <span className="text-xs font-semibold text-gray-800 hidden sm:block max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200/90 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <div className="text-xs font-bold text-gray-900 truncate">{user?.name}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{role} Account</div>
                </div>

                <Link
                  to="/portfolio"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <User size={14} className="text-gray-400" />
                  <span>Profile & Portfolio</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
