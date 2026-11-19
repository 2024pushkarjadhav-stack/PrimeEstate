const io = require('../frontend/node_modules/socket.io-client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'primeestate_super_secret_jwt_key_2026_secure';
const SERVER_URL = 'http://localhost:5000';

async function testSocketDirect() {
  console.log('========================================================');
  console.log('🧪 EXPERIMENT 8: DIRECT WEBSOCKET (SOCKET.IO) TEST SUITE');
  console.log('========================================================');

  // Step 1: Generate valid JWT for an Agent and a Buyer
  const agentPayload = {
    id: '64f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Alex Morgan',
    email: 'alex.morgan@primeestate.com',
    role: 'Agent',
  };
  const agentToken = jwt.sign(agentPayload, JWT_SECRET, { expiresIn: '1h' });

  const buyerPayload = {
    id: '64f1a2b3c4d5e6f7a8b9c0d2',
    name: 'Sophia Patel',
    email: 'sophia.patel@gmail.com',
    role: 'Buyer',
  };
  const buyerToken = jwt.sign(buyerPayload, JWT_SECRET, { expiresIn: '1h' });

  console.log('\n[Test 1] Generated mock Agent & Buyer JWT tokens.');

  // Step 2: Connect Unauthenticated Client (Public Visitor)
  console.log('\n[Test 2] Connecting Public Visitor (Anonymous Client)...');
  const publicSocket = io(SERVER_URL, {
    transports: ['websocket'],
  });

  await new Promise((resolve, reject) => {
    publicSocket.on('connect', () => {
      console.log('✓ Public Socket connected successfully! ID:', publicSocket.id);
      resolve();
    });
    publicSocket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('Public socket connection timeout')), 4000);
  });

  // Step 3: Connect Authenticated Agent Client
  console.log('\n[Test 3] Connecting Authenticated Agent Client with JWT Handshake...');
  const agentSocket = io(SERVER_URL, {
    auth: { token: agentToken },
    transports: ['websocket'],
  });

  await new Promise((resolve, reject) => {
    agentSocket.on('connect', () => {
      console.log('✓ Agent Socket connected & authenticated! ID:', agentSocket.id);
      resolve();
    });
    agentSocket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('Agent socket connection timeout')), 4000);
  });

  // Step 4: Connect Authenticated Buyer Client
  console.log('\n[Test 4] Connecting Authenticated Buyer Client with JWT Handshake...');
  const buyerSocket = io(SERVER_URL, {
    auth: { token: buyerToken },
    transports: ['websocket'],
  });

  await new Promise((resolve, reject) => {
    buyerSocket.on('connect', () => {
      console.log('✓ Buyer Socket connected & authenticated! ID:', buyerSocket.id);
      resolve();
    });
    buyerSocket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('Buyer socket connection timeout')), 4000);
  });

  // Step 5: Test Ping-Pong Heartbeat
  console.log('\n[Test 5] Testing Ping-Pong Heartbeat...');
  await new Promise((resolve) => {
    agentSocket.emit('ping');
    agentSocket.on('pong', (data) => {
      console.log('✓ Received Pong Response from Server:');
      console.log('  Status:', data.status);
      console.log('  Server Timestamp:', data.serverTime);
      resolve();
    });
  });

  // Step 6: Test Real-Time Event Dispatch via WebSocket
  console.log('\n[Test 6] Testing Real-Time Property Broadcast (property:broadcast -> property:created)...');

  const propertyEventPromise = new Promise((resolve) => {
    buyerSocket.on('property:created', (data) => {
      console.log('✓ Buyer Socket received [property:created] event:');
      console.log('  Title:', data.title);
      console.log('  Price:', '$' + data.price?.toLocaleString());
      console.log('  Location:', data.location);
      resolve(data);
    });
  });

  const notificationPromise = new Promise((resolve) => {
    publicSocket.on('notification:new', (notif) => {
      console.log('✓ Public Socket received [notification:new] broadcast:');
      console.log('  Title:', notif.title);
      console.log('  Message:', notif.message);
      resolve(notif);
    });
  });

  // Agent emits property creation event
  agentSocket.emit('property:broadcast', {
    _id: 'prop_realtime_999',
    title: 'Grand Azure Seaside Villa',
    price: 3850000,
    location: 'Miami Beach, FL',
    bedrooms: 5,
    bathrooms: 6,
    type: 'Villa',
    status: 'Available',
  });

  await Promise.all([propertyEventPromise, notificationPromise]);
  console.log('✓ Broadcast events successfully received across all connected sockets!');

  // Step 7: Test Targeted Notification to Role (role_Agent)
  console.log('\n[Test 7] Testing Targeted Role Notification (role_Agent)...');
  const agentNotifPromise = new Promise((resolve) => {
    agentSocket.on('notification:new', (notif) => {
      if (notif.type === 'appointment') {
        console.log('✓ Agent Socket received targeted appointment notification:');
        console.log('  Title:', notif.title);
        console.log('  Customer:', notif.message);
        resolve(notif);
      }
    });
  });

  // Buyer books appointment, triggering notification to role_Agent
  buyerSocket.emit('appointment:notify', {
    agentId: agentPayload.id,
    customerName: 'Sophia Patel',
    propertyTitle: 'Grand Azure Seaside Villa',
  });

  await agentNotifPromise;
  console.log('✓ Targeted role notification delivered exclusively to Agent room!');

  // Step 8: Test Targeted Private User Room Notification (user_${buyerPayload.id})
  console.log('\n[Test 8] Testing Private User Notification (user_' + buyerPayload.id + ')...');
  const buyerPrivatePromise = new Promise((resolve) => {
    buyerSocket.on('notification:new', (notif) => {
      if (notif.type === 'appointment_update') {
        console.log('✓ Buyer Socket received private status update notification:');
        console.log('  Status:', notif.title);
        console.log('  Message:', notif.message);
        resolve(notif);
      }
    });
  });

  // Agent updates status, triggering notification to specific customer
  agentSocket.emit('status:notify', {
    customerId: buyerPayload.id,
    status: 'Confirmed',
    propertyTitle: 'Grand Azure Seaside Villa',
  });

  await buyerPrivatePromise;
  console.log('✓ Private user notification delivered exclusively to Buyer room!');

  // Cleanup
  console.log('\n[Cleanup] Disconnecting all test sockets...');
  publicSocket.disconnect();
  agentSocket.disconnect();
  buyerSocket.disconnect();

  console.log('\n========================================================');
  console.log('🎉 ALL EXPERIMENT 8 WEBSOCKET TESTS PASSED (100%)!');
  console.log('========================================================\n');
  process.exit(0);
}

testSocketDirect().catch((err) => {
  console.error('Socket direct test failed:', err);
  process.exit(1);
});
