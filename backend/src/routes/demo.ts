import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { auditRepository } from '../repositories/auditRepository';
import { telemetryRepository } from '../repositories/telemetryRepository';

const router = Router();

export interface DemoTelemetryPoint {
  timestamp: string;
  timeOffset: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  anomalyDetected: boolean;
  message?: string;
  isDemo: true;
}

export interface DemoEvent {
  id: string;
  time: string;
  eventType: string;
  message: string;
  details?: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  stageIndex: number;
  isDemo: true;
}

export interface DemoStageInfo {
  index: number;
  key: string;
  title: string;
  path: string;
  description: string;
  category: 'Problem & Intelligence' | 'Evidence & Tech' | 'Execution & Pilots' | 'Impact & Audit';
}

const DEMO_STAGES: DemoStageInfo[] = [
  { index: 0, key: 'problem', title: 'Problem Statement Identified', path: '/problems', description: 'Rural community water contamination problem registered with severity, constraints, and target stakeholders.', category: 'Problem & Intelligence' },
  { index: 1, key: 'intelligence', title: 'Problem Intelligence & Context Modeling', path: '/problems/prob-water-01/analyze', description: '16-dimensional root cause, ecosystem context, and stakeholder impact mapping.', category: 'Problem & Intelligence' },
  { index: 2, key: 'root-causes', title: 'Root Cause & Failure Mode Analysis', path: '/problems/prob-water-01/analyze', description: 'Isolating primary failure modes: agricultural fertilizer leaching, open well vulnerabilities, and delayed municipal testing.', category: 'Problem & Intelligence' },
  { index: 3, key: 'evidence-sources', title: 'Multi-Source Evidence Aggregation', path: '/evidence?problemId=prob-water-01', description: 'Querying live connectors (Jal Jeevan Mission, WHO Water Safety, CPCB, arXiv peer-reviewed literature).', category: 'Evidence & Tech' },
  { index: 4, key: 'evidence-scoring', title: 'Evidence Credibility & Regulatory Scoring', path: '/evidence?problemId=prob-water-01', description: 'Evaluating citations against BIS IS 10500:2012 Drinking Water Specification with 94.8% confidence.', category: 'Evidence & Tech' },
  { index: 5, key: 'decision-brief', title: 'AI Decision Brief Synthesis', path: '/problems/prob-water-01/decision-brief', description: 'Generating structured tradeoff matrix, risk boundaries, and sub-₹3,500 BOM constraints.', category: 'Evidence & Tech' },
  { index: 6, key: 'tech-matrix', title: 'Hardware & Architecture Selection', path: '/tech-recommendations?problemId=prob-water-01', description: 'Selecting ESP32 dual-core MCU, optical turbidity probe, analog pH meter, and LoRaWAN/MQTT mesh protocol.', category: 'Evidence & Tech' },
  { index: 7, key: 'pilot-deployment', title: 'Field Pilot Deployment Active', path: '/pilots?problemId=prob-water-01', description: 'Deploying Solar-Powered Water Quality Telemetry Network in Alwar District (4 village sensor nodes).', category: 'Execution & Pilots' },
  { index: 8, key: 'live-telemetry', title: 'Simulated Live Sensor Telemetry Stream', path: '/pilots?problemId=prob-water-01', description: 'Real-time telemetry streaming: Turbidity spike to 16.2 NTU and pH dropping to 5.7.', category: 'Execution & Pilots' },
  { index: 9, key: 'anomaly-detection', title: 'CRITICAL Anomaly Detected & Decision Alert', path: '/pilots?problemId=prob-water-01', description: 'Decision Engine triggers high-priority hazard alert: Observed measurements violate IS 10500 standards.', category: 'Execution & Pilots' },
  { index: 10, key: 'pilot-intervention', title: 'Frontline Community & Automated Intervention', path: '/pilots?problemId=prob-water-01', description: 'Automated vernacular SMS broadcast to 1,200 households and relay activation of solar UV/flocculation unit.', category: 'Execution & Pilots' },
  { index: 11, key: 'telemetry-restored', title: 'Water Potability Normalization', path: '/pilots?problemId=prob-water-01', description: 'Post-intervention sensor readings confirm potability restored (pH 6.7, Turbidity 4.6 NTU, TDS 385 ppm).', category: 'Execution & Pilots' },
  { index: 12, key: 'impact-measurement', title: 'Measurable Impact KPI Verification', path: '/impact?problemId=prob-water-01', description: 'Detection time reduced from 72h to 4.5h; False alerts reduced to 6.8%; Continuous monitoring coverage at 81.5%.', category: 'Impact & Audit' },
  { index: 13, key: 'audit-ledger', title: 'Immutable Audit Ledger Signed & Completed', path: '/audit', description: 'All telemetry packets, AI inferences, alerts, and user interventions verified and immutably recorded.', category: 'Impact & Audit' },
];

