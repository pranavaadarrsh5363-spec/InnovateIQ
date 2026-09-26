import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, RotateCcw, SkipForward, Sparkles, AlertTriangle,
  CheckCircle2, Clock, Activity, ShieldCheck, ArrowRight, X,
  ChevronDown, ChevronUp, Radio, Zap, Layers, ExternalLink,
  Droplets, Thermometer, Gauge, AlertOctagon, TrendingUp
} from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';
import { DemoStageInfo } from '../../types';

export default function JudgeDemoPanel() {
  const {
    demoState,
    isDemoActive,
    isPanelOpen,
    setIsPanelOpen,
    autoPlay,
    setAutoPlay,
    playSpeed,
    setPlaySpeed,
    startDemo,
    stepDemo,
    pauseDemo,
    resetDemo,
    jumpToStage,
    loading
  } = useDemo();

  const navigate = useNavigate();
  const [minimized, setMinimized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'events' | 'decision' | 'impact'>('overview');

  if (!isPanelOpen && !isDemoActive) {
    return null;
  }

  const currentStage = demoState?.currentStage;
  const stageIndex = demoState?.stageIndex ?? 0;
  const totalStages = demoState?.totalStages ?? 14;
  const latestTelemetry = demoState?.latestTelemetry;
  const decisionAlert = demoState?.decisionAlert;
  const events = demoState?.events ?? [];
  const impactMetrics = demoState?.impactComparison?.metrics ?? [];
  const isCompleted = demoState?.status === 'completed';

  const getStatusColor = (status?: string) => {
    if (status === 'CRITICAL') return 'bg-red-500/10 text-red-600 border-red-500/30';
    if (status === 'WARNING') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'critical') return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800 border border-red-200">CRITICAL</span>;
    if (sev === 'warning') return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">WARNING</span>;
    if (sev === 'success') return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">VERIFIED</span>;
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">INFO</span>;
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 border-b border-indigo-900/60 shadow-2xl relative z-40 transition-all duration-200">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCompleted ? 'bg-emerald-400' : autoPlay ? 'bg-amber-400' : 'bg-blue-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isCompleted ? 'bg-emerald-500' : autoPlay ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-wider text-amber-400 uppercase flex items-center gap-1">
                <Zap size={13} className="text-amber-400 fill-amber-400" />
                JUDGE EVALUATION DEMO MODE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 font-mono hidden sm:inline">
                SIMULATED SCENARIO
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 truncate">
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium truncate">{demoState?.scenario}</span>
          </div>
        </div>

        {/* Right: Stage Status & Control Buttons */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 sm:gap-3">
          {/* Stage Progress Indicator */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono">Stage:</span>
            <span className="font-bold text-blue-400">{stageIndex + 1}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{totalStages}</span>
            <span className="text-slate-300 font-semibold truncate max-w-[140px] sm:max-w-[200px] hidden xs:inline">
              ({currentStage?.title || 'Initializing'})
            </span>
          </div>

          {/* Interactive Play Controls */}
          <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-1 rounded-lg border border-slate-800">
            {autoPlay ? (
              <button
                onClick={pauseDemo}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition"
                title="Pause automated playback"
              >
                <Pause size={12} />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (isCompleted) startDemo();
                  else setAutoPlay(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 text-xs font-bold transition shadow-xs"
                title="Start automated stage progression"
              >
                <Play size={12} className="fill-white" />
                <span>{isCompleted ? 'Restart' : 'Auto Play'}</span>
              </button>
            )}

            <button
              onClick={() => stepDemo(undefined, true)}
              disabled={isCompleted}
              className="flex items-center gap-1 px-2 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 text-xs font-medium transition"
              title="Advance to next innovation stage"
            >
              <SkipForward size={13} />
              <span className="hidden sm:inline">Next</span>
            </button>

            <button
              onClick={resetDemo}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Reset demo state"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Speed Toggle */}
          <button
            onClick={() => setPlaySpeed(playSpeed === 3000 ? 1500 : 3000)}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            title="Toggle playback speed"
          >
            <Clock size={11} />
            <span>{playSpeed === 1500 ? '2x (1.5s)' : '1x (3s)'}</span>
          </button>

          {/* Minimize / Expand & Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(prev => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              aria-label={minimized ? 'Expand panel' : 'Minimize panel'}
            >
              {minimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              aria-label="Close demo bar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Interactive Demo Workspace */}
      {!minimized && (
        <div className="border-t border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 max-w-7xl mx-auto space-y-4">
          {/* 14-Stage Innovation Lifecycle Flow */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-blue-400" />
                14-Stage Innovation Lifecycle (Click stage to inspect)
              </span>
              {currentStage && (
                <button
                  onClick={() => navigate(currentStage.path)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 underline"
                >
                  Inspect Active Page: {currentStage.path} <ExternalLink size={11} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
              {demoState?.stages?.map((st: DemoStageInfo) => {
                const isPassed = st.index < stageIndex;
                const isCurrent = st.index === stageIndex;

                return (
                  <button
                    key={st.key}
                    onClick={() => jumpToStage(st, true)}
                    className={`p-2 rounded-lg text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[58px] ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-md scale-[1.02]'
                        : isPassed
                        ? 'bg-slate-800/90 text-emerald-300 hover:bg-slate-800 border border-slate-700/60'
                        : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/60 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-mono ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                        {st.index + 1}.
                      </span>
                      {isPassed ? (
                        <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] leading-tight line-clamp-2 truncate">{st.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Telemetry Stream & Sensors
            </button>
            <button
              onClick={() => setActiveTab('decision')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'decision'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Decision Alert
              {decisionAlert?.severity === 'Critical' && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === 'impact'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Measurable Impact Comparison
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === 'events'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Event Log ({events.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & TELEMETRY STREAM */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Telemetry Sensor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* pH Sensor */}
                <div className={`p-3.5 rounded-xl border bg-slate-900/90 ${getStatusColor(latestTelemetry?.status)}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Droplets size={14} className="text-blue-400" />
                      pH Sensor
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(latestTelemetry?.status)}`}>
                      {latestTelemetry?.ph !== undefined && (latestTelemetry.ph < 6.5 || latestTelemetry.ph > 8.5) ? 'ACIDIC SPIKE' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{latestTelemetry?.ph ?? 6.8}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Permissible: 6.5 – 8.5</span>
                    <span className="font-mono text-[10px] text-slate-500">Node: ALWAR-01</span>
                  </div>
                </div>

                {/* Turbidity Sensor */}
                <div className={`p-3.5 rounded-xl border bg-slate-900/90 ${getStatusColor(latestTelemetry?.status)}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Gauge size={14} className="text-amber-400" />
                      Turbidity (NTU)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(latestTelemetry?.status)}`}>
                      {latestTelemetry?.turbidity !== undefined && latestTelemetry.turbidity > 5.0 ? 'EXCEEDED' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{latestTelemetry?.turbidity ?? 4.2} <span className="text-sm font-normal text-slate-400">NTU</span></div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>BIS Limit: &lt; 5.0 NTU</span>
                    <span className="font-mono text-[10px] text-slate-500">Optical SEN0189</span>
                  </div>
                </div>

                {/* TDS Sensor */}
                <div className={`p-3.5 rounded-xl border bg-slate-900/90 ${getStatusColor(latestTelemetry?.status)}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Activity size={14} className="text-indigo-400" />
                      Total Dissolved Solids
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(latestTelemetry?.status)}`}>
                      {latestTelemetry?.tds !== undefined && latestTelemetry.tds > 500 ? 'ELEVATED' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{latestTelemetry?.tds ?? 390} <span className="text-sm font-normal text-slate-400">ppm</span></div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Desirable: &lt; 500 ppm</span>
                    <span className="font-mono text-[10px] text-slate-500">Conductivity Cell</span>
                  </div>
                </div>

                {/* Temperature Sensor */}
                <div className="p-3.5 rounded-xl border bg-slate-900/90 border-slate-800 text-slate-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Thermometer size={14} className="text-rose-400" />
                      Water Temp
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      STABLE
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{latestTelemetry?.temperature ?? 27.8}°C</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                    <span>Ambient Ambient: 32°C</span>
                    <span className="font-mono text-[10px] text-slate-500">DS18B20 Probe</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    SIMULATED FIELD DATA
                  </span>
                  <span className="text-slate-300 font-medium">
                    {latestTelemetry?.message || 'Continuous 10s sampling active from Alwar Field Pilot Network'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Timestamp: {latestTelemetry?.timeOffset} • Status: {latestTelemetry?.status}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI DECISION ENGINE ALERT */}
          {activeTab === 'decision' && decisionAlert && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <AlertOctagon size={18} className={decisionAlert.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'} />
                  <div>
                    <h4 className="text-sm font-bold text-white">{decisionAlert.title}</h4>
                    <p className="text-[11px] text-slate-400">Automated Reasoning & Multi-Factor Inference</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(decisionAlert.severity.toUpperCase())}`}>
                  {decisionAlert.severity} SEVERITY
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* 1. Observed Measurements */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Activity size={11} className="text-blue-400" />
                    1. Observed Field Telemetry
                  </span>
                  <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                    <div>pH: <span className="font-bold text-white">{decisionAlert.observedMeasurement.ph}</span></div>
                    <div>Turbidity: <span className="font-bold text-amber-400">{decisionAlert.observedMeasurement.turbidity}</span></div>
                    <div>TDS: <span className="font-bold text-white">{decisionAlert.observedMeasurement.tds}</span></div>
                    <div>Status: <span className="font-bold text-red-400">{decisionAlert.observedMeasurement.thresholdStatus}</span></div>
                  </div>
                </div>

                {/* 2. AI Interpretation */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" />
                    2. AI-Generated Interpretation
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {decisionAlert.aiInterpretation}
                  </p>
                  <div className="text-[10px] text-emerald-400 font-mono pt-1">
                    Confidence: {decisionAlert.confidenceScore}% (BIS IS 10500 Grounding)
                  </div>
                </div>

                {/* 3. Recommended Action */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-400" />
                    3. Recommended Action Plan
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-line">
                    {decisionAlert.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEASURABLE IMPACT COMPARISON */}
          {activeTab === 'impact' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Simulated Field Pilot Outcomes (Baseline vs. Active Intervention)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Simulated Demo Result
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {impactMetrics.map(m => (
                  <div key={m.label} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.category}</div>
                    <div className="font-bold text-white text-sm">{m.label}</div>
                    <div className="space-y-1 pt-1 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Baseline:</span>
                        <span className="line-through">{m.baseline}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Simulated Pilot:</span>
                        <span>{m.simulated}</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-center">
                      {m.improvement}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REAL-TIME EVENT STREAM */}
          {activeTab === 'events' && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs max-h-56 overflow-y-auto">
              {events.map((evt) => (
                <div key={evt.id} className="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5">{evt.time}</span>
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{evt.message}</span>
                        {getSeverityBadge(evt.severity)}
                      </div>
                      {evt.details && <p className="text-[11px] text-slate-400 mt-0.5">{evt.details}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 flex-shrink-0">
                    Stage {evt.stageIndex + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Demo Completed Card */}
          {isCompleted && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Evaluation Demo Complete (14 / 14 Stages Verified)</h4>
                  <p className="text-xs text-slate-300">
                    The rural water contamination problem was analyzed, cross-referenced with evidence, deployed in simulation, intervened, and cryptographically audited.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate('/audit')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
                >
                  <ShieldCheck size={13} />
                  <span>Inspect Audit Ledger</span>
                </button>
                <button
                  onClick={startDemo}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Restart Demo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
