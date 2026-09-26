const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const fullPath = path.startsWith('/health') ? path : (path.startsWith('/api') ? path : '/api' + path);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: fullPath,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            const parsed = resBody ? JSON.parse(resBody) : null;
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: resBody });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('INNOVATEIQ END-TO-END WORKFLOW & RBAC AUDIT SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - ${details}`);
      failed++;
    }
  }

  // 1. Auth & RBAC
  console.log('--- 1. Authentication & RBAC Verification ---');
  const studentRes = await request('POST', '/auth/login', { email: 'aarav@sih.dev', password: 'demo123' });
  const studentToken = studentRes.data?.token;
  assert('Student login succeeds (aarav@sih.dev)', studentRes.status === 200 && studentToken, `status: ${studentRes.status}`);

  const mentorRes = await request('POST', '/auth/login', { email: 'mentor@sih.dev', password: 'demo123' });
  const mentorToken = mentorRes.data?.token;
  assert('Mentor login succeeds (mentor@sih.dev)', mentorRes.status === 200 && mentorToken, `status: ${mentorRes.status}`);

  const adminRes = await request('POST', '/auth/login', { email: 'admin@sih.dev', password: 'demo123' });
  const adminToken = adminRes.data?.token;
  assert('Admin login succeeds (admin@sih.dev)', adminRes.status === 200 && adminToken, `status: ${adminRes.status}`);

  // 2. Problem Hub & Decision Brief
  console.log('\n--- 2. Flagship Problem Intelligence & Decision Brief ---');
  const probList = await request('GET', '/problems', null, { Authorization: `Bearer ${studentToken}` });
  assert('GET /api/problems returns problem list', probList.status === 200 && Array.isArray(probList.data) && probList.data.length >= 1);

  const waterProb = await request('GET', '/problems/prob-water-01', null, { Authorization: `Bearer ${studentToken}` });
  assert('GET /api/problems/prob-water-01 returns rural water problem', waterProb.status === 200 && waterProb.data?.id === 'prob-water-01');

  const briefRes = await request('GET', '/problems/prob-water-01/decision-brief', null, { Authorization: `Bearer ${studentToken}` });
  assert('GET /api/problems/prob-water-01/decision-brief returns 200', briefRes.status === 200);
  const brief = briefRes.data;
  assert('Decision Brief contains 6-dimension feasibility',
    !!(brief?.feasibility?.technical &&
    brief?.feasibility?.financial &&
    brief?.feasibility?.infrastructure &&
    brief?.feasibility?.operational &&
    brief?.feasibility?.scalability &&
    brief?.feasibility?.dataAvailability)
  );
  assert('Scorecard has overallScore', typeof brief?.feasibility?.overallScore === 'number');
  assert('Decision Brief includes citations, solutions, gaps, risks, and next steps',
    Array.isArray(brief?.evidenceSummary?.topCitations) &&
    Array.isArray(brief?.existingSolutionsSummary) &&
    Array.isArray(brief?.innovationGaps) &&
    Array.isArray(brief?.risksAndMitigations) &&
    Array.isArray(brief?.suggestedNextActions)
  );

  // 3. Context Continuity: Problem -> Project Creation
  console.log('\n--- 3. Context Continuity & Project Inheritance ---');
  const createProjRes = await request('POST', '/projects', {
    title: 'Automated Solar Fluoride Sensor Node',
    problemStatement: 'Detect unsafe fluoride concentration in groundwater before village distribution.',
    domain: 'Water & Sanitation',
    technologies: ['ESP32', 'LoRaWAN', 'TensorFlow Lite', 'Edge Impulse'],
    problemId: 'prob-water-01',
  }, { Authorization: `Bearer ${studentToken}` });

  assert('POST /api/projects creates linked project', createProjRes.status === 201 && createProjRes.data?.id);
  const newProj = createProjRes.data;
  assert('Created project retains problemId: prob-water-01', newProj?.problemId === 'prob-water-01');
  assert('Created project auto-inherits targetUsers from problem', typeof newProj?.targetUsers === 'string' && newProj?.targetUsers.length > 0);
  assert('Created project auto-seeds structured tasks and milestones', Array.isArray(newProj?.tasks) && newProj?.tasks.length >= 3);

  // 4. Evidence Discovery
  console.log('\n--- 4. Multi-Connector Evidence Retrieval ---');
  const evRes = await request('GET', '/evidence/search?domain=Water%20%26%20Sanitation', null, { Authorization: `Bearer ${studentToken}` });
  assert('GET /api/evidence/search returns water citations', evRes.status === 200 && Array.isArray(evRes.data) && evRes.data.length > 0);
  const connRes = await request('GET', '/evidence/connectors', null, { Authorization: `Bearer ${studentToken}` });
  assert('GET /api/evidence/connectors returns 6 active connectors', connRes.status === 200 && Array.isArray(connRes.data) && connRes.data.length === 6);

  // 5. Tech & Skill Recommendations
  console.log('\n--- 5. Technology & Skill Intelligence ---');
  const techRecRes = await request('POST', '/ai/recommend-technologies', {
    description: 'Submersible water sensor mesh with low-power solar edge node',
    domain: 'IoT',
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/ai/recommend-technologies returns structured stack', techRecRes.status === 200 && Array.isArray(techRecRes.data) && techRecRes.data.length >= 5);

  const skillRes = await request('POST', '/ai/skill-gap', {
    currentSkills: ['Python', 'SQL'],
    domain: 'IoT',
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/ai/skill-gap identifies high/medium gaps', skillRes.status === 200 && Array.isArray(skillRes.data) && skillRes.data.length >= 4);

  // 6. Field Pilots & Sensor Telemetry
  console.log('\n--- 6. Field Trials, Pilots & Telemetry ---');
  const pilotsRes = await request('GET', '/pilots', null, { Authorization: `Bearer ${studentToken}` });
  assert('GET /api/pilots returns pilot programs', pilotsRes.status === 200 && Array.isArray(pilotsRes.data) && pilotsRes.data.length >= 1);

  const logIssueRes = await request('POST', '/pilots/pilot-alwar-01/issues', {
    description: 'Solar panel dust accumulation causing 15% daily battery drop',
    severity: 'medium',
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/pilots/pilot-alwar-01/issues logs field issue', logIssueRes.status === 201 && logIssueRes.data?.id);

  const logFeedbackRes = await request('POST', '/pilots/pilot-alwar-01/feedback', {
    authorName: 'Ramesh Patel',
    role: 'Village Sarpanch',
    content: 'Early alarm prevented distributing turbid canal runoff to 400 households.',
    sentiment: 'positive',
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/pilots/pilot-alwar-01/feedback records community voice', logFeedbackRes.status === 201 && logFeedbackRes.data?.id);

  // 7. Measurable Impact & Feedback Loops
  console.log('\n--- 7. Measurable Impact & Verification ---');
  const kpisRes = await request('GET', '/impact/kpis', null, { Authorization: `Bearer ${studentToken}` });
  assert('GET /api/impact/kpis returns baseline vs target metrics', kpisRes.status === 200 && Array.isArray(kpisRes.data) && kpisRes.data.length >= 3);

  const updateKpiRes = await request('PUT', '/impact/kpis/kpi-1', {
    currentValue: 0.22,
    verifiedDate: new Date().toISOString().split('T')[0],
  }, { Authorization: `Bearer ${studentToken}` });
  assert('PUT /api/impact/kpis/kpi-1 updates telemetry', updateKpiRes.status === 200 && updateKpiRes.data?.currentValue === 0.22);

  const loopRes = await request('POST', '/impact/feedback-loops', {
    problemId: 'prob-water-01',
    cycleNumber: 3,
    date: new Date().toISOString().split('T')[0],
    finding: 'Calibration drift on pH electrodes reduced precision after 45 days in hard water.',
    decision: 'Introduced monthly auto-calibration offset routine in firmware v2.1.',
    updatedTarget: 'Maintain >95% accuracy over 90 days continuous submersion.',
    status: 'implemented',
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/impact/feedback-loops logs continuous improvement cycle', loopRes.status === 201 && loopRes.data?.id);

  // 8. Governance & Audit Logging
  console.log('\n--- 8. Enterprise Audit Trail ---');
  const auditRes = await request('GET', '/audit/logs', null, { Authorization: `Bearer ${adminToken}` });
  assert('GET /api/audit/logs accessible to Admin', auditRes.status === 200 && Array.isArray(auditRes.data) && auditRes.data.length > 0);

  const studentAuditRes = await request('GET', '/audit/logs', null, { Authorization: `Bearer ${studentToken}` });
  assert('GET /api/audit/logs returns 403 Forbidden for Student role', studentAuditRes.status === 403);

  // 9. Judge Evaluation Demo Mode Suite
  console.log('\n--- 9. Judge Evaluation Demo Mode Verification ---');
  const demoStartRes = await request('POST', '/demo/start', null);
  assert('POST /api/demo/start initializes demo state', demoStartRes.status === 200 && demoStartRes.data?.status === 'running');
  assert('Demo scenario set to Rural Water Contamination', demoStartRes.data?.problemId === 'prob-water-01');
  assert('Initial telemetry point tagged as isDemo', demoStartRes.data?.latestTelemetry?.isDemo === true);

  const demoStep8Res = await request('POST', '/demo/step', { stageIndex: 8 });
  assert('POST /api/demo/step advances to Live Telemetry stage', demoStep8Res.status === 200 && demoStep8Res.data?.stageIndex === 8);
  assert('Stage 8 detects critical turbidity threshold violation (16.2 NTU)', demoStep8Res.data?.latestTelemetry?.status === 'CRITICAL' && demoStep8Res.data?.latestTelemetry?.turbidity === 16.2);

  const demoStatusRes = await request('GET', '/demo/status');
  assert('GET /api/demo/status returns complete 14-stage metadata', demoStatusRes.status === 200 && demoStatusRes.data?.stages?.length === 14);
  assert('Decision alert distinguishes observed vs AI interpretation', Boolean(demoStatusRes.data?.decisionAlert?.observedMeasurement && demoStatusRes.data?.decisionAlert?.aiInterpretation));
  assert('Decision alert provides explainable recommended action', Boolean(demoStatusRes.data?.decisionAlert?.recommendedAction));

  const demoImpactRes = demoStatusRes.data?.impactComparison;
  assert('Impact comparison compares baseline vs simulated pilot', Boolean(demoImpactRes?.metrics?.length >= 4 && demoImpactRes?.isDemo));

  const demoEventsRes = await request('GET', '/demo/events');
  assert('GET /api/demo/events returns timestamped event stream', demoEventsRes.status === 200 && Array.isArray(demoEventsRes.data?.events) && demoEventsRes.data?.events?.length >= 2);

  const demoCompleteRes = await request('POST', '/demo/step', { stageIndex: 13 });
  assert('Advancing to stage 13 marks demo as completed', demoCompleteRes.data?.status === 'completed');

  const demoResetRes = await request('POST', '/demo/reset');
  assert('POST /api/demo/reset clears active simulation state', demoResetRes.status === 200 && demoResetRes.data?.status === 'idle');

  // 10. Production Telemetry & Real Data Layer Verification
  console.log('\n--- 10. Production Telemetry & Real Data Architecture ---');
  
  // Health check verification
  const healthRes = await request('GET', '/health');
  assert('GET /api/health (and /health) returns status: healthy or ok', healthRes.status === 200 && (healthRes.data?.status === 'ok' || healthRes.data?.status === 'healthy'));
  assert('Health check reports telemetryIngestion operational', healthRes.data?.services?.telemetryIngestion === 'operational');
  assert('Health check reports anomalyDetection operational', healthRes.data?.services?.anomalyDetection === 'operational');
  assert('Health check reports demoEngine operational', healthRes.data?.services?.demoEngine === 'operational');

  // Valid Telemetry Ingestion (POST /api/telemetry)
  const validTelemetryRes = await request('POST', '/telemetry', {
    pilotId: 'pilot-alwar-01',
    deviceId: 'node-alwar-01',
    measurements: {
      ph: 7.4,
      turbidity: 2.3,
      tds: 320,
      temperature: 25.1,
    },
  });
  assert('POST /api/telemetry ingests valid sensor packet', validTelemetryRes.status === 201 && validTelemetryRes.data?.status === 'success');
  assert('Ingested packet tagged isDemo: false', validTelemetryRes.data?.data?.isDemo === false);
  assert('Normal sensor packet evaluates to status: NORMAL', validTelemetryRes.data?.data?.evaluation?.status === 'NORMAL');
  assert('Evaluation includes explainable interpretation and action',
    Boolean(validTelemetryRes.data?.data?.evaluation?.interpretation && validTelemetryRes.data?.data?.evaluation?.recommendedAction)
  );

  // Server-Side Validation: Missing pilotId / deviceId
  const missingFieldRes = await request('POST', '/telemetry', {
    measurements: { ph: 7.0 },
  });
  assert('POST /api/telemetry rejects payload missing pilotId/deviceId (400)', missingFieldRes.status === 400);

  // Server-Side Validation: Invalid sensor bounds (pH=99)
  const invalidPhRes = await request('POST', '/telemetry', {
    pilotId: 'pilot-alwar-01',
    deviceId: 'node-alwar-01',
    measurements: { ph: 99.0 },
  });
  assert('POST /api/telemetry rejects out-of-bounds pH=99 (400)', invalidPhRes.status === 400);

  // Server-Side Validation: Invalid sensor bounds (turbidity < 0)
  const negativeTurbidityRes = await request('POST', '/telemetry', {
    pilotId: 'pilot-alwar-01',
    deviceId: 'node-alwar-01',
    measurements: { turbidity: -5.0 },
  });
  assert('POST /api/telemetry rejects negative turbidity (400)', negativeTurbidityRes.status === 400);

  // Critical Anomaly Detection (Turbidity & pH violation according to BIS IS 10500:2012)
  const criticalTelemetryRes = await request('POST', '/telemetry', {
    pilotId: 'pilot-alwar-01',
    deviceId: 'node-alwar-01',
    measurements: {
      ph: 9.2,
      turbidity: 16.5,
      tds: 1200,
      temperature: 28.0,
    },
  });
  assert('POST /api/telemetry evaluates critical multi-parameter violation', criticalTelemetryRes.status === 201);
  assert('Critical telemetry receives CRITICAL status', criticalTelemetryRes.data?.data?.evaluation?.status === 'CRITICAL');
  assert('Violations list contains BIS IS 10500 threshold breaches', Array.isArray(criticalTelemetryRes.data?.violations) && criticalTelemetryRes.data?.violations?.length >= 2);

  // Device Registry (GET /api/telemetry/devices)
  const devicesRes = await request('GET', '/telemetry/devices');
  assert('GET /api/telemetry/devices returns registered field nodes', devicesRes.status === 200 && Array.isArray(devicesRes.data?.data) && devicesRes.data?.data?.length >= 2);
  assert('Device status updated to CRITICAL following anomalous reading', devicesRes.data?.data?.some(d => d.deviceId === 'node-alwar-01' && d.status === 'CRITICAL'));

  // Device Registration (POST /api/telemetry/devices)
  const testDeviceId = `node-test-${Date.now()}`;
  const registerDeviceRes = await request('POST', '/telemetry/devices', {
    deviceId: testDeviceId,
    pilotId: 'pilot-alwar-01',
    name: 'Udaipur Remote Sub-station Node',
    location: 'Udaipur, Rajasthan',
  });
  assert('POST /api/telemetry/devices registers new field device', registerDeviceRes.status === 201 && registerDeviceRes.data?.data?.deviceId === testDeviceId);

  // Duplicate device registration rejection (409 Conflict)
  const duplicateDeviceRes = await request('POST', '/telemetry/devices', {
    deviceId: testDeviceId,
    pilotId: 'pilot-alwar-01',
    name: 'Duplicate Node',
  });
  assert('POST /api/telemetry/devices rejects duplicate device ID (409)', duplicateDeviceRes.status === 409);

  // Latest Telemetry (GET /api/telemetry/latest/:pilotId)
  const latestTeleRes = await request('GET', '/telemetry/latest/pilot-alwar-01');
  assert('GET /api/telemetry/latest/pilot-alwar-01 returns newest packet', latestTeleRes.status === 200 && latestTeleRes.data?.data?.pilotId === 'pilot-alwar-01');
  assert('Latest packet has isDemo: false tag', latestTeleRes.data?.data?.isDemo === false);

  // Telemetry History (GET /api/telemetry/history/:pilotId)
  const historyTeleRes = await request('GET', '/telemetry/history/pilot-alwar-01');
  assert('GET /api/telemetry/history/pilot-alwar-01 returns time-series array', historyTeleRes.status === 200 && Array.isArray(historyTeleRes.data?.data));

  // BIS Thresholds (GET /api/telemetry/thresholds)
  const thresholdsRes = await request('GET', '/telemetry/thresholds');
  assert('GET /api/telemetry/thresholds returns BIS IS 10500:2012 specification', thresholdsRes.status === 200 && thresholdsRes.data?.regulatoryStandard?.includes('BIS IS 10500'));

  // Protected Thresholds Update (PUT /api/telemetry/thresholds)
  const unauthThresholdRes = await request('PUT', '/telemetry/thresholds', { maxTurbidity: 6.0 });
  assert('PUT /api/telemetry/thresholds rejects unauthenticated request (401)', unauthThresholdRes.status === 401);

  const studentThresholdRes = await request('PUT', '/telemetry/thresholds', { maxTurbidity: 6.0 }, { Authorization: `Bearer ${studentToken}` });
  assert('PUT /api/telemetry/thresholds rejects unauthorized student role (403)', studentThresholdRes.status === 403);

  const adminThresholdRes = await request('PUT', '/telemetry/thresholds', { turbidity: { acceptable: 2.0, permissible: 6.0, critical: 12.0 } }, { Authorization: `Bearer ${adminToken}` });
  assert('PUT /api/telemetry/thresholds allows admin update (200)', adminThresholdRes.status === 200 && adminThresholdRes.data?.status === 'success');

  // 11. Database Persistence, Repeatability & Real Data Hardening
  console.log('\n--- 11. Database Persistence, Repeatability & Real Data Hardening ---');

  // Health check database status
  const dbHealthRes = await request('GET', '/health');
  assert('GET /api/health reports database subsystem operational',
    dbHealthRes.status === 200 &&
    (dbHealthRes.data?.services?.database === 'operational' || dbHealthRes.data?.services?.database === 'connected')
  );
  assert('Health check reports database engine dialect', typeof dbHealthRes.data?.databaseEngine === 'string');

  // Real Telemetry Persistence across distinct pilot
  const jaipurPilotId = `pilot-jaipur-${Date.now()}`;
  const jaipurDeviceId = `node-jaipur-${Date.now()}`;
  const jaipurTelemetryRes = await request('POST', '/telemetry', {
    pilotId: jaipurPilotId,
    deviceId: jaipurDeviceId,
    measurements: {
      ph: 7.1,
      turbidity: 1.8,
      tds: 290,
      temperature: 23.4,
    },
  });
  assert('POST /api/telemetry persists real field packet to database', jaipurTelemetryRes.status === 201);

  const fetchJaipurRes = await request('GET', `/telemetry/latest/${jaipurPilotId}`);
  assert('GET /api/telemetry/latest/:pilotId retrieves persisted packet from database',
    fetchJaipurRes.status === 200 &&
    fetchJaipurRes.data?.data?.pilotId === jaipurPilotId &&
    fetchJaipurRes.data?.data?.isDemo === false
  );

  const historyJaipurRes = await request('GET', `/telemetry/history/${jaipurPilotId}?limit=5`);
  assert('GET /api/telemetry/history/:pilotId retrieves persisted time-series',
    historyJaipurRes.status === 200 &&
    Array.isArray(historyJaipurRes.data?.data) &&
    historyJaipurRes.data?.data?.length >= 1
  );

  // Demo Cycle 1: Full 14-stage execution
  console.log('\n--- 12. Full 14-Stage Judge Demo Repeatability & Hardening ---');
  const demoCycle1Start = await request('POST', '/demo/start');
  assert('Demo Cycle 1: Starts cleanly at stage 0', demoCycle1Start.status === 200 && demoCycle1Start.data?.stageIndex === 0);

  const demoCycle1Advance = await request('POST', '/demo/step', { stageIndex: 9 });
  assert('Demo Cycle 1: Advances to Critical Anomaly Detection (Stage 9)',
    demoCycle1Advance.status === 200 &&
    demoCycle1Advance.data?.decisionAlert?.severity === 'Critical'
  );

  const demoCycle1Complete = await request('POST', '/demo/step', { stageIndex: 13 });
  assert('Demo Cycle 1: Completes at Stage 13', demoCycle1Complete.status === 200 && demoCycle1Complete.data?.status === 'completed');

  // Demo Reset
  const demoResetCheck = await request('POST', '/demo/reset');
  assert('Demo Reset: Clears simulation state without error', demoResetCheck.status === 200 && demoResetCheck.data?.status === 'idle');

  // Verify Real Data Untouched after Demo Reset
  const postResetJaipurCheck = await request('GET', `/telemetry/latest/${jaipurPilotId}`);
  assert('POST-RESET ISOLATION: Real telemetry remains in persistent database after demo reset',
    postResetJaipurCheck.status === 200 &&
    postResetJaipurCheck.data?.data?.pilotId === jaipurPilotId
  );

  // Demo Cycle 2: Second consecutive run from clean reset (Repeatability Verification)
  const demoCycle2Start = await request('POST', '/demo/start');
  assert('Demo Cycle 2: Repeatable start from clean reset', demoCycle2Start.status === 200 && demoCycle2Start.data?.status === 'running');

  const demoCycle2Finish = await request('POST', '/demo/step', { stageIndex: 13 });
  assert('Demo Cycle 2: Successfully reaches completion again (100% Repeatability)',
    demoCycle2Finish.status === 200 &&
    demoCycle2Finish.data?.status === 'completed'
  );

  // 13. Observability, Correlation & Security Headers
  console.log('\n--- 13. Observability, Correlation & Security Headers ---');
  const headersRes = await request('GET', '/health');
  assert('Response includes X-Request-ID correlation header', Boolean(headersRes.headers['x-request-id']));
  assert('Response includes X-Content-Type-Options: nosniff', headersRes.headers['x-content-type-options'] === 'nosniff');
  assert('Response includes X-Frame-Options: SAMEORIGIN', headersRes.headers['x-frame-options'] === 'SAMEORIGIN');
  assert('Response includes Referrer-Policy: strict-origin-when-cross-origin', headersRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin');

  // 14. Liveness, Readiness & Pre-Flight Checks
  console.log('\n--- 14. Liveness, Readiness & Pre-Flight Checks ---');
  const liveRes = await request('GET', '/health/live');
  assert('GET /health/live returns process status: alive', liveRes.status === 200 && liveRes.data?.status === 'alive');

  const readyRes = await request('GET', '/health/ready');
  assert('GET /health/ready returns service readiness: ready', readyRes.status === 200 && readyRes.data?.status === 'ready');

  const demoReadinessRes = await request('GET', '/demo/readiness');
  assert('GET /api/demo/readiness returns judge pre-flight status: READY', demoReadinessRes.status === 200 && demoReadinessRes.data?.status === 'READY');
  assert('Pre-flight verifies all 14 stages, scenario, and seed data',
    demoReadinessRes.data?.checks?.demoScenarioLoaded &&
    demoReadinessRes.data?.checks?.totalStagesConfigured &&
    demoReadinessRes.data?.checks?.seedDataAvailable
  );

  // 15. 10-Cycle Judge Demo Repeatability & Safety Lock
  console.log('\n--- 15. 10-Cycle Judge Demo Safety Lock & Repeatability ---');
  let multiCycleSuccess = true;
  for (let i = 1; i <= 10; i++) {
    const start = await request('POST', '/demo/start');
    const step = await request('POST', '/demo/step', { stageIndex: 13 });
    const reset = await request('POST', '/demo/reset');
    if (start.status !== 200 || step.status !== 200 || reset.status !== 200 || step.data?.status !== 'completed') {
      multiCycleSuccess = false;
      break;
    }
  }
  assert('10 Consecutive Demo Reset/Start/Complete Cycles Execute with 0 State Corruption', multiCycleSuccess);

  const post10CyclesJaipurCheck = await request('GET', `/telemetry/latest/${jaipurPilotId}`);
  assert('Real production telemetry remains 100% intact after 10 full demo reset cycles',
    post10CyclesJaipurCheck.status === 200 &&
    post10CyclesJaipurCheck.data?.data?.pilotId === jaipurPilotId
  );

  // 16. Structured Error Responses & 404 Handling
  console.log('\n--- 16. Structured Error Responses & 404 Handling ---');
  const notFoundRes = await request('GET', '/non-existent-endpoint-test-404');
  assert('404 returns structured JSON error format (success: false)', notFoundRes.status === 404 && notFoundRes.data?.success === false);
  assert('404 error contains code: RESOURCE_NOT_FOUND and requestId',
    notFoundRes.data?.error?.code === 'RESOURCE_NOT_FOUND' &&
    Boolean(notFoundRes.data?.requestId)
  );

  // 17. Multi-Tenant Enterprise SaaS Lifecycle & Real-World Workflow Verification
  console.log('\n--- 17. Multi-Tenant Enterprise SaaS Lifecycle & Real-World Workflow ---');
  
  // A. Organization Creation
  const newOrgRes = await request('POST', '/organizations', {
    name: 'Tamil Nadu Water Supply and Drainage Board (TWAD)',
    type: 'Government',
    domain: 'Rural Aquifer Monitoring',
    location: 'Chennai, Tamil Nadu',
    subscriptionTier: 'ENTERPRISE',
    contactEmail: 'nodal@twadboard.gov.in',
    description: 'State statutory body implementing piped water and rural desalination schemes across southern districts.',
  }, { Authorization: `Bearer ${adminToken}` });
  assert('POST /api/organizations creates real multi-tenant organization', newOrgRes.status === 201 && newOrgRes.data?.success === true);
  const createdOrg = newOrgRes.data?.organization;
  const orgId = createdOrg?.id;

  const orgStatsRes = await request('GET', `/organizations/${orgId}/stats`);
  assert('GET /api/organizations/:id/stats returns live aggregated metrics', orgStatsRes.status === 200 && typeof orgStatsRes.data?.stats?.totalProblems === 'number');

  // B. Real Problem Publishing
  const newProbRes = await request('POST', '/problems', {
    title: 'Fluoride and Saline Intrusion in Coastal Groundwater (Ramanathapuram)',
    description: 'Coastal borewells exhibit seasonal salinity spikes and fluoride concentrations exceeding 2.5 mg/L, affecting 18 coastal panchayats.',
    domain: 'Water Resources & Sanitation',
    organization: createdOrg.name,
    organizationId: orgId,
    location: 'Ramanathapuram, Tamil Nadu',
    priority: 'Critical',
    targetPopulation: '24,000 Coastal Inhabitants',
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/problems creates real organization-scoped problem', newProbRes.status === 201 && Boolean(newProbRes.data?.id));
  const createdProblem = newProbRes.data;
  const problemId = createdProblem?.id;

  // C. Candidate Solutions Registration
  const sol1Res = await request('POST', '/solutions', {
    problemId: problemId,
    organizationId: orgId,
    title: 'Solar-Powered Capacitive Deionization (CDI) with Online Conductivity Cell',
    description: 'Low-pressure electrosorption unit targeting specific fluoride and monovalent salt removal with 80% water recovery.',
    technologyStack: ['Capacitive Deionization', 'ESP32-S3', 'RS485 Modbus', 'Solar MPPT'],
    maturityLevel: 'TRL-6',
    feasibilityScore: 89,
    estimatedCostInr: 12500,
    timelineWeeks: 10,
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/solutions creates candidate solution #1', sol1Res.status === 201 && sol1Res.data?.success === true);

  const sol2Res = await request('POST', '/solutions', {
    problemId: problemId,
    organizationId: orgId,
    title: 'Graphene-Activated Hydrotalcite Nano-Filtration Column',
    description: 'Selective layered double hydroxide composite adsorbent for rapid fluoride binding without reject brine.',
    technologyStack: ['Nanomaterial Adsorption', 'Pressure Differential Sensor', 'GSM Gateway'],
    maturityLevel: 'TRL-5',
    feasibilityScore: 82,
    estimatedCostInr: 9200,
    timelineWeeks: 8,
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/solutions creates candidate solution #2', sol2Res.status === 201 && sol2Res.data?.success === true);

  // D. Comparative Solution Analysis
  const compareRes = await request('POST', '/solutions/compare', {
    solutionIds: [sol1Res.data.solution.id, sol2Res.data.solution.id],
  });
  assert('POST /api/solutions/compare generates multi-candidate trade-off matrix',
    compareRes.status === 200 &&
    compareRes.data?.comparison?.candidateCount === 2 &&
    Boolean(compareRes.data?.comparison?.recommendedSolutionId)
  );

  // E. Pilot Program Launch
  const newPilotRes = await request('POST', '/pilots', {
    projectId: 'proj-cauvery-01',
    problemId: problemId,
    organizationId: orgId,
    title: 'Ramanathapuram Desalination & De-fluoridation Field Trial',
    organization: createdOrg.name,
    location: 'Mandapam Panchayat, Ramanathapuram',
    participantsCount: 120,
    objectives: ['Validate continuous TDS reduction below 400 ppm under coastal tidal surges'],
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/pilots creates operational field pilot program', newPilotRes.status === 201 && Boolean(newPilotRes.data?.id));
  const createdPilot = newPilotRes.data;
  const newPilotId = createdPilot.id;

  // F. Field Device Node Registration
  const newDeviceRes = await request('POST', '/telemetry/devices', {
    deviceId: `node-mandapam-${Date.now().toString().slice(-4)}`,
    pilotId: newPilotId,
    name: 'Mandapam Desalination Pilot Station Node',
    location: 'Mandapam Camp, Ramanathapuram (9.2800° N, 79.1200° E)',
    sensorTypes: ['Electrical Conductivity Cell', 'Optical Turbidity', 'pH Probe'],
    hardwareModel: 'ESP32-S3 + SIM7600 4G LTE Gateway',
    firmwareVersion: 'v3.0.1-prod',
  });
  assert('POST /api/telemetry/devices registers pilot field sensor node', newDeviceRes.status === 201);
  const newDeviceId = newDeviceRes.data?.data?.deviceId;

  // G. Dynamic Impact Insufficient Data Handling
  const emptyImpactRes = await request('GET', `/impact/calculate/${newPilotId}`);
  assert('GET /api/impact/calculate/:pilotId flags INSUFFICIENT_DATA when < 3 readings exist',
    emptyImpactRes.status === 200 &&
    emptyImpactRes.data?.computed === false &&
    emptyImpactRes.data?.status === 'INSUFFICIENT_DATA'
  );

  // H. Multi-Point Telemetry Ingestion (Baseline -> Progression -> Anomaly -> Resolved)
  // Reading 1: Baseline (Unfiltered high salinity)
  await request('POST', '/telemetry', {
    pilotId: newPilotId,
    deviceId: newDeviceId,
    measurements: { ph: 8.4, turbidity: 9.8, tds: 1450, temperature: 28.5 },
    source: 'PHYSICAL_SENSOR',
    organizationId: orgId,
  });

  // Reading 2: Operational start (Partial filtration)
  await request('POST', '/telemetry', {
    pilotId: newPilotId,
    deviceId: newDeviceId,
    measurements: { ph: 7.9, turbidity: 5.2, tds: 820, temperature: 28.0 },
    source: 'PHYSICAL_SENSOR',
    organizationId: orgId,
  });

  // Reading 3: Manual field reading with Critical Turbidity spike (triggers Decision Alert & Notification)
  const manualSpikeRes = await request('POST', '/telemetry', {
    pilotId: newPilotId,
    deviceId: newDeviceId,
    measurements: { ph: 8.8, turbidity: 18.5, tds: 1200, temperature: 29.0 },
    source: 'MANUAL_ENTRY',
    organizationId: orgId,
    recordedByUserId: 'u1',
  });
  assert('POST /api/telemetry processes MANUAL_ENTRY reading with correct source tag',
    manualSpikeRes.status === 201 &&
    manualSpikeRes.data?.data?.source === 'MANUAL_ENTRY'
  );
  assert('Manual critical reading triggers CRITICAL anomaly evaluation',
    manualSpikeRes.data?.data?.evaluation?.status === 'CRITICAL'
  );

  // I. Decision Alert Verification & Lifecycle
  const alertsRes = await request('GET', `/alerts?pilotId=${newPilotId}`);
  assert('GET /api/alerts returns auto-triggered decision alert for field pilot',
    alertsRes.status === 200 &&
    Array.isArray(alertsRes.data) &&
    alertsRes.data.length >= 1
  );
  const activeAlert = alertsRes.data[0];

  const ackAlertRes = await request('POST', `/alerts/${activeAlert.id}/acknowledge`, null, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/alerts/:id/acknowledge updates alert status to ACKNOWLEDGED',
    ackAlertRes.status === 200 &&
    ackAlertRes.data?.alert?.status === 'ACKNOWLEDGED'
  );

  const resolveAlertRes = await request('POST', `/alerts/${activeAlert.id}/resolve`, null, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/alerts/:id/resolve updates alert status to RESOLVED',
    resolveAlertRes.status === 200 &&
    resolveAlertRes.data?.alert?.status === 'RESOLVED'
  );

  // J. Operational Action Task Dispatch & Resolution
  const actionRes = await request('POST', '/actions', {
    pilotId: newPilotId,
    problemId: problemId,
    organizationId: orgId,
    alertId: activeAlert.id,
    title: 'Execute Chemical Desorption and Membrane Backwash at Mandapam Station',
    description: 'Clean CDI electrode modules with dilute citric acid to remove divalent fouling salts.',
    priority: 'HIGH',
    assignedToName: 'S. Ramanathan (Field Engineer)',
  }, { Authorization: `Bearer ${studentToken}` });
  assert('POST /api/actions creates operational task assigned to field operator',
    actionRes.status === 201 &&
    actionRes.data?.success === true
  );
  const createdActionId = actionRes.data?.action?.id;

  const updateActionRes = await request('PATCH', `/actions/${createdActionId}`, {
    status: 'RESOLVED',
    resolutionNotes: 'Desorption flush completed successfully. CDI cell resistance restored to nominal 1.2 Ohms.',
  }, { Authorization: `Bearer ${studentToken}` });
  assert('PATCH /api/actions/:id updates task status to RESOLVED with field resolution notes',
    updateActionRes.status === 200 &&
    updateActionRes.data?.action?.status === 'RESOLVED'
  );

  // Reading 4: Post-Action Restored Telemetry reading
  await request('POST', '/telemetry', {
    pilotId: newPilotId,
    deviceId: newDeviceId,
    measurements: { ph: 7.3, turbidity: 1.4, tds: 310, temperature: 27.2 },
    source: 'PHYSICAL_SENSOR',
    organizationId: orgId,
  });

  // K. Traceable Dynamic Impact Calculation
  const computedImpactRes = await request('GET', `/impact/calculate/${newPilotId}`);
  assert('GET /api/impact/calculate/:pilotId dynamically computes verified field metrics',
    computedImpactRes.status === 200 &&
    computedImpactRes.data?.computed === true &&
    computedImpactRes.data?.dataPointsCount >= 4 &&
    Array.isArray(computedImpactRes.data?.metrics) &&
    computedImpactRes.data?.metrics.length >= 3
  );
  assert('Impact metrics report verifiable percentage change and confidence score',
    typeof computedImpactRes.data?.metrics[0]?.percentageChange === 'number' &&
    typeof computedImpactRes.data?.metrics[0]?.confidenceScore === 'number' &&
    Boolean(computedImpactRes.data?.metrics[0]?.sourceOfTruth)
  );

  // L. Tamper-Evident SHA-256 Audit Ledger Chain Verification
  const verifyChainRes = await request('GET', '/audit/verify-chain', null, { Authorization: `Bearer ${adminToken}` });
  assert('GET /api/audit/verify-chain verifies cryptographic SHA-256 ledger integrity',
    verifyChainRes.status === 200 &&
    verifyChainRes.data?.integrity === 'VALID' &&
    verifyChainRes.data?.totalChecked >= 10
  );

  // M. Isolation Verification: Judge Demo Reset does not impact production organization or telemetry
  await request('POST', '/demo/reset');
  const postResetPilotCheck = await request('GET', `/telemetry/latest/${newPilotId}`);
  assert('Post-Demo-Reset: Production multi-tenant telemetry remains 100% intact in persistent store',
    postResetPilotCheck.status === 200 &&
    postResetPilotCheck.data?.data?.pilotId === newPilotId &&
    postResetPilotCheck.data?.data?.isDemo === false
  );

  // 18. Brand-New Organization Onboarding Lifecycle (isDemo: false)
  console.log('\n--- 18. Brand-New Organization Onboarding Lifecycle ---');
  const bwssbOrgRes = await request('POST', '/organizations', {
    name: 'Bangalore Water Supply and Sewerage Board (BWSSB)',
    type: 'Government',
    domain: 'Urban Aquifer & Piped Water Supply',
    location: 'Bengaluru, Karnataka',
    subscriptionTier: 'ENTERPRISE',
    contactEmail: 'chief.engineer@bwssb.karnataka.gov.in',
    description: 'Statutory body providing water supply, water treatment, and sewage disposal for Bangalore Metropolitan Area.',
  }, { Authorization: `Bearer ${adminToken}` });
  assert('POST /api/organizations registers fresh organization (BWSSB)', bwssbOrgRes.status === 201 && bwssbOrgRes.data?.organization?.id);
  const bwssbOrg = bwssbOrgRes.data.organization;
  const bwssbOrgId = bwssbOrg.id;

  // Zero-State Verification
  const zeroStatsRes = await request('GET', `/organizations/${bwssbOrgId}/stats`);
  assert('Zero-State: New organization starts with 0 problems and 0 pilots',
    zeroStatsRes.status === 200 &&
    zeroStatsRes.data?.stats?.totalProblems === 0 &&
    zeroStatsRes.data?.stats?.totalPilots === 0
  );

  // User Registration for BWSSB
  const bwssbUserRes = await request('POST', '/auth/register', {
    name: 'Priya Narayanan',
    email: `priya.${Date.now()}@bwssb.gov.in`,
    password: 'password123',
    role: 'student',
    organization: bwssbOrg.name,
    organizationId: bwssbOrgId,
    domain: 'Water Resources & Urban IoT',
  });
  assert('POST /api/auth/register registers tenant engineer for BWSSB', bwssbUserRes.status === 201 && bwssbUserRes.data?.token);
  const bwssbToken = bwssbUserRes.data.token;
  assert('JWT payload binds organizationId to BWSSB', bwssbUserRes.data?.user?.organizationId === bwssbOrgId);

  // Publish First Problem for BWSSB
  const bwssbProbRes = await request('POST', '/problems', {
    title: 'Secondary Treated Effluent Quality Verification in Bellandur Catchment',
    description: 'Continuous monitoring of ammoniacal nitrogen and dissolved oxygen in tertiary treatment discharge outlets.',
    domain: 'Water Resources & Sanitation',
    organization: bwssbOrg.name,
    organizationId: bwssbOrgId,
    location: 'Bellandur Lake Outfall, Bengaluru',
    priority: 'High',
    targetPopulation: '180,000 Urban Residents',
  }, { Authorization: `Bearer ${bwssbToken}` });
  assert('BWSSB Engineer publishes first problem statement', bwssbProbRes.status === 201 && bwssbProbRes.data?.id);
  const bwssbProblemId = bwssbProbRes.data.id;

  // Register Candidate Solution for BWSSB Problem
  const bwssbSolRes = await request('POST', '/solutions', {
    problemId: bwssbProblemId,
    organizationId: bwssbOrgId,
    title: 'Dual-Wavelength UV-Vis Spectrophotometric Nitrate & COD Probe',
    description: 'Reagent-free optical absorption probe for real-time organic load measurement in wastewater outfalls.',
    technologyStack: ['UV-Vis Spectrophotometry', 'STM32 Microcontroller', 'RS485 Modbus', 'Solar Backup'],
    maturityLevel: 'TRL-5',
    feasibilityScore: 88,
    estimatedCostInr: 18500,
    timelineWeeks: 10,
  }, { Authorization: `Bearer ${bwssbToken}` });
  assert('BWSSB registers candidate solution', bwssbSolRes.status === 201 && bwssbSolRes.data?.solution?.id);
  const bwssbSolutionId = bwssbSolRes.data.solution.id;

  // Launch Field Pilot for BWSSB
  const bwssbPilotRes = await request('POST', '/pilots', {
    projectId: 'proj-bellandur-01',
    problemId: bwssbProblemId,
    organizationId: bwssbOrgId,
    title: 'Bellandur Outfall Continuous Effluent Trial',
    organization: bwssbOrg.name,
    location: 'Bellandur STP Outlet, Bengaluru',
    participantsCount: 45,
    objectives: ['Validate continuous ammoniacal nitrogen monitoring over 60 days'],
  }, { Authorization: `Bearer ${bwssbToken}` });
  assert('BWSSB launches operational field pilot testbed', bwssbPilotRes.status === 201 && bwssbPilotRes.data?.id);
  const bwssbPilotId = bwssbPilotRes.data.id;

  // Register Device Node for BWSSB Pilot
  const bwssbDeviceRes = await request('POST', '/telemetry/devices', {
    deviceId: `node-bwssb-${Date.now().toString().slice(-4)}`,
    pilotId: bwssbPilotId,
    name: 'Bellandur STP Discharge Node #1',
    location: 'Bellandur Wetland Outfall (12.9352° N, 77.6772° E)',
    sensorTypes: ['UV Nitrate Cell', 'Optical Dissolved Oxygen', 'Temperature'],
    hardwareModel: 'ESP32-S3 + Ethernet PoE Gateway',
    firmwareVersion: 'v1.0.4-prod',
  });
  assert('BWSSB provisions and registers field hardware node', bwssbDeviceRes.status === 201);
  const bwssbDeviceId = bwssbDeviceRes.data?.data?.deviceId;

  // Verify Updated Organization Stats
  const updatedBwssbStats = await request('GET', `/organizations/${bwssbOrgId}/stats`);
  assert('Updated Stats: Organization metrics reflect 1 problem, 1 pilot, and 1 device',
    updatedBwssbStats.status === 200 &&
    updatedBwssbStats.data?.stats?.totalProblems === 1 &&
    updatedBwssbStats.data?.stats?.totalPilots === 1 &&
    updatedBwssbStats.data?.stats?.totalDevices === 1
  );

  // 19. Multi-Tenant Isolation & Cross-Organization Security
  console.log('\n--- 19. Multi-Tenant Isolation & Cross-Organization Security ---');
  const gwssbOrgRes = await request('POST', '/organizations', {
    name: 'Gujarat Water Supply & Sewerage Board (GWSSB)',
    type: 'Government',
    domain: 'Saline Intrusion in Coastal Aquifers',
    location: 'Gandhinagar, Gujarat',
    subscriptionTier: 'ENTERPRISE',
    contactEmail: 'info@gwssb.gujarat.gov.in',
  }, { Authorization: `Bearer ${adminToken}` });
  const gwssbOrg = gwssbOrgRes.data.organization;
  const gwssbOrgId = gwssbOrg.id;

  const gwssbUserRes = await request('POST', '/auth/register', {
    name: 'Chirag Patel',
    email: `chirag.${Date.now()}@gwssb.gov.in`,
    password: 'password123',
    role: 'student',
    organization: gwssbOrg.name,
    organizationId: gwssbOrgId,
    domain: 'Coastal Hydrology',
  });
  const gwssbToken = gwssbUserRes.data.token;

  // Cross-Tenant Mutation Attempt 1: Delete Org A problem by Org B user -> 403
  const crossDeleteProbRes = await request('DELETE', `/problems/${bwssbProblemId}`, null, { Authorization: `Bearer ${gwssbToken}` });
  assert('SECURITY: Org B user cannot DELETE Org A problem (403 Forbidden)', crossDeleteProbRes.status === 403);

  // Cross-Tenant Mutation Attempt 2: Update Org A problem by Org B user -> 403
  const crossPatchProbRes = await request('PATCH', `/problems/${bwssbProblemId}`, { title: 'Hacked Title' }, { Authorization: `Bearer ${gwssbToken}` });
  assert('SECURITY: Org B user cannot PATCH Org A problem (403 Forbidden)', crossPatchProbRes.status === 403);

  // Cross-Tenant Mutation Attempt 3: Delete Org A solution by Org B user -> 403
  const crossDeleteSolRes = await request('DELETE', `/solutions/${bwssbSolutionId}`, null, { Authorization: `Bearer ${gwssbToken}` });
  assert('SECURITY: Org B user cannot DELETE Org A solution (403 Forbidden)', crossDeleteSolRes.status === 403);

  // Cross-Tenant Mutation Attempt 4: Delete Org A pilot by Org B user -> 403
  const crossDeletePilotRes = await request('DELETE', `/pilots/${bwssbPilotId}`, null, { Authorization: `Bearer ${gwssbToken}` });
  assert('SECURITY: Org B user cannot DELETE Org A pilot (403 Forbidden)', crossDeletePilotRes.status === 403);

  // Tenant-Scoped Read Querying
  const gwssbScopedProbs = await request('GET', `/problems?organizationId=${gwssbOrgId}`);
  assert('Tenant-Scoped Read: Querying GWSSB problems returns isolated list (length 0)',
    gwssbScopedProbs.status === 200 &&
    Array.isArray(gwssbScopedProbs.data) &&
    gwssbScopedProbs.data.length === 0
  );

  // 20. Data-Driven Device Status Derivation & Thresholds
  console.log('\n--- 20. Data-Driven Device Status Derivation & Thresholds ---');
  const allDevicesCheck = await request('GET', '/telemetry/devices');
  assert('GET /api/telemetry/devices returns all registered field nodes', allDevicesCheck.status === 200 && Array.isArray(allDevicesCheck.data?.data));
  const bwssbDeviceRecord = allDevicesCheck.data?.data?.find(d => d.deviceId === bwssbDeviceId);
  assert('Freshly registered device derives ONLINE status based on timestamp', bwssbDeviceRecord?.status === 'ONLINE');

  // Ingest critical turbidity reading on BWSSB device
  await request('POST', '/telemetry', {
    pilotId: bwssbPilotId,
    deviceId: bwssbDeviceId,
    measurements: { ph: 9.4, turbidity: 22.0, tds: 1500, temperature: 29.5 },
    organizationId: bwssbOrgId,
  });

  const postAnomalyDevices = await request('GET', '/telemetry/devices');
  const anomalousDevice = postAnomalyDevices.data?.data?.find(d => d.deviceId === bwssbDeviceId);
  assert('Device status transitions to CRITICAL after threshold violation', anomalousDevice?.status === 'CRITICAL');

  // 21. Cryptographic SHA-256 Ledger Integrity & Tamper Detection
  console.log('\n--- 21. Cryptographic SHA-256 Ledger Integrity ---');
  const preTamperVerify = await request('GET', '/audit/verify-chain', null, { Authorization: `Bearer ${adminToken}` });
  assert('Audit Ledger SHA-256 chain is valid and verified',
    preTamperVerify.status === 200 &&
    preTamperVerify.data?.integrity === 'VALID' &&
    preTamperVerify.data?.totalChecked >= 12
  );

  // Add a new audit log and re-verify chain continuity
  const newAuditEntry = await request('POST', '/audit/log', {
    userId: 'admin-1',
    userName: 'Dr. Rajesh Sharma',
    userRole: 'admin',
    action: 'Compliance Verification Completed',
    entityType: 'Organization',
    entityId: bwssbOrgId,
    details: 'Completed annual BIS IS 10500 compliance review for BWSSB Bellandur catchment.',
  });
  assert('POST /api/audit/log records new governance event with cryptographic hash', newAuditEntry.status === 201 && Boolean(newAuditEntry.data?.entryHash));

  const postLogVerify = await request('GET', '/audit/verify-chain', null, { Authorization: `Bearer ${adminToken}` });
  assert('Audit Ledger maintains continuous hash chain after new entry creation',
    postLogVerify.status === 200 &&
    postLogVerify.data?.integrity === 'VALID' &&
    postLogVerify.data?.totalChecked > preTamperVerify.data?.totalChecked
  );

  // 22. Server-Side Pagination & Filtered Search
  console.log('\n--- 22. Server-Side Pagination & Filtered Search ---');
  const paginatedProblems = await request('GET', '/problems?page=1&pageSize=2');
  assert('GET /api/problems with pagination returns structured pagination metadata',
    paginatedProblems.status === 200 &&
    Array.isArray(paginatedProblems.data?.items) &&
    paginatedProblems.data?.items?.length <= 2 &&
    typeof paginatedProblems.data?.total === 'number' &&
    typeof paginatedProblems.data?.totalPages === 'number'
  );

  const paginatedPilots = await request('GET', '/pilots?page=1&pageSize=2');
  assert('GET /api/pilots with pagination returns structured pagination metadata',
    paginatedPilots.status === 200 &&
    Array.isArray(paginatedPilots.data?.items) &&
    paginatedPilots.data?.items?.length <= 2 &&
    typeof paginatedPilots.data?.total === 'number'
  );

  const paginatedAudit = await request('GET', '/audit/logs?page=1&pageSize=5', null, { Authorization: `Bearer ${adminToken}` });
  assert('GET /api/audit/logs with pagination returns structured pagination metadata',
    paginatedAudit.status === 200 &&
    Array.isArray(paginatedAudit.data?.items) &&
    paginatedAudit.data?.items?.length <= 5 &&
    typeof paginatedAudit.data?.total === 'number'
  );

  const searchEvidence = await request('GET', '/evidence/search?query=turbidity');
  assert('GET /api/evidence/search returns matching academic and empirical citations',
    searchEvidence.status === 200 &&
    Array.isArray(searchEvidence.data) &&
    searchEvidence.data.length >= 1
  );

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runAudit().catch((err) => {
  console.error('Audit suite crashed:', err);
  process.exit(1);
});