const TELEMETRY_PROFILE: { ph: number; turbidity: number; tds: number; temp: number; status: 'NORMAL' | 'WARNING' | 'CRITICAL'; anomaly: boolean; msg: string }[] = [
  { ph: 6.8, turbidity: 4.2, tds: 390, temp: 27.8, status: 'NORMAL', anomaly: false, msg: 'Normal baseline potability' },
  { ph: 6.7, turbidity: 4.8, tds: 405, temp: 28.0, status: 'NORMAL', anomaly: false, msg: 'Stable groundwater reading' },
  { ph: 6.6, turbidity: 5.8, tds: 420, temp: 28.2, status: 'NORMAL', anomaly: false, msg: 'Minor diurnal variance' },
  { ph: 6.5, turbidity: 7.8, tds: 450, temp: 28.4, status: 'WARNING', anomaly: false, msg: 'Turbidity rising above desirable 5.0 NTU threshold' },
  { ph: 6.4, turbidity: 9.6, tds: 510, temp: 28.8, status: 'WARNING', anomaly: false, msg: 'Elevated suspended particulate matter detected' },
  { ph: 6.3, turbidity: 11.4, tds: 580, temp: 29.1, status: 'WARNING', anomaly: false, msg: 'Continuous upward turbidity trajectory' },
  { ph: 6.1, turbidity: 14.1, tds: 640, temp: 29.3, status: 'CRITICAL', anomaly: true, msg: 'Approaching critical contamination limit' },
  { ph: 5.9, turbidity: 15.6, tds: 690, temp: 29.4, status: 'CRITICAL', anomaly: true, msg: 'Severe acidification & high particulate suspension' },
  { ph: 5.7, turbidity: 16.2, tds: 710, temp: 29.4, status: 'CRITICAL', anomaly: true, msg: 'PEAK CONTAMINATION SPIKE: Exceeds BIS IS 10500 limits' },
  { ph: 5.8, turbidity: 15.1, tds: 670, temp: 29.2, status: 'CRITICAL', anomaly: true, msg: 'Intervention active: Automated flocculation initiated' },
  { ph: 6.2, turbidity: 9.2, tds: 520, temp: 28.8, status: 'WARNING', anomaly: false, msg: 'Turbidity clearing rapidly post-flocculation' },
  { ph: 6.5, turbidity: 5.9, tds: 430, temp: 28.4, status: 'NORMAL', anomaly: false, msg: 'pH returning to neutral range (6.5 - 8.5)' },
  { ph: 6.7, turbidity: 4.6, tds: 385, temp: 28.1, status: 'NORMAL', anomaly: false, msg: 'Water fully safe for community consumption' },
  { ph: 6.8, turbidity: 4.3, tds: 380, temp: 28.0, status: 'NORMAL', anomaly: false, msg: 'Sustained safe telemetry; pilot cycle validated' },
];

// In-Memory Demo State
let demoState = {
  status: 'idle' as 'idle' | 'running' | 'paused' | 'completed',
  scenario: 'Rural Community Water Contamination Early Warning',
  problemId: 'prob-water-01',
  stageIndex: 0,
  totalStages: DEMO_STAGES.length,
  telemetryHistory: [] as DemoTelemetryPoint[],
  events: [] as DemoEvent[],
  isDemo: true as const,
};

function formatTime(d: Date = new Date()): string {
  return d.toTimeString().split(' ')[0];
}

