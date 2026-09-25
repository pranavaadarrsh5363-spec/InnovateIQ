const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api' + path,
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

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runAudit().catch((err) => {
  console.error('Audit suite crashed:', err);
  process.exit(1);
});
