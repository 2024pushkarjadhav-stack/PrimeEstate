const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isOriginAllowed } = require('../config/cors');

console.log('====================================================');
console.log('🚀 RUNNING PRIMESTATE BACKEND CI TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ [FAIL] ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

(async () => {
  // Test 1: Password Hashing with bcryptjs
  await runAsyncTest('Password Hashing & Verification (Bcrypt salt rounds 10)', async () => {
    const plainText = 'PrimeEstate2026Secure!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainText, salt);

    assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Hash should follow bcrypt format');
    assert(hash !== plainText, 'Hash must not equal plain text password');

    const match = await bcrypt.compare(plainText, hash);
    assert.strictEqual(match, true, 'Correct password must match hash');

    const badMatch = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(badMatch, false, 'Incorrect password must be rejected');
  });

  // Test 2: JWT Token Creation & Expiry Validation
  runTest('JSON Web Token (JWT) Signing & Claims Verification', () => {
    const payload = {
      id: '507f1f77bcf86cd799439011',
      name: 'Alexander Sterling',
      email: 'alexander@primeestate.com',
      role: 'Agent',
    };
    const secret = 'ci_test_secret_key_32_bytes_long_string';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    assert(token && token.split('.').length === 3, 'JWT should contain three dot-separated segments');

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);
    assert.strictEqual(decoded.role, 'Agent');
  });

  // Test 3: CORS Allowed Origins in Production
  runTest('CORS Policy Verification (Localhost & Vercel Domains)', () => {
    // Localhost origins
    assert.strictEqual(isOriginAllowed('http://localhost:5173'), true, 'Localhost:5173 must be allowed');
    assert.strictEqual(isOriginAllowed('http://localhost:3000'), true, 'Localhost:3000 must be allowed');

    // Vercel deployment domains
    assert.strictEqual(
      isOriginAllowed('https://primeestate.vercel.app'),
      true,
      'Production Vercel domain must be allowed'
    );
    assert.strictEqual(
      isOriginAllowed('https://primeestate-preview-branch-pushkar.vercel.app'),
      true,
      'Preview Vercel domain must be allowed'
    );

    // Render domains
    assert.strictEqual(
      isOriginAllowed('https://primeestate-backend.onrender.com'),
      true,
      'Render internal domain must be allowed'
    );

    // Requests without origin header (server-to-server, curl)
    assert.strictEqual(isOriginAllowed(null), true, 'Requests with null origin must be allowed');
    assert.strictEqual(isOriginAllowed(undefined), true, 'Requests with undefined origin must be allowed');
  });

  // Test 4: Error Response Class
  runTest('Custom ErrorResponse and Status Code Handler', () => {
    const ErrorResponse = require('../utils/errorResponse');
    const err404 = new ErrorResponse('Resource not found', 404);
    assert.strictEqual(err404.statusCode, 404);
    assert.strictEqual(err404.message, 'Resource not found');

    const err401 = new ErrorResponse('Not authorized', 401);
    assert.strictEqual(err401.statusCode, 401);

    const err403 = new ErrorResponse('Forbidden role access', 403);
    assert.strictEqual(err403.statusCode, 403);
  });

  // Test 5: Role Authorization Middleware Logic
  runTest('Role-Based Access Control (RBAC) Logic', () => {
    const { authorize } = require('../middleware/authMiddleware');
    const agentOnly = authorize('Agent');

    let agentCalled = false;
    const reqAgent = { user: { role: 'Agent' } };
    const res = {};
    const nextAgent = (err) => {
      if (!err) agentCalled = true;
    };
    agentOnly(reqAgent, res, nextAgent);
    assert.strictEqual(agentCalled, true, 'Agent role should pass authorize(Agent)');

    let buyerError = null;
    const reqBuyer = { user: { role: 'Buyer' } };
    const nextBuyer = (err) => {
      buyerError = err;
    };
    agentOnly(reqBuyer, res, nextBuyer);
    assert(buyerError, 'Buyer role should be rejected by authorize(Agent)');
    assert.strictEqual(buyerError.statusCode, 403, 'Buyer rejection status code should be 403 Forbidden');
  });

  console.log('\n====================================================');
  console.log(`🎯 CI TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL BACKEND CI UNIT TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
})();
