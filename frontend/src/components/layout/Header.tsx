import { useState, useEffect } from 'react';
import { Bell, Search, Check, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../services/api';
import { NotificationItem } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      notificationsApi.getAll().then(res => setNotifications(res.data)).catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const markAsRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Global Semantic Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search problems, evidence, research, or technologies: 'low-cost water telemetry', 'NILM sensors'..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Notifications button & dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(s => !s)}
              className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 animate-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Smart Notifications</h4>
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

          {/* User Profile Shortcut */}
          <div
            onClick={() => navigate('/portfolio')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-7 h-7 rounded-full border border-gray-200"
            />
            <span className="text-xs font-semibold text-gray-700 hidden sm:block">
              {user?.name?.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
