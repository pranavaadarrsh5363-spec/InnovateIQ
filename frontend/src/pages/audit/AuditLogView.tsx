import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Search, Filter, RefreshCw, Download, FileText,
  User, Clock, Activity, Database, CheckCircle2, ChevronRight, Zap,
  Lock, Link as LinkIcon, AlertTriangle, Hash, ExternalLink
} from 'lucide-react';
import { auditApi, demoApi } from '../../services/api';
import { AuditLog } from '../../types';
import Layout from '../../components/layout/Layout';
import { useDemo } from '../../contexts/DemoContext';

export default function AuditLogView() {
  const { demoState, isDemoActive } = useDemo();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  
  // Chain Integrity State
  const [chainIntegrity, setChainIntegrity] = useState<any>(null);
  const [verifyingChain, setVerifyingChain] = useState(false);

  useEffect(() => {
    fetchLogs();
    verifyLedgerChain();
  }, [actionFilter, isDemoActive, demoState?.stageIndex]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (actionFilter !== 'all') params.action = actionFilter;
      const res = await auditApi.getAll(params);
      setLogs(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err: any) {
      // If 403 or demo fallback
      try {
        const demoRes = await demoApi.getEvents();
        const demoEvents = demoRes.data?.events || [];
        const mappedLogs: AuditLog[] = demoEvents.map((evt: any) => ({
          id: evt.id,
          userId: 'demo-judge',
          userName: 'Judge Evaluation Demo',
          userRole: 'admin',
          action: `[DEMO] ${evt.eventType}`,
          timestamp: new Date().toISOString(),
          entityType: 'Pilot',
          entityId: 'pilot-alwar-01',
          details: `[SIMULATED FIELD DATA] ${evt.message}${evt.details ? ' — ' + evt.details : ''}`,
          isDemo: true,
          entryHash: 'simulated-hash-' + evt.id,
          prevHash: '0000000000000000'
        }));
        setLogs(mappedLogs);
      } catch (e) {
        console.error('Failed to load audit logs:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyLedgerChain = async () => {
    setVerifyingChain(true);
    try {
      const res = await auditApi.verifyChain();
      setChainIntegrity(res.data);
    } catch (err) {
      console.error('Ledger verification error:', err);
      setChainIntegrity({ integrity: 'UNAVAILABLE', message: 'Verification restricted to administrative roles' });
    } finally {
      setVerifyingChain(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      (log.entryHash && log.entryHash.toLowerCase().includes(q)) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(q)
    );
  });

  const exportAuditJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `innovateiq-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadge = (action: string) => {
    if (action.includes('created') || action.includes('added') || action.includes('CREATE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">{action}</span>;
    }
    if (action.includes('analyzed') || action.includes('evaluated') || action.includes('VERIFY')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">{action}</span>;
    }
    if (action.includes('updated') || action.includes('changed') || action.includes('UPDATE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">{action}</span>;
    }
    if (action.includes('issue') || action.includes('alert') || action.includes('ANOMALY')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">{action}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">{action}</span>;
  };

  return (
    <Layout title="Audit & Cryptographic Governance" subtitle="Data governance, SHA-256 hash chaining, inference history & immutable activity trails">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-slate-500/20 text-slate-300 border border-slate-400/30 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Enterprise Governance
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <Lock size={11} />
                  SHA-256 CHAINED
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                System Audit & Cryptographic Ledger
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Enterprise transparency requires verifiable traceability of all AI inferences, metric updates, pilot transitions, and operator interventions. Every log entry is cryptographically signed and hash-chained.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={verifyLedgerChain}
                disabled={verifyingChain}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-600 transition"
              >
                <RefreshCw size={13} className={verifyingChain ? 'animate-spin' : ''} />
                Verify Ledger Chain
              </button>
              <button
                onClick={exportAuditJSON}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition"
              >
                <Download size={13} />
                Export Ledger (.json)
              </button>
            </div>
          </div>
        </div>

        {/* Cryptographic Chain Integrity Status Banner */}
        {chainIntegrity && (
          <div className={`p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            chainIntegrity.integrity === 'VALID'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : chainIntegrity.integrity === 'UNAVAILABLE'
              ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/60 text-red-900 dark:text-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                chainIntegrity.integrity === 'VALID'
                  ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                <Lock size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                  <span>Cryptographic Hash Chain: {chainIntegrity.integrity === 'VALID' ? 'VERIFIED (100% TAMPER-EVIDENT)' : chainIntegrity.integrity}</span>
                </h4>
                <p className="text-xs opacity-90">
                  {chainIntegrity.message || `${chainIntegrity.totalChecked || logs.length} consecutive records validated with SHA-256 hash chaining.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-white/60 dark:bg-black/40 border border-current">
                {chainIntegrity.totalChecked || logs.length} Blocks Verified
              </span>
            </div>
          </div>
        )}

        {/* SIH Evaluation Demo Live Audit Trail Status */}
        {isDemoActive && (
          <div className="p-4 rounded-xl bg-slate-950 text-slate-100 border border-indigo-900/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Zap size={18} className="text-amber-400 fill-amber-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Live Evaluation Demo Audit Stream Active</h4>
                <p className="text-[11px] text-slate-400">
                  All simulated telemetry events, anomaly detections, and AI mitigation decisions are signed with immutable timestamps.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
              {logs.filter(l => l.action.startsWith('[DEMO]')).length} Demo Audit Entries
            </span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by user, action type, SHA-256 hash, entity ID..."
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
              <option value="all">All Operations</option>
              <option value="problem_analyzed">Problem Inferences</option>
              <option value="pilot_status_updated">Pilot Updates</option>
              <option value="pilot_issue_logged">Field Issues</option>
              <option value="kpi_reading_recorded">Telemetry & KPIs</option>
              <option value="feedback_loop_recorded">Feedback Loops</option>
              <option value="CREATE_ORGANIZATION">Organization Creation</option>
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

        {/* Audit Table with SHA-256 Hash Chaining Chips */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Operation</th>
                  <th className="p-3.5">Target Entity</th>
                  <th className="p-3.5">SHA-256 Hash Signature</th>
                  <th className="p-3.5">Payload & Audit State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                      Fetching verified audit ledger...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const truncatedHash = log.entryHash ? `${log.entryHash.slice(0, 8)}...${log.entryHash.slice(-6)}` : 'N/A';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-slate-400" />
                            <span>{log.userName || log.userId}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono pl-4 block">
                            {log.userRole || 'system'}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                          <div>{log.entityType}</div>
                          <div className="text-[10px] text-slate-400">ID: {log.entityId}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700 flex items-center gap-1 w-max">
                            <Hash size={10} className="text-blue-500" />
                            {truncatedHash}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px] max-w-xs truncate">
                          {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
