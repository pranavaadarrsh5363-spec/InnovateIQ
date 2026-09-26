import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Search, Filter, RefreshCw, Download, FileText,
  User, Clock, Activity, Database, CheckCircle2, ChevronRight
} from 'lucide-react';
import { auditApi } from '../../services/api';
import { AuditLog } from '../../types';
import Layout from '../../components/layout/Layout';

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (actionFilter !== 'all') params.action = actionFilter;
      const res = await auditApi.getAll(params);
      setLogs(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes('created') || action.includes('added')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">{action}</span>;
    }
    if (action.includes('analyzed') || action.includes('evaluated')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">{action}</span>;
    }
    if (action.includes('updated') || action.includes('changed')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">{action}</span>;
    }
    if (action.includes('issue') || action.includes('alert')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">{action}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">{action}</span>;
  };

  return (
    <Layout title="Audit & Governance" subtitle="Data governance, inference history & immutable activity trails">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-slate-500/20 text-slate-300 border border-slate-400/30 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              Governance & Ledger
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[IMMUTABLE AUDIT TRAIL]</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Audit & Compliance Log
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Enterprise transparency requires clear traceability of all AI inferences, metric updates, pilot transitions, and user interventions. Every action is signed, time-stamped, and archived.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by user, action type, entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Actions</option>
            <option value="problem_analyzed">Problem Analyzed</option>
            <option value="pilot_status_updated">Pilot Status Updated</option>
            <option value="pilot_issue_logged">Pilot Issue Logged</option>
            <option value="kpi_reading_recorded">KPI Reading Recorded</option>
            <option value="feedback_loop_recorded">Feedback Loop Recorded</option>
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Details & Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                    Fetching audit ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      {log.userName}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      {log.entityType} ({log.entityId})
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px] max-w-md truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </Layout>
  );
}
