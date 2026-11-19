const fs = require('fs');
const path = require('path');

async function testRealUserAuthFlow() {
  console.log('=================================================================');
  console.log('🧪 VERIFYING PRODUCTION-READY REAL USER AUTHENTICATION & LOGIN UI');
  console.log('=================================================================\n');

  const BASE_URL = 'http://localhost:5000/api';
  const timestamp = Date.now();

  const realAgent = {
    name: 'Marcus Vance',
    email: `marcus.vance.${timestamp}@primeestate.com`,
    password: 'RealAgentPassword123!',
    phone: '+1 (555) 789-0123',
    role: 'Agent',
  };

  const realBuyer = {
    name: 'Chloe Bennett',
    email: `chloe.bennett.${timestamp}@gmail.com`,
    password: 'BuyerSecurePass456!',
    phone: '+1 (555) 456-7890',
    role: 'Buyer',
  };

  // Test 1: Register real Agent
  console.log('[Test 1] Registering a new real Agent account...');
  const regAgentRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(realAgent),
  });
  const regAgentData = await regAgentRes.json();
  console.log('Status:', regAgentRes.status);
  if (regAgentRes.status !== 201 || !regAgentData.token) {
    throw new Error(`Agent registration failed: ${JSON.stringify(regAgentData)}`);
  }
  console.log(`✓ Real Agent registered: ${regAgentData.user.name} (${regAgentData.user.email}) - Role: ${regAgentData.user.role}`);
  console.log(`✓ JWT Token received: ${regAgentData.token.substring(0, 20)}...`);
  if (regAgentData.user.password) {
    throw new Error('Security violation: password returned in registration response!');
  }
  console.log('✓ Password omitted from response payload.\n');

  // Test 2: Register real Buyer
  console.log('[Test 2] Registering a new real Buyer account...');
  const regBuyerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(realBuyer),
  });
  const regBuyerData = await regBuyerRes.json();
  console.log('Status:', regBuyerRes.status);
  if (regBuyerRes.status !== 201 || !regBuyerData.token) {
    throw new Error(`Buyer registration failed: ${JSON.stringify(regBuyerData)}`);
  }
  console.log(`✓ Real Buyer registered: ${regBuyerData.user.name} (${regBuyerData.user.email}) - Role: ${regBuyerData.user.role}`);
  console.log(`✓ JWT Token received: ${regBuyerData.token.substring(0, 20)}...\n`);

  // Test 3: Duplicate email prevention
  console.log('[Test 3] Testing duplicate email registration prevention...');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(realAgent),
  });
  const dupData = await dupRes.json();
  console.log('Status:', dupRes.status);
  if (dupRes.status !== 409) {
    throw new Error(`Expected 409 Conflict, received: ${dupRes.status}`);
  }
  console.log(`✓ Duplicate registration correctly rejected with 409 Conflict: "${dupData.error}"\n`);

  // Test 4: Real User Login with correct credentials
  console.log('[Test 4] Logging in with newly registered Agent credentials...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: realAgent.email,
      password: realAgent.password,
    }),
  });
  const loginData = await loginRes.json();
  console.log('Status:', loginRes.status);
  if (loginRes.status !== 200 || !loginData.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  console.log(`✓ Login successful for: ${loginData.user.name} (${loginData.user.email})`);
  console.log(`✓ Signed JWT issued: ${loginData.token.substring(0, 25)}...\n`);

  // Test 5: Login with incorrect password
  console.log('[Test 5] Attempting login with incorrect password...');
  const badPassRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: realAgent.email,
      password: 'WrongPassword999!',
    }),
  });
  const badPassData = await badPassRes.json();
  console.log('Status:', badPassRes.status);
  if (badPassRes.status !== 401) {
    throw new Error(`Expected 401 Unauthorized, got ${badPassRes.status}`);
  }
  console.log(`✓ Incorrect password rejected with 401: "${badPassData.error}"\n`);

  // Test 6: Login with unregistered email
  console.log('[Test 6] Attempting login with non-existent email...');
  const noUserRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'nonexistent.user.2026@gmail.com',
      password: 'SomePassword123!',
    }),
  });
  const noUserData = await noUserRes.json();
  console.log('Status:', noUserRes.status);
  if (noUserRes.status !== 401) {
    throw new Error(`Expected 401 Unauthorized, got ${noUserRes.status}`);
  }
  console.log(`✓ Non-existent account rejected with 401: "${noUserData.error}"\n`);

  // Test 7: Verify /api/auth/me profile retrieval
  console.log('[Test 7] Fetching authenticated user profile (/api/auth/me)...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${loginData.token}` },
  });
  const meData = await meRes.json();
  console.log('Status:', meRes.status);
  if (meRes.status !== 200 || !meData.user) {
    throw new Error(`/api/auth/me failed: ${JSON.stringify(meData)}`);
  }
  console.log(`✓ User profile verified: ${meData.user.name} | Role: ${meData.user.role}`);
  console.log(`✓ Password hash omitted from profile: ${meData.user.password === undefined}\n`);

  // Test 8: Role Authorization (Agent vs Buyer)
  console.log('[Test 8] Verifying role-based permissions...');
  // Buyer tries to create a property -> should receive 403 Forbidden
  const buyerForbiddenRes = await fetch(`${BASE_URL}/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${regBuyerData.token}`,
    },
    body: JSON.stringify({
      title: 'Unauthorized Villa Attempt',
      price: 1500000,
      location: 'Malibu, CA',
      type: 'Villa',
      bedrooms: 4,
      bathrooms: 4,
    }),
  });
  const buyerForbiddenData = await buyerForbiddenRes.json();
  console.log('Buyer Create Property Status:', buyerForbiddenRes.status);
  if (buyerForbiddenRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for Buyer property creation, got ${buyerForbiddenRes.status}`);
  }
  console.log(`✓ Buyer correctly blocked from Agent operation (403 Forbidden): "${buyerForbiddenData.error}"\n`);

  // Test 9: Verify Login page code is free of demo autofill
  console.log('[Test 9] Verifying LoginPage.jsx source code...');
  const loginPageContent = fs.readFileSync(
    path.join(__dirname, '../frontend/src/pages/LoginPage.jsx'),
    'utf-8'
  );
  const demoPatterns = [
    'Quick Demo Login',
    'Demo Agent',
    'Demo Buyer',
    'handleQuickLogin',
    'agent@primeestate.com',
  ];

  let hasDemo = false;
  for (const pattern of demoPatterns) {
    if (loginPageContent.includes(pattern)) {
      console.error(`❌ Found unwanted demo pattern in LoginPage.jsx: "${pattern}"`);
      hasDemo = true;
    }
  }

  if (hasDemo) {
    throw new Error('LoginPage still contains demo buttons or demo autofill logic!');
  }
  console.log('✓ Verified: LoginPage.jsx has NO demo login buttons, NO 1-click autofill, and NO demo credentials.\n');

  console.log('=================================================================');
  console.log('🎉 ALL PRODUCTION-READY AUTHENTICATION TESTS PASSED (100%)!');
  console.log('=================================================================\n');
}

testRealUserAuthFlow().catch((err) => {
  console.error('\n❌ Test flow error:', err.message);
  process.exit(1);
});