function syncToAuditLedger(event: DemoEvent) {
  const auditEntry = {
    id: `audit-demo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: 'demo-judge',
    userName: 'Judge Evaluation Demo',
    userRole: 'admin',
    action: `[DEMO] ${event.eventType}`,
    timestamp: new Date().toISOString(),
    entityType: 'Pilot',
    entityId: 'pilot-alwar-01',
    details: `[SIMULATED FIELD DATA] ${event.message}${event.details ? ' — ' + event.details : ''}`,
    isDemo: true,
  };
  (db as any).auditLogs.unshift(auditEntry);
  auditRepository.create(auditEntry).catch(() => {});
}

function buildDecisionAlert(reading: typeof TELEMETRY_PROFILE[0]) {
  const isCritical = reading.status === 'CRITICAL';
  return {
    title: isCritical
      ? 'CRITICAL FIELD ALERT — Turbidity & Acidity Threshold Violation'
      : 'TELEMETRY STATUS — Standard Parameter Monitoring',
    severity: isCritical ? 'Critical' : reading.status === 'WARNING' ? 'Medium' : 'Low',
    observedMeasurement: {
      ph: `${reading.ph} (Permissible: 6.5 - 8.5)`,
      turbidity: `${reading.turbidity} NTU (Permissible: < 5.0 NTU)`,
      tds: `${reading.tds} ppm (Desirable: < 500 ppm)`,
      temperature: `${reading.temp}°C`,
      thresholdStatus: isCritical ? 'CRITICAL THRESHOLD VIOLATION' : reading.status,
    },
    aiInterpretation: isCritical
      ? 'Sudden co-occurrence of acute turbidity spike (+285%) and pH drop (-16.2%) indicates high probability of upstream agricultural fertilizer/effluent leaching into feeder aquifer.'
      : 'Sensor telemetry is within expected variance parameters. No acute health threat identified.',
    recommendedAction: isCritical
      ? '1. Dispatch high-priority vernacular SMS broadcast to 1,200 village households.\n2. Trigger solar UV/flocculation automated chemical dosing relay.\n3. Dispatch field technician for physical sample verification at Well #3.'
      : 'Continue continuous 10-second sampling and maintain standard baseline telemetry stream.',
    riskAssessment: isCritical
      ? 'High risk of acute gastrointestinal outbreak if untreated water reaches primary distribution points within the next 3 hours.'
      : 'Negligible immediate public health risk.',
    confidenceScore: 94.8,
    isDemo: true as const,
  };
}

function getImpactComparison(stageIndex: number) {
  const hasIntervention = stageIndex >= 10;
  return {
    metrics: [
      {
        label: 'Contamination Detection Time',
        baseline: '72.0 hrs',
        simulated: hasIntervention ? '4.5 hrs' : '38.0 hrs',
        improvement: hasIntervention ? '-93.7% (Faster Action)' : '-47.2%',
        category: 'Time Efficiency',
      },
      {
        label: 'False Alarm Rate',
        baseline: '18.2%',
        simulated: hasIntervention ? '6.8%' : '11.5%',
        improvement: hasIntervention ? '-62.6% (Higher Precision)' : '-36.8%',
        category: 'Accuracy',
      },
      {
        label: 'Continuous Monitoring Coverage',
        baseline: '42.0%',
        simulated: stageIndex >= 7 ? '81.5%' : '55.0%',
        improvement: stageIndex >= 7 ? '+94.0% (Real-time)' : '+31.0%',
        category: 'Operational',
      },
      {
        label: 'Waterborne Illness Risk Index',
        baseline: 'High (0.78)',
        simulated: hasIntervention ? 'Low (0.12)' : 'Moderate (0.45)',
        improvement: hasIntervention ? '-84.6% Risk Mitigation' : '-42.3%',
        category: 'Health & Safety',
      },
    ],
    isDemo: true as const,
  };
}

// POST /api/demo/start
router.post('/start', (_req: Request, res: Response) => {
  demoState = {
    status: 'running',
    scenario: 'Rural Community Water Contamination Early Warning',
    problemId: 'prob-water-01',
    stageIndex: 0,
    totalStages: DEMO_STAGES.length,
    telemetryHistory: [],
    events: [],
    isDemo: true,
  };

  const initialTelemetry: DemoTelemetryPoint = {
    timestamp: new Date().toISOString(),
    timeOffset: formatTime(),
    ph: TELEMETRY_PROFILE[0].ph,
    turbidity: TELEMETRY_PROFILE[0].turbidity,
    tds: TELEMETRY_PROFILE[0].tds,
    temperature: TELEMETRY_PROFILE[0].temp,
    status: TELEMETRY_PROFILE[0].status,
    anomalyDetected: TELEMETRY_PROFILE[0].anomaly,
    message: TELEMETRY_PROFILE[0].msg,
    isDemo: true,
  };
  demoState.telemetryHistory.push(initialTelemetry);

  const startEvent: DemoEvent = {
    id: `evt-${Date.now()}-0`,
    time: formatTime(),
    eventType: 'DEMO_STARTED',
    message: 'Evaluation Demo initialized for Rural Community Water Contamination scenario',
    details: 'Loaded problem prob-water-01 with baseline IoT sensor parameters',
    severity: 'info',
    stageIndex: 0,
    isDemo: true,
  };
  demoState.events.push(startEvent);
  syncToAuditLedger(startEvent);

  return res.json(buildFullStatusResponse());
});

// POST /api/demo/step (advance to next stage or specific stage)
router.post('/step', (req: Request, res: Response) => {
  const targetStage = typeof req.body.stageIndex === 'number'
    ? Math.max(0, Math.min(DEMO_STAGES.length - 1, req.body.stageIndex))
    : Math.min(DEMO_STAGES.length - 1, demoState.stageIndex + 1);

  demoState.stageIndex = targetStage;
  if (targetStage === DEMO_STAGES.length - 1) {
    demoState.status = 'completed';
  } else {
    demoState.status = 'running';
  }

  const profile = TELEMETRY_PROFILE[targetStage] || TELEMETRY_PROFILE[TELEMETRY_PROFILE.length - 1];
  const stage = DEMO_STAGES[targetStage];

  const point: DemoTelemetryPoint = {
    timestamp: new Date().toISOString(),
    timeOffset: formatTime(),
    ph: profile.ph,
    turbidity: profile.turbidity,
    tds: profile.tds,
    temperature: profile.temp,
    status: profile.status,
    anomalyDetected: profile.anomaly,
    message: profile.msg,
    isDemo: true,
  };
  demoState.telemetryHistory.push(point);

  // Keep last 20 telemetry points
  if (demoState.telemetryHistory.length > 20) {
    demoState.telemetryHistory.shift();
  }

  let eventType = 'STAGE_TRANSITION';
  let severity: 'info' | 'warning' | 'critical' | 'success' = 'info';

  if (targetStage === 0) eventType = 'PROBLEM_IDENTIFIED';
  else if (targetStage === 1) eventType = 'INTELLIGENCE_MODELING';
  else if (targetStage === 3) eventType = 'EVIDENCE_RETRIEVED';
  else if (targetStage === 5) eventType = 'DECISION_BRIEF_SYNTHESIZED';
  else if (targetStage === 7) eventType = 'PILOT_DEPLOYED';
  else if (targetStage === 8) { eventType = 'TELEMETRY_RECEIVED'; severity = 'warning'; }
  else if (targetStage === 9) { eventType = 'CRITICAL_ANOMALY_DETECTED'; severity = 'critical'; }
  else if (targetStage === 10) { eventType = 'PILOT_INTERVENTION_TRIGGERED'; severity = 'critical'; }
  else if (targetStage === 11) { eventType = 'WATER_QUALITY_RESTORED'; severity = 'success'; }
  else if (targetStage === 12) { eventType = 'IMPACT_METRICS_UPDATED'; severity = 'success'; }
  else if (targetStage === 13) { eventType = 'DEMO_COMPLETED'; severity = 'success'; }

  const newEvent: DemoEvent = {
    id: `evt-${Date.now()}-${targetStage}`,
    time: formatTime(),
    eventType,
    message: stage.title,
    details: stage.description,
    severity,
    stageIndex: targetStage,
    isDemo: true,
  };
  demoState.events.push(newEvent);
  syncToAuditLedger(newEvent);

  return res.json(buildFullStatusResponse());
});

// POST /api/demo/pause
router.post('/pause', (_req: Request, res: Response) => {
  demoState.status = 'paused';
  return res.json(buildFullStatusResponse());
});

// POST /api/demo/reset
router.post('/reset', async (_req: Request, res: Response) => {
  demoState = {
    status: 'idle',
    scenario: 'Rural Community Water Contamination Early Warning',
    problemId: 'prob-water-01',
    stageIndex: 0,
    totalStages: DEMO_STAGES.length,
    telemetryHistory: [],
    events: [],
    isDemo: true,
  };
  await auditRepository.clearDemoLogs().catch(() => 0);
  await telemetryRepository.clearDemoTelemetry().catch(() => 0);
  return res.json(buildFullStatusResponse());
});

// GET /api/demo/status
router.get('/status', (_req: Request, res: Response) => {
  return res.json(buildFullStatusResponse());
});

// GET /api/demo/telemetry
router.get('/telemetry', (_req: Request, res: Response) => {
  return res.json({
    latest: demoState.telemetryHistory[demoState.telemetryHistory.length - 1] || null,
    history: demoState.telemetryHistory,
    isDemo: true,
  });
});

// GET /api/demo/events
router.get('/events', (_req: Request, res: Response) => {
  return res.json({
    events: demoState.events,
    isDemo: true,
  });
});

// GET /api/demo/readiness (Pre-flight evaluation check for SIH judges)
router.get('/readiness', async (_req: Request, res: Response) => {
  try {
    const checks = {
      apiProcess: true,
      demoScenarioLoaded: Boolean(demoState.scenario && demoState.problemId === 'prob-water-01'),
      totalStagesConfigured: DEMO_STAGES.length === 14,
      telemetryProfilesLoaded: TELEMETRY_PROFILE.length >= 14,
      seedDataAvailable: Array.isArray((db as any).problems) && (db as any).problems.some((p: any) => p.id === 'prob-water-01'),
      pilotAvailable: Array.isArray((db as any).pilotPrograms) && (db as any).pilotPrograms.some((p: any) => p.id === 'pilot-alwar-01'),
      auditSubsystemReady: true,
    };

    const isReady = Object.values(checks).every(Boolean);

    return res.json({
      status: isReady ? 'READY' : 'NOT_READY',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      scenario: demoState.scenario,
      problemId: demoState.problemId,
      totalStages: DEMO_STAGES.length,
      checks,
      isDemo: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'NOT_READY', error: err.message, isDemo: true });
  }
});

function buildFullStatusResponse() {
  const currentStage = DEMO_STAGES[demoState.stageIndex] || DEMO_STAGES[0];
  const latestProfile = TELEMETRY_PROFILE[demoState.stageIndex] || TELEMETRY_PROFILE[0];
  const latestTelemetry = demoState.telemetryHistory[demoState.telemetryHistory.length - 1] || {
    timestamp: new Date().toISOString(),
    timeOffset: formatTime(),
    ph: latestProfile.ph,
    turbidity: latestProfile.turbidity,
    tds: latestProfile.tds,
    temperature: latestProfile.temp,
    status: latestProfile.status,
    anomalyDetected: latestProfile.anomaly,
    message: latestProfile.msg,
    isDemo: true,
  };

  return {
    status: demoState.status,
    scenario: demoState.scenario,
    problemId: demoState.problemId,
    stageIndex: demoState.stageIndex,
    totalStages: demoState.totalStages,
    progressLabel: `${demoState.stageIndex + 1} / ${demoState.totalStages}`,
    currentStage,
    stages: DEMO_STAGES,
    latestTelemetry,
    telemetryHistory: demoState.telemetryHistory,
    events: demoState.events,
    decisionAlert: buildDecisionAlert(latestProfile),
    impactComparison: getImpactComparison(demoState.stageIndex),
    isDemo: true,
  };
}

export default router;
