import React, { useState, useEffect } from 'react';
import {
  Rocket, MapPin, Users, Calendar, AlertTriangle, MessageSquare,
  CheckCircle2, PlusCircle, Clock, ShieldAlert, ArrowRight,
  TrendingUp, RefreshCw, Layers, CheckSquare, ShieldCheck,
  Zap, Activity, Droplets, Gauge, Thermometer, Plus, Radio,
  Send, Cpu, UserCheck
} from 'lucide-react';
import { pilotsApi, telemetryApi } from '../../services/api';
import { PilotProgram, PilotIssue, PilotFeedback } from '../../types';
import Layout from '../../components/layout/Layout';
import { useInnovation } from '../../contexts/InnovationContext';
import { useDemo } from '../../contexts/DemoContext';

export default function PilotManager() {
  const { activeProblem, activeProject } = useInnovation();
  const { demoState, isDemoActive } = useDemo();
  const [pilots, setPilots] = useState<PilotProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPilot, setSelectedPilot] = useState<PilotProgram | null>(null);
  
  // Real Telemetry State
  const [latestTelemetry, setLatestTelemetry] = useState<any>(null);
  const [telemetryDevices, setTelemetryDevices] = useState<any[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Register Device Modal
  const [showRegisterDeviceModal, setShowRegisterDeviceModal] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceLocation, setNewDeviceLocation] = useState('');
  const [newDeviceHardware, setNewDeviceHardware] = useState('ESP32-S3 + LoRaWAN SX1262');
  const [newDeviceFirmware, setNewDeviceFirmware] = useState('v2.4.0-prod');
  const [registeringDevice, setRegisteringDevice] = useState(false);

  // Manual Telemetry Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDeviceId, setManualDeviceId] = useState('');
  const [manualPh, setManualPh] = useState('7.2');
  const [manualTurbidity, setManualTurbidity] = useState('3.4');
  const [manualTds, setManualTds] = useState('380');
  const [manualTemp, setManualTemp] = useState('26.0');
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualResult, setManualResult] = useState<any>(null);

  // Create Pilot Modal
  const [showCreatePilotModal, setShowCreatePilotModal] = useState(false);
  const [newPilotName, setNewPilotName] = useState('');
  const [newPilotLocation, setNewPilotLocation] = useState('');
  const [newPilotCohort, setNewPilotCohort] = useState('');
  const [newPilotPartner, setNewPilotPartner] = useState('');
  const [newPilotDesc, setNewPilotDesc] = useState('');
  const [newPilotCriteria, setNewPilotCriteria] = useState('');
  const [creatingPilot, setCreatingPilot] = useState(false);

  // Issue & Feedback form states
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackRole, setFeedbackRole] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSentiment, setFeedbackSentiment] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPilots();
  }, [activeProblem, activeProject]);

  useEffect(() => {
    if (selectedPilot) {
      fetchPilotTelemetry(selectedPilot.id);
    }
  }, [selectedPilot]);

  const fetchPilots = async () => {
    setLoading(true);
    try {
      const res = await pilotsApi.getAll();
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setPilots(data);
      if (data.length > 0) {
        const match = data.find((p: any) => 
          (activeProblem && p.problemId === activeProblem.id) ||
          (activeProject && p.projectId === activeProject.id) ||
          (p.id === 'pilot-alwar-01')
        );
        setSelectedPilot(match || data[0]);
      }
    } catch (err) {
      console.error('Failed to load pilots:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPilotTelemetry = async (pilotId: string) => {
    setTelemetryLoading(true);
    try {
      const [teleRes, devRes] = await Promise.all([
        telemetryApi.getLatest(pilotId).catch(() => ({ data: null })),
        telemetryApi.getDevices().catch(() => ({ data: { data: [] } }))
      ]);

      if (teleRes.data?.data) {
        setLatestTelemetry(teleRes.data.data);
      } else {
        setLatestTelemetry(null);
      }

      const allDevices = Array.isArray(devRes.data?.data) ? devRes.data.data : [];
      const pilotDevices = allDevices.filter((d: any) => d.pilotId === pilotId);
      setTelemetryDevices(pilotDevices);
      if (pilotDevices.length > 0 && !manualDeviceId) {
        setManualDeviceId(pilotDevices[0].deviceId);
      } else if (!manualDeviceId) {
        setManualDeviceId(`node-${pilotId.slice(-6)}`);
      }
    } catch (err) {
      console.error('Failed to fetch pilot telemetry:', err);
    } finally {
      setTelemetryLoading(false);
    }
  };

  const handleStatusChange = async (pilotId: string, newStatus: string) => {
    try {
      await pilotsApi.updateStatus(pilotId, newStatus);
      fetchPilots();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleLogManualTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot) return;
    setManualSubmitting(true);
    setManualResult(null);

    try {
      const payload = {
        pilotId: selectedPilot.id,
        deviceId: manualDeviceId || `node-${selectedPilot.id.slice(-6)}`,
        measurements: {
          ph: parseFloat(manualPh),
          turbidity: parseFloat(manualTurbidity),
          tds: parseFloat(manualTds),
          temperature: parseFloat(manualTemp)
        },
        source: 'MANUAL_ENTRY' as const,
        organizationId: (selectedPilot as any).organizationId,
        recordedByUserId: 'u-operator-01'
      };

      const res = await telemetryApi.ingest(payload);
      setManualResult(res.data);
      fetchPilotTelemetry(selectedPilot.id);
      setTimeout(() => {
        setShowManualModal(false);
        setManualResult(null);
      }, 2000);
    } catch (err: any) {
      console.error('Manual telemetry submission failed:', err);
      setManualResult({ error: err.response?.data?.message || 'Submission failed' });
    } finally {
      setManualSubmitting(false);
    }
  };

  const handleCreatePilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPilotName || !newPilotLocation) return;
    setCreatingPilot(true);

    try {
      const payload = {
        name: newPilotName,
        location: newPilotLocation,
        cohortSize: newPilotCohort || '100 Households',
        partnerOrganization: newPilotPartner || 'District Administration',
        description: newPilotDesc || 'Community trial deployment of sensor and filtration nodes.',
        successCriteria: newPilotCriteria ? newPilotCriteria.split(',').map(s => s.trim()) : ['TDS < 500 ppm', 'pH 6.5 - 8.5'],
        problemId: activeProblem?.id || 'prob-water-01',
        projectId: activeProject?.id || 'proj-cauvery-01',
        status: 'deploying'
      };

      const res = await pilotsApi.create(payload);
      setShowCreatePilotModal(false);
      setNewPilotName('');
      setNewPilotLocation('');
      setNewPilotCohort('');
      setNewPilotPartner('');
      setNewPilotDesc('');
      setNewPilotCriteria('');
      fetchPilots();
    } catch (err) {
      console.error('Failed to create pilot program:', err);
    } finally {
      setCreatingPilot(false);
    }
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot || !issueDescription) return;
    setSubmitting(true);
    try {
      await pilotsApi.logIssue(selectedPilot.id, {
        description: issueDescription,
        severity: issueSeverity
      });
      setIssueDescription('');
      fetchPilots();
    } catch (err) {
      console.error('Failed to log issue:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot || !feedbackContent || !feedbackAuthor) return;
    setSubmitting(true);
    try {
      await pilotsApi.addFeedback(selectedPilot.id, {
        authorName: feedbackAuthor,
        role: feedbackRole || 'Field Observer',
        content: feedbackContent,
        sentiment: feedbackSentiment
      });
      setFeedbackAuthor('');
      setFeedbackRole('');
      setFeedbackContent('');
      fetchPilots();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilot || !newDeviceId) return;
    setRegisteringDevice(true);
    try {
      await telemetryApi.registerDevice({
        deviceId: newDeviceId,
        pilotId: selectedPilot.id,
        name: newDeviceName || `Sensor Node (${newDeviceId})`,
        location: newDeviceLocation || selectedPilot.location,
        hardwareModel: newDeviceHardware,
        firmwareVersion: newDeviceFirmware,
        sensorTypes: ['Optical Turbidity', 'pH Probe', 'TDS Conductivity Cell', 'Temperature'],
      });
      setShowRegisterDeviceModal(false);
      setNewDeviceId('');
      setNewDeviceName('');
      setNewDeviceLocation('');
      fetchPilotTelemetry(selectedPilot.id);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to register device');
    } finally {
      setRegisteringDevice(false);
    }
  };

  const getDeviceStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'ONLINE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">ONLINE</span>;
      case 'RECENTLY_SEEN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">RECENTLY SEEN</span>;
      case 'STALE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">STALE</span>;
      case 'OFFLINE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/20 text-slate-400 border border-slate-500/40">OFFLINE</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/40">WARNING</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/20 text-slate-400 border border-slate-500/40">{status || 'UNKNOWN'}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Active Field Trial</span>;
      case 'deploying':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Deploying Sensors</span>;
      case 'evaluating':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Evaluating Results</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">Pilot Completed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">{status}</span>;
    }
  };

  // Active Telemetry to display (Demo simulated or real ingested)
  const displayTelemetry = isDemoActive ? demoState?.latestTelemetry : latestTelemetry;

  return (
    <Layout title="Pilot Deployments & Operations" subtitle="Field trials, sensor node streams, manual reading audits & frontline sentiment">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-5 sm:p-8 border border-slate-700 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <Rocket size={13} className="text-emerald-400" />
                  Real-World Operations
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">[EDGE & MANUAL INGESTION]</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Pilot Program Operations & Field Trials
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Empirical validation requires physical deployment in real operating conditions. Track field testbeds, register IoT sensor hardware, log manual water quality readings, and manage on-ground obstacles.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowCreatePilotModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition"
              >
                <Plus size={15} />
                New Pilot Deployment
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw size={32} className="animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">Loading pilot deployments and telemetry streams...</p>
          </div>
        ) : pilots.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Rocket size={48} className="mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold">No Pilot Deployments Active</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Launch a pilot program to begin deploying physical sensors, collecting field measurements, and validating outcomes.
            </p>
            <button
              onClick={() => setShowCreatePilotModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
            >
              <Plus size={15} />
              Launch First Field Pilot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pilots List */}
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Deployments ({pilots.length})
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">[SELECT TESTBED]</span>
              </div>

              <div className="space-y-3">
                {pilots.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPilot(p)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedPilot?.id === p.id
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                        {p.name || (p as any).title}
                      </h4>
                      {getStatusBadge(p.status)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                      <MapPin size={13} className="text-red-500 flex-shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Cohort: {p.cohortSize || (p as any).participantsCount || 'N/A'}</span>
                      <span>Issues: {p.issues?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Pilot Detail View */}
            {selectedPilot && (
              <div className="lg:col-span-2 space-y-6">
                {/* Pilot Details Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">[FIELD TESTBED ID: {selectedPilot.id}]</span>
                        {getStatusBadge(selectedPilot.status)}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                        {selectedPilot.name || (selectedPilot as any).title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowManualModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        <Send size={13} />
                        Log Manual Reading
                      </button>
                      <select
                        value={selectedPilot.status}
                        onChange={(e) => handleStatusChange(selectedPilot.id, e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="site_scouted">Site Scouted</option>
                        <option value="deploying">Deploying</option>
                        <option value="active">Active Field Trial</option>
                        <option value="evaluating">Evaluating</option>
                        <option value="completed">Completed</option>
                        <option value="scaled">Nationally Scaled</option>
                      </select>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                      <strong className="text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{selectedPilot.location}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cohort / Testbed</span>
                      <strong className="text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{selectedPilot.cohortSize || (selectedPilot as any).participantsCount || '100 Households'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Partner Body</span>
                      <strong className="text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{selectedPilot.partnerOrganization || (selectedPilot as any).organization || 'District Administration'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Timeline</span>
                      <strong className="text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                        {selectedPilot.startDate ? `${selectedPilot.startDate} – ${selectedPilot.endDate || 'Active'}` : 'Ongoing Pilot'}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedPilot.description || (selectedPilot as any).objectives?.join(', ')}
                  </p>

                  {/* Success Criteria */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Success Thresholds:</span>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPilot.successCriteria || (selectedPilot as any).objectives || ['TDS < 500 ppm', 'pH 6.5 - 8.5']).map((crit: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          {crit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Field Telemetry & Sensor Stream */}
                <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Activity size={16} className="text-emerald-400" />
                          Field Telemetry Stream & Anomaly Monitor
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Node: {displayTelemetry?.deviceId || (telemetryDevices[0]?.deviceId || 'node-alwar-01')} &bull; Ingestion: {displayTelemetry?.source || 'PHYSICAL_SENSOR'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        displayTelemetry?.evaluation?.status === 'CRITICAL' || displayTelemetry?.status === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        STATUS: {displayTelemetry?.evaluation?.status || displayTelemetry?.status || 'NORMAL'}
                      </span>
                      <button
                        onClick={() => fetchPilotTelemetry(selectedPilot.id)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                        title="Refresh stream"
                      >
                        <RefreshCw size={13} className={telemetryLoading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>

                  {/* 4-Sensor Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold"><Droplets size={12} className="text-blue-400" /> pH Probe</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          (displayTelemetry?.measurements?.ph ?? displayTelemetry?.ph ?? 7.2) < 6.5 || (displayTelemetry?.measurements?.ph ?? displayTelemetry?.ph ?? 7.2) > 8.5
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {(displayTelemetry?.measurements?.ph ?? displayTelemetry?.ph ?? 7.2) < 6.5 || (displayTelemetry?.measurements?.ph ?? displayTelemetry?.ph ?? 7.2) > 8.5 ? 'OUT OF BOUNDS' : 'SAFE'}
                        </span>
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        {displayTelemetry?.measurements?.ph ?? displayTelemetry?.ph ?? 7.2}
                      </div>
                      <div className="text-[10px] text-slate-500">Permissible: 6.5 - 8.5</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold"><Gauge size={12} className="text-amber-400" /> Turbidity</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          (displayTelemetry?.measurements?.turbidity ?? displayTelemetry?.turbidity ?? 2.8) > 5.0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {(displayTelemetry?.measurements?.turbidity ?? displayTelemetry?.turbidity ?? 2.8) > 5.0 ? 'ELEVATED' : 'NORMAL'}
                        </span>
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        {displayTelemetry?.measurements?.turbidity ?? displayTelemetry?.turbidity ?? 2.8} <span className="text-xs text-slate-400 font-normal">NTU</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Permissible: &lt; 5.0 NTU</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold"><Activity size={12} className="text-indigo-400" /> TDS / EC</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          (displayTelemetry?.measurements?.tds ?? displayTelemetry?.tds ?? 360) > 500
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {(displayTelemetry?.measurements?.tds ?? displayTelemetry?.tds ?? 360) > 500 ? 'HIGH' : 'SAFE'}
                        </span>
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        {displayTelemetry?.measurements?.tds ?? displayTelemetry?.tds ?? 360} <span className="text-xs text-slate-400 font-normal">ppm</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Desirable: &lt; 500 ppm</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold"><Thermometer size={12} className="text-rose-400" /> Temperature</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                          NORMAL
                        </span>
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        {displayTelemetry?.measurements?.temperature ?? displayTelemetry?.temperature ?? 26.4}°C
                      </div>
                      <div className="text-[10px] text-slate-500">Sensor Probe</div>
                    </div>
                  </div>

                  {/* Anomaly & Decision Alert Banner if Critical */}
                  {(displayTelemetry?.evaluation?.status === 'CRITICAL' || displayTelemetry?.status === 'CRITICAL' || (demoState?.decisionAlert && demoState.decisionAlert.severity === 'Critical')) && (
                    <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-xs flex items-start gap-2.5 text-red-200 animate-pulse">
                      <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-white block">
                          CRITICAL FIELD ANOMALY DETECTED: {displayTelemetry?.evaluation?.interpretation || demoState?.decisionAlert?.title || 'Threshold Violation'}
                        </span>
                        <span className="text-[11px] text-red-300 block">
                          Action Required: {displayTelemetry?.evaluation?.recommendedAction || demoState?.decisionAlert?.recommendedAction || 'Inspect filtration membrane and dispatch field maintenance.'}
                        </span>
                        <div className="pt-1">
                          <a href="/actions" className="inline-flex items-center gap-1 text-[11px] font-bold text-red-200 underline">
                            View & Dispatch Operational Action Tasks &rarr;
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Provisioned Hardware Nodes & Gateways Registry */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Cpu size={16} className="text-blue-600" />
                        Provisioned Field Hardware Nodes & Gateways ({telemetryDevices.length})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Autonomous edge nodes, micro-controllers and remote IoT telemetry units assigned to this deployment
                      </p>
                    </div>

                    <button
                      onClick={() => setShowRegisterDeviceModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap self-start sm:self-auto"
                    >
                      <Plus size={13} />
                      Register Hardware Node
                    </button>
                  </div>

                  {telemetryDevices.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                      <Cpu size={28} className="mx-auto text-slate-400" />
                      <p className="text-xs text-slate-500 font-medium">No physical hardware nodes currently registered for this testbed.</p>
                      <button
                        onClick={() => setShowRegisterDeviceModal(true)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        + Register First Edge Node
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {telemetryDevices.map((dev: any) => (
                        <div
                          key={dev.deviceId}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                  {dev.deviceId}
                                </span>
                              </div>
                              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {dev.name || 'Remote Monitoring Node'}
                              </h4>
                            </div>
                            <div>{getDeviceStatusBadge(dev.status)}</div>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-500">
                            <div className="flex items-center justify-between">
                              <span>Hardware:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{dev.hardwareModel || 'ESP32-S3 + LoRaWAN'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Firmware:</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{dev.firmwareVersion || 'v2.4.0'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Location:</span>
                              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{dev.location || selectedPilot.location}</span>
                            </div>
                            {dev.batteryLevel !== undefined && (
                              <div className="flex items-center justify-between">
                                <span>Battery:</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dev.batteryLevel}%</span>
                              </div>
                            )}
                            {dev.lastSeen && (
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px]">
                                <span>Last Active:</span>
                                <span className="font-mono">{new Date(dev.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-1.5 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                            <span className="text-[10px] text-slate-400">
                              Probes: {(dev.sensorTypes || ['pH', 'Turbidity', 'TDS']).length} active
                            </span>
                            <button
                              onClick={() => {
                                setManualDeviceId(dev.deviceId);
                                setShowManualModal(true);
                              }}
                              className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <Send size={11} /> Log Reading
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Field Issues Logged */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500" />
                      Field Obstacles & Operational Failure Logs ({selectedPilot.issues?.length || 0})
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">[AUDIT RECORD]</span>
                  </div>

                  <div className="space-y-2">
                    {selectedPilot.issues && selectedPilot.issues.length > 0 ? (
                      selectedPilot.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                                issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                issue.severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="text-[11px] text-slate-400">{issue.loggedAt}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{issue.description}</p>
                            {issue.resolutionNotes && (
                              <p className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                                Resolution: {issue.resolutionNotes}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {issue.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No field obstacles currently logged for this deployment.</p>
                    )}
                  </div>

                  {/* Add Issue Form */}
                  <form onSubmit={handleAddIssue} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Log real-world obstacle (e.g. sensor bio-fouling, power outage, salinity surge)..."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={issueSeverity}
                        onChange={(e: any) => setIssueSeverity(e.target.value)}
                        className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                      <button
                        type="submit"
                        disabled={submitting || !issueDescription}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50 whitespace-nowrap"
                      >
                        Log Issue
                      </button>
                    </div>
                  </form>
                </div>

                {/* Frontline Qualitative Feedback */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare size={16} className="text-blue-600" />
                      Frontline Community & Operator Feedback ({selectedPilot.feedback?.length || 0})
                    </h3>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden xs:inline">[QUALITATIVE SIGNALS]</span>
                  </div>

                  <div className="space-y-3">
                    {selectedPilot.feedback && selectedPilot.feedback.length > 0 ? (
                      selectedPilot.feedback.map((fb) => (
                        <div
                          key={fb.id}
                          className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {fb.authorName} <span className="text-slate-400 font-normal">({fb.role})</span>
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-semibold uppercase ${
                              fb.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' :
                              fb.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {fb.sentiment}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 italic">
                            "{fb.content}"
                          </p>
                          <span className="text-[10px] text-slate-400 block">{fb.submittedAt}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No community feedback entries recorded yet.</p>
                    )}
                  </div>

                  {/* Add Feedback Form */}
                  <form onSubmit={handleAddFeedback} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Stakeholder Name (e.g. Village Sarpanch, ASHA Worker)"
                        value={feedbackAuthor}
                        onChange={(e) => setFeedbackAuthor(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Role / Title (e.g. Water Committee Chairperson)"
                        value={feedbackRole}
                        onChange={(e) => setFeedbackRole(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <textarea
                        placeholder="Verbatim quote or field qualitative observation from local community..."
                        value={feedbackContent}
                        onChange={(e) => setFeedbackContent(e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <div className="flex sm:flex-col justify-between gap-1.5">
                        <select
                          value={feedbackSentiment}
                          onChange={(e: any) => setFeedbackSentiment(e.target.value)}
                          className="flex-1 sm:flex-initial px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <option value="positive">Positive</option>
                          <option value="neutral">Neutral</option>
                          <option value="negative">Negative</option>
                        </select>
                        <button
                          type="submit"
                          disabled={submitting || !feedbackContent || !feedbackAuthor}
                          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          Add Feedback
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Log Manual Field Telemetry */}
        {showManualModal && selectedPilot && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Log Manual Field Water Reading
                  </h3>
                </div>
                <button
                  onClick={() => setShowManualModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleLogManualTelemetry} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Device Node ID</label>
                  <input
                    type="text"
                    value={manualDeviceId}
                    onChange={(e) => setManualDeviceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">pH Level (6.5 - 8.5)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={manualPh}
                      onChange={(e) => setManualPh(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Turbidity (NTU &lt; 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualTurbidity}
                      onChange={(e) => setManualTurbidity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">TDS (ppm &lt; 500)</label>
                    <input
                      type="number"
                      step="1"
                      value={manualTds}
                      onChange={(e) => setManualTds(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualTemp}
                      onChange={(e) => setManualTemp(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>
                </div>

                {manualResult && (
                  <div className={`p-3 rounded-lg text-xs ${
                    manualResult.error
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {manualResult.error ? (
                      <div>Error: {manualResult.error}</div>
                    ) : (
                      <div>
                        Reading successfully persisted! Evaluation: <strong>{manualResult.data?.evaluation?.status}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {manualSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                    Submit Reading
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Pilot Deployment */}
        {showCreatePilotModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Rocket size={18} className="text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Launch New Pilot Deployment
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreatePilotModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreatePilot} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilot Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramanathapuram Desalination Trial"
                    value={newPilotName}
                    onChange={(e) => setNewPilotName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location / Panchayat</label>
                    <input
                      type="text"
                      placeholder="e.g. Mandapam, Tamil Nadu"
                      value={newPilotLocation}
                      onChange={(e) => setNewPilotLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cohort / Population</label>
                    <input
                      type="text"
                      placeholder="e.g. 150 Households"
                      value={newPilotCohort}
                      onChange={(e) => setNewPilotCohort(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Partner Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Tamil Nadu Water Board / IIT Madras"
                    value={newPilotPartner}
                    onChange={(e) => setNewPilotPartner(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deployment Description</label>
                  <textarea
                    rows={2}
                    placeholder="Operational objectives and pilot boundary conditions..."
                    value={newPilotDesc}
                    onChange={(e) => setNewPilotDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Success Criteria (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Fluoride < 1.0 mg/L, TDS < 400 ppm, 99% Node Uptime"
                    value={newPilotCriteria}
                    onChange={(e) => setNewPilotCriteria(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePilotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingPilot}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    Launch Pilot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Register Hardware Sensor Node */}
        {showRegisterDeviceModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Register Hardware Sensor Node
                  </h3>
                </div>
                <button
                  onClick={() => setShowRegisterDeviceModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleRegisterDevice} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Device ID / Hardware Serial *</label>
                  <input
                    type="text"
                    placeholder="e.g. node-chennai-01, esp32-lora-89"
                    value={newDeviceId}
                    onChange={(e) => setNewDeviceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Friendly Station Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mandapam Desalination Substation Node"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hardware Model / MCU</label>
                    <input
                      type="text"
                      placeholder="e.g. ESP32-S3 + SIM7600"
                      value={newDeviceHardware}
                      onChange={(e) => setNewDeviceHardware(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Firmware Release</label>
                    <input
                      type="text"
                      placeholder="e.g. v3.0.1-prod"
                      value={newDeviceFirmware}
                      onChange={(e) => setNewDeviceFirmware(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Field Location / GPS Coordinates</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramanathapuram (9.2800° N, 79.1200° E)"
                    value={newDeviceLocation}
                    onChange={(e) => setNewDeviceLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterDeviceModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-lg border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registeringDevice || !newDeviceId}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {registeringDevice ? 'Registering...' : 'Register Device'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
