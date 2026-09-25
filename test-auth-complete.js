const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   INNOVATEIQ AUTHENTICATION VERIFICATION SUITE    ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      if (details) console.log(`       -> ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName}`);
      if (details) console.error(`       -> ${details}`);
    }
  }

  // 1. Health check backend directly (port 5000)
  try {
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.statusCode === 200 && health.data.status === 'ok',
      'Backend Health Check (Port 5000)',
      `Status: ${health.statusCode}, Response: ${JSON.stringify(health.data)}`
    );
  } catch (err) {
    assert(false, 'Backend Health Check (Port 5000)', err.message);
  }

  // 2. Health check via Vite proxy (port 5173)
  try {
    const proxyHealth = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/api/health',
      method: 'GET'
    });
    assert(proxyHealth.statusCode === 200 && proxyHealth.data.status === 'ok',
      'Frontend Vite Proxy -> Backend Health Check (Port 5173)',
      `Status: ${proxyHealth.statusCode}, Proxy working seamlessly`
    );
  } catch (err) {
    assert(false, 'Frontend Vite Proxy -> Backend Health Check (Port 5173)', err.message);
  }

  let studentToken = '';
  // 3. Student Demo Account Login (aarav@sih.dev / demo123)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'aarav@sih.dev', password: 'demo123' });

    studentToken = res.data.token;
    assert(
      res.statusCode === 200 && res.data.user && res.data.user.role === 'student' && res.data.token,
      'Student Account Authentication (aarav@sih.dev / demo123)',
      `Name: ${res.data.user?.name}, Role: ${res.data.user?.role}, Token present: ${Boolean(studentToken)}`
    );
  } catch (err) {
    assert(false, 'Student Account Authentication', err.message);
  }

  let mentorToken = '';
  // 4. University / Mentor Demo Account Login (mentor@sih.dev / demo123)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'mentor@sih.dev', password: 'demo123' });

    mentorToken = res.data.token;
    assert(
      res.statusCode === 200 && res.data.user && res.data.user.role === 'mentor' && res.data.token,
      'Mentor Account Authentication (mentor@sih.dev / demo123)',
      `Name: ${res.data.user?.name}, Role: ${res.data.user?.role}, Token present: ${Boolean(mentorToken)}`
    );
  } catch (err) {
    assert(false, 'Mentor Account Authentication', err.message);
  }

  let adminToken = '';
  // 5. Organization Admin Demo Account Login (admin@sih.dev / demo123)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@sih.dev', password: 'demo123' });

    adminToken = res.data.token;
    assert(
      res.statusCode === 200 && res.data.user && res.data.user.role === 'admin' && res.data.token,
      'Admin Account Authentication (admin@sih.dev / demo123)',
      `Name: ${res.data.user?.name}, Role: ${res.data.user?.role}, Token present: ${Boolean(adminToken)}`
    );
  } catch (err) {
    assert(false, 'Admin Account Authentication', err.message);
  }

  // 6. Case Sensitivity & Trimming (Aarav@Sih.dev / demo123)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: '  Aarav@Sih.dev  ', password: 'demo123' });

    assert(
      res.statusCode === 200 && res.data.user && res.data.user.email === 'aarav@sih.dev',
      'Case-Insensitive & Trimmed Email Normalization ("  Aarav@Sih.dev  ")',
      `Resolved user: ${res.data.user?.email}`
    );
  } catch (err) {
    assert(false, 'Email Normalization', err.message);
  }

  // 7. Invalid Password Rejection (aarav@sih.dev / wrongpass)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'aarav@sih.dev', password: 'wrongpassword123' });

    const msg = res.data?.message || res.data?.error;
    assert(
      res.statusCode === 401 && msg === 'Invalid credentials',
      'Invalid Password Rejection (401)',
      `Status: ${res.statusCode}, Message: "${msg}"`
    );
  } catch (err) {
    assert(false, 'Invalid Password Rejection', err.message);
  }

  // 8. Non-existent User Rejection (unknown@example.com / demo123)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'unknown_user_999@example.com', password: 'demo123' });

    const msg = res.data?.message || res.data?.error;
    assert(
      res.statusCode === 401 && msg === 'Invalid credentials',
      'Non-existent User Rejection (401)',
      `Status: ${res.statusCode}, Message: "${msg}"`
    );
  } catch (err) {
    assert(false, 'Non-existent User Rejection', err.message);
  }

  // 9. Missing Credentials Validation (empty fields -> 400)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: '', password: '' });

    const msg = res.data?.message || res.data?.error;
    assert(
      res.statusCode === 400 && msg,
      'Backend Empty Payload Rejection (400 Bad Request)',
      `Status: ${res.statusCode}, Message: "${msg}"`
    );
  } catch (err) {
    assert(false, 'Empty Payload Rejection', err.message);
  }

  // 10. Session Persistence / Token Verification (GET /api/auth/me with Student Token)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    const userObj = res.data.user || res.data;
    assert(
      res.statusCode === 200 && userObj && userObj.email === 'aarav@sih.dev',
      'Session Persistence / Token Verification (GET /api/auth/me)',
      `Authenticated user: ${userObj.name} (${userObj.email}), Role: ${userObj.role}`
    );
  } catch (err) {
    assert(false, 'Session Persistence / Token Verification', err.message);
  }

  // 11. Protected Route Denial Without Token (GET /api/auth/me without header)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET'
    });

    const msg = res.data?.message || res.data?.error;
    assert(
      res.statusCode === 401 && msg,
      'Protected Route Denial Without Token (401 Unauthorized)',
      `Status: ${res.statusCode}, Message: "${msg}"`
    );
  } catch (err) {
    assert(false, 'Protected Route Denial Without Token', err.message);
  }

  // 12. Protected Route Denial With Tampered Token
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid.tampered.token' }
    });

    const msg = res.data?.message || res.data?.error;
    assert(
      res.statusCode === 403 && msg,
      'Protected Route Denial With Tampered Token (403 Forbidden)',
      `Status: ${res.statusCode}, Message: "${msg}"`
    );
  } catch (err) {
    assert(false, 'Protected Route Denial With Tampered Token', err.message);
  }

  // 13. Login via Vite Proxy (frontend port 5173) to verify end-to-end frontend proxy
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'aarav@sih.dev', password: 'demo123' });

    assert(
      res.statusCode === 200 && res.data.token && res.data.user?.role === 'student',
      'End-to-End Login via Vite Proxy (http://localhost:5173/api/auth/login)',
      `Proxy successfully delivered auth credentials and returned JWT & role`
    );
  } catch (err) {
    assert(false, 'End-to-End Login via Vite Proxy', err.message);
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
